const express = require("express");

// Importamos CORS para permitir que la app móvil consuma la API
const cors = require("cors");

const jwt = require("jsonwebtoken");

const app = express();

// Permitimos recibir datos en formato JSON
app.use(express.json());

app.use(cors());

const PORT = 3000;

const JWT_SECRET = "clave_secreta_inventario";

// Usuario de prueba para iniciar sesión
const usuarios = [
  {
    id: 1,
    usuario: "admin",
    password: "1234",
  },
];

// Productos guardados en memoria
let productos = [
  {
    id: "1",
    nombre: "Lip Gloss Dior Addict",
    stock: 18,
  },
  {
    id: "2",
    nombre: "Blush Rare beauty",
    stock: 12,
  },
  {
    id: "3",
    nombre: "Lip Balm",
    stock: 20,
  },
  {
    id: "4",
    nombre: "Iluminador YSL",
    stock: 10,
  },
  {
    id: "5",
    nombre: "Mist Corporal de Vainilla",
    stock: 15,
  },
];

// Ruta pública para iniciar sesión
app.post("/login", (req, res) => {
  const { usuario, password } = req.body;

  const usuarioEncontrado = usuarios.find(
    (u) => u.usuario === usuario && u.password === password
  );

  if (!usuarioEncontrado) {
    return res.status(401).json({
      mensaje: "Credenciales incorrectas",
    });
  }

  // Creamos el token JWT con expiración de 1 hora
  const token = jwt.sign(
    {
      id: usuarioEncontrado.id,
      usuario: usuarioEncontrado.usuario,
    },
    JWT_SECRET,
    {
      expiresIn: "1h",
    }
  );

  // Enviamos el token a la app móvil
  res.json({
    mensaje: "Inicio de sesión correcto",
    token,
  });
});

function verificarToken(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({
      mensaje: "No se envió token de autorización",
    });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      mensaje: "Token no proporcionado",
    });
  }

  // Validamos si el token es correcto o si expiró
  jwt.verify(token, JWT_SECRET, (error, usuarioDecodificado) => {
    if (error) {
      return res.status(403).json({
        mensaje: "Token inválido o expirado",
      });
    }

    req.usuario = usuarioDecodificado;

    
    next();
  });
}

app.get("/productos", verificarToken, (req, res) => {
  res.json(productos);
});

app.get("/productos/:id", verificarToken, (req, res) => {
  const { id } = req.params;

  const producto = productos.find((p) => p.id === id);

  if (!producto) {
    return res.status(404).json({
      mensaje: "Producto no encontrado",
    });
  }

  res.json(producto);
});

// Ruta protegida para actualizar el stock de un producto
app.put("/productos/:id", verificarToken, (req, res) => {
  const { id } = req.params;
  const { salida } = req.body;

  const producto = productos.find((p) => p.id === id);

  if (!producto) {
    return res.status(404).json({
      mensaje: "Producto no encontrado",
    });
  }

  // Validamos que la salida sea mayor a cero
  if (!salida || salida <= 0) {
    return res.status(400).json({
      mensaje: "La cantidad de salida debe ser mayor a cero",
    });
  }

  // Validamos que el stock no quede negativo
  if (producto.stock - salida < 0) {
    return res.status(400).json({
      mensaje: "No se permite stock negativo",
    });
  }

  // Restamos la salida al stock actual
  producto.stock = producto.stock - salida;

  res.json({
    mensaje: "Stock actualizado correctamente",
    producto,
  });
});

// Iniciamos el servidor
app.listen(PORT, () => {
  console.log(`API ejecutándose en http://localhost:${PORT}`);
});
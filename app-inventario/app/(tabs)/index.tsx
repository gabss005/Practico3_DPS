// Importamos React y hooks para manejar estados
import React, { useEffect, useState } from "react";

// Importamos componentes básicos de React Native
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  Alert,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";

// Importamos SecureStore para guardar el token JWT de forma segura
import * as SecureStore from "expo-secure-store";

// Importamos la cámara para escanear códigos QR
import { CameraView, useCameraPermissions } from "expo-camera";

// IMPORTANTE:
// Si usas el celular físico, aquí debes poner la IP de tu computadora.
// Luego te ayudo a encontrarla.
// Ejemplo: http://192.168.1.20:3000
const API_URL = "http://192.168.0.9:3000";

// Definimos el tipo de dato de un producto
type Producto = {
  id: string;
  nombre: string;
  stock: number;
};

// 🌸 Botón personalizado rosa pastel lindo
function BotonPrincipal({
  titulo,
  onPress,
  color = "#FF8DC7",
  textColor = "#FFFFFF",
}: {
  titulo: string;
  onPress: () => void;
  color?: string;
  textColor?: string;
}) {
  return (
    <TouchableOpacity
      style={[styles.botonPrincipal, { backgroundColor: color }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.textoBoton, { color: textColor }]}>{titulo}</Text>
    </TouchableOpacity>
  );
}
export default function HomeScreen() {
  // Estado para saber si el usuario ya inició sesión
  const [autenticado, setAutenticado] = useState(false);

  // Estados para login
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");

  // Estados para productos
  const [productos, setProductos] = useState<Producto[]>([]);
  const [productoSeleccionado, setProductoSeleccionado] =
    useState<Producto | null>(null);

  // Estado para registrar salida de inventario
  const [salida, setSalida] = useState("");

  // Estado para mostrar u ocultar el lector QR
  const [mostrarScanner, setMostrarScanner] = useState(false);

  // Permisos de cámara
  const [permission, requestPermission] = useCameraPermissions();

  // Estado para evitar que el QR se lea varias veces seguidas
  const [qrLeido, setQrLeido] = useState(false);

  // Al cargar la app, revisamos si ya hay un token guardado
  useEffect(() => {
    revisarToken();
  }, []);

  // Función para revisar si existe un token guardado
  const revisarToken = async () => {
    const token = await SecureStore.getItemAsync("token");

    if (token) {
      setAutenticado(true);
      cargarProductos();
    }
  };

  // Función para obtener el token JWT guardado
  const obtenerToken = async () => {
    return await SecureStore.getItemAsync("token");
  };

  // Función reutilizable para hacer peticiones protegidas a la API
  const fetchConToken = async (endpoint: string, opciones: any = {}) => {
    const token = await obtenerToken();

    const respuesta = await fetch(`${API_URL}${endpoint}`, {
      ...opciones,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(opciones.headers || {}),
      },
    });

    const data = await respuesta.json();
if (!respuesta.ok) {
  // Si el token es inválido o expiró, eliminamos el token guardado
  // y regresamos al login para que el usuario inicie sesión otra vez.
  if (respuesta.status === 401 || respuesta.status === 403) {
    await SecureStore.deleteItemAsync("token");
    setAutenticado(false);
    setProductos([]);
    setProductoSeleccionado(null);
  }

  throw new Error(data.mensaje || "Error en la solicitud");
}

    return data;
  };

  // Función para iniciar sesión
  const iniciarSesion = async () => {
    try {
      // Validamos que los campos no estén vacíos
      if (!usuario || !password) {
        Alert.alert("Error", "Ingresa usuario y contraseña");
        return;
      }

      // Consumimos el endpoint público POST /login
      const respuesta = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          usuario,
          password,
        }),
      });

      const data = await respuesta.json();

      // Si las credenciales son incorrectas, mostramos mensaje
      if (!respuesta.ok) {
        Alert.alert("Error", data.mensaje || "Credenciales incorrectas");
        return;
      }

      // Guardamos el token JWT en SecureStore
      await SecureStore.setItemAsync("token", data.token);

      // Cambiamos el estado a autenticado
      setAutenticado(true);

      // Cargamos el listado de productos
      cargarProductos();

      Alert.alert("Éxito", "Inicio de sesión correcto");
    } catch (error) {
      Alert.alert("Error", "No se pudo conectar con la API");
    }
  };

  // Función para cargar el listado completo de productos
  const cargarProductos = async () => {
    try {
      const data = await fetchConToken("/productos");
      setProductos(data);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  // Función para consultar un producto específico por ID
  const consultarProducto = async (id: string) => {
    try {
      const data = await fetchConToken(`/productos/${id}`);
      setProductoSeleccionado(data);
      setMostrarScanner(false);
      setQrLeido(false);
    } catch (error: any) {
      Alert.alert("Error", error.message);
      setMostrarScanner(false);
      setQrLeido(false);
    }
  };

  // Función para actualizar el stock registrando una salida
  const actualizarStock = async () => {
    try {
      if (!productoSeleccionado) {
        Alert.alert("Error", "Selecciona un producto primero");
        return;
      }

      const cantidadSalida = parseInt(salida);

      // Validamos que sea una cantidad correcta
      if (!cantidadSalida || cantidadSalida <= 0) {
        Alert.alert("Error", "Ingresa una cantidad válida");
        return;
      }

      // Consumimos el endpoint PUT /productos/:id
      const data = await fetchConToken(`/productos/${productoSeleccionado.id}`, {
        method: "PUT",
        body: JSON.stringify({
          salida: cantidadSalida,
        }),
      });

      Alert.alert("Éxito", data.mensaje);

      // Limpiamos el campo de salida
      setSalida("");

      // Actualizamos el producto mostrado
      setProductoSeleccionado(data.producto);

      // Actualizamos también el listado completo
      cargarProductos();
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  // Función para cerrar sesión
  const cerrarSesion = async () => {
    await SecureStore.deleteItemAsync("token");
    setAutenticado(false);
    setUsuario("");
    setPassword("");
    setProductos([]);
    setProductoSeleccionado(null);
  };

  // Función para activar el scanner QR
  const abrirScanner = async () => {
    if (!permission?.granted) {
      await requestPermission();
    }

    setQrLeido(false);
    setMostrarScanner(true);
  };

  // Función que se ejecuta cuando la cámara lee un QR
  const leerQR = ({ data }: { data: string }) => {
    if (qrLeido) return;

    setQrLeido(true);

    // El QR debe contener el ID del producto, por ejemplo: 1, 2 o 3
    Alert.alert("QR leído", `ID detectado: ${data}`);

    // Consultamos el producto usando el ID leído
    consultarProducto(data);
  };

  // 🌸 Pantalla de login rosa pastel
  if (!autenticado) {
    return (
      <View style={styles.container}>
        <Text style={styles.loginEmoji}>🌸</Text>
        <Text style={styles.titulo}>Sistema de Inventario</Text>
        <Text style={styles.subtitulo}>Inicio de sesión</Text>

        <TextInput
          style={styles.input}
          placeholder="Usuario"
          placeholderTextColor="#D4829B"
          value={usuario}
          onChangeText={setUsuario}
        />

        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          placeholderTextColor="#D4829B"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <BotonPrincipal titulo="✨ Iniciar sesión" onPress={iniciarSesion} />
        <Text style={styles.ayuda}>Usuario de prueba: admin</Text>
        <Text style={styles.ayuda}>Contraseña: 1234</Text>
      </View>
    );
  }

  // Pantalla del scanner QR
  if (mostrarScanner) {
    if (!permission) {
      return (
        <View style={styles.container}>
          <Text>Solicitando permiso de cámara...</Text>
        </View>
      );
    }

    if (!permission.granted) {
      return (
        <View style={styles.container}>
          <Text>No se tiene permiso para usar la cámara</Text>
          <Button title="Dar permiso" onPress={requestPermission} />
          <Button title="Volver" onPress={() => setMostrarScanner(false)} />
        </View>
      );
    }

    return (
      <View style={styles.scannerContainer}>
        <CameraView
          style={styles.camera}
          facing="back"
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
          onBarcodeScanned={leerQR}
        />

        <View style={styles.scannerInfo}>
          <Text style={styles.textoBlanco}>Escanea el QR del producto</Text>
          <Button title="Volver" onPress={() => setMostrarScanner(false)} />
        </View>
      </View>
    );
  }

  // 🌸 Pantalla principal después de iniciar sesión
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>🌸 Inventario Inteligente</Text>

      <BotonPrincipal titulo="📷 Escanear código QR" onPress={abrirScanner} />

      <View style={styles.espacio}>
        <BotonPrincipal titulo="🔄 Actualizar listado" onPress={cargarProductos} color="#FFB6D9" textColor="#4A2040" />
      </View>

      <Text style={styles.subtitulo}>📦 Listado de productos</Text>

      <FlatList
        data={productos}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => consultarProducto(item.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.cardTitulo}>🏷️ ID: {item.id}</Text>
            <Text style={styles.cardTexto}>Nombre: {item.nombre}</Text>
            <Text style={styles.cardTexto}>Stock disponible: {item.stock}</Text>
          </TouchableOpacity>
        )}
      />

      {productoSeleccionado && (
        <View style={styles.detalle}>
          <Text style={styles.subtitulo}>💖 Producto seleccionado</Text>

          <Text style={styles.texto}>ID: {productoSeleccionado.id}</Text>
          <Text style={styles.texto}>Nombre: {productoSeleccionado.nombre}</Text>
          <Text style={styles.texto}>
            Stock disponible: {productoSeleccionado.stock}
          </Text>

          <Text style={styles.subtitulo}>📤 Registrar salida</Text>

          <TextInput
            style={styles.input}
            placeholder="Cantidad a retirar"
            placeholderTextColor="#D4829B"
            value={salida}
            onChangeText={setSalida}
            keyboardType="numeric"
          />

          <BotonPrincipal titulo="✅ Actualizar stock" onPress={actualizarStock} color="#FFC9E0" textColor="#4A2040" />
        </View>
      )}

      <View style={styles.espacioGrande}>
        <BotonPrincipal titulo="🚪 Cerrar sesión" onPress={cerrarSesion} color="#F27A9E" />
      </View>
    </ScrollView>
  );
}

// 🌸 Estilos rosa pastel lindos y acogedores
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: "#FFF5F9",
  },
  loginEmoji: {
    fontSize: 50,
    textAlign: "center",
    marginBottom: 10,
  },
  titulo: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#4A2040",
  },
  subtitulo: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
    color: "#8C4068",
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#FFBDD6",
    borderRadius: 14,
    padding: 14,
    marginBottom: 15,
    backgroundColor: "#FFFFFF",
    color: "#4A2040",
    fontSize: 15,
  },
  card: {
    padding: 16,
    borderWidth: 1.5,
    borderColor: "#FFCCE0",
    borderRadius: 16,
    marginBottom: 12,
    backgroundColor: "#FFE5F1",
    shadowColor: "#FFB6D9",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 4,
  },
  cardTitulo: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 5,
    color: "#8C4068",
  },
  cardTexto: {
    fontSize: 14,
    color: "#4A2040",
    marginBottom: 2,
  },
  detalle: {
    padding: 18,
    borderWidth: 1.5,
    borderColor: "#FFB6D9",
    borderRadius: 16,
    marginTop: 20,
    backgroundColor: "#FFF0F6",
    shadowColor: "#FFB6D9",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 3,
  },
  texto: {
    fontSize: 16,
    marginBottom: 5,
    color: "#4A2040",
  },
  ayuda: {
    marginTop: 10,
    textAlign: "center",
    color: "#B06A8A",
    fontSize: 13,
  },
  espacio: {
    marginTop: 10,
  },
  espacioGrande: {
    marginTop: 30,
    marginBottom: 40,
  },
  scannerContainer: {
    flex: 1,
    backgroundColor: "#2D1525",
  },
  camera: {
    flex: 1,
  },
  scannerInfo: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    alignItems: "center",
  },
  textoBlanco: {
    color: "#FFE5F1",
    fontSize: 18,
    marginBottom: 10,
  },
  botonPrincipal: {
    paddingVertical: 16,
    borderRadius: 18,
    marginTop: 10,
    alignItems: "center",
    backgroundColor: "#FF8DC7",
    shadowColor: "#FF8DC7",
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 5,
  },
  textoBoton: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
});
/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

// 🌸 Paleta rosa pastel linda y acogedora
const tintColorLight = '#FF8DC7';
const tintColorDark = '#FFB6D9';

export const Colors = {
  light: {
    text: '#4A2040',
    background: '#FFF5F9',
    tint: tintColorLight,
    icon: '#D4829B',
    tabIconDefault: '#D4829B',
    tabIconSelected: tintColorLight,
    // Colores extra rosa pastel
    cardBackground: '#FFE5F1',
    cardBorder: '#FFCCE0',
    inputBorder: '#FFBDD6',
    inputBackground: '#FFFFFF',
    buttonPrimary: '#FF8DC7',
    buttonSecondary: '#FFB6D9',
    buttonDanger: '#F27A9E',
    accent: '#FFC9E0',
    subtitleText: '#8C4068',
    helpText: '#B06A8A',
    shadow: '#FFB6D9',
    headerBackground: '#FFD6EB',
    detailBackground: '#FFF0F6',
    detailBorder: '#FFB6D9',
  },
  dark: {
    text: '#FFE5F1',
    background: '#2D1525',
    tint: tintColorDark,
    icon: '#D4829B',
    tabIconDefault: '#D4829B',
    tabIconSelected: tintColorDark,
    cardBackground: '#3D2035',
    cardBorder: '#5A3050',
    inputBorder: '#5A3050',
    inputBackground: '#3D2035',
    buttonPrimary: '#FF8DC7',
    buttonSecondary: '#FFB6D9',
    buttonDanger: '#F27A9E',
    accent: '#5A3050',
    subtitleText: '#FFB6D9',
    helpText: '#D4829B',
    shadow: '#1A0A15',
    headerBackground: '#3D2035',
    detailBackground: '#3D2035',
    detailBorder: '#5A3050',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
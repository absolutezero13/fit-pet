import eva from "@eva-design/eva";

// Base colors that are shared between themes
const baseColors = {
  ...eva,
  "color-success-50": "#E8F5E9",
  "color-success-100": "#CFF9CD",
  "color-success-200": "#9EF3A2",
  "color-success-300": "#68DB79",
  "color-success-400": "#3FB75C",
  "color-success-500": "#11873A",
  "color-success-600": "#0C743A",
  "color-success-700": "#086138",
  "color-success-800": "#054E34",
  "color-success-900": "#034030",
  "color-info-100": "#C9FBF7",
  "color-info-200": "#95F7F6",
  "color-info-300": "#5EDDE7",
  "color-info-400": "#36B9CF",
  "color-info-500": "#038AAF",
  "color-info-600": "#026B96",
  "color-info-700": "#01507D",
  "color-info-800": "#003965",
  "color-info-900": "#002953",
  "color-warning-100": "#FBF6C9",
  "color-warning-200": "#F7EC94",
  "color-warning-300": "#E7D65D",
  "color-warning-400": "#CFBA34",
  "color-warning-500": "#AF9501",
  "color-warning-600": "#967D00",
  "color-warning-700": "#7D6700",
  "color-warning-800": "#655100",
  "color-warning-900": "#534200",
  "color-danger-100": "#F9E1D0",
  "color-danger-200": "#F4BFA3",
  "color-danger-300": "#E08D70",
  "color-danger-400": "#C15E49",
  "color-danger-500": "#99261A",
  "color-danger-600": "#831413",
  "color-danger-700": "#6E0D13",
  "color-danger-800": "#580814",
  "color-danger-900": "#490414",
};

// Light theme colors (original colors)
export const lightColors = {
  ...baseColors,
  "color-primary-50": "#F5F7FA",
  "color-primary-100": "#E2E9F4",
  "color-primary-200": "#C7D4EA",
  "color-primary-300": "#96A4C1",
  "color-primary-400": "#5F6A83",
  "color-primary-500": "#1F2431",
  "color-primary-600": "#161B2A",
  "color-primary-700": "#0F1323",
  "color-primary-800": "#090D1C",
  "color-primary-900": "#050817",
  // Semantic colors for light theme
  background: "#E2E9F4",
  backgroundSecondary: "#F5F7FA",
  surface: "#FFFFFF",
  text: "#1F2431",
  textSecondary: "#5F6A83",
  textTertiary: "#96A4C1",
  textInverse: "#FFFFFF",
  border: "#C7D4EA",
  shadow: "#000000",
};

// Dark theme colors (dark blue dominated)
export const darkColors = {
  ...baseColors,
  "color-primary-50": "#050817",
  "color-primary-100": "#0F1323",
  "color-primary-200": "#161B2A",
  "color-primary-300": "#1F2431",
  "color-primary-400": "#96A4C1",
  "color-primary-500": "#E2E9F4",
  "color-primary-600": "#F5F7FA",
  "color-primary-700": "#FFFFFF",
  "color-primary-800": "#FFFFFF",
  "color-primary-900": "#FFFFFF",
  // Semantic colors for dark theme
  background: "#0A1628",
  backgroundSecondary: "#0F1D32",
  surface: "#162A46",
  text: "#E2E9F4",
  textSecondary: "#96A4C1",
  textTertiary: "#5F6A83",
  textInverse: "#1F2431",
  border: "#1F3A5F",
  shadow: "#000000",
};

export type ThemeColors = typeof lightColors;
export type ThemeMode = "light" | "dark";

// Default export for backward compatibility
export const colors = lightColors;

export const macroColors = {
  calories: colors["color-warning-500"],
  protein: colors["color-success-500"],
  carbs: colors["color-info-500"],
  fats: colors["color-warning-500"],
};

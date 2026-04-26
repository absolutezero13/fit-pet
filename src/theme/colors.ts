import eva from "@eva-design/eva";

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
  background: "#E2E9F4",
  backgroundSecondary: "#F5F7FA",
  surface: "#FFFFFF",
  text: "#1F2431",
  textSecondary: "#5F6A83",
  textTertiary: "#96A4C1",
  textInverse: "#FFFFFF",
  border: "#C7D4EA",
  shadow: "#000000",
  skeleton: "#C7D4EA",
  white: "#FFFFFF",
  accent: "#11873A",
  accentSoft: "#11873A22",
};

export type ThemeColors = typeof lightColors;

const onyxColors: ThemeColors = {
  ...baseColors,
  "color-primary-50": "#000000",
  "color-primary-100": "#0A0A0A",
  "color-primary-200": "#111111",
  "color-primary-300": "#1A1A1A",
  "color-primary-400": "#888888",
  "color-primary-500": "#F0F0F0",
  "color-primary-600": "#F5F5F5",
  "color-primary-700": "#FAFAFA",
  "color-primary-800": "#FFFFFF",
  "color-primary-900": "#FFFFFF",
  "color-success-100": "#0D2E18",
  "color-success-200": "#134D24",
  "color-success-300": "#1A6B30",
  "color-success-400": "#4CAF70",
  "color-success-500": "#4CAF70",
  "color-success-600": "#3DBE6E",
  "color-info-100": "#072A33",
  "color-info-200": "#0C3F4D",
  "color-info-300": "#105566",
  "color-info-400": "#36B9CF",
  "color-info-500": "#36B9CF",
  "color-info-600": "#2AABCF",
  "color-warning-100": "#2A2200",
  "color-warning-200": "#3D3200",
  "color-warning-300": "#514200",
  "color-warning-400": "#D4A800",
  "color-warning-500": "#D4A800",
  "color-warning-600": "#C49B00",
  "color-danger-100": "#2A0D0A",
  "color-danger-200": "#3D1210",
  "color-danger-300": "#5C1A17",
  "color-danger-400": "#E05A4A",
  "color-danger-500": "#E05A4A",
  "color-danger-600": "#CC4A3A",
  background: "#000000",
  backgroundSecondary: "#0A0A0A",
  surface: "#242424",
  text: "#F0F0F0",
  textSecondary: "#888888",
  textTertiary: "#555555",
  textInverse: "#000000",
  border: "#383838",
  shadow: "#000000",
  skeleton: "#1A1A1A",
  white: "#FFFFFF",
  accent: "#4CAF70",
  accentSoft: "#4CAF7022",
};

const midnightGoldColors: ThemeColors = {
  ...onyxColors,
  background: "#100A02",
  backgroundSecondary: "#1A1206",
  surface: "#2B2113",
  border: "#5C4520",
  text: "#F8EFD6",
  textSecondary: "#B59E73",
  textTertiary: "#7A6840",
  skeleton: "#2B2113",
  accent: "#E5B454",
  accentSoft: "#E5B45422",
};

const noirRoseColors: ThemeColors = {
  ...onyxColors,
  background: "#13070B",
  backgroundSecondary: "#1C0A10",
  surface: "#2E1820",
  border: "#5C2A38",
  text: "#FBE6EC",
  textSecondary: "#B98792",
  textTertiary: "#7A5260",
  skeleton: "#2E1820",
  accent: "#E5677A",
  accentSoft: "#E5677A22",
};

const deepOceanColors: ThemeColors = {
  ...onyxColors,
  background: "#031026",
  backgroundSecondary: "#061838",
  surface: "#0F2548",
  border: "#1F4377",
  text: "#E1ECF8",
  textSecondary: "#7494C0",
  textTertiary: "#445E85",
  skeleton: "#0F2548",
  accent: "#36B9CF",
  accentSoft: "#36B9CF22",
};

const violetDuskColors: ThemeColors = {
  ...onyxColors,
  background: "#0C051E",
  backgroundSecondary: "#150932",
  surface: "#241644",
  border: "#3F2980",
  text: "#EDE0FB",
  textSecondary: "#9F8AC8",
  textTertiary: "#604E80",
  skeleton: "#241644",
  accent: "#B388FF",
  accentSoft: "#B388FF22",
};

export enum ThemeId {
  Onyx = "onyx",
  MidnightGold = "midnight-gold",
  NoirRose = "noir-rose",
  DeepOcean = "deep-ocean",
  VioletDusk = "violet-dusk",
  Ivory = "ivory",
}

type ThemeDefinition = {
  id: ThemeId;
  nameKey: string;
  colors: ThemeColors;
  isDark: boolean;
  swatch: { background: string; accent: string };
};

export const themes: Record<ThemeId, ThemeDefinition> = {
  [ThemeId.Onyx]: {
    id: ThemeId.Onyx,
    nameKey: "themeOnyx",
    colors: onyxColors,
    isDark: true,
    swatch: { background: onyxColors.background, accent: onyxColors.accent },
  },
  [ThemeId.MidnightGold]: {
    id: ThemeId.MidnightGold,
    nameKey: "themeMidnightGold",
    colors: midnightGoldColors,
    isDark: true,
    swatch: {
      background: midnightGoldColors.background,
      accent: midnightGoldColors.accent,
    },
  },
  [ThemeId.NoirRose]: {
    id: ThemeId.NoirRose,
    nameKey: "themeNoirRose",
    colors: noirRoseColors,
    isDark: true,
    swatch: {
      background: noirRoseColors.background,
      accent: noirRoseColors.accent,
    },
  },
  [ThemeId.DeepOcean]: {
    id: ThemeId.DeepOcean,
    nameKey: "themeDeepOcean",
    colors: deepOceanColors,
    isDark: true,
    swatch: {
      background: deepOceanColors.background,
      accent: deepOceanColors.accent,
    },
  },
  [ThemeId.VioletDusk]: {
    id: ThemeId.VioletDusk,
    nameKey: "themeVioletDusk",
    colors: violetDuskColors,
    isDark: true,
    swatch: {
      background: violetDuskColors.background,
      accent: violetDuskColors.accent,
    },
  },
  [ThemeId.Ivory]: {
    id: ThemeId.Ivory,
    nameKey: "themeIvory",
    colors: lightColors,
    isDark: false,
    swatch: { background: lightColors.background, accent: lightColors.accent },
  },
};

export const DEFAULT_THEME_ID: ThemeId = ThemeId.Onyx;

export const darkGrayColors = onyxColors;
export const colors = onyxColors;

export const macroColors = {
  calories: "#F5A623",
  protein: colors["color-success-400"],
  carbs: colors["color-info-400"],
  fats: "#FF7043",
};

export const macroBackgrounds = {
  calories: macroColors.calories + "15",
  protein: macroColors.protein + "15",
  carbs: macroColors.carbs + "15",
  fats: macroColors.fats + "15",
};

import { macroColors, macroBackgrounds } from "../theme/colors";

export type MacroType = "calories" | "protein" | "carbs" | "fats";

type IconName = "fire" | "arm-flex" | "bread-slice" | "water";

interface MacroConfig {
  icon: IconName;
  color: string;
  background: string;
  labelKey: string;
}

const macroConfigs: Record<MacroType, MacroConfig> = {
  calories: {
    icon: "fire",
    color: macroColors.calories,
    background: macroBackgrounds.calories,
    labelKey: "calories",
  },
  protein: {
    icon: "arm-flex",
    color: macroColors.protein,
    background: macroBackgrounds.protein,
    labelKey: "proteins",
  },
  carbs: {
    icon: "bread-slice",
    color: macroColors.carbs,
    background: macroBackgrounds.carbs,
    labelKey: "carbs",
  },
  fats: {
    icon: "water",
    color: macroColors.fats,
    background: macroBackgrounds.fats,
    labelKey: "fats",
  },
};

const getMacroConfig = (macro: MacroType): MacroConfig => {
  return macroConfigs[macro];
};

export const withMacroAlpha = (macro: MacroType, alphaHex: string): string =>
  macroConfigs[macro].color + alphaHex;

export default getMacroConfig;

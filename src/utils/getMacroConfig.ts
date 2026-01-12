import { macroColors, macroBackgrounds } from "../theme/colors";

export type MacroType = "calories" | "protein" | "carbs" | "fats";

type IconName =
  | "fire"
  | "lightning-bolt"
  | "bread-slice"
  | "water"
  | "circle-half-full";

interface MacroConfig {
  icon: IconName;
  color: string;
  background: string;
}

const macroConfigs: Record<MacroType, MacroConfig> = {
  calories: {
    icon: "fire",
    color: macroColors.calories,
    background: macroBackgrounds.calories,
  },
  protein: {
    icon: "lightning-bolt",
    color: macroColors.protein,
    background: macroBackgrounds.protein,
  },
  carbs: {
    icon: "bread-slice",
    color: macroColors.carbs,
    background: macroBackgrounds.carbs,
  },
  fats: {
    icon: "water",
    color: macroColors.fats,
    background: macroBackgrounds.fats,
  },
};

const getMacroConfig = (macro: MacroType): MacroConfig => {
  return macroConfigs[macro];
};

export default getMacroConfig;

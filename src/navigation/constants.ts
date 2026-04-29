import { Platform } from "react-native";
import { scale } from "../theme/utils";

export const TAB_BAR_HEIGHT = scale(Platform.select({ ios: 70, default: 70 }));
export const TAB_BAR_ICON_SIZE = scale(24);

export enum TrueSheetNames {
  SIGN_UP = "SIGN_UP",
  LOGIN = "LOGIN",
  LANGUAGE_SELECTION = "LANGUAGE_SELECTION",
  LOG_MEAL = "LOG_MEAL",
  LOG_MEAL_ANALYSIS = "LOG_MEAL_ANALYSIS",
  SCAN_MEAL = "SCAN_MEAL",
  WEIGHT_HEIGHT_PICKER = "WEIGHT_HEIGHT_PICKER",
  SETTINGS_AI_TONE = "SETTINGS_AI_TONE",
  SETTINGS_GOALS = "SETTINGS_GOALS",
  SETTINGS_NOTIFICATIONS = "SETTINGS_NOTIFICATIONS",
  THEME_SELECTION = "THEME_SELECTION",
}

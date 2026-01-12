import { Platform } from "react-native";
import { scale } from "../theme/utils";

export const TAB_BAR_HEIGHT = scale(Platform.select({ ios: 70, default: 70 }));
export const TAB_BAR_ICON_SIZE = scale(24);

export enum TrueSheetNames {
  SIGN_UP = "SIGN_UP",
  LOGIN = "LOGIN",
  LANGUAGE_SELECTION = "LANGUAGE_SELECTION",
  LOG_MEAL = "LOG_MEAL",
  SCAN_MEAL = "SCAN_MEAL",
  WEIGHT_HEIGHT_PICKER = "WEIGHT_HEIGHT_PICKER",
}

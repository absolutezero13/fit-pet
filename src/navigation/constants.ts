import { Platform } from "react-native";
import { scale } from "../theme/utils";

export const TAB_BAR_HEIGHT = scale(Platform.select({ ios: 70, default: 70 }));
export const TAB_BAR_ICON_SIZE = scale(24);

export enum TrueSheetNames {
  SIGN_UP = "SIGN_UP",
  LANGUAGE_SELECTION = "LANGUAGE_SELECTION",
}

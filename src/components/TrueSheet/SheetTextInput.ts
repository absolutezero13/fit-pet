import { Platform } from "react-native";
import type { SheetTextInputComponent } from "./types";

type SheetTextInputModule = {
  default: SheetTextInputComponent;
};

const sheetTextInputModule: SheetTextInputModule =
  Platform.OS === "android"
    ? require("./SheetTextInput.android")
    : require("./SheetTextInput.ios");

const SheetTextInput = sheetTextInputModule.default;

export default SheetTextInput;

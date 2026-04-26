import { Platform } from "react-native";
import type { SheetScrollViewComponent } from "./types";

type SheetScrollViewModule = {
  default: SheetScrollViewComponent;
};

const sheetScrollViewModule: SheetScrollViewModule =
  Platform.OS === "android"
    ? require("./SheetScrollView.android")
    : require("./SheetScrollView.ios");

const SheetScrollView = sheetScrollViewModule.default;

export default SheetScrollView;

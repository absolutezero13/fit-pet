import type React from "react";
import { Platform } from "react-native";
import type { TrueSheetController, TrueSheetProps } from "./types";

type TrueSheetModule = {
  TrueSheet: React.FC<TrueSheetProps> & TrueSheetController;
};

const trueSheetModule: TrueSheetModule =
  Platform.OS === "android"
    ? require("./TrueSheet.android")
    : require("./TrueSheet.ios");

export const TrueSheet = trueSheetModule.TrueSheet;

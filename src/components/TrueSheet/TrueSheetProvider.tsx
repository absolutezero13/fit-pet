import type React from "react";
import type { PropsWithChildren } from "react";
import { Platform } from "react-native";

type TrueSheetProviderModule = {
  default: React.ComponentType<PropsWithChildren>;
};

const trueSheetProviderModule: TrueSheetProviderModule =
  Platform.OS === "android"
    ? require("./TrueSheetProvider.android")
    : require("./TrueSheetProvider.ios");

const TrueSheetProvider = trueSheetProviderModule.default;

export default TrueSheetProvider;

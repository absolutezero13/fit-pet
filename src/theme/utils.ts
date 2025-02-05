import { Dimensions, ViewStyle } from "react-native";
import { colors } from "./colors";

const scaleFactor = Dimensions.get("window").width / 375;

export const scale = (size: number) => size * scaleFactor;
export const SCREEN_HEIGHT = Dimensions.get("window").height;
export const SCREEN_WIDTH = Dimensions.get("window").width;

export const shadowStyle: ViewStyle = {
  shadowColor: colors["color-primary-500"],
  shadowOffset: {
    width: 0,
    height: scale(2),
  },
  shadowOpacity: 0.25,
  shadowRadius: scale(3.84),
  elevation: scale(5),
};

import { StyleSheet } from "react-native";
import { colors } from "./colors";
import { scale } from "./utils";

export const fontStyles = StyleSheet.create({
  hero: {
    fontFamily: "Nunito_900Black",
    fontSize: scale(48),
    lineHeight: scale(64),
    color: colors["color-primary-500"],
  },
  headline1: {
    fontFamily: "Nunito_900Black",
    fontSize: scale(32),
    lineHeight: scale(44),
    color: colors["color-primary-500"],
  },
  headline2: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: scale(24),
    lineHeight: scale(32),
    color: colors["color-primary-500"],
  },
  headline3: {
    fontFamily: "Nunito_700Bold",
    fontSize: scale(20),
    color: colors["color-primary-500"],
    lineHeight: scale(28),
  },
  headline4: {
    fontFamily: "Nunito_600SemiBold",
    color: colors["color-primary-500"],
    fontSize: scale(18),
    lineHeight: scale(24),
  },

  body1: {
    fontFamily: "Nunito_400Regular",
    fontSize: scale(16),
    lineHeight: scale(24),
    color: colors["color-primary-500"],
  },

  body2: {
    fontFamily: "Nunito_400Regular",
    color: colors["color-primary-500"],
    fontSize: scale(14),
    lineHeight: scale(20),
  },
  caption: {
    fontFamily: "Nunito_400Regular",
    fontSize: scale(12),
    color: colors["color-primary-500"],
    lineHeight: scale(16),
  },
  footnote: {
    fontFamily: "Nunito_400Regular",
    fontSize: scale(10),
    color: colors["color-primary-500"],
    lineHeight: scale(14),
  },
});

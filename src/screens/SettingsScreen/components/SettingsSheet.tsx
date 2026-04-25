import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { TrueSheetNames } from "../../../navigation/constants";
import { useTheme } from "../../../theme/ThemeContext";
import { fontStyles } from "../../../theme/fontStyles";
import { scale } from "../../../theme/utils";

type Props = {
  name: TrueSheetNames;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  onWillPresent?: () => void;
};

const SettingsSheet = ({
  name,
  title,
  children,
  footer,
  onWillPresent,
}: Props) => {
  const { colors, isDark } = useTheme();

  return (
    <TrueSheet
      name={name}
      detents={["auto"]}
      maxHeight={scale(720)}
      blurTint={
        isDark ? "system-thick-material-dark" : "system-thick-material-light"
      }
      insetAdjustment="never"
      onWillPresent={onWillPresent}
      blurOptions={{
        interaction: false,
      }}
    >
      <View style={styles.container}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        <View style={styles.content}>{children}</View>
        {footer ? footer : null}
      </View>
    </TrueSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: scale(24),
    paddingBottom: scale(28),
  },
  title: {
    ...fontStyles.headline2,
    marginBottom: scale(16),
    textAlign: "center",
  },
  content: {
    alignSelf: "stretch",
    gap: scale(16),
    width: "100%",
  },
});

export default SettingsSheet;

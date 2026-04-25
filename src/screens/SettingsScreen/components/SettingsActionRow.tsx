import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { scale } from "../../../theme/utils";
import { fontStyles } from "../../../theme/fontStyles";
import type { ThemeColors } from "../../../theme/colors";

type MaterialIconName = keyof typeof MaterialCommunityIcons.glyphMap;

export type SettingsActionRowProps = {
  icon: MaterialIconName;
  title: string;
  colors: ThemeColors;
  value?: string;
  onPress?: () => void;
  trailing?: React.ReactNode;
  isLast?: boolean;
};

const SettingsActionRow = ({
  icon,
  title,
  colors,
  value,
  onPress,
  trailing,
  isLast = false,
}: SettingsActionRowProps) => {
  const row = (
    <View
      style={[
        styles.preferenceRow,
        {
          borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <View style={styles.preferenceInfo}>
        <View
          style={[
            styles.preferenceIconWrap,
            { backgroundColor: colors.backgroundSecondary },
          ]}
        >
          <MaterialCommunityIcons
            name={icon}
            size={scale(20)}
            color={colors.text}
          />
        </View>

        <View style={styles.preferenceCopy}>
          <Text style={[styles.preferenceTitle, { color: colors.text }]}>
            {title}
          </Text>
          {value ? (
            <Text
              numberOfLines={1}
              style={[styles.preferenceValue, { color: colors.textSecondary }]}
            >
              {value}
            </Text>
          ) : null}
        </View>
      </View>

      {trailing ?? (
        <MaterialCommunityIcons
          name="chevron-right"
          size={scale(22)}
          color={colors.textSecondary}
        />
      )}
    </View>
  );

  if (!onPress) {
    return row;
  }

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress}>
      {row}
    </TouchableOpacity>
  );
};

export const settingsActionRowStyles = StyleSheet.create({
  preferenceRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: scale(14),
  },
  preferenceInfo: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    minWidth: 0,
  },
  preferenceIconWrap: {
    alignItems: "center",
    borderRadius: scale(16),
    height: scale(44),
    justifyContent: "center",
    marginRight: scale(12),
    width: scale(44),
  },
  preferenceCopy: {
    flex: 1,
    minWidth: 0,
  },
  preferenceTitle: {
    ...fontStyles.headline4,
  },
  preferenceValue: {
    ...fontStyles.body2,
    marginTop: scale(2),
  },
});

const styles = settingsActionRowStyles;

export default SettingsActionRow;

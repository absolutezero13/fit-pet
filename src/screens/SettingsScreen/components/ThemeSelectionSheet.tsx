import React, { FC, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { TrueSheetNames } from "../../../navigation/constants";
import { scale } from "../../../theme/utils";
import { fontStyles } from "../../../theme/fontStyles";
import { useTheme } from "../../../theme/ThemeContext";
import { ThemeId, themes } from "../../../theme/colors";
import AppButton from "../../../components/AppButton";
import SettingsSheet from "./SettingsSheet";

type ThemeOptionRowProps = {
  id: ThemeId;
  isSelected: boolean;
  onPress: (id: ThemeId) => void;
};

const ThemeOptionRow: FC<ThemeOptionRowProps> = ({
  id,
  isSelected,
  onPress,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const definition = themes[id];

  const handlePress = () => onPress(id);

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={handlePress}
      style={[
        styles.row,
        {
          backgroundColor: isSelected
            ? colors.accentSoft
            : colors.backgroundSecondary,
          borderColor: isSelected ? colors.accent : "transparent",
        },
      ]}
    >
      <View
        style={[
          styles.swatchOuter,
          { backgroundColor: definition.swatch.background },
        ]}
      >
        <View
          style={[
            styles.swatchInner,
            { backgroundColor: definition.swatch.accent },
          ]}
        />
      </View>

      <View style={styles.copy}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t(definition.nameKey)}
        </Text>
      </View>

      {isSelected ? (
        <View style={[styles.check, { backgroundColor: colors.accent }]}>
          <Ionicons
            name="checkmark"
            size={scale(14)}
            color={colors.textInverse}
          />
        </View>
      ) : null}
    </TouchableOpacity>
  );
};

const ThemeSelectionSheet: FC = () => {
  const { t } = useTranslation();
  const { theme, setTheme, colors, isDark } = useTheme();
  const [draftTheme, setDraftTheme] = useState<ThemeId>(theme);
  const [saving, setSaving] = useState(false);

  const surfaceCardStyle = {};

  const handleWillPresent = () => {
    setDraftTheme(theme);
  };

  const handleSelect = (id: ThemeId) => {
    setDraftTheme(id);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      if (draftTheme !== theme) {
        setTheme(draftTheme);
      }
      await TrueSheet.dismiss(TrueSheetNames.THEME_SELECTION);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsSheet
      name={TrueSheetNames.THEME_SELECTION}
      title={t("themePickerTitle")}
      onWillPresent={handleWillPresent}
      footer={
        <AppButton
          title={t("save")}
          onPress={handleSave}
          loading={saving}
          disabled={saving}
          margin={{ marginHorizontal: scale(24) }}
        />
      }
    >
      <View style={[styles.card, surfaceCardStyle]}>
        <View style={styles.list}>
          {Object.values(themes).map((definition) => (
            <ThemeOptionRow
              key={definition.id}
              id={definition.id}
              isSelected={definition.id === draftTheme}
              onPress={handleSelect}
            />
          ))}
        </View>
      </View>
    </SettingsSheet>
  );
};

export default ThemeSelectionSheet;

const styles = StyleSheet.create({
  card: {
    borderRadius: scale(28),
    elevation: 6,
    padding: scale(18),
    shadowOffset: { width: 0, height: scale(6) },
    shadowRadius: scale(18),
    width: "100%",
  },
  list: {
    gap: scale(10),
  },
  row: {
    alignItems: "center",
    borderRadius: scale(20),
    borderWidth: 1,
    flexDirection: "row",
    gap: scale(14),
    minHeight: scale(68),
    paddingHorizontal: scale(16),
    paddingVertical: scale(14),
  },
  swatchOuter: {
    alignItems: "center",
    borderRadius: scale(18),
    height: scale(36),
    justifyContent: "center",
    width: scale(36),
  },
  swatchInner: {
    borderRadius: scale(10),
    height: scale(20),
    width: scale(20),
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    ...fontStyles.body1Bold,
  },
  check: {
    alignItems: "center",
    borderRadius: scale(11),
    height: scale(22),
    justifyContent: "center",
    width: scale(22),
  },
});

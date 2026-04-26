import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { TrueSheet } from "../../../components/TrueSheet";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { TrueSheetNames } from "../../../navigation/constants";
import { useTheme } from "../../../theme/ThemeContext";
import { fontStyles } from "../../../theme/fontStyles";
import { scale } from "../../../theme/utils";
import AppButton from "../../../components/AppButton";
import { AITone } from "../../../zustand/usePreferencesStore";
import SettingsSheet from "./SettingsSheet";

type ToneOption = {
  key: AITone;
  label: string;
};

type ToneOptionCardProps = {
  option: ToneOption;
  selectedTone: AITone;
  onToneSelect: (tone: AITone) => void;
};

type Props = {
  toneOptions: ToneOption[];
  selectedTone: AITone;
  onSaveTone: (tone: AITone) => void;
};

const ToneOptionCard = ({
  option,
  selectedTone,
  onToneSelect,
}: ToneOptionCardProps) => {
  const { colors } = useTheme();
  const isSelected = selectedTone === option.key;

  const handlePress = () => {
    onToneSelect(option.key);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={handlePress}
      style={[
        styles.toneChip,
        {
          backgroundColor: isSelected
            ? colors.accentSoft
            : colors.backgroundSecondary,
          borderColor: isSelected ? colors.accent : "transparent",
        },
      ]}
    >
      <Text
        numberOfLines={2}
        style={[
          styles.toneChipLabel,
          { color: isSelected ? colors.text : colors.textSecondary },
        ]}
      >
        {option.label}
      </Text>

      {isSelected ? (
        <View
          style={[styles.selectionCheck, { backgroundColor: colors.accent }]}
        >
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

const ToneSettingsSheet = ({
  toneOptions,
  selectedTone,
  onSaveTone,
}: Props) => {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const [draftTone, setDraftTone] = useState(selectedTone);

  const surfaceCardStyle = {};

  const handleWillPresent = () => {
    setDraftTone(selectedTone);
  };

  const handleSave = async () => {
    onSaveTone(draftTone);
    await TrueSheet.dismiss(TrueSheetNames.SETTINGS_AI_TONE);
  };

  return (
    <SettingsSheet
      name={TrueSheetNames.SETTINGS_AI_TONE}
      title={t("aiTone")}
      onWillPresent={handleWillPresent}
      footer={
        <AppButton
          title={t("save")}
          onPress={handleSave}
          margin={{ marginHorizontal: scale(24) }}
        />
      }
    >
      <View style={[styles.card, surfaceCardStyle]}>
        <View style={styles.toneGrid}>
          {toneOptions.map((option) => (
            <ToneOptionCard
              key={option.key}
              option={option}
              selectedTone={draftTone}
              onToneSelect={setDraftTone}
            />
          ))}
        </View>
      </View>
    </SettingsSheet>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: scale(28),
    padding: scale(18),
  },
  toneGrid: {
    gap: scale(10),
  },
  toneChip: {
    alignItems: "center",
    borderRadius: scale(20),
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: scale(58),
    paddingHorizontal: scale(16),
    paddingVertical: scale(14),
    width: "100%",
  },
  toneChipLabel: {
    ...fontStyles.body1Bold,
    flex: 1,
    marginRight: scale(12),
  },
  selectionCheck: {
    alignItems: "center",
    borderRadius: scale(11),
    height: scale(22),
    justifyContent: "center",
    width: scale(22),
  },
});

export default ToneSettingsSheet;

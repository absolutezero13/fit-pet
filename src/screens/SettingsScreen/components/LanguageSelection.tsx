import React, { FC, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { TrueSheet } from "../../../components/TrueSheet";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { setLanguage } from "../../../services/languageService";
import { TrueSheetNames } from "../../../navigation/constants";
import { scale } from "../../../theme/utils";
import { fontStyles } from "../../../theme/fontStyles";
import { useTheme } from "../../../theme/ThemeContext";
import AppButton from "../../../components/AppButton";
import SettingsSheet from "./SettingsSheet";

type LanguageOption = {
  code: string;
  localName: string;
  name: string;
};

type Props = {
  languageOptions: LanguageOption[];
};

type LanguageOptionRowProps = {
  item: LanguageOption;
  isSelected: boolean;
  onPress: (languageCode: string) => void;
};

const LanguageOptionRow = ({
  item,
  isSelected,
  onPress,
}: LanguageOptionRowProps) => {
  const { colors } = useTheme();

  const handlePress = () => {
    onPress(item.code);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={handlePress}
      style={[
        styles.languageOption,
        {
          backgroundColor: isSelected
            ? colors.accentSoft
            : colors.backgroundSecondary,
          borderColor: isSelected ? colors.accent : "transparent",
        },
      ]}
    >
      <View style={styles.languageOptionContent}>
        <Text style={[styles.languageText, { color: colors.text }]}>
          {item.localName}
        </Text>
        <Text
          style={[styles.languageMetaText, { color: colors.textSecondary }]}
        >
          {item.name}
        </Text>
      </View>

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

const LanguageSelection: FC<Props> = ({ languageOptions }) => {
  const { t, i18n } = useTranslation();
  const { colors, isDark } = useTheme();
  const [draftLanguage, setDraftLanguage] = useState(i18n.language);
  const [saving, setSaving] = useState(false);

  const handleWillPresent = () => {
    setDraftLanguage(i18n.language);
  };

  const handleLanguageSelect = (languageCode: string) => {
    setDraftLanguage(languageCode);
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      if (draftLanguage !== i18n.language) {
        await setLanguage(draftLanguage);
      }

      await TrueSheet.dismiss(TrueSheetNames.LANGUAGE_SELECTION);
    } catch (error) {
      console.error("Error changing language:", error);
      await TrueSheet.dismiss(TrueSheetNames.LANGUAGE_SELECTION);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsSheet
      name={TrueSheetNames.LANGUAGE_SELECTION}
      title={t("selectLanguage")}
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
      <View style={[styles.card]}>
        <View style={styles.languageList}>
          {languageOptions.map((item) => (
            <LanguageOptionRow
              key={item.code}
              item={item}
              isSelected={item.code === draftLanguage}
              onPress={handleLanguageSelect}
            />
          ))}
        </View>
      </View>
    </SettingsSheet>
  );
};

export default LanguageSelection;

const styles = StyleSheet.create({
  card: {
    borderRadius: scale(28),
    padding: scale(18),
    shadowOffset: {
      width: 0,
      height: scale(6),
    },
    shadowRadius: scale(18),
    width: "100%",
  },
  languageList: {
    gap: scale(10),
  },
  languageOption: {
    alignItems: "center",
    borderRadius: scale(20),
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: scale(68),
    paddingHorizontal: scale(16),
    paddingVertical: scale(14),
  },
  languageOptionContent: {
    flex: 1,
    minWidth: 0,
  },
  languageText: {
    ...fontStyles.body1Bold,
  },
  languageMetaText: {
    ...fontStyles.body2,
    marginTop: scale(2),
  },
  selectionCheck: {
    alignItems: "center",
    borderRadius: scale(11),
    height: scale(22),
    justifyContent: "center",
    width: scale(22),
  },
});

import React, { FC } from "react";
import { View, TouchableOpacity, FlatList, StyleSheet, Text } from "react-native";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { colors } from "../../../theme/colors";
import { scale } from "../../../theme/utils";
import { fontStyles } from "../../../theme/fontStyles";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { changeLanguage } from "i18next";
import { storageService } from "../../../storage/AsyncStorageService";
import { TrueSheetNames } from "../../../navigation/constants";

type Props = {
  languageOptions: {
    code: string;
    localName: string;
    name: string;
  }[];
};

const LanguageSelection: FC<Props> = ({ languageOptions }) => {
  const { t, i18n } = useTranslation();

  const handleLanguageChange = async (languageCode: string) => {
    try {
      // Change the language in i18next
      await changeLanguage(languageCode);

      // Persist the language choice to storage
      await storageService.setItem("language", { code: languageCode });

      // Dismiss the sheet
      TrueSheet.dismiss(TrueSheetNames.LANGUAGE_SELECTION);
    } catch (error) {
      console.error("Error changing language:", error);
      // Still dismiss the sheet even if storage fails
      TrueSheet.dismiss(TrueSheetNames.LANGUAGE_SELECTION);
    }
  };

  return (
    <TrueSheet
      name={TrueSheetNames.LANGUAGE_SELECTION}
      detents={["auto"]}
      blurTint="system-thick-material-light"
      insetAdjustment="never"
      blurOptions={{
        interaction: false,
      }}
    >
      <View style={styles.container}>
        <Text style={styles.title}>{t("selectLanguage")}</Text>

        <FlatList
          data={languageOptions}
          keyExtractor={(item) => item.code}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.languageOption,
                item.code === i18n.language && styles.languageOptionSelected,
              ]}
              onPress={() => handleLanguageChange(item.code)}
            >
              <Text
                style={[
                  styles.languageText,
                  item.code === i18n.language && styles.languageTextSelected,
                ]}
              >
                {item.localName}
              </Text>
              {item.code === i18n.language && (
                <View style={styles.checkmarkContainer}>
                  <Ionicons
                    name="checkmark"
                    size={scale(20)}
                    color="white"
                  />
                </View>
              )}
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.languageList}
        />
      </View>
    </TrueSheet>
  );
};

export default LanguageSelection;

const styles = StyleSheet.create({
  container: {
    paddingTop: scale(24),
    paddingBottom: scale(32),
    paddingHorizontal: scale(24),
  },
  title: {
    ...fontStyles.headline2,
    color: colors["color-primary-500"],
    marginBottom: scale(16),
    textAlign: "center",
  },
  languageList: {
    gap: scale(8),
  },
  languageOption: {
    paddingVertical: scale(16),
    paddingHorizontal: scale(16),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: scale(12),
    backgroundColor: colors["color-primary-50"],
  },
  languageOptionSelected: {
    backgroundColor: colors["color-primary-100"],
    borderWidth: 2,
    borderColor: colors["color-primary-500"],
  },
  languageText: {
    ...fontStyles.headline4,
    color: colors["color-primary-500"],
  },
  languageTextSelected: {
    fontWeight: "bold",
  },
  checkmarkContainer: {
    width: scale(28),
    height: scale(28),
    borderRadius: scale(14),
    backgroundColor: colors["color-primary-500"],
    justifyContent: "center",
    alignItems: "center",
  },
});

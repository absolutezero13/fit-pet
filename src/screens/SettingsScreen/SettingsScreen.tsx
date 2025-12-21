import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { scale } from "../../theme/utils";
import { colors } from "../../theme/colors";
import { useNavigation } from "@react-navigation/native";
import { GoalEnum } from "../../zustand/useOnboardingStore";
import { useTranslation } from "react-i18next";
import { fontStyles } from "../../theme/fontStyles";
import useAuthService from "../../services/auth";
import { goalItems } from "../OnboardingScreen/components/Goal";
import useUserStore from "../../zustand/useUserStore";
import AppButton from "../../components/AppButton";
import LanguageSelection from "./components/LanguageSelection";
import userService from "../../services/user";
import {
  isLiquidGlassSupported,
  LiquidGlassView,
} from "@callstack/liquid-glass";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type LanguageOption = { code: string; name: string; localName: string };

const SettingsScreen = () => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const authService = useAuthService();
  const { top } = useSafeAreaInsets();

  const user = useUserStore();

  const [localWeight, setLocalWeight] = useState(
    user?.onboarding?.weight ? user.onboarding.weight.toString() : ""
  );
  const [localHeight, setLocalHeight] = useState(
    user?.onboarding?.height ? user.onboarding.height.toString() : ""
  );
  const [isLanguageModalVisible, setIsLanguageModalVisible] = useState(false);
  const [selectedGoals, setSelectedGoals] = useState<GoalEnum[]>(
    user?.onboarding?.goals || []
  );

  // Language options - easily expandable for future languages
  const languageOptions: LanguageOption[] = [
    { code: "en", name: "English", localName: "English" },
    { code: "tr", name: "Turkish", localName: "Türkçe" },
    // Add more languages here in the future
  ];

  const toggleGoal = (key: GoalEnum) => {
    if (selectedGoals.includes(key)) {
      setSelectedGoals(selectedGoals.filter((g) => g !== key));
    } else {
      setSelectedGoals([...selectedGoals, key]);
    }
  };

  const saveChanges = async () => {
    // Validate inputs
    const weightNum = parseFloat(localWeight);
    const heightNum = parseFloat(localHeight);

    if (isNaN(weightNum) || isNaN(heightNum)) {
      Alert.alert(
        t("settings.validationError"),
        t("settings.enterValidNumbers")
      );
      return;
    }

    await userService.createOrUpdateUser({
      onboarding: {
        goals: selectedGoals,
        height: heightNum,
        weight: weightNum,
      },
    });

    navigation.goBack();
  };

  const currentLanguage =
    languageOptions.find((lang) => lang.code === i18n.language) ||
    languageOptions[0];

  return (
    <View style={[styles.container]}>
      <LiquidGlassView
        effect={"clear"}
        style={[styles.header, { paddingTop: top }]}
        tintColor={colors["color-primary-100"]}
      >
        <MaterialCommunityIcons
          name="chevron-left"
          size={scale(40)}
          color={colors["color-primary-500"]}
          onPress={navigation.goBack}
        />

        <Text style={styles.title}>{t("settingsTitle")}</Text>
      </LiquidGlassView>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Language Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("language")}</Text>
          <TouchableOpacity
            style={styles.card}
            onPress={() => setIsLanguageModalVisible(true)}
          >
            <View style={styles.settingRow}>
              <View style={styles.settingLabelContainer}>
                <MaterialCommunityIcons
                  name="translate"
                  size={scale(20)}
                  color={colors["color-primary-500"]}
                  style={styles.icon}
                />
                <Text style={styles.settingLabel}>
                  {currentLanguage.localName}
                </Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={scale(24)}
                color={colors["color-primary-400"]}
              />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("profile")}</Text>
          <View style={styles.card}>
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>{t("weight")}</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={localWeight}
                  onChangeText={setLocalWeight}
                  keyboardType="numeric"
                  placeholder="0"
                />
                <Text style={styles.inputUnit}>kg</Text>
              </View>
            </View>

            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>{t("height")}</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={localHeight}
                  onChangeText={setLocalHeight}
                  keyboardType="numeric"
                  placeholder="0"
                />
                <Text style={styles.inputUnit}>cm</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("goals")}</Text>
          <View style={styles.card}>
            {goalItems.map((goal) => (
              <TouchableOpacity
                key={goal.key}
                style={styles.goalRow}
                onPress={() => toggleGoal(goal.key)}
              >
                <Text style={styles.goalText}>{t(goal.titleKey)}</Text>
                <View style={styles.checkboxContainer}>
                  <View
                    style={[
                      styles.checkbox,
                      selectedGoals.some((g) => g === goal.key) &&
                        styles.checkboxSelected,
                    ]}
                  >
                    {selectedGoals.some((g) => g === goal.key) && (
                      <Ionicons
                        name="checkmark"
                        size={scale(16)}
                        color="white"
                      />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                t("logoutConfirmation"),
                t("logoutConfirmationMessage"),
                [
                  {
                    text: t("cancel"),
                    style: "cancel",
                  },
                  {
                    text: t("logoutConfirmation"),
                    style: "destructive",
                    onPress: () => {
                      authService.logout(navigation);
                    },
                  },
                ]
              );
            }}
            style={styles.card}
          >
            <Text>{t("logoutConfirmation")}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            onPress={async () => {
              Alert.alert(
                t("deleteAccountConfirmation"),
                t("deleteAccountConfirmationMessage"),
                [
                  {
                    text: t("cancel"),
                    style: "cancel",
                  },
                  {
                    text: t("deleteAccountConfirmation"),
                    style: "destructive",
                    onPress: async () => {
                      await userService.deletUser();
                      authService.logout(navigation);
                    },
                  },
                ]
              );
            }}
            style={styles.card}
          >
            <Text style={{ color: "red" }}>
              {t("deleteAccountConfirmation")}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <LanguageSelection
        visible={isLanguageModalVisible}
        onClose={() => setIsLanguageModalVisible(false)}
        languageOptions={languageOptions}
      />

      <AppButton
        title={t("saveChanges")}
        onPress={saveChanges}
        position="bottom"
        margin={{
          marginHorizontal: scale(24),
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors["color-primary-100"],
  },
  header: {
    paddingHorizontal: scale(24),
    paddingVertical: scale(16),
    flexDirection: "row",
    alignItems: "center",
    gap: scale(4),
    position: "absolute",
    width: "100%",
    backgroundColor: isLiquidGlassSupported
      ? undefined
      : colors["color-primary-50"],
    zIndex: 1,
  },
  title: {
    ...fontStyles.headline1,
    color: colors["color-primary-500"],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: scale(24),
    paddingBottom: scale(72),
    paddingTop: scale(96),
  },
  section: {
    marginBottom: scale(24),
  },
  sectionTitle: {
    ...fontStyles.headline3,
    color: colors["color-primary-500"],
    marginBottom: scale(12),
  },
  card: {
    backgroundColor: "white",
    borderRadius: scale(16),
    padding: scale(16),
    shadowColor: colors["color-primary-500"],
    shadowOffset: {
      width: 0,
      height: scale(2),
    },
    shadowOpacity: 0.05,
    shadowRadius: scale(8),
    elevation: 3,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: scale(8),
  },
  settingLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: scale(8),
  },
  settingLabel: {
    ...fontStyles.body1,
    color: colors["color-primary-500"],
  },
  inputRow: {
    marginBottom: scale(16),
  },
  inputLabel: {
    ...fontStyles.body2,
    color: colors["color-primary-400"],
    marginBottom: scale(8),
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors["color-primary-300"],
    borderRadius: scale(12),
    height: scale(48),
    paddingHorizontal: scale(12),
  },
  input: {
    flex: 1,
    ...fontStyles.body1,
    height: scale(48),
    color: colors["color-primary-500"],
  },
  inputUnit: {
    ...fontStyles.body2,
    color: colors["color-primary-400"],
    width: scale(24),
    textAlign: "center",
  },
  goalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: scale(12),
    borderBottomWidth: 1,
    borderBottomColor: colors["color-primary-100"],
  },
  goalText: {
    ...fontStyles.body1,
    color: colors["color-primary-500"],
  },
  checkboxContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  checkbox: {
    width: scale(24),
    height: scale(24),
    borderRadius: scale(4),
    borderWidth: 2,
    borderColor: colors["color-primary-300"],
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxSelected: {
    backgroundColor: colors["color-primary-500"],
    borderColor: colors["color-primary-500"],
  },
  saveButton: {
    backgroundColor: colors["color-success-400"],
    padding: scale(16),
    borderRadius: scale(12),
    alignItems: "center",
    marginHorizontal: scale(24),
    position: "absolute",
    bottom: scale(16),
    left: 0,
    right: 0,
  },
  buttonText: {
    ...fontStyles.headline4,
    color: "white",
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: scale(24),
    borderTopRightRadius: scale(24),
    paddingBottom: scale(32),
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: scale(24),
    borderBottomWidth: 1,
    borderBottomColor: colors["color-primary-100"],
  },
  modalTitle: {
    ...fontStyles.headline3,
    color: colors["color-primary-500"],
  },
  languageList: {
    paddingHorizontal: scale(16),
  },
  languageOption: {
    paddingVertical: scale(16),
    paddingHorizontal: scale(8),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  languageOptionSelected: {
    // backgroundColor: colors["color-primary-100"],
  },
  languageText: {
    ...fontStyles.body1,
    color: colors["color-primary-500"],
  },
  languageTextSelected: {
    fontWeight: "bold",
  },
});

export default SettingsScreen;

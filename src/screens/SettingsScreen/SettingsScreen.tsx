import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  Switch,
} from "react-native";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { scale } from "../../theme/utils";
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
import SignUpBanner from "./components/SignUpBanner";
import SignUpTrueSheet from "./components/SignUpTrueSheet";
import { TrueSheetNames } from "../../navigation/constants";
import usePreferencesStore, { AITone } from "../../zustand/usePreferencesStore";
import { useTheme } from "../../theme/ThemeContext";
import FullPageSpinner from "../../components/FullPageSpinner";
import WeightHeightPicker from "./components/WeightHeightPicker";

type LanguageOption = { code: string; name: string; localName: string };

const SettingsScreen = () => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const authService = useAuthService();
  const { top } = useSafeAreaInsets();
  const { colors, isDark, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const user = useUserStore();
  const aiTone = usePreferencesStore((state) => state.aiTone);
  const setAiTone = usePreferencesStore((state) => state.setAiTone);
  const [deleting, setDeleting] = useState(false);
  const [localWeight, setLocalWeight] = useState(
    user?.onboarding?.weight ?? 70
  );
  const [localHeight, setLocalHeight] = useState(
    user?.onboarding?.height ?? 170
  );
  const [selectedGoals, setSelectedGoals] = useState<GoalEnum[]>(
    user?.onboarding?.goals || []
  );

  // Language options - easily expandable for future languages
  const languageOptions: LanguageOption[] = [
    { code: "en", name: "English", localName: "English" },
    { code: "tr", name: "Turkish", localName: "Türkçe" },
    // Add more languages here in the future
  ];

  const toneOptions: { key: AITone; label: string }[] = [
    { key: AITone.Harsh, label: t("toneHarsh") },
    { key: AITone.Friendly, label: t("toneFriendly") },
    { key: AITone.Funny, label: t("toneFunny") },
    { key: AITone.Nerdy, label: t("toneNerdy") },
    { key: AITone.Supportive, label: t("toneSupportive") },
  ];

  const toggleGoal = (key: GoalEnum) => {
    if (selectedGoals.includes(key)) {
      setSelectedGoals(selectedGoals.filter((g) => g !== key));
    } else {
      setSelectedGoals([...selectedGoals, key]);
    }
  };

  const saveChanges = async () => {
    setLoading(true);

    await userService.createOrUpdateUser({
      onboarding: {
        goals: selectedGoals,
        height: localHeight,
        weight: localWeight,
      },
    });

    navigation.goBack();
    setLoading(false);
  };

  const currentLanguage =
    languageOptions.find((lang) => lang.code === i18n.language) ||
    languageOptions[0];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LiquidGlassView
        effect={"clear"}
        style={[
          styles.header,
          {
            paddingTop: Platform.select({ android: top, ios: scale(16) }),
            backgroundColor: isLiquidGlassSupported
              ? undefined
              : colors.backgroundSecondary,
          },
        ]}
      >
        <MaterialCommunityIcons
          name="chevron-left"
          size={scale(40)}
          color={colors.text}
          onPress={navigation.goBack}
        />

        <Text style={[styles.title, { color: colors.text }]}>
          {t("settingsTitle")}
        </Text>
      </LiquidGlassView>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {!user?.email && <SignUpBanner />}

        {/* Theme Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t("appearance")}
          </Text>
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingLabelContainer}>
                <MaterialCommunityIcons
                  name={isDark ? "weather-night" : "weather-sunny"}
                  size={scale(20)}
                  color={colors.text}
                  style={styles.icon}
                />
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  {t("darkMode")}
                </Text>
              </View>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{
                  false: colors.border,
                  true: colors["color-success-400"],
                }}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t("language")}
          </Text>
          <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.surface }]}
            onPress={() => TrueSheet.present(TrueSheetNames.LANGUAGE_SELECTION)}
          >
            <View style={styles.settingRow}>
              <View style={styles.settingLabelContainer}>
                <MaterialCommunityIcons
                  name="translate"
                  size={scale(20)}
                  color={colors.text}
                  style={styles.icon}
                />
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  {currentLanguage.localName}
                </Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={scale(24)}
                color={colors.textSecondary}
              />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t("aiTone")}
          </Text>
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            {toneOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[styles.goalRow, { borderBottomColor: colors.border }]}
                onPress={() => setAiTone(option.key)}
              >
                <Text style={[styles.goalText, { color: colors.text }]}>
                  {option.label}
                </Text>
                <View style={styles.checkboxContainer}>
                  <View
                    style={[styles.radioButton, { borderColor: colors.border }]}
                  >
                    {aiTone === option.key && (
                      <View
                        style={[
                          styles.radioButtonSelectedInner,
                          { backgroundColor: colors["color-primary-500"] },
                        ]}
                      />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t("profile")}
          </Text>
          <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.surface }]}
            onPress={() => TrueSheet.present(TrueSheetNames.WEIGHT_HEIGHT_PICKER)}
          >
            <View style={styles.profileContent}>
              <View style={styles.profileRows}>
                <View style={styles.profileRow}>
                  <View style={styles.settingLabelContainer}>
                    <MaterialCommunityIcons
                      name="scale-bathroom"
                      size={scale(20)}
                      color={colors.text}
                      style={styles.icon}
                    />
                    <Text style={[styles.settingLabel, { color: colors.text }]}>
                      {t("weight")}: {localWeight} kg
                    </Text>
                  </View>
                </View>
                <View style={styles.profileRow}>
                  <View style={styles.settingLabelContainer}>
                    <MaterialCommunityIcons
                      name="human-male-height"
                      size={scale(20)}
                      color={colors.text}
                      style={styles.icon}
                    />
                    <Text style={[styles.settingLabel, { color: colors.text }]}>
                      {t("height")}: {localHeight} cm
                    </Text>
                  </View>
                </View>
              </View>
              <MaterialCommunityIcons
                name="pencil"
                size={scale(20)}
                color={colors.textSecondary}
              />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t("goals")}
          </Text>
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            {goalItems.map((goal) => (
              <TouchableOpacity
                key={goal.key}
                style={[styles.goalRow, { borderBottomColor: colors.border }]}
                onPress={() => toggleGoal(goal.key)}
              >
                <Text style={[styles.goalText, { color: colors.text }]}>
                  {t(goal.titleKey)}
                </Text>
                <View style={styles.checkboxContainer}>
                  <View
                    style={[
                      styles.checkbox,
                      { borderColor: colors.border },
                      selectedGoals.some((g) => g === goal.key) && {
                        backgroundColor: colors["color-primary-500"],
                        borderColor: colors["color-primary-500"],
                      },
                    ]}
                  >
                    {selectedGoals.some((g) => g === goal.key) && (
                      <Ionicons
                        name="checkmark"
                        size={scale(16)}
                        color={colors.textInverse}
                      />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {user?.email && (
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
              style={[styles.card, { backgroundColor: colors.surface }]}
            >
              <Text style={[fontStyles.headline4, { color: colors.text }]}>
                {t("logoutConfirmation")}
              </Text>
            </TouchableOpacity>
          </View>
        )}
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
                      setDeleting(true);
                      await userService.deletUser();
                      setDeleting(false);
                      authService.logout(navigation);
                    },
                  },
                ]
              );
            }}
            style={[styles.card, { alignItems: "center" }]}
          >
            <Text
              style={[
                fontStyles.headline4,
                {
                  color: colors["color-danger-500"],
                  textAlign: "center",
                  textDecorationLine: "underline",
                },
              ]}
            >
              {t("deleteAccountConfirmation")}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <LanguageSelection languageOptions={languageOptions} />

      <WeightHeightPicker
        weight={localWeight}
        height={localHeight}
        onWeightChange={setLocalWeight}
        onHeightChange={setLocalHeight}
        isDark={isDark}
      />

      <AppButton
        title={t("saveChanges")}
        onPress={saveChanges}
        position="bottom"
        margin={{
          marginHorizontal: scale(24),
        }}
        loading={loading || deleting}
      />
      <SignUpTrueSheet />
      <FullPageSpinner visible={deleting} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: scale(24),
    paddingVertical: scale(16),
    borderRadius: scale(32),
    flexDirection: "row",
    alignItems: "center",
    gap: scale(4),
    position: "absolute",
    width: "100%",
    zIndex: 1,
  },
  title: {
    ...fontStyles.headline1,
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
    ...fontStyles.headline2,
    marginBottom: scale(12),
  },
  card: {
    borderRadius: scale(32),
    padding: scale(16),
    paddingHorizontal: scale(24),
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
    ...fontStyles.headline4,
  },
  profileContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  profileRows: {
    flex: 1,
  },
  profileRow: {
    paddingVertical: scale(12),
  },
  goalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: scale(12),
  },
  goalText: {
    ...fontStyles.headline4,
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
    alignItems: "center",
    justifyContent: "center",
  },
  saveButton: {
    padding: scale(16),
    borderRadius: scale(12),
    alignItems: "center",
    marginHorizontal: scale(24),
    position: "absolute",
    bottom: scale(16),
    left: 0,
    right: 0,
  },
  radioButton: {
    width: scale(24),
    height: scale(24),
    borderRadius: scale(12),
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  radioButtonSelectedInner: {
    width: scale(14),
    height: scale(14),
    borderRadius: scale(7),
  },
});

export default SettingsScreen;

import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { TrueSheet } from "../../components/TrueSheet";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  isLiquidGlassSupported,
  LiquidGlassView,
} from "@callstack/liquid-glass";
import { scale } from "../../theme/utils";
import { fontStyles } from "../../theme/fontStyles";
import useAuthService from "../../services/auth";
import useUserStore from "../../zustand/useUserStore";
import LanguageSelection from "./components/LanguageSelection";
import userService from "../../services/user";
import SignUpBanner from "./components/SignUpBanner";
import SignUpTrueSheet from "./components/SignUpTrueSheet";
import { TrueSheetNames } from "../../navigation/constants";
import usePreferencesStore, { AITone } from "../../zustand/usePreferencesStore";
import { useTheme } from "../../theme/ThemeContext";
import FullPageSpinner from "../../components/FullPageSpinner";
import { analyticsService, AnalyticsEvent } from "../../services/analytics";
import WeightHeightPicker from "./components/WeightHeightPicker";
import ToneSettingsSheet from "./components/ToneSettingsSheet";
import GoalsSettingsSheet from "./components/GoalsSettingsSheet";
import NotificationSettingsSheet from "./components/NotificationSettingsSheet";
import SettingsActionRow from "./components/SettingsActionRow";
import ThemeSelectionSheet from "./components/ThemeSelectionSheet";
import { themes } from "../../theme/colors";

type LanguageOption = { code: string; name: string; localName: string };

const languageOptions: LanguageOption[] = [
  { code: "en", name: "English", localName: "English" },
  { code: "tr", name: "Turkish", localName: "Türkçe" },
];

const SettingsScreen = () => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const authService = useAuthService();
  const { top, bottom } = useSafeAreaInsets();
  const { colors, isDark, theme } = useTheme();
  const user = useUserStore();
  const aiTone = usePreferencesStore((state) => state.aiTone);
  const setAiTone = usePreferencesStore((state) => state.setAiTone);

  const [deleting, setDeleting] = useState(false);
  const currentWeight = user?.onboarding?.weight ?? 70;
  const currentHeight = user?.onboarding?.height ?? 170;

  const toneOptions: { key: AITone; label: string }[] = [
    { key: AITone.Harsh, label: t("toneHarsh") },
    { key: AITone.Friendly, label: t("toneFriendly") },
    { key: AITone.Funny, label: t("toneFunny") },
    { key: AITone.Nerdy, label: t("toneNerdy") },
    { key: AITone.Supportive, label: t("toneSupportive") },
  ];

  const currentLanguage =
    languageOptions.find((language) => language.code === i18n.language) ||
    languageOptions[0];

  const userName = user?.displayName || user?.name;
  const firstName = userName?.split(" ")[0];

  const selectedToneLabel =
    toneOptions.find((option) => option.key === aiTone)?.label ||
    toneOptions[0].label;

  const surfaceCardStyle = {
    backgroundColor: colors.surface,
    shadowColor: colors.shadow,
    shadowOpacity: isDark ? 0.28 : 0.12,
  };

  const deleteCardBackgroundColor = isDark
    ? colors["color-danger-100"]
    : `${colors["color-danger-100"]}DD`;
  const bodyMetricsLabel = `${currentHeight} cm • ${currentWeight} kg`;

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleItemPress = (sheetName: TrueSheetNames) => {
    TrueSheet.present(sheetName);
  };

  const handleSaveTone = (tone: AITone) => {
    setAiTone(tone);
  };

  const handleLogout = () => {
    authService.logout(navigation);
  };

  const handleLogoutPress = () => {
    Alert.alert(t("logoutConfirmation"), t("logoutConfirmationMessage"), [
      {
        text: t("cancel"),
        style: "cancel",
      },
      {
        text: t("logoutConfirmation"),
        style: "destructive",
        onPress: handleLogout,
      },
    ]);
  };

  const handleDeleteAccount = async () => {
    try {
      setDeleting(true);
      await userService.deletUser();
      analyticsService.logEvent(AnalyticsEvent.DeleteUser);
    } finally {
      setDeleting(false);
    }

    authService.logout(navigation);
  };

  const handleDeleteAccountPress = () => {
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
          onPress: handleDeleteAccount,
        },
      ],
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LiquidGlassView
        effect="clear"
        style={[
          styles.header,
          {
            paddingTop: top,
            backgroundColor: isLiquidGlassSupported
              ? undefined
              : colors.backgroundSecondary,
          },
        ]}
      >
        <TouchableOpacity
          accessibilityRole="button"
          activeOpacity={0.8}
          hitSlop={12}
          onPress={handleBackPress}
          style={[
            styles.backButton,
            {
              backgroundColor: isLiquidGlassSupported
                ? undefined
                : colors.backgroundSecondary,
            },
          ]}
        >
          <MaterialCommunityIcons
            name="chevron-left"
            size={scale(26)}
            color={colors.text}
          />
        </TouchableOpacity>

        <View style={styles.headerTitles}>
          {firstName ? (
            <Text style={[styles.greeting, { color: colors.textSecondary }]}>
              {t("hi")}, {firstName}
            </Text>
          ) : null}
          <Text style={[styles.title, { color: colors.text }]}>
            {t("settingsTitle")}
          </Text>
        </View>
      </LiquidGlassView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: top + scale(92),
            paddingBottom: bottom,
          },
        ]}
      >
        {!user?.email ? <SignUpBanner /> : null}

        <View
          style={[styles.sectionCard, styles.settingsCard, surfaceCardStyle]}
        >
          <SettingsActionRow
            icon="bell-outline"
            title={t("notifications")}
            onPress={() =>
              handleItemPress(TrueSheetNames.SETTINGS_NOTIFICATIONS)
            }
            colors={colors}
          />
          <SettingsActionRow
            icon="human-male-height"
            title={`${t("height")} & ${t("weight")}`}
            value={bodyMetricsLabel}
            onPress={() => handleItemPress(TrueSheetNames.WEIGHT_HEIGHT_PICKER)}
            colors={colors}
          />

          <SettingsActionRow
            icon="message-text-outline"
            title={t("aiTone")}
            value={selectedToneLabel}
            onPress={() => handleItemPress(TrueSheetNames.SETTINGS_AI_TONE)}
            colors={colors}
          />
          {/* <SettingsActionRow
            icon="flag-outline"
            title={t("goals")}
            value={goalsSummary}
            onPress={() => handleItemPress(TrueSheetNames.SETTINGS_GOALS)}
            colors={colors}
          /> */}
          <SettingsActionRow
            icon="palette-outline"
            title={t("theme")}
            value={t(themes[theme].nameKey)}
            onPress={() => handleItemPress(TrueSheetNames.THEME_SELECTION)}
            colors={colors}
          />
          <SettingsActionRow
            icon="translate"
            title={t("language")}
            value={currentLanguage.localName}
            onPress={() => handleItemPress(TrueSheetNames.LANGUAGE_SELECTION)}
            colors={colors}
            isLast
          />
        </View>

        <View style={styles.actionStack}>
          {user?.email ? (
            <View style={[styles.sectionCard, surfaceCardStyle]}>
              <SettingsActionRow
                icon="logout"
                title={t("logout")}
                onPress={handleLogoutPress}
                colors={colors}
                isLast
              />
            </View>
          ) : null}

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleDeleteAccountPress}
            style={[
              styles.deleteCard,
              {
                backgroundColor: deleteCardBackgroundColor,
                shadowColor: colors.shadow,
                shadowOpacity: isDark ? 0.24 : 0.1,
              },
            ]}
          >
            <View style={styles.deleteRowInfo}>
              <View
                style={[
                  styles.deleteIconWrap,
                  {
                    backgroundColor: isDark
                      ? `${colors.background}B8`
                      : `${colors.white}CC`,
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="trash-can-outline"
                  size={scale(18)}
                  color={colors["color-danger-500"]}
                />
              </View>

              <View style={styles.deleteRowCopy}>
                <Text
                  style={[
                    styles.deleteRowTitle,
                    { color: colors["color-danger-500"] },
                  ]}
                >
                  {t("deleteAccountConfirmation")}
                </Text>
              </View>
            </View>

            <MaterialCommunityIcons
              name="chevron-right"
              size={scale(20)}
              color={colors["color-danger-500"]}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <NotificationSettingsSheet />
      <ThemeSelectionSheet />
      <ToneSettingsSheet
        toneOptions={toneOptions}
        selectedTone={aiTone}
        onSaveTone={handleSaveTone}
      />
      <GoalsSettingsSheet />
      <LanguageSelection languageOptions={languageOptions} />
      <WeightHeightPicker />

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
    alignItems: "center",
    borderRadius: scale(32),
    flexDirection: "row",
    gap: scale(12),
    paddingBottom: scale(14),
    paddingHorizontal: scale(24),
    position: "absolute",
    width: "100%",
    zIndex: 1,
  },
  backButton: {
    alignItems: "center",
    borderRadius: scale(20),
    height: scale(40),
    justifyContent: "center",
    width: scale(40),
  },
  headerTitles: {
    flex: 1,
  },
  greeting: {
    ...fontStyles.body2,
    marginBottom: scale(2),
  },
  title: {
    ...fontStyles.headline1,
    lineHeight: scale(32),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: scale(24),
  },
  heroCard: {
    borderRadius: scale(32),
    elevation: 8,
    marginBottom: scale(24),
    overflow: "hidden",
    padding: scale(22),
    shadowOffset: {
      width: 0,
      height: scale(8),
    },
    shadowRadius: scale(20),
  },
  heroGlow: {
    borderRadius: scale(64),
    height: scale(128),
    position: "absolute",
    right: scale(-10),
    top: scale(-20),
    width: scale(128),
  },
  heroGlowSecondary: {
    borderRadius: scale(54),
    bottom: scale(-28),
    height: scale(108),
    left: scale(-8),
    position: "absolute",
    width: scale(108),
  },
  heroTopRow: {
    alignItems: "center",
    flexDirection: "row",
  },
  avatarWrap: {
    alignItems: "center",
    borderRadius: scale(24),
    height: scale(64),
    justifyContent: "center",
    marginRight: scale(14),
    width: scale(64),
  },
  avatarLabel: {
    ...fontStyles.headline2,
    color: "white",
    lineHeight: scale(24),
  },
  heroCopy: {
    flex: 1,
    minWidth: 0,
  },
  heroTitle: {
    fontFamily: "Nunito_900Black",
    fontSize: scale(22),
    lineHeight: scale(28),
  },
  heroSubtitle: {
    ...fontStyles.body1,
    marginTop: scale(4),
  },
  sectionCard: {
    borderRadius: scale(28),
    elevation: 6,
    paddingHorizontal: scale(16),
    paddingVertical: scale(4),
    shadowOffset: {
      width: 0,
      height: scale(6),
    },
    shadowRadius: scale(18),
  },
  settingsCard: {
    marginBottom: scale(24),
  },
  actionStack: {
    gap: scale(12),
    marginBottom: scale(16),
  },
  deleteCard: {
    alignItems: "center",
    borderRadius: scale(24),
    elevation: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: scale(48),
    paddingHorizontal: scale(12),
    paddingVertical: scale(10),
    shadowOffset: {
      width: 0,
      height: scale(4),
    },
    shadowRadius: scale(14),
  },
  deleteRowInfo: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    minWidth: 0,
  },
  deleteIconWrap: {
    alignItems: "center",
    borderRadius: scale(12),
    height: scale(36),
    justifyContent: "center",
    marginRight: scale(10),
    width: scale(36),
  },
  deleteRowCopy: {
    flex: 1,
    minWidth: 0,
  },
  deleteRowTitle: {
    ...fontStyles.body1Bold,
  },
});

export default SettingsScreen;

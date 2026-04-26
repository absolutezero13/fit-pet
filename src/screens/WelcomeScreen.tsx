import React, { FC, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { scale } from "../theme/utils";
import { fontStyles } from "../theme/fontStyles";
import { useTheme } from "../theme/ThemeContext";
import { ThemeColors } from "../theme/colors";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
} from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import AppButton from "../components/AppButton";
import { useTranslation } from "react-i18next";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import useAuthService, { LoginType } from "../services/auth";
import userService from "../services/user";
import { getAuth } from "@react-native-firebase/auth";
import { IUser } from "../zustand/useUserStore";
import LoginTrueSheet from "./SettingsScreen/components/LoginTrueSheet";
import SignUpTrueSheet from "./SettingsScreen/components/SignUpTrueSheet";
import { TrueSheet } from "../components/TrueSheet";
import { TrueSheetNames } from "../navigation/constants";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const RING_CORE = scale(76);
const RING_MID = scale(132);
const RING_OUTER = scale(196);

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    hero: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    ringsWrap: {
      width: RING_OUTER,
      height: RING_OUTER,
      alignItems: "center",
      justifyContent: "center",
    },
    ring: {
      position: "absolute",
      borderRadius: 9999,
      borderWidth: StyleSheet.hairlineWidth,
    },
    ringOuter: {
      width: RING_OUTER,
      height: RING_OUTER,
      borderColor: colors.accent + "26",
    },
    ringMid: {
      width: RING_MID,
      height: RING_MID,
      borderColor: colors.accent + "40",
    },
    coreCircle: {
      width: RING_CORE,
      height: RING_CORE,
      borderRadius: RING_CORE / 2,
      backgroundColor: colors.accent + "1F",
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.accent + "66",
      alignItems: "center",
      justifyContent: "center",
    },
    content: {
      paddingHorizontal: scale(24),
    },
    label: {
      ...fontStyles.caption,
      color: colors.accent,
      letterSpacing: 2.5,
      marginBottom: scale(12),
    },
    heading: {
      ...fontStyles.hero,
      fontSize: scale(40),
      lineHeight: scale(46),
      color: colors.text,
      marginBottom: scale(14),
    },
    headingAccent: {
      color: colors.accent,
    },
    description: {
      ...fontStyles.body1,
      fontSize: scale(15),
      lineHeight: scale(22),
      color: colors.textSecondary,
      marginBottom: scale(24),
    },
    pillRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: scale(8),
      marginBottom: scale(28),
    },
    pill: {
      paddingHorizontal: scale(14),
      paddingVertical: scale(8),
      borderRadius: scale(999),
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      backgroundColor: colors.surface + "66",
    },
    pillText: {
      ...fontStyles.body2,
      color: colors.textSecondary,
    },
    buttonWrap: {
      marginBottom: scale(14),
    },
    loginRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: scale(6),
    },
    loginText: {
      ...fontStyles.body2,
      color: colors.textTertiary,
    },
    loginLink: {
      ...fontStyles.body2,
      color: colors.accent,
      fontWeight: "700",
    },
  });

const WelcomeScreen: FC = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const authService = useAuthService();
  const [loading, setLoading] = React.useState(false);
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  const heroOpacity = useSharedValue(0);
  const heroY = useSharedValue(32);
  const contentOpacity = useSharedValue(0);
  const contentY = useSharedValue(40);

  useEffect(() => {
    heroOpacity.value = withDelay(120, withTiming(1, { duration: 700 }));
    heroY.value = withDelay(120, withSpring(0, { damping: 20, stiffness: 80 }));
    contentOpacity.value = withDelay(400, withTiming(1, { duration: 600 }));
    contentY.value = withDelay(
      400,
      withSpring(0, { damping: 20, stiffness: 90 }),
    );
  }, []);

  const heroStyle = useAnimatedStyle(() => ({
    opacity: heroOpacity.value,
    transform: [{ translateY: heroY.value }],
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentY.value }],
  }));

  const loginSilent = async () => {
    try {
      await getAuth().signOut();
    } catch {}
    setLoading(true);

    let user: undefined | IUser;

    if (!getAuth().currentUser) {
      const response = await authService.handleLogin(LoginType.Anonymous);
      const { success, user: loginUser } = response;
      if (!success || !loginUser) {
        setLoading(false);
        return;
      }
      user = loginUser;
    } else {
      user = (await userService.getUser()).user;
    }

    if (user?.onboardingCompleted) {
      await userService.getUser();
      navigation.reset({ routes: [{ name: "HomeTabs" }], index: 0 });
    } else {
      navigation.navigate("Onboarding");
    }
    setLoading(false);
  };

  const openLoginSheet = () => {
    TrueSheet.present(TrueSheetNames.LOGIN);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <Animated.View
        style={[styles.hero, { paddingTop: insets.top }, heroStyle]}
      >
        <View style={styles.ringsWrap}>
          <View style={[styles.ring, styles.ringOuter]} />
          <View style={[styles.ring, styles.ringMid]} />
          <View style={styles.coreCircle}>
            <MaterialCommunityIcons
              name="paw"
              size={scale(36)}
              color={colors.accent}
            />
          </View>
        </View>
      </Animated.View>

      <Animated.View
        style={[
          styles.content,
          { paddingBottom: insets.bottom + scale(16) },
          contentStyle,
        ]}
      >
        <Text style={styles.heading}>
          {t("welcomeHeadline1Pre")}{" "}
          <Text style={styles.headingAccent}>
            {t("welcomeHeadline1Accent")}
          </Text>
          {"\n"}
          {t("welcomeHeadline2")}
        </Text>
        <Text style={styles.description}>{t("welcomeExplanation")}</Text>

        <View style={styles.pillRow}>
          <View style={[styles.pill]}>
            <Text style={[styles.pillText]}>{t("featureCalorieTracking")}</Text>
          </View>
          <View style={styles.pill}>
            <Text style={styles.pillText}>{t("featureAiSuggestions")}</Text>
          </View>
          <View style={styles.pill}>
            <Text style={styles.pillText}>{t("featureRecipeGenerator")}</Text>
          </View>
        </View>

        <View style={styles.buttonWrap}>
          <AppButton
            title={t("getStarted")}
            loading={loading}
            onPress={loginSilent}
            backgroundColor={colors.accent}
          />
        </View>

        <View style={styles.loginRow}>
          <Text style={styles.loginText}>{t("existingUser")}</Text>
          <TouchableOpacity onPress={openLoginSheet} activeOpacity={0.7}>
            <Text style={styles.loginLink}>{t("login")}</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      <LoginTrueSheet />
      <SignUpTrueSheet />
    </View>
  );
};

export default WelcomeScreen;

import React, { useEffect } from "react";
import {
  View,
  StyleSheet,
  Image,
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
import badger from "./assets/badger-welcome.png";
import useAuthService, { LoginType } from "../services/auth";
import userService from "../services/user";
import { getAuth } from "@react-native-firebase/auth";
import { IUser } from "../zustand/useUserStore";
import LoginTrueSheet from "./SettingsScreen/components/LoginTrueSheet";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { TrueSheetNames } from "../navigation/constants";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    hero: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    image: {
      width: scale(260),
      height: scale(260),
    },
    bottom: {
      paddingHorizontal: scale(28),
      paddingTop: scale(8),
      backgroundColor: colors.surface,
      borderTopLeftRadius: scale(36),
      borderTopRightRadius: scale(36),
    },
    divider: {
      width: scale(36),
      height: scale(4),
      borderRadius: scale(2),
      backgroundColor: colors.border,
      alignSelf: "center",
      marginBottom: scale(28),
    },
    label: {
      ...fontStyles.caption,
      color: colors["color-success-400"],
      letterSpacing: 2.5,
      textAlign: "center",
      marginBottom: scale(8),
    },
    appName: {
      ...fontStyles.hero,
      color: colors.text,
      textAlign: "center",
      marginBottom: scale(10),
    },
    description: {
      ...fontStyles.body1,
      color: colors.textSecondary,
      textAlign: "center",
      lineHeight: scale(22),
      marginBottom: scale(32),
      paddingHorizontal: scale(8),
    },
    buttonWrap: {
      marginBottom: scale(16),
    },
    loginRow: {
      flexDirection: "row",
      alignSelf: "center",
      alignItems: "center",
      gap: scale(6),
      marginBottom: scale(8),
    },
    loginText: {
      ...fontStyles.body2,
      color: colors.textTertiary,
    },
    loginLink: {
      ...fontStyles.body2,
      color: colors["color-success-500"],
      fontWeight: "700",
    },
  });

const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const authService = useAuthService();
  const [loading, setLoading] = React.useState(false);
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  const mascotOpacity = useSharedValue(0);
  const mascotY = useSharedValue(32);
  const bottomOpacity = useSharedValue(0);
  const bottomY = useSharedValue(40);

  useEffect(() => {
    mascotOpacity.value = withDelay(120, withTiming(1, { duration: 700 }));
    mascotY.value = withDelay(120, withSpring(0, { damping: 20, stiffness: 80 }));

    bottomOpacity.value = withDelay(400, withTiming(1, { duration: 600 }));
    bottomY.value = withDelay(400, withSpring(0, { damping: 20, stiffness: 90 }));
  }, []);

  const mascotStyle = useAnimatedStyle(() => ({
    opacity: mascotOpacity.value,
    transform: [{ translateY: mascotY.value }],
  }));

  const bottomStyle = useAnimatedStyle(() => ({
    opacity: bottomOpacity.value,
    transform: [{ translateY: bottomY.value }],
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

      <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.background }]} />

      <View style={[styles.hero, { paddingTop: insets.top + scale(48) }]}>
        <Animated.View style={mascotStyle}>
          <Image source={badger} style={styles.image} resizeMode="contain" />
        </Animated.View>
      </View>

      <Animated.View
        style={[styles.bottom, { paddingBottom: insets.bottom + scale(24) }, bottomStyle]}
      >
        <View style={styles.divider} />

        <Text style={styles.label}>{t("welcome").toUpperCase()}</Text>
        <Text style={styles.appName}>{t("appName")}</Text>
        <Text style={styles.description}>{t("welcomeExplanation")}</Text>

        <View style={styles.buttonWrap}>
          <AppButton
            title={t("getStarted")}
            loading={loading}
            onPress={loginSilent}
            backgroundColor={colors["color-success-400"]}
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
    </View>
  );
};

export default WelcomeScreen;

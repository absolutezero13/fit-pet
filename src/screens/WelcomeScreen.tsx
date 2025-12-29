import React from "react";
import {
  View,
  StyleSheet,
  Platform,
  Image,
  Text,
  TouchableOpacity,
} from "react-native";
import { scale } from "../theme/utils";
import { fontStyles } from "../theme/fontStyles";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import AppButton from "../components/AppButton";
import { useTranslation } from "react-i18next";
import badger from "./assets/badger-welcome.png";
import useAuthService, { LoginType } from "../services/auth";
import userService from "../services/user";
import { getAuth } from "@react-native-firebase/auth";
import { IUser } from "../zustand/useUserStore";
import { useTheme } from "../theme/ThemeContext";

const disableAnimation = Platform.OS === "android";

const WelcomeScreen = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const authService = useAuthService();
  const [loading, setLoading] = React.useState(false);
  const { colors } = useTheme();

  const handleGoogleLogin = async () => {
    setLoading(true);

    let user: undefined | IUser;

    if (!getAuth().currentUser) {
      const { success, user: loginUser } = await authService.handleLogin(
        LoginType.Google
      );
      if (!success || !loginUser) {
        setLoading(false);
        console.error("Google login failed");
        return;
      }
      user = loginUser;
    }
    if (user?.onboardingCompleted) {
      await userService.getUser();
      navigation.reset({
        routes: [{ name: "HomeTabs" }],
        index: 0,
      });
    } else {
      navigation.navigate("Onboarding");
    }
    setLoading(false);
  };

  const handleLoginPress = () => {
    navigation.navigate("Login");
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.heroSection}>
        <Image source={badger} style={styles.image} resizeMode="contain" />
      </View>
      <View style={[styles.contentCard, { backgroundColor: colors.surface }]}>
        <Animated.Text
          entering={disableAnimation ? undefined : FadeInUp}
          style={[styles.welcomeText, { color: colors.textSecondary }]}
        >
          {t("welcome").toUpperCase()}
        </Animated.Text>
        <Animated.Text
          entering={disableAnimation ? undefined : FadeInUp.delay(100)}
          style={[styles.appName, { color: colors.text }]}
        >
          {t("appName")}
        </Animated.Text>
        <Animated.Text
          entering={disableAnimation ? undefined : FadeInUp.delay(200)}
          style={[styles.description, { color: colors.textSecondary }]}
        >
          {t("welcomeExplanation")}
        </Animated.Text>
        <Animated.View
          entering={disableAnimation ? undefined : FadeInUp.delay(300)}
          style={styles.buttonContainer}
        >
          <AppButton
            disableAnimation={disableAnimation}
            title={t("getStarted")}
            loading={loading}
            onPress={handleGoogleLogin}
          />
        </Animated.View>
        <Animated.View
          entering={disableAnimation ? undefined : FadeInUp.delay(400)}
          style={styles.loginContainer}
        >
          <Text style={[styles.loginText, { color: colors.textSecondary }]}>{t("existingUser")}</Text>
          <TouchableOpacity onPress={handleLoginPress}>
            <Text style={[styles.loginLink, { color: colors.text }]}>{t("login")}</Text>
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.bottomIndicator} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: scale(60),
  },
  image: {
    width: scale(320),
    height: scale(320),
  },
  contentCard: {
    borderTopLeftRadius: scale(32),
    borderTopRightRadius: scale(32),
    paddingHorizontal: scale(32),
    paddingTop: scale(48),
    paddingBottom: scale(32),
    minHeight: scale(380),
  },
  welcomeText: {
    ...fontStyles.caption,
    fontWeight: "600",
    letterSpacing: 2,
    textAlign: "center",
    marginBottom: scale(12),
  },
  appName: {
    ...fontStyles.hero,
    textAlign: "center",
    marginBottom: scale(24),
  },
  description: {
    ...fontStyles.body1,
    textAlign: "center",
    marginBottom: scale(32),
  },
  buttonContainer: {
    marginBottom: scale(16),
  },
  loginContainer: {
    alignItems: "center",
    marginBottom: scale(24),
    flexDirection: "row",
    alignSelf: "center",
    gap: scale(4),
  },
  loginText: {
    ...fontStyles.body2,
  },
  loginLink: {
    ...fontStyles.body2,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  bottomIndicator: {
    width: scale(128),
    height: scale(4),
    borderRadius: scale(2),
    alignSelf: "center",
  },
});

export default WelcomeScreen;

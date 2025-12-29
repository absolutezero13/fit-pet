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
import { colors } from "../theme/colors";
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

const disableAnimation = Platform.OS === "android";

const WelcomeScreen = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const authService = useAuthService();
  const [loading, setLoading] = React.useState(false);

  const login = async (type: LoginType) => {
    setLoading(true);

    let user: undefined | IUser;
    console.log("getAuth().currentUser", getAuth().currentUser);

    if (!getAuth().currentUser) {
      console.log("signing in");
      const { success, user: loginUser } = await authService.handleLogin(type);
      if (!success || !loginUser) {
        setLoading(false);
        console.error("Google login failed");
        return;
      }
      user = loginUser;
    } else {
      console.log("getting user");
      user = (await userService.getUser()).user;
    }
    console.log("user after login", user);

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

  return (
    <View style={styles.container}>
      <View style={styles.heroSection}>
        <Image source={badger} style={styles.image} resizeMode="contain" />
      </View>
      <View style={styles.contentCard}>
        <Animated.Text
          entering={disableAnimation ? undefined : FadeInUp}
          style={styles.welcomeText}
        >
          {t("welcome").toUpperCase()}
        </Animated.Text>
        <Animated.Text
          entering={disableAnimation ? undefined : FadeInUp.delay(100)}
          style={styles.appName}
        >
          {t("appName")}
        </Animated.Text>
        <Animated.Text
          entering={disableAnimation ? undefined : FadeInUp.delay(200)}
          style={styles.description}
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
            onPress={() => login(LoginType.Anonymous)}
          />
        </Animated.View>
        <Animated.View
          entering={disableAnimation ? undefined : FadeInUp.delay(400)}
          style={styles.loginContainer}
        >
          <Text style={styles.loginText}>{t("existingUser")}</Text>
          <TouchableOpacity onPress={() => login(LoginType.Google)}>
            <Text style={styles.loginLink}>{t("login")}</Text>
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
    backgroundColor: colors["color-primary-100"],
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
    backgroundColor: "#FFFFFF",
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
    color: "#111827",
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
    color: "#111827",
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

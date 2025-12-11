import React, { useEffect } from "react";
import { View, StyleSheet, Platform, Image } from "react-native";
import { fontStyles } from "../theme/fontStyles";
import { scale } from "../theme/utils";
import { colors } from "../theme/colors";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import AppButton from "../components/AppButton";
import { useTranslation } from "react-i18next";
import badger from "./assets/badger-welcome.png";
import useAuthService, { LoginType } from "../services/auth";
import userService from "../services/user";

const disableAnimation = Platform.OS === "android";

const WelcomeScreen = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const authService = useAuthService();
  const [loading, setLoading] = React.useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { success, user } = await authService.handleLogin(LoginType.Google);
    console.log("Google login success:", success);
    if (!success || !user) {
      setLoading(false);
      console.error("Google login failed");
      return;
    }

    if (user.onboardingCompleted) {
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
      <Animated.Text
        entering={disableAnimation ? undefined : FadeInUp}
        style={[fontStyles.headline2]}
      >
        {t("welcome")}
      </Animated.Text>

      <Animated.Text
        entering={disableAnimation ? undefined : FadeInUp}
        style={[
          fontStyles.hero,
          {
            marginTop: scale(16),
          },
        ]}
      >
        {t("appName")}
      </Animated.Text>

      <Image source={badger} style={styles.image} />
      <AppButton
        disableAnimation={disableAnimation}
        position="bottom"
        title={t("getStarted")}
        loading={loading}
        onPress={handleGoogleLogin}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors["color-primary-200"],
    paddingHorizontal: scale(24),
  },
  image: {
    width: scale(250),
    height: scale(375),
    marginTop: scale(32),
  },
});

export default WelcomeScreen;

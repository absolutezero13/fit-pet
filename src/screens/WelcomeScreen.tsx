import React from "react";
import { View, StyleSheet, Platform, Image } from "react-native";
import { fontStyles } from "../theme/fontStyles";
import { scale } from "../theme/utils";
import { colors } from "../theme/colors";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import AppButton from "../components/AppButton";
import { useTranslation } from "react-i18next";
import badger from "./assets/badger-welcome.png";
import useAuthService from "../services/auth";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import auth from "@react-native-firebase/auth";

const disableAnimation = Platform.OS === "android";

GoogleSignin.configure({});

const WelcomeScreen = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const authService = useAuthService();

  const onStart = async () => {
    const currentUser = auth().currentUser;
    if (currentUser) {
      navigation.navigate("Onboarding");
      return;
    }

    await authService.handleAnonymousLogin();
    navigation.navigate("Onboarding");
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
        onPress={onStart}
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

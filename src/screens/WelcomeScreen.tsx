import React, { useEffect } from "react";
import { View, StyleSheet, Platform, Image } from "react-native";
import { fontStyles } from "../theme/fontStyles";
import { scale } from "../theme/utils";
import { colors } from "../theme/colors";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import AppButton from "../components/AppButton";
import { storageService } from "../storage/AsyncStorageService";
import { useTranslation } from "react-i18next";
import badger from "./assets/badger-welcome.png";
import useAuthService, { LoginType } from "../services/auth";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import auth from "@react-native-firebase/auth";

const disableAnimation = Platform.OS === "android";

GoogleSignin.configure({});

const WelcomeScreen = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const authService = useAuthService();

  useEffect(() => {
    const user = auth().currentUser;
    if (user) {
      navigation.reset({
        routes: [{ name: "HomeTabs" }],
        index: 0,
      });
    }
  }, []);

  const onStart = async () => {
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

      <Image
        source={badger}
        style={{
          width: scale(250),
          height: scale(375),
          marginTop: scale(32),
        }}
      />
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
});

export default WelcomeScreen;

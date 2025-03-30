import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { fontStyles } from "../theme/fontStyles";
import { scale } from "../theme/utils";
import { colors } from "../theme/colors";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import AppButton from "../components/AppButton";
import { storageService } from "../storage/AsyncStorageService";
import { useTranslation } from "react-i18next";

const WelcomeScreen = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();

  useEffect(() => {
    storageService.getItem("User").then((user) => {
      if (user) {
        navigation.reset({
          routes: [{ name: "HomeTabs" }],
          index: 0,
        });
      }
    });
  }, []);

  return (
    <View style={styles.container}>
      <Animated.Text entering={FadeInUp} style={[fontStyles.headline2]}>
        {t("welcome")}
      </Animated.Text>

      <Animated.Text
        entering={FadeInUp}
        style={[
          fontStyles.hero,
          {
            marginTop: scale(16),
          },
        ]}
      >
        {t("appName")}
      </Animated.Text>

      <AppButton
        position="bottom"
        title={t("getStarted")}
        onPress={() => navigation.navigate("Onboarding")}
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
});

export default WelcomeScreen;

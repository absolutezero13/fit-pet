import { Assets as NavigationAssets } from "@react-navigation/elements";
import { Asset } from "expo-asset";
import * as SplashScreen from "expo-splash-screen";
import * as React from "react";
import RootNavigator from "./navigation/RootNavigation";
import { NavigationContainer } from "@react-navigation/native";
import {
  useFonts,
  Nunito_200ExtraLight,
  Nunito_300Light,
  Nunito_400Regular,
  Nunito_500Medium,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  Nunito_900Black,
  Nunito_200ExtraLight_Italic,
  Nunito_300Light_Italic,
  Nunito_400Regular_Italic,
  Nunito_500Medium_Italic,
  Nunito_600SemiBold_Italic,
  Nunito_700Bold_Italic,
  Nunito_800ExtraBold_Italic,
  Nunito_900Black_Italic,
} from "@expo-google-fonts/nunito";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import i18next, { changeLanguage } from "i18next";
import { initReactI18next } from "react-i18next";
import { resources } from "./localization/resources";
import { KeyboardProvider } from "react-native-keyboard-controller";
import auth from "@react-native-firebase/auth";
import userService from "./services/user";
import { storageService } from "./storage/AsyncStorageService";
import { getCrashlytics } from "@react-native-firebase/crashlytics";
import useUserStore from "./zustand/useUserStore";
import { ThemeProvider } from "./theme/ThemeContext";
import { analyticsService, AnalyticsEvent } from "./services/analytics";
import notificationService from "./services/notificationService";
import ProgressiveUnlockChecker from "./components/ProgressiveUnlockChecker";

const AMPLITUDE_API_KEY = "6fe402b8cb00cc133cbd85e986b37342";

i18next.use(initReactI18next).init({
  resources,
  lng: "en",
  interpolation: {
    escapeValue: false,
  },
});

const initializeLanguage = async () => {
  const language = await storageService.getItem("language");
  console.log("language", language);
  changeLanguage(language?.code || "en");
};

// NavigationBar.setBackgroundColorAsync("#ffffff00");

Asset.loadAsync([...NavigationAssets]);

SplashScreen.preventAutoHideAsync();

export function App() {
  const [fontLoaded] = useFonts({
    Nunito_200ExtraLight,
    Nunito_300Light,
    Nunito_400Regular,
    Nunito_500Medium,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
    Nunito_900Black,
    Nunito_200ExtraLight_Italic,
    Nunito_300Light_Italic,
    Nunito_400Regular_Italic,
    Nunito_500Medium_Italic,
    Nunito_600SemiBold_Italic,
    Nunito_700Bold_Italic,
    Nunito_800ExtraBold_Italic,
    Nunito_900Black_Italic,
  });

  const userStore = useUserStore((state) => state);
  const user = auth().currentUser;
  if (!fontLoaded) {
    return null;
  }

  const onReady = async () => {
    getCrashlytics().log("App ready");

    // Initialize analytics
    analyticsService.init(AMPLITUDE_API_KEY);

    // Initialize notification service
    await notificationService.initialize();

    // Track first launch
    const hasLaunched = await storageService.getItem("hasLaunched");
    if (!hasLaunched) {
      analyticsService.logEvent(AnalyticsEvent.FirstLaunch);
      await storageService.setItem("hasLaunched", true);
    }

    if (user) {
      try {
        await userService.getUser();
        analyticsService.setUserId(user.uid);
      } catch (error) {
        console.error("Error fetching user data:", error);
        getCrashlytics().recordError(error as Error);
      }
    }

    await initializeLanguage();
    console.log("App ready async");
    setTimeout(async () => {
      SplashScreen.hideAsync();
    }, 100);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <KeyboardProvider>
          <NavigationContainer onReady={onReady}>
            <RootNavigator />
            <ProgressiveUnlockChecker />
          </NavigationContainer>
        </KeyboardProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

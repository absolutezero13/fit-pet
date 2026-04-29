import { Assets as NavigationAssets } from "@react-navigation/elements";
import { Asset } from "expo-asset";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import * as React from "react";
import RootNavigator from "./navigation/RootNavigation";
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  NavigationContainer,
} from "@react-navigation/native";
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
import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import { resources } from "./localization/resources";
import { initializeLanguage } from "./services/languageService";
import { KeyboardProvider } from "react-native-keyboard-controller";
import auth from "@react-native-firebase/auth";
import userService from "./services/user";
import { storageService } from "./storage/AsyncStorageService";
import { getCrashlytics } from "@react-native-firebase/crashlytics";
import { ThemeProvider, useTheme } from "./theme/ThemeContext";
import { analyticsService, AnalyticsEvent } from "./services/analytics";
import notificationService from "./services/notificationService";
import { initMealLiveActivityListener } from "./services/mealLiveActivitySync";
import TrueSheetProvider from "./components/TrueSheet/TrueSheetProvider";
import { SafeAreaProvider } from "react-native-safe-area-context";

const AMPLITUDE_API_KEY = "6fe402b8cb00cc133cbd85e986b37342";

i18next.use(initReactI18next).init({
  resources,
  lng: "en",
  interpolation: {
    escapeValue: false,
  },
});

// NavigationBar.setBackgroundColorAsync("#ffffff00");

Asset.loadAsync([...NavigationAssets]);

SplashScreen.preventAutoHideAsync();

const AppShell = ({ onReady }: { onReady: () => Promise<void> }) => {
  const { colors, isDark } = useTheme();
  const navigationTheme = {
    ...(isDark ? NavigationDarkTheme : NavigationDefaultTheme),
    colors: {
      ...(isDark ? NavigationDarkTheme.colors : NavigationDefaultTheme.colors),
      primary: colors.accent,
      background: colors.background,
      card: colors.background,
      text: colors.text,
      border: colors.border,
      notification: colors["color-danger-500"],
    },
  };

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} translucent />
      <SafeAreaProvider>
        <KeyboardProvider>
          <TrueSheetProvider>
            <NavigationContainer onReady={onReady} theme={navigationTheme}>
              <RootNavigator />
            </NavigationContainer>
          </TrueSheetProvider>
        </KeyboardProvider>
      </SafeAreaProvider>
    </>
  );
};

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
  const [isLanguageReady, setIsLanguageReady] = React.useState(false);

  React.useEffect(() => {
    let isMounted = true;

    const bootstrapLanguage = async () => {
      try {
        await initializeLanguage();
      } finally {
        if (isMounted) {
          setIsLanguageReady(true);
        }
      }
    };

    bootstrapLanguage();

    return () => {
      isMounted = false;
    };
  }, []);

  const user = auth().currentUser;
  if (!fontLoaded || !isLanguageReady) {
    return null;
  }

  const onReady = async () => {
    getCrashlytics().log("App ready");

    analyticsService.init(AMPLITUDE_API_KEY);

    await notificationService.initialize();
    notificationService.initLanguageListener();

    initMealLiveActivityListener();

    const hasLaunched = await storageService.getItem("hasLaunched");
    if (!hasLaunched) {
      analyticsService.logEvent(AnalyticsEvent.FirstLaunch);
      await storageService.setItem("hasLaunched", true);
    }

    if (user) {
      try {
        await userService.getUser();
        console.log("User UID:", user.uid);
        analyticsService.setUserId(user.uid);
      } catch (error) {
        console.error("Error fetching user data:", error);
        getCrashlytics().recordError(error as Error);
      }
    }

    console.log("App ready async");
    setTimeout(async () => {
      SplashScreen.hideAsync();
    }, 100);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <AppShell onReady={onReady} />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

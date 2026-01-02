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
import { Platform, UIManager } from "react-native";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import i18next, { changeLanguage } from "i18next";
import { initReactI18next } from "react-i18next";
import { resources } from "./localization/resources";
import { KeyboardProvider } from "react-native-keyboard-controller";
import auth from "@react-native-firebase/auth";
import userService from "./services/user";
import { storageService } from "./storage/AsyncStorageService";
import { getCrashlytics } from "@react-native-firebase/crashlytics";
import useUserStore from "./zustand/useUserStore";

i18next.use(initReactI18next).init({
  resources,
  lng: "en", // Default language
  interpolation: {
    escapeValue: false, // React already escapes values
  },
});

const initializeLanguage = async () => {
  const language = await storageService.getItem("language");
  console.log("language", language);
  changeLanguage(language?.code || "en");
};

// NavigationBar.setBackgroundColorAsync("#ffffff00");

Asset.loadAsync([...NavigationAssets]);

// Enable LayoutAnimation for Android
if (Platform.OS === "android") {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

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

    if (user) {
      try {
        await userService.getUser();
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
      <BottomSheetModalProvider>
        <KeyboardProvider>
          <NavigationContainer onReady={onReady}>
            <RootNavigator />
          </NavigationContainer>
        </KeyboardProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}

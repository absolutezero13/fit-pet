import "./gesture-handler";
import "@expo/metro-runtime"; // Necessary for Fast Refresh on Web
import React from "react";
import { registerRootComponent } from "expo";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
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
  useFonts,
} from "@expo-google-fonts/nunito";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import i18next, { initReactI18next } from "i18next";
import { I18nextProvider } from "react-i18next";
import Analyzing from "./src/screens/OnboardingScreen/components/Analyzing";
import { resources } from "./src/localization/resources";
import { View } from "react-native";

const Stack = createNativeStackNavigator();
const previewI18n = i18next.createInstance();

previewI18n.use(initReactI18next).init({
  resources,
  lng: "en",
  interpolation: {
    escapeValue: false,
  },
});

const PreviewApp = () => {
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

  if (!fontLoaded) {
    return <View />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <I18nextProvider i18n={previewI18n}>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="AnalyzingPreview">
              {() => <Analyzing focused />}
            </Stack.Screen>
          </Stack.Navigator>
        </NavigationContainer>
      </I18nextProvider>
    </GestureHandlerRootView>
  );
};

registerRootComponent(PreviewApp);

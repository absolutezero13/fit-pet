import { createNativeStackNavigator } from "@react-navigation/native-stack";
import OnboardingScreen from "../screens/OnboardingScreen/OnboardingScreen";
import WelcomeScreen from "../screens/WelcomeScreen";
import LogMealScreen from "../screens/LogMealScreen";
import SettingsScreen from "../screens/SettingsScreen";
import TabNavigator from "./TabBarNavigation";
import MealDetailScreen from "../screens/MealDetailScreen/MealDetailScreen";
import AnalyzedMealScreen from "../screens/AnalyzedMealScreen/AnalyzedMealScreen";
import { IMeal } from "../services/apiTypes";
import { createNavigationContainerRef } from "@react-navigation/native";

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Welcome">
      <Stack.Screen
        options={{
          headerShown: false,
        }}
        component={WelcomeScreen}
        name="Welcome"
      />

      <Stack.Screen
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
        component={OnboardingScreen}
        name="Onboarding"
      />

      <Stack.Screen
        name="HomeTabs"
        component={TabNavigator}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="MealDetail"
        component={MealDetailScreen}
        options={{
          headerShown: false,
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="LogMeal"
        component={LogMealScreen}
        options={{
          headerShown: false,
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          headerShown: false,
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="AnalyzedMeal"
        component={AnalyzedMealScreen}
        options={{
          headerShown: false,
          presentation: "card",
        }}
      />
    </Stack.Navigator>
  );
};

export default RootNavigator;

type RootStackParamList = {
  Welcome: undefined;
  HomeTabs: undefined;
  Profile: undefined;
  Settings: undefined;
  NotFound: undefined;
  Onboarding: undefined;
  AnalyzedMeal: {
    meal: IMeal;
  };
  LogMeal: undefined;
  MealDetail: {
    meal: IMeal;
  };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

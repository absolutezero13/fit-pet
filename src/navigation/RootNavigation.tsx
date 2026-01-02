import { createNativeStackNavigator } from "@react-navigation/native-stack";
import OnboardingScreen from "../screens/OnboardingScreen/OnboardingScreen";
import WelcomeScreen from "../screens/WelcomeScreen";
import SettingsScreen from "../screens/SettingsScreen/SettingsScreen";
import TabNavigator from "./TabBarNavigation";
import MealDetailScreen from "../screens/MealDetailScreen/MealDetailScreen";
import AnalyzedMealScreen from "../screens/AnalyzedMealScreen/AnalyzedMealScreen";
import { IMeal } from "../services/apiTypes";
import { isLiquidGlassSupported } from "@callstack/liquid-glass";
import TabBarNavigationLegacy from "./TabBarNavigationLegacy";
import useUserStore from "../zustand/useUserStore";

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
  const userStore = useUserStore((state) => state);
  return (
    <Stack.Navigator
      initialRouteName={userStore?.onboardingCompleted ? "HomeTabs" : "Welcome"}
    >
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
        component={
          isLiquidGlassSupported ? TabNavigator : TabBarNavigationLegacy
        }
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
    mealId: string;
  };
  LogMeal: {
    selectedDate: string;
    mealId?: string;
  };
  MealDetail: {
    meal: IMeal;
  };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

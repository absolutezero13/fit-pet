import { createNativeStackNavigator } from "@react-navigation/native-stack";
import OnboardingScreen from "../screens/OnboardingScreen/OnboardingScreen";
import WelcomeScreen from "../screens/WelcomeScreen";
import PaywallScreen from "../screens/PaywallScreen";
import SettingsScreen from "../screens/SettingsScreen/SettingsScreen";
import TabNavigator from "./TabBarNavigation";
import MealDetailScreen from "../screens/MealDetailScreen/MealDetailScreen";
import AnalyzedMealScreen from "../screens/AnalyzedMealScreen/AnalyzedMealScreen";
import CookRecipeScreen from "../screens/CookRecipeScreen/CookRecipeScreen";
import { CookRecipe, IMeal } from "../services/apiTypes";
import { isLiquidGlassSupported } from "@callstack/liquid-glass";
import TabBarNavigationLegacy from "./TabBarNavigationLegacy";
import useUserStore, { INITIAL_USER_STORE } from "../zustand/useUserStore";
import { useTheme } from "../theme/ThemeContext";

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
  const userStore = useUserStore((state) => state);
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      initialRouteName={userStore?.onboardingCompleted ? "HomeTabs" : "Welcome"}
      screenOptions={{
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
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
        component={PaywallScreen}
        name="Paywall"
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
          presentation: "card",
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
      <Stack.Screen
        name="CookRecipe"
        component={CookRecipeScreen}
        options={{
          headerShown: false,
          gestureEnabled: false,
          presentation: "card",
        }}
      />
    </Stack.Navigator>
  );
};

export default RootNavigator;

type RootStackParamList = {
  Welcome: undefined;
  Paywall: undefined;
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
  CookRecipe: {
    recipe: CookRecipe;
  };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

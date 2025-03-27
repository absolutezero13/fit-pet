import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import OnboardingScreen from "../screens/OnboardingScreen";
import WelcomeScreen from "../screens/WelcomeScreen";
import MealsScreen from "../screens/MealsScreen";
import HomeScreen from "../screens/HomeScreen/HomeScreen";
import AnalyzedMealScreen from "../screens/AnalyzedMealScreen";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { scale } from "../theme/utils";
import { colors } from "../theme/colors";
import { fontStyles } from "../theme/fontStyles";
import ChatScreen from "../screens/ChatScreen";
import { MaterialIcons } from "@expo/vector-icons";
import { Platform, ViewStyle } from "react-native";
import LogMealScreen from "../screens/LogMealScreen";

export const tabBarDefaultStyles: ViewStyle = {
  elevation: 0,
  borderTopWidth: 0,
  height: scale(Platform.select({ ios: 85, default: 65 })),
  paddingBottom: scale(8),
  paddingTop: scale(8),
  borderTopLeftRadius: scale(20),
  borderTopRightRadius: scale(20),
  position: "absolute",
  left: scale(20), // Added side padding
  right: scale(20), // Added side padding
  shadowColor: colors["color-primary-500"],
  shadowOffset: {
    width: 0,
    height: -4,
  },
  shadowOpacity: 0.1,
  shadowRadius: 8,
};

const Tabs = createBottomTabNavigator();
const TAB_BAR_ICON_SIZE = scale(24);

const renderTabBarIcon = (screenName: string, focused: boolean) => {
  const color = focused
    ? colors["color-success-400"]
    : colors["color-primary-400"];

  switch (screenName) {
    case "Meals":
      return (
        <MaterialCommunityIcons
          name="food-apple"
          size={TAB_BAR_ICON_SIZE}
          color={color}
        />
      );
    case "Home":
      return (
        <FontAwesome5 name="burn" size={TAB_BAR_ICON_SIZE} color={color} />
      );
    case "Chat":
      return (
        <MaterialIcons
          name="sports-gymnastics"
          size={TAB_BAR_ICON_SIZE}
          color={color}
        />
      );
    default:
      return null;
  }
};

const TabNavigator = () => {
  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: tabBarDefaultStyles,
        tabBarLabelStyle: {
          ...fontStyles.body2,
          color: colors["color-primary-400"],
        },
        tabBarActiveTintColor: colors["color-success-400"],
        tabBarInactiveTintColor: colors["color-primary-400"],
        animation: "shift",
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="Meals"
        component={MealsScreen}
        options={{
          tabBarIcon: ({ focused }) => renderTabBarIcon("Meals", focused),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => renderTabBarIcon("Home", focused),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          tabBarIcon: ({ focused }) => renderTabBarIcon("Chat", focused),
          headerShown: false,
        }}
      />
    </Tabs.Navigator>
  );
};
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
        name="LogMeal"
        component={LogMealScreen}
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
  HomeTabs: undefined;
  Profile: undefined;
  Settings: undefined;
  NotFound: undefined;
  AnalyzedMeal: {
    meal: {
      id: string;
      mealType: string;
      description: string;
      time: string;
      calories: string;
      proteins: string;
      carbs: string;
      fats: string;
    };
  };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

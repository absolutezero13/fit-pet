import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import OnboardingScreen from "../screens/OnboardingScreen";
import WelcomeScreen from "../screens/WelcomeScreen";
import MealsScreen from "../screens/MealsScreen";
import HomeScreen from "../screens/HomeScreen";
import LearnScreen from "../screens/LearnScreen";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { scale } from "../theme/utils";
import { colors } from "../theme/colors";
import { fontStyles } from "../theme/fontStyles";

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
    case "Learn":
      return (
        <FontAwesome5
          name="chalkboard-teacher"
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
        tabBarStyle: {
          elevation: 0,
          borderTopWidth: 0,
          height: scale(85),
          paddingBottom: 8,
          paddingTop: 8,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          position: "absolute",
          left: 20, // Added side padding
          right: 20, // Added side padding
          shadowColor: colors["color-primary-500"],
          shadowOffset: {
            width: 0,
            height: -4,
          },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          ...fontStyles.body2,
          color: colors["color-primary-400"],
        },
        tabBarActiveTintColor: colors["color-success-400"],
        tabBarInactiveTintColor: colors["color-primary-400"],
        animation: "shift",
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
        name="Learn"
        component={LearnScreen}
        options={{
          tabBarIcon: ({ focused }) => renderTabBarIcon("Learn", focused),
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
    </Stack.Navigator>
  );
};

export default RootNavigator;

type RootStackParamList = {
  HomeTabs: undefined;
  Profile: undefined;
  Settings: undefined;
  NotFound: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

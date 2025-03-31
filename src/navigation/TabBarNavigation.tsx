import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";
import { useTranslation } from "react-i18next";
import { Platform, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ChatScreen from "../screens/ChatScreen/ChatScreen";
import HomeScreen from "../screens/HomeScreen/HomeScreen";
import MealsScreen from "../screens/MealsScreen/MealsScreen";
import { colors } from "../theme/colors";
import { fontStyles } from "../theme/fontStyles";
import { scale } from "../theme/utils";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { MaterialIcons } from "@expo/vector-icons";
import { TAB_BAR_HEIGHT, TAB_BAR_ICON_SIZE } from "./constants";

const Tabs = createBottomTabNavigator();

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
  const { t } = useTranslation();
  const { bottom } = useSafeAreaInsets();

  const tabBarDefaultStyles: ViewStyle = {
    elevation: 0,
    borderTopWidth: 0,
    height: TAB_BAR_HEIGHT + bottom,
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
        name={t("tabMeals")}
        component={MealsScreen}
        options={{
          tabBarIcon: ({ focused }) => renderTabBarIcon("Meals", focused),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name={t("tabHome")}
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => renderTabBarIcon("Home", focused),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name={t("tabChat")}
        component={ChatScreen}
        options={{
          tabBarIcon: ({ focused }) => renderTabBarIcon("Chat", focused),
          headerShown: false,
        }}
      />
    </Tabs.Navigator>
  );
};

export default TabNavigator;

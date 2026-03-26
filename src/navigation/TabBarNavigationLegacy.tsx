import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";
import { useTranslation } from "react-i18next";
import { ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ChatScreen from "../screens/ChatScreen/ChatScreen";
import HomeScreen from "../screens/HomeScreen/HomeScreen";
import MealsScreen from "../screens/MealsScreen/MealsScreen";
import { fontStyles } from "../theme/fontStyles";
import { useTheme } from "../theme/ThemeContext";
import { scale } from "../theme/utils";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { MaterialIcons } from "@expo/vector-icons";
import { TAB_BAR_HEIGHT, TAB_BAR_ICON_SIZE } from "./constants";
import SettingsScreen from "../screens/SettingsScreen/SettingsScreen";

const Tabs = createBottomTabNavigator();

const TabBarNavigationLegacy = () => {
  const { t } = useTranslation();
  const { bottom } = useSafeAreaInsets();
  const { colors } = useTheme();

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
          <MaterialIcons name="chat" size={TAB_BAR_ICON_SIZE} color={color} />
        );
      case "Settings":
        return (
          <MaterialIcons
            name="settings"
            size={TAB_BAR_ICON_SIZE}
            color={color}
          />
        );

      default:
        return null;
    }
  };

  const tabBarDefaultStyles: ViewStyle = {
    elevation: 0,
    borderTopWidth: 0,
    height: TAB_BAR_HEIGHT + bottom,
    paddingTop: scale(8),
    borderTopLeftRadius: scale(20),
    borderTopRightRadius: scale(20),
    position: "absolute",
    left: scale(20),
    right: scale(20),
    backgroundColor: colors.surface,
    shadowColor: colors.shadow,
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
          fontFamily: fontStyles.body2.fontFamily,
          fontSize: fontStyles.body2.fontSize,
          lineHeight: fontStyles.body2.lineHeight,
        },
        tabBarActiveTintColor: colors["color-success-400"],
        tabBarInactiveTintColor: colors["color-primary-400"],
        animation: "shift",
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          title: t("tabChat"),
          tabBarIcon: ({ focused }) => renderTabBarIcon("Chat", focused),
        }}
      />
      <Tabs.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: t("tabHome"),
          tabBarIcon: ({ focused }) => renderTabBarIcon("Home", focused),
        }}
      />
      <Tabs.Screen
        options={{
          title: t("tabSettings"),
          tabBarIcon: ({ focused }) => renderTabBarIcon("Settings", focused),
        }}
        name="Settings"
        component={SettingsScreen}
      />
    </Tabs.Navigator>
  );
};

export default TabBarNavigationLegacy;

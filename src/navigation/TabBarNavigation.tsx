import React from "react";
import { useTranslation } from "react-i18next";
import { ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ChatScreen from "../screens/ChatScreen/ChatScreen";
import HomeScreen from "../screens/HomeScreen/HomeScreen";
import MealsScreen from "../screens/MealsScreen/MealsScreen";
import { colors } from "../theme/colors";
import { fontStyles } from "../theme/fontStyles";
import { scale } from "../theme/utils";
import { TAB_BAR_HEIGHT } from "./constants";
import { createNativeBottomTabNavigator } from "@bottom-tabs/react-navigation";

const Tabs = createNativeBottomTabNavigator();

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
      hapticFeedbackEnabled
      screenOptions={{
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
          tabBarIcon: () => ({ sfSymbol: "list.star" }),
        }}
      />
      <Tabs.Screen
        name={t("tabHome")}
        component={HomeScreen}
        options={{
          tabBarIcon: () => ({
            sfSymbol: "house.fill",
          }),
        }}
      />
      <Tabs.Screen
        name={t("tabChat")}
        component={ChatScreen}
        options={{
          tabBarIcon: () => ({ sfSymbol: "sparkle" }),
        }}
      />
    </Tabs.Navigator>
  );
};

export default TabNavigator;

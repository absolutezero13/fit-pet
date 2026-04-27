import React from "react";
import { useTranslation } from "react-i18next";
import { ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ChatScreen from "../screens/ChatScreen/ChatScreen";
import CookScreen from "../screens/CookScreen/CookScreen";
import HomeScreen from "../screens/HomeScreen/HomeScreen";
import { createNativeBottomTabNavigator } from "@bottom-tabs/react-navigation";
import { useTheme } from "../theme/ThemeContext";

const Tabs = createNativeBottomTabNavigator();

const TabNavigator = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  return (
    <Tabs.Navigator
      hapticFeedbackEnabled
      initialRouteName="Home"
      screenOptions={{
        tabBarActiveTintColor: colors.accent,
      }}
    >
      <Tabs.Screen
        name="Cook"
        component={CookScreen}
        options={{
          title: t("tabCook"),
          tabBarIcon: () => ({ sfSymbol: "fork.knife.circle" }),
        }}
      />
      <Tabs.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: t("tabHome"),
          tabBarIcon: () => ({
            sfSymbol: "calendar",
          }),
        }}
      />
      <Tabs.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          title: t("tabChat"),
          tabBarIcon: () => ({ sfSymbol: "sparkle" }),
        }}
      />
    </Tabs.Navigator>
  );
};

export default TabNavigator;

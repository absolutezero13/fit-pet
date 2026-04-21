import React from "react";
import { useTranslation } from "react-i18next";
import { ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ChatScreen from "../screens/ChatScreen/ChatScreen";
import CookScreen from "../screens/CookScreen/CookScreen";
import HomeScreen from "../screens/HomeScreen/HomeScreen";
import { colors } from "../theme/colors";
import { createNativeBottomTabNavigator } from "@bottom-tabs/react-navigation";

const Tabs = createNativeBottomTabNavigator();

const TabNavigator = () => {
  const { t } = useTranslation();

  return (
    <Tabs.Navigator
      hapticFeedbackEnabled
      initialRouteName="Home"
      screenOptions={{
        tabBarActiveTintColor: colors["color-success-400"],
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

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";
import { useTranslation } from "react-i18next";
import ChatScreen from "../screens/ChatScreen/ChatScreen";
import CookScreen from "../screens/CookScreen/CookScreen";
import HomeScreen from "../screens/HomeScreen/HomeScreen";
import GlassTabBar from "./GlassTabBar";

const Tabs = createBottomTabNavigator();

const TabBarNavigationLegacy = () => {
  const { t } = useTranslation();

  return (
    <Tabs.Navigator
      initialRouteName="Home"
      tabBar={(props) => <GlassTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        animation: "shift",
      }}
    >
      <Tabs.Screen
        name="Chat"
        component={ChatScreen}
        options={{ title: t("tabChat") }}
      />
      <Tabs.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: t("tabHome") }}
      />
      <Tabs.Screen
        name="Cook"
        component={CookScreen}
        options={{ title: t("tabCook") }}
      />
    </Tabs.Navigator>
  );
};

export default TabBarNavigationLegacy;

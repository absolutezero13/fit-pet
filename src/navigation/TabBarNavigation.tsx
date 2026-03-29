import React from "react";
import { useTranslation } from "react-i18next";
import { ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ChatScreen from "../screens/ChatScreen/ChatScreen";
import HomeScreen from "../screens/HomeScreen/HomeScreen";
import MealsScreen from "../screens/MealsScreen/MealsScreen";
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
      {/* <Tabs.Screen
        name="Meals"
        component={MealsScreen}
        options={{
          title: t("tabMeals"),
          tabBarIcon: () => ({ sfSymbol: "list.star" }),
        }}
      /> */}
      <Tabs.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          title: t("tabChat"),
          tabBarIcon: () => ({ sfSymbol: "sparkle" }),
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
    </Tabs.Navigator>
  );
};

export default TabNavigator;

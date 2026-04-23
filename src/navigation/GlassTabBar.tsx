import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import React, { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeContext";
import { scale } from "../theme/utils";
import { TAB_BAR_ICON_SIZE } from "./constants";

const TAB_ITEM_WIDTH = scale(80);
const PILL_HEIGHT = scale(56);
const BAR_PADDING_H = scale(2);
const PILL_INSET = scale(2);
const PILL_WIDTH = TAB_ITEM_WIDTH;

const ICONS: Record<string, (color: string) => React.ReactNode> = {
  Chat: (color) => (
    <MaterialIcons name="chat" size={TAB_BAR_ICON_SIZE} color={color} />
  ),
  Home: (color) => (
    <FontAwesome5 name="burn" size={TAB_BAR_ICON_SIZE} color={color} />
  ),
  Cook: (color) => (
    <MaterialCommunityIcons
      name="chef-hat"
      size={TAB_BAR_ICON_SIZE}
      color={color}
    />
  ),
};

const GlassTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const { bottom } = useSafeAreaInsets();
  const { colors, isDark } = useTheme();

  const activeIndex = state.index;
  const tabCount = state.routes.length;

  const indexAnim = useRef(new Animated.Value(activeIndex)).current;

  useEffect(() => {
    Animated.spring(indexAnim, {
      toValue: activeIndex,
      useNativeDriver: true,
      damping: 18,
      stiffness: 180,
      mass: 0.8,
    }).start();
  }, [activeIndex]);

  const translateX = indexAnim.interpolate({
    inputRange: state.routes.map((_, i) => i),
    outputRange: state.routes.map((_, i) => i * TAB_ITEM_WIDTH),
  });

  const glassBackground = isDark
    ? "rgba(22, 42, 70, 0.82)"
    : "rgba(255, 255, 255, 0.72)";
  const glassBorder = isDark
    ? "rgba(255, 255, 255, 0.10)"
    : "rgba(255, 255, 255, 0.85)";
  const activePillBg = isDark
    ? "rgba(255, 255, 255, 0.14)"
    : "rgba(255, 255, 255, 0.90)";
  const activePillBorder = isDark
    ? "rgba(255, 255, 255, 0.18)"
    : "rgba(255, 255, 255, 1)";

  return (
    <View
      style={[styles.wrapper, { bottom: Math.max(bottom, scale(16)) }]}
      pointerEvents="box-none"
    >
      <View
        style={[
          styles.bar,
          {
            backgroundColor: glassBackground,
            borderColor: glassBorder,
            width: tabCount * TAB_ITEM_WIDTH + BAR_PADDING_H * 2,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.activePill,
            {
              backgroundColor: activePillBg,
              borderColor: activePillBorder,
              width: PILL_WIDTH,
              transform: [{ translateX }],
            },
          ]}
        />

        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = (options.title ?? route.name) as string;
          const focused = index === activeIndex;
          const color = focused
            ? colors["color-success-400"]
            : isDark
              ? "rgba(150, 164, 193, 0.8)"
              : "rgba(95, 106, 131, 0.7)";

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={[styles.tab, { width: TAB_ITEM_WIDTH }]}
              android_ripple={null}
            >
              <View style={styles.tabContent}>
                {ICONS[route.name]?.(color)}
                <Text
                  style={[
                    styles.label,
                    {
                      color,
                      fontWeight: focused ? "600" : "400",
                    },
                  ]}
                  numberOfLines={1}
                >
                  {label}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    height: PILL_HEIGHT,
    borderRadius: scale(32),
    borderWidth: 1.5,
    paddingHorizontal: BAR_PADDING_H,
    elevation: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
  },
  activePill: {
    position: "absolute",
    height: PILL_HEIGHT - scale(6),
    borderRadius: scale(24),
    borderWidth: 1,
    zIndex: 0,
  },
  tab: {
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  tabContent: {
    alignItems: "center",
    gap: scale(2),
  },
  label: {
    fontSize: scale(10),
    lineHeight: scale(14),
  },
});

export default GlassTabBar;

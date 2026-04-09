import React, { useEffect } from "react";
import { Modal, StyleSheet, View, Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from "react-native-reanimated";
import { useTranslation } from "react-i18next";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { scale, SCREEN_HEIGHT, SCREEN_WIDTH } from "../theme/utils";
import { fontStyles } from "../theme/fontStyles";
import { useTheme } from "../theme/ThemeContext";

const AnalyzingMealOverlay = ({
  visible,
  label,
}: {
  visible: boolean;
  label?: string;
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const rotation = useSharedValue(0);
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (!visible) {
      return;
    }

    rotation.value = withRepeat(
      withTiming(360, { duration: 2000, easing: Easing.linear }),
      -1
    );

    pulse.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.95, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ),
      -1
    );
  }, [visible]);

  const rotationStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.container}>
        <View style={[styles.content, { backgroundColor: colors.surface }]}>
          <Animated.View
            style={[
              styles.iconOuterRing,
              { borderColor: colors["color-success-500"] + "30" },
              rotationStyle,
            ]}
          >
            <View
              style={[
                styles.ringDot,
                { backgroundColor: colors["color-success-500"] },
              ]}
            />
            <View
              style={[
                styles.ringDot,
                styles.ringDot2,
                { backgroundColor: colors["color-success-500"] },
              ]}
            />
            <View
              style={[
                styles.ringDot,
                styles.ringDot3,
                { backgroundColor: colors["color-success-500"] },
              ]}
            />
          </Animated.View>
          <Animated.View
            style={[
              styles.iconContainer,
              {
                backgroundColor: colors["color-success-500"],
                shadowColor: colors["color-success-500"],
              },
              pulseStyle,
            ]}
          >
            <MaterialCommunityIcons
              name="magnify"
              size={scale(36)}
              color={colors.textInverse}
            />
          </Animated.View>
          <Text style={[styles.statusText, { color: colors.text }]}> 
            {label ?? t("analyzingMeal")}
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  content: {
    alignItems: "center",
    borderRadius: scale(28),
    padding: scale(32),
    paddingTop: scale(48),
    width: scale(260),
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  iconOuterRing: {
    position: "absolute",
    top: scale(24),
    width: scale(100),
    height: scale(100),
    borderRadius: scale(50),
    borderWidth: 2,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  ringDot: {
    position: "absolute",
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
    top: -scale(4),
  },
  ringDot2: {
    top: "auto",
    bottom: -scale(4),
    right: scale(20),
  },
  ringDot3: {
    top: "auto",
    left: -scale(4),
    bottom: scale(30),
  },
  iconContainer: {
    width: scale(80),
    height: scale(80),
    borderRadius: scale(40),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: scale(24),
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  statusText: {
    ...fontStyles.headline3,
    textAlign: "center",
  },
});

export default AnalyzingMealOverlay;

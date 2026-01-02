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

const ACCENT_GREEN = "#4CAF50";

const AnalyzingMealOverlay = ({ visible }: { visible: boolean }) => {
  const { t } = useTranslation();

  // Animation values
  const rotation = useSharedValue(0);
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (!visible) {
      return;
    }

    // Main rotation
    rotation.value = withRepeat(
      withTiming(360, { duration: 2000, easing: Easing.linear }),
      -1
    );

    // Pulse animation
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
        <View style={styles.content}>
          {/* Animated Icon Container */}
          <Animated.View style={[styles.iconOuterRing, rotationStyle]}>
            <View style={styles.ringDot} />
            <View style={[styles.ringDot, styles.ringDot2]} />
            <View style={[styles.ringDot, styles.ringDot3]} />
          </Animated.View>

          <Animated.View style={[styles.iconContainer, pulseStyle]}>
            <MaterialCommunityIcons
              name="magnify"
              size={scale(36)}
              color="white"
            />
          </Animated.View>

          {/* Status Message */}
          <Text style={styles.statusText}>{t("analyzingMeal")}</Text>
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
    backgroundColor: "white",
    borderRadius: scale(28),
    padding: scale(32),
    paddingTop: scale(48),
    width: scale(260),
    shadowColor: "#000",
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
    borderColor: ACCENT_GREEN + "30",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  ringDot: {
    position: "absolute",
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
    backgroundColor: ACCENT_GREEN,
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
    backgroundColor: ACCENT_GREEN,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: scale(24),
    shadowColor: ACCENT_GREEN,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  statusText: {
    ...fontStyles.headline3,
    color: "#1A1A1A",
    textAlign: "center",
  },
});

export default AnalyzingMealOverlay;

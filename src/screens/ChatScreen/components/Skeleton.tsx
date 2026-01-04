import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { scale } from "../../../theme/utils";
import { useTheme } from "../../../theme/ThemeContext";

const MessageSkeleton = () => {
  const opacity = useSharedValue(0.3);
  const { colors } = useTheme();

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.7, { duration: 300, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.line, styles.line1, animatedStyle, { backgroundColor: colors.skeleton }]} />
      <Animated.View style={[styles.line, styles.line1, animatedStyle, { backgroundColor: colors.skeleton }]} />
      <Animated.View style={[styles.line, styles.line1, animatedStyle, { backgroundColor: colors.skeleton }]} />
      <Animated.View style={[styles.line, styles.line1, animatedStyle, { backgroundColor: colors.skeleton }]} />
      <Animated.View style={[styles.line, styles.line2, animatedStyle, { backgroundColor: colors.skeleton }]} />
      <Animated.View style={[styles.line, styles.line3, animatedStyle, { backgroundColor: colors.skeleton }]} />
    </View>
  );
};

export default MessageSkeleton;

const styles = StyleSheet.create({
  container: {
    gap: scale(8),
    minWidth: scale(200),
  },
  line: {
    height: scale(14),
    borderRadius: scale(7),
  },
  line1: {
    width: "100%",
  },
  line2: {
    width: "85%",
  },
  line3: {
    width: "60%",
  },
});

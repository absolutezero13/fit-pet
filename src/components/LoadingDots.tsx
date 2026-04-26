import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useTheme } from "../theme/ThemeContext";
import { scale } from "../theme/utils";

type LoadingDotsProps = {
  color?: string;
};

const LoadingDots = ({ color }: LoadingDotsProps) => {
  const { colors } = useTheme();
  const dotColor = color ?? colors.accent;
  const first = useSharedValue(0);
  const second = useSharedValue(0);
  const third = useSharedValue(0);

  useEffect(() => {
    const animate = (value: typeof first, delay: number) => {
      value.value = withDelay(
        delay,
        withRepeat(
          withTiming(1, {
            duration: 420,
            easing: Easing.inOut(Easing.ease),
          }),
          -1,
          true,
        ),
      );
    };

    animate(first, 0);
    animate(second, 120);
    animate(third, 240);
  }, [first, second, third]);

  const firstDotStyle = useAnimatedStyle(() => ({
    opacity: 0.35 + first.value * 0.65,
    transform: [
      { translateY: -4 * first.value },
      { scale: 0.96 + first.value * 0.08 },
    ],
  }));
  const secondDotStyle = useAnimatedStyle(() => ({
    opacity: 0.35 + second.value * 0.65,
    transform: [
      { translateY: -4 * second.value },
      { scale: 0.96 + second.value * 0.08 },
    ],
  }));
  const thirdDotStyle = useAnimatedStyle(() => ({
    opacity: 0.35 + third.value * 0.65,
    transform: [
      { translateY: -4 * third.value },
      { scale: 0.96 + third.value * 0.08 },
    ],
  }));

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: scale(8),
      }}
    >
      <Animated.View
        style={[
          {
            width: scale(10),
            height: scale(10),
            borderRadius: scale(5),
            backgroundColor: dotColor,
          },
          firstDotStyle,
        ]}
      />
      <Animated.View
        style={[
          {
            width: scale(10),
            height: scale(10),
            borderRadius: scale(5),
            backgroundColor: dotColor,
          },
          secondDotStyle,
        ]}
      />
      <Animated.View
        style={[
          {
            width: scale(10),
            height: scale(10),
            borderRadius: scale(5),
            backgroundColor: dotColor,
          },
          thirdDotStyle,
        ]}
      />
    </View>
  );
};

export default LoadingDots;

import { useEffect, useId, useMemo, useState } from "react";
import { LayoutChangeEvent, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle, Defs, RadialGradient, Stop } from "react-native-svg";

type LoadingGlowProps = {
  durationMs?: number;
};

const randInRange = (min: number, max: number) =>
  min + Math.random() * (max - min);

const LoadingGlow = ({ durationMs = 8500 }: LoadingGlowProps) => {
  const [size, setSize] = useState({ w: 0, h: 0 });
  const glow = useSharedValue(0);
  const reactId = useId();
  const gradientId = `loadingGlow-${reactId.replace(/:/g, "")}`;

  const seeds = useMemo(
    () => ({
      startXFrac: randInRange(0.42, 0.62),
      startYFrac: randInRange(0.08, 0.22),
      endXFrac: randInRange(-0.1, 0.08),
      endYFrac: randInRange(0.92, 1.1),
    }),
    [],
  );

  useEffect(() => {
    glow.value = 0;
    glow.value = withRepeat(
      withTiming(1, { duration: durationMs, easing: Easing.linear }),
      -1,
      false,
    );
    return () => {
      cancelAnimation(glow);
    };
  }, [durationMs, glow]);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    if (width > 0 && height > 0 && (size.w !== width || size.h !== height)) {
      setSize({ w: width, h: height });
    }
  };

  const glowDiameter = Math.round(Math.max(size.w, size.h, 1) * 1.25);
  const startCenterX = size.w * seeds.startXFrac;
  const startCenterY = size.h * seeds.startYFrac;
  const endCenterX = size.w * seeds.endXFrac;
  const endCenterY = size.h * seeds.endYFrac;
  const startX = startCenterX - glowDiameter / 2;
  const startY = startCenterY - glowDiameter / 2;
  const endX = endCenterX - glowDiameter / 2;
  const endY = endCenterY - glowDiameter / 2;

  const glowStyle = useAnimatedStyle(() => {
    const p = glow.value;
    const x = startX + (endX - startX) * p;
    const y = startY + (endY - startY) * p;

    const peak = 0.7;
    const minScale = 0.2;
    const maxScale = 4.5;
    const endScale = 0.5;
    let scaleVal = minScale;
    if (p <= peak) {
      const growT = p / peak;
      scaleVal = minScale + (maxScale - minScale) * (growT * growT * growT);
    } else {
      const shrinkT = (p - peak) / (1 - peak);
      scaleVal = maxScale + (endScale - maxScale) * shrinkT;
    }

    let opacity = 1;
    if (p < 0.12) {
      opacity = p / 0.12;
    } else if (p > 0.92) {
      opacity = (1 - p) / 0.08;
    }

    return {
      opacity,
      transform: [
        { translateX: x },
        { translateY: y },
        { scale: scaleVal },
      ],
    };
  });

  return (
    <View
      style={styles.container}
      pointerEvents="none"
      onLayout={handleLayout}
    >
      {size.w > 0 && size.h > 0 ? (
        <Animated.View
          style={[
            {
              position: "absolute",
              top: 0,
              left: 0,
              width: glowDiameter,
              height: glowDiameter,
            },
            glowStyle,
          ]}
        >
          <Svg width={glowDiameter} height={glowDiameter}>
            <Defs>
              <RadialGradient
                id={gradientId}
                cx="50%"
                cy="50%"
                rx="50%"
                ry="50%"
                fx="50%"
                fy="50%"
              >
                <Stop
                  offset="0%"
                  stopColor="rgb(255, 210, 130)"
                  stopOpacity="0.85"
                />
                <Stop
                  offset="35%"
                  stopColor="rgb(255, 160, 70)"
                  stopOpacity="0.45"
                />
                <Stop
                  offset="70%"
                  stopColor="rgb(255, 110, 40)"
                  stopOpacity="0.12"
                />
                <Stop
                  offset="100%"
                  stopColor="rgb(255, 90, 30)"
                  stopOpacity="0"
                />
              </RadialGradient>
            </Defs>
            <Circle
              cx={glowDiameter / 2}
              cy={glowDiameter / 2}
              r={glowDiameter / 2}
              fill={`url(#${gradientId})`}
            />
          </Svg>
        </Animated.View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
});

export default LoadingGlow;

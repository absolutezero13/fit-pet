import React, { FC, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";
import Icon from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";
import { useTheme } from "../theme/ThemeContext";
import getMacroConfig, { MacroType } from "../utils/getMacroConfig";
import { scale } from "../theme/utils";
import { fontStyles } from "../theme/fontStyles";

const AnimatedPath = Animated.createAnimatedComponent(Path);
const ARC_ANGLE = 270;

const polarToCartesian = (cx: number, cy: number, r: number, angle: number) => {
  const rad = ((angle - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
};

const describeArc = (
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
) => {
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, endAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
};

interface ArcProgressProps {
  progress: number;
  color: string;
  trackColor: string;
  size: number;
  strokeWidth: number;
}

export const ArcProgress: FC<ArcProgressProps> = ({
  progress,
  color,
  trackColor,
  size,
  strokeWidth,
}) => {
  const radius = (size - strokeWidth) / 2;
  const arcLength = (ARC_ANGLE / 360) * 2 * Math.PI * radius;
  const animatedProgress = useSharedValue(0);
  const cx = size / 2;
  const cy = size / 2;

  useEffect(() => {
    animatedProgress.value = withTiming(Math.min(progress, 1), {
      duration: 1000,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress, animatedProgress]);

  const trackPath = describeArc(cx, cy, radius, 0, ARC_ANGLE);

  const animatedProps = useAnimatedProps(() => {
    const currentAngle = ARC_ANGLE * animatedProgress.value;
    const strokeDashoffset =
      arcLength - (currentAngle / 360) * 2 * Math.PI * radius;
    return { strokeDashoffset };
  });

  return (
    <Svg
      width={size}
      height={size}
      style={{ transform: [{ rotate: "225deg" }] }}
    >
      <Path
        d={trackPath}
        stroke={trackColor}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
      />
      <AnimatedPath
        d={trackPath}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={arcLength}
        animatedProps={animatedProps}
      />
    </Svg>
  );
};

interface RingWithIconProps {
  progress: number;
  color: string;
  trackColor: string;
  iconBgColor: string;
  iconColor: string;
  icon: React.ComponentProps<typeof Icon>["name"];
  size: number;
  strokeWidth: number;
  iconSize: number;
}

export const RingWithIcon: FC<RingWithIconProps> = ({
  progress,
  color,
  trackColor,
  iconBgColor,
  iconColor,
  icon,
  size,
  strokeWidth,
  iconSize,
}) => {
  const innerCircle = size - strokeWidth * 2 - scale(6);
  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <ArcProgress
        progress={progress}
        color={color}
        trackColor={trackColor}
        size={size}
        strokeWidth={strokeWidth}
      />
      <View
        style={{
          position: "absolute",
          width: innerCircle,
          height: innerCircle,
          borderRadius: innerCircle / 2,
          backgroundColor: iconBgColor,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon name={icon} size={iconSize} color={iconColor} />
      </View>
    </View>
  );
};

interface MacroCardProps {
  type: Exclude<MacroType, "calories">;
  current: number;
  goal: number;
  variant?: "remaining" | "content";
  summaryMetric?: "remaining" | "consumed";
}

const MacroCard: FC<MacroCardProps> = ({
  type,
  current,
  goal,
  variant = "remaining",
  summaryMetric = "remaining",
}) => {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const config = getMacroConfig(type);
  const isOver = current > goal;
  const remaining = Math.max(0, goal - current);
  const overBy = Math.max(0, current - goal);
  const displayValue =
    variant === "remaining" && summaryMetric === "consumed"
      ? Math.round(current)
      : isOver
        ? overBy
        : remaining;
  const progress = goal > 0 ? Math.min(current / goal, 1) : 0;

  const ringColor = isOver ? colors["color-danger-400"] : config.color;
  const iconBg = colors.backgroundSecondary;
  const trackColor = isDark ? colors.textTertiary + "30" : colors.border + "60";
  const labelKey = (
    variant === "remaining" && summaryMetric === "consumed"
      ? isOver
        ? {
            protein: "proteinOver",
            carbs: "carbsOver",
            fats: "fatsOver",
          }
        : {
            protein: "proteinConsumed",
            carbs: "carbsConsumed",
            fats: "fatsConsumed",
          }
      : {
          protein: isOver ? "proteinOver" : "proteinLeft",
          carbs: isOver ? "carbsOver" : "carbsLeft",
          fats: isOver ? "fatsOver" : "fatsLeft",
        }
  )[type];

  const [labelMain, labelSuffix] = t(labelKey).split(" ");

  if (variant === "content") {
    return (
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <View style={styles.textBlock}>
          <Text style={[styles.value, { color: colors.text }]}>
            {Math.round(current)}g
          </Text>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            {t(config.labelKey)}
          </Text>
        </View>
        <View style={styles.ringWrapper}>
          <RingWithIcon
            progress={0}
            color={config.color}
            trackColor={trackColor}
            iconBgColor={iconBg}
            iconColor={config.color}
            icon={config.icon}
            size={scale(64)}
            strokeWidth={scale(5)}
            iconSize={scale(20)}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <View style={styles.textBlock}>
        <Text style={[styles.value, { color: colors.text }]}>
          {Math.round(displayValue)}g
        </Text>
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          {labelMain}
          {labelSuffix ? " " : ""}
          <Text
            style={
              isOver ? { fontWeight: "700", color: colors.text } : undefined
            }
          >
            {labelSuffix ?? ""}
          </Text>
        </Text>
      </View>
      <View style={styles.ringWrapper}>
        <RingWithIcon
          progress={progress}
          color={ringColor}
          trackColor={trackColor}
          iconBgColor={iconBg}
          iconColor={ringColor}
          icon={config.icon}
          size={scale(64)}
          strokeWidth={scale(5)}
          iconSize={scale(20)}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: scale(20),
    padding: scale(14),
    minHeight: scale(130),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: scale(4) },
    shadowOpacity: 0.12,
    shadowRadius: scale(14),
    elevation: 6,
  },
  textBlock: {
    marginBottom: scale(10),
  },
  value: {
    fontSize: scale(22),
    fontWeight: "700",
  },
  label: {
    ...fontStyles.caption,
    marginTop: scale(2),
  },
  ringWrapper: {
    alignItems: "flex-start",
  },
});

export default MacroCard;

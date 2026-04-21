import React, { FC, useEffect, useMemo, useState } from "react";
import { View, StyleSheet, Text, Modal, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import getMacroConfig, { MacroType } from "../../../utils/getMacroConfig";
import { fontStyles } from "../../../theme/fontStyles";
import { scale } from "../../../theme/utils";
import { IMeal } from "../../../services/apiTypes";
import Icon from "@expo/vector-icons/MaterialCommunityIcons";
import useUserStore, { MacroGoals } from "../../../zustand/useUserStore";
import { getGramGoal } from "./utils";
import userService from "../../../services/user";
import Slider from "@react-native-community/slider";
import AppButton from "../../../components/AppButton";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
  FadeIn,
  FadeOut,
} from "react-native-reanimated";
import { useTheme } from "../../../theme/ThemeContext";
import Svg, { Path } from "react-native-svg";

const AnimatedPath = Animated.createAnimatedComponent(Path);

const ARC_ANGLE = 270;

const polarToCartesian = (cx: number, cy: number, r: number, angle: number) => {
  const rad = ((angle - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
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

const ArcProgress: FC<ArcProgressProps> = ({
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
    return {
      strokeDashoffset,
    };
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

const RingWithIcon: FC<RingWithIconProps> = ({
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
}

const MacroCard: FC<MacroCardProps> = ({ type, current, goal }) => {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const config = getMacroConfig(type);
  const isOver = current > goal;
  const remaining = Math.max(0, goal - current);
  const overBy = Math.max(0, current - goal);
  const displayValue = isOver ? overBy : remaining;
  const progress = Math.min(current / goal, 1);

  const ringColor = isOver ? colors["color-danger-400"] : config.color;
  const iconBg = colors.backgroundSecondary;
  const trackColor = isDark
    ? colors.textTertiary + "30"
    : colors.border + "60";

  const labelKey = (
    {
      protein: isOver ? "proteinOver" : "proteinLeft",
      carbs: isOver ? "carbsOver" : "carbsLeft",
      fats: isOver ? "fatsOver" : "fatsLeft",
    } as const
  )[type];

  const [labelMain, labelSuffix] = t(labelKey).split(" ");

  return (
    <View style={[macroCardStyles.card, { backgroundColor: colors.surface }]}>
      <View style={macroCardStyles.textBlock}>
        <Text style={[macroCardStyles.value, { color: colors.text }]}>
          {Math.round(displayValue)}g
        </Text>
        <Text style={[macroCardStyles.label, { color: colors.textSecondary }]}>
          {labelMain}
          {labelSuffix ? " " : ""}
          <Text
            style={
              isOver
                ? { fontWeight: "700", color: colors.text }
                : undefined
            }
          >
            {labelSuffix ?? ""}
          </Text>
        </Text>
      </View>
      <View style={macroCardStyles.ringWrapper}>
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

const DailySummary: FC<{ meals: IMeal[] }> = ({ meals }) => {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const currentMacroGoals = useUserStore((state) => state?.macroGoals);
  const [goals, setGoals] = useState<MacroGoals>(
    currentMacroGoals as MacroGoals,
  );

  const totals = useMemo(() => {
    const initialTotals = {
      calories: 0,
      proteins: 0,
      carbs: 0,
      fats: 0,
      score: 0,
    };

    return meals.reduce(
      (acc, meal) => ({
        calories: acc.calories + Number(meal.calories || 0),
        proteins: acc.proteins + Number(meal.proteins || 0),
        carbs: acc.carbs + Number(meal.carbs || 0),
        fats: acc.fats + Number(meal.fats || 0),
        score: acc.score + (meal.score || 0),
      }),
      initialTotals,
    );
  }, [meals]);

  const proteinGoal = getGramGoal({
    calorieGoal: goals.calories,
    kcalCoefficent: 4,
    percentage: goals.proteins,
  });
  const carbsGoal = getGramGoal({
    calorieGoal: goals.calories,
    kcalCoefficent: 4,
    percentage: goals.carbs,
  });
  const fatsGoal = getGramGoal({
    calorieGoal: goals.calories,
    kcalCoefficent: 9,
    percentage: goals.fats,
  });

  const calorieProgress = Math.min(totals.calories / goals.calories, 1);
  const isOverCalorie = totals.calories > goals.calories;
  const remainingCalories = Math.max(0, goals.calories - totals.calories);
  const overCalories = Math.max(0, totals.calories - goals.calories);
  const calorieDisplay = isOverCalorie ? overCalories : remainingCalories;

  const calorieConfig = getMacroConfig("calories");
  const ringColor = isOverCalorie
    ? colors["color-danger-400"]
    : colors.text;
  const trackColor = isDark
    ? colors.textTertiary + "30"
    : colors.border + "60";
  const iconBg = colors.backgroundSecondary;

  const [calorieLabelMain, calorieLabelSuffix] = t(
    isOverCalorie ? "caloriesOver" : "caloriesLeft",
  ).split(" ");

  const saveGoals = async () => {
    userService.createOrUpdateUser({
      macroGoals: goals,
    });
    setModalVisible(false);
  };

  return (
    <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.wrapper}>
      <View
        style={[styles.calorieCard, { backgroundColor: colors.surface }]}
      >
        <Pressable
          style={styles.settingsButton}
          onPress={() => setModalVisible(true)}
          hitSlop={12}
        >
          <Icon
            name="cog-outline"
            size={scale(18)}
            color={colors.textSecondary}
          />
        </Pressable>
        <View style={styles.calorieTextBlock}>
          <Text style={[styles.calorieValue, { color: colors.text }]}>
            {Math.round(calorieDisplay)}
          </Text>
          <Text
            style={[styles.calorieLabel, { color: colors.textSecondary }]}
          >
            {calorieLabelMain}
            {calorieLabelSuffix ? " " : ""}
            <Text
              style={
                isOverCalorie
                  ? { fontWeight: "700", color: colors.text }
                  : undefined
              }
            >
              {calorieLabelSuffix ?? ""}
            </Text>
          </Text>
        </View>
        <RingWithIcon
          progress={calorieProgress}
          color={ringColor}
          trackColor={trackColor}
          iconBgColor={iconBg}
          iconColor={ringColor}
          icon={calorieConfig.icon}
          size={scale(110)}
          strokeWidth={scale(9)}
          iconSize={scale(28)}
        />
      </View>

      <View style={styles.macroRow}>
        <MacroCard
          type="protein"
          current={totals.proteins}
          goal={proteinGoal}
        />
        <MacroCard type="carbs" current={totals.carbs} goal={carbsGoal} />
        <MacroCard type="fats" current={totals.fats} goal={fatsGoal} />
      </View>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View
          style={[
            styles.modalContainer,
            {
              backgroundColor: isDark
                ? "rgba(0, 0, 0, 0.6)"
                : "rgba(0, 0, 0, 0.3)",
            },
          ]}
        >
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: colors.surface,
                shadowColor: colors.shadow,
              },
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {t("nutritionGoals")}
            </Text>

            <View
              style={[
                styles.calorieModalCard,
                {
                  backgroundColor: colors.backgroundSecondary,
                  borderColor: colors.border,
                },
              ]}
            >
              <View
                style={[
                  styles.calorieIconContainer,
                  { backgroundColor: getMacroConfig("calories").background },
                ]}
              >
                <Icon
                  name={getMacroConfig("calories").icon}
                  size={scale(24)}
                  color={getMacroConfig("calories").color}
                />
              </View>
              <View style={styles.calorieLabelContainer}>
                <Text
                  style={[styles.calorieCardLabel, { color: colors.text }]}
                >
                  {t("calories")}
                </Text>
                <Text
                  style={[
                    styles.calorieSublabel,
                    { color: getMacroConfig("protein").color },
                  ]}
                >
                  {t("dailyGoal")}
                </Text>
              </View>
              <View style={styles.calorieValueContainer}>
                <Text
                  style={[styles.calorieCardValue, { color: colors.text }]}
                >
                  {goals.calories}
                </Text>
                <Text
                  style={[
                    styles.calorieUnit,
                    { color: colors.textSecondary },
                  ]}
                >
                  kcal
                </Text>
              </View>
            </View>

            <Slider
              style={styles.slider}
              value={goals.calories}
              minimumValue={1000}
              maximumValue={5000}
              step={10}
              onValueChange={(value) =>
                setGoals((prev) => ({ ...prev, calories: Math.round(value) }))
              }
              minimumTrackTintColor={getMacroConfig("calories").color}
              maximumTrackTintColor={colors.border}
              thumbTintColor={getMacroConfig("calories").color}
            />

            <View style={styles.sliderRow}>
              <View
                style={[
                  styles.sliderIconContainer,
                  { backgroundColor: getMacroConfig("protein").background },
                ]}
              >
                <Icon
                  name={getMacroConfig("protein").icon}
                  size={scale(20)}
                  color={getMacroConfig("protein").color}
                />
              </View>
              <Text style={[styles.sliderLabel, { color: colors.text }]}>
                {t("proteins")}
              </Text>
              <Text
                style={[styles.sliderGrams, { color: colors.textSecondary }]}
              >
                {((goals.proteins * goals.calories) / 100 / 4).toFixed(0)} g
              </Text>
              <Text
                style={[
                  styles.sliderPercent,
                  { color: getMacroConfig("protein").color },
                ]}
              >
                {goals.proteins}%
              </Text>
            </View>

            <Slider
              style={styles.slider}
              value={goals.proteins}
              minimumValue={10}
              maximumValue={60}
              step={1}
              onValueChange={(value) =>
                setGoals((prev) => ({
                  ...prev,
                  proteins: Math.round(value),
                  carbs: Math.round((100 - Math.round(value)) * 0.6),
                  fats: Math.round((100 - Math.round(value)) * 0.4),
                }))
              }
              minimumTrackTintColor={getMacroConfig("protein").color}
              maximumTrackTintColor={colors.border}
              thumbTintColor={getMacroConfig("protein").color}
            />

            <View style={styles.otherRow}>
              <View
                style={[
                  styles.otherIconContainer,
                  { backgroundColor: colors.backgroundSecondary },
                ]}
              >
                <Icon
                  name="circle-half-full"
                  size={scale(20)}
                  color={colors.textSecondary}
                />
              </View>
              <Text style={[styles.otherLabel, { color: colors.text }]}>
                {t("otherCarbsFat")}
              </Text>
              <Text
                style={[styles.otherPercent, { color: colors.textSecondary }]}
              >
                {100 - goals.proteins}%
              </Text>
            </View>

            <View style={styles.modalButtons}>
              <AppButton
                title={t("cancel")}
                onPress={() => setModalVisible(false)}
                flex
              />
              <AppButton
                title={t("save")}
                onPress={saveGoals}
                backgroundColor={colors["color-success-400"]}
                flex
              />
            </View>
          </View>
        </View>
      </Modal>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: scale(24),
    marginBottom: scale(16),
    gap: scale(10),
  },
  settingsButton: {
    position: "absolute",
    top: scale(10),
    right: scale(12),
    zIndex: 1,
    padding: scale(4),
  },
  calorieCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: scale(24),
    paddingVertical: scale(20),
    paddingLeft: scale(20),
    paddingRight: scale(16),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: scale(4) },
    shadowOpacity: 0.12,
    shadowRadius: scale(14),
    elevation: 6,
  },
  calorieTextBlock: {
    flex: 1,
  },
  calorieValue: {
    fontSize: scale(44),
    fontWeight: "700",
    lineHeight: scale(50),
  },
  calorieLabel: {
    ...fontStyles.body1,
    marginTop: scale(2),
  },
  macroRow: {
    flexDirection: "row",
    gap: scale(10),
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: scale(20),
  },
  modalContent: {
    borderRadius: scale(24),
    padding: scale(24),
    width: "100%",
    shadowOffset: { width: 0, height: scale(4) },
    shadowOpacity: 0.15,
    shadowRadius: scale(12),
    elevation: 8,
  },
  modalTitle: {
    ...fontStyles.headline2,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: scale(20),
  },
  calorieModalCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: scale(16),
    borderWidth: 1,
    padding: scale(16),
    marginBottom: scale(24),
  },
  calorieIconContainer: {
    width: scale(48),
    height: scale(48),
    borderRadius: scale(12),
    justifyContent: "center",
    alignItems: "center",
    marginRight: scale(12),
  },
  calorieLabelContainer: {
    flex: 1,
  },
  calorieCardLabel: {
    ...fontStyles.body1,
    fontWeight: "600",
  },
  calorieSublabel: {
    ...fontStyles.caption,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  calorieValueContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  calorieCardValue: {
    ...fontStyles.headline1,
    fontWeight: "300",
    fontSize: scale(36),
  },
  calorieUnit: {
    ...fontStyles.body2,
    marginLeft: scale(4),
  },
  sliderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: scale(8),
  },
  sliderIconContainer: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(10),
    justifyContent: "center",
    alignItems: "center",
    marginRight: scale(12),
  },
  sliderLabel: {
    ...fontStyles.body1,
    fontWeight: "500",
    flex: 1,
  },
  sliderGrams: {
    ...fontStyles.body2,
    marginRight: scale(8),
  },
  sliderPercent: {
    ...fontStyles.body1,
    fontWeight: "700",
  },
  slider: {
    width: "100%",
    height: scale(40),
    marginBottom: scale(16),
  },
  otherRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: scale(24),
  },
  otherIconContainer: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(10),
    justifyContent: "center",
    alignItems: "center",
    marginRight: scale(12),
  },
  otherLabel: {
    ...fontStyles.body1,
    fontWeight: "500",
    flex: 1,
  },
  otherPercent: {
    ...fontStyles.body1,
    fontWeight: "600",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: scale(12),
  },
});

const macroCardStyles = StyleSheet.create({
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

export default DailySummary;

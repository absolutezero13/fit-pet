import React, { useMemo, useState, useEffect } from "react";
import { View, StyleSheet, Text, Modal, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import { macroColors } from "../../../theme/colors";
import getMacroConfig from "../../../utils/getMacroConfig";
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
  useAnimatedStyle,
  withTiming,
  Easing,
  FadeIn,
  FadeOut,
} from "react-native-reanimated";
import { useTheme } from "../../../theme/ThemeContext";
import Svg, { Path } from "react-native-svg";
import LiquidPicker from "../../../components/LiquidPicker";

const AnimatedPath = Animated.createAnimatedComponent(Path);

const RING_SIZE = scale(140);
const STROKE_WIDTH = scale(12);
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
const ARC_ANGLE = 270;
const ARC_LENGTH = (ARC_ANGLE / 360) * 2 * Math.PI * RADIUS;
const START_ANGLE = 0;

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
  endAngle: number
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
}

const ArcProgress = ({ progress, color, trackColor }: ArcProgressProps) => {
  const animatedProgress = useSharedValue(0);
  const cx = RING_SIZE / 2;
  const cy = RING_SIZE / 2;

  useEffect(() => {
    animatedProgress.value = withTiming(Math.min(progress, 1), {
      duration: 1000,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress, animatedProgress]);

  const trackPath = describeArc(
    cx,
    cy,
    RADIUS,
    START_ANGLE,
    START_ANGLE + ARC_ANGLE
  );

  const animatedProps = useAnimatedProps(() => {
    const currentAngle = ARC_ANGLE * animatedProgress.value;
    const strokeDashoffset =
      ARC_LENGTH - (currentAngle / 360) * 2 * Math.PI * RADIUS;
    return {
      strokeDashoffset,
    };
  });

  return (
    <Svg
      width={RING_SIZE}
      height={RING_SIZE}
      style={{ transform: [{ rotate: "225deg" }] }}
    >
      <Path
        d={trackPath}
        stroke={trackColor}
        strokeWidth={STROKE_WIDTH}
        fill="none"
        strokeLinecap="round"
      />
      <AnimatedPath
        d={trackPath}
        stroke={color}
        strokeWidth={STROKE_WIDTH}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={ARC_LENGTH}
        animatedProps={animatedProps}
      />
    </Svg>
  );
};

interface MacroProgressBarProps {
  label: string;
  current: number;
  goal: number;
  color: string;
  trackColor: string;
  showRemaining: boolean;
}

const MacroProgressBar = ({
  label,
  current,
  goal,
  color,
  trackColor,
  showRemaining,
}: MacroProgressBarProps) => {
  const remaining = Math.max(0, goal - current);
  const displayValue = showRemaining ? remaining : current;
  const progress = Math.min(current / goal, 1);
  const animatedWidth = useSharedValue(0);

  useEffect(() => {
    animatedWidth.value = withTiming(progress * 100, {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress, animatedWidth]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${animatedWidth.value}%`,
  }));

  return (
    <View style={styles.macroItem}>
      <Text style={[styles.macroLabel, { color }]}>{label}</Text>
      <View
        style={[styles.macroProgressTrack, { backgroundColor: trackColor }]}
      >
        <Animated.View
          style={[
            styles.macroProgressFill,
            { backgroundColor: color },
            animatedStyle,
          ]}
        />
      </View>
      <Text style={[styles.macroValues, { color }]}>
        {displayValue} / {goal}g
      </Text>
    </View>
  );
};

const DailySummary = ({ meals }: { meals: IMeal[] }) => {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [showRemaining, setShowRemaining] = useState(false);
  const currentMacroGoals = useUserStore((state) => state?.macroGoals);
  const [goals, setGoals] = useState<MacroGoals>(
    currentMacroGoals as MacroGoals
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
      initialTotals
    );
  }, [meals]);

  const progress = {
    calories: Math.min(totals.calories / goals.calories, 1),
    proteins: Math.min(
      totals.proteins /
        getGramGoal({
          calorieGoal: goals.calories,
          kcalCoefficent: 4,
          percentage: goals.proteins,
        }),
      1
    ),
    carbs: Math.min(
      totals.carbs /
        getGramGoal({
          calorieGoal: goals.calories,
          kcalCoefficent: 4,
          percentage: goals.carbs,
        }),
      1
    ),
    fats: Math.min(
      totals.fats /
        getGramGoal({
          calorieGoal: goals.calories,
          kcalCoefficent: 9,
          percentage: goals.fats,
        }),
      1
    ),
  };

  const saveGoals = async () => {
    userService.createOrUpdateUser({
      macroGoals: goals,
    });
    setModalVisible(false);
  };

  const proteinGoal = Math.round((goals.proteins * goals.calories) / 100 / 4);
  const carbsGoal = Math.round((goals.carbs * goals.calories) / 100 / 4);
  const fatsGoal = Math.round((goals.fats * goals.calories) / 100 / 9);
  const isOverCalorieGoal = totals.calories > goals.calories;
  const remainingCalories = Math.max(0, goals.calories - totals.calories);

  const ringColor = isOverCalorieGoal
    ? colors["color-danger-400"]
    : macroColors.calories;

  const trackColor = isDark ? colors.textTertiary + "40" : colors.border + "60";

  const centerValue = showRemaining
    ? remainingCalories.toFixed(0)
    : totals.calories.toFixed(0);

  const centerLabel = showRemaining ? t("remaining") : t("consumed");

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <Animated.View entering={FadeIn} exiting={FadeOut}>
        <Pressable
          style={styles.settingsButton}
          onPress={() => setModalVisible(true)}
        >
          <Icon
            name="cog-outline"
            size={scale(20)}
            color={colors.textSecondary}
          />
        </Pressable>

        <View style={styles.ringSection}>
          <View style={styles.sideStats}>
            <Text style={[styles.sideValue, { color: colors.text }]}>
              {remainingCalories.toFixed(0)}
            </Text>
            <Text style={[styles.sideLabel, { color: colors.textSecondary }]}>
              {t("remaining")}
            </Text>
          </View>

          <View style={styles.ringContainer}>
            <ArcProgress
              progress={progress.calories}
              color={ringColor}
              trackColor={trackColor}
            />
            <View style={styles.ringCenter}>
              <Text
                style={[
                  styles.calorieValue,
                  {
                    color: isOverCalorieGoal
                      ? colors["color-danger-400"]
                      : colors.text,
                  },
                ]}
              >
                {centerValue}
              </Text>
              <Text
                style={[styles.calorieLabel, { color: colors.textSecondary }]}
              >
                {centerLabel}
              </Text>
            </View>
          </View>

          <View style={styles.sideStats}>
            <Text style={[styles.sideValue, { color: colors.text }]}>
              {goals.calories}
            </Text>
            <Text style={[styles.sideLabel, { color: colors.textSecondary }]}>
              {t("target")}
            </Text>
          </View>
        </View>

        <View style={styles.macrosSection}>
          <MacroProgressBar
            label={t("proteins")}
            current={Math.round(totals.proteins)}
            goal={proteinGoal}
            color={getMacroConfig("protein").color}
            trackColor={trackColor}
            showRemaining={showRemaining}
          />
          <MacroProgressBar
            label={t("fats")}
            current={Math.round(totals.fats)}
            goal={fatsGoal}
            color={getMacroConfig("fats").color}
            trackColor={trackColor}
            showRemaining={showRemaining}
          />
          <MacroProgressBar
            label={t("carbs")}
            current={Math.round(totals.carbs)}
            goal={carbsGoal}
            color={getMacroConfig("carbs").color}
            trackColor={trackColor}
            showRemaining={showRemaining}
          />
        </View>

        <LiquidPicker
          options={[t("consumed"), t("remaining")]}
          selectedIndex={showRemaining ? 1 : 0}
          onSelected={(index) => setShowRemaining(index === 1)}
        />
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
                  styles.calorieCard,
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: scale(20),
    marginBottom: scale(16),
    marginHorizontal: scale(24),
    borderRadius: scale(24),
  },
  settingsButton: {
    position: "absolute",
    top: 0,
    right: 0,
    zIndex: 1,
    padding: scale(4),
  },
  ringSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: scale(20),
    gap: scale(8),
  },
  sideStats: {
    alignItems: "center",
    minWidth: scale(70),
  },
  sideValue: {
    fontSize: scale(20),
    fontWeight: "600",
  },
  sideLabel: {
    ...fontStyles.caption,
    marginTop: scale(2),
  },
  ringContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  ringCenter: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  calorieValue: {
    fontSize: scale(28),
    fontWeight: "700",
  },
  calorieLabel: {
    ...fontStyles.caption,
    marginTop: scale(2),
  },
  macrosSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: scale(12),
    marginBottom: scale(16),
  },
  macroItem: {
    flex: 1,
    alignItems: "center",
  },
  macroLabel: {
    ...fontStyles.caption,
    fontWeight: "500",
    marginBottom: scale(6),
  },
  macroProgressTrack: {
    width: "100%",
    height: scale(5),
    borderRadius: scale(3),
    overflow: "hidden",
    marginBottom: scale(6),
  },
  macroProgressFill: {
    height: "100%",
    borderRadius: scale(3),
  },
  macroValues: {
    ...fontStyles.caption,
    fontWeight: "600",
  },
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: scale(4),
  },
  toggleButton: {
    paddingVertical: scale(8),
    paddingHorizontal: scale(20),
    borderRadius: scale(18),
  },
  toggleButtonActive: {
    borderRadius: scale(18),
  },
  toggleText: {
    ...fontStyles.body2,
    fontWeight: "600",
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
  calorieCard: {
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

export default DailySummary;

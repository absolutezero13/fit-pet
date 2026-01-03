import React, { useMemo, useState } from "react";
import { View, StyleSheet, Text, Modal, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import { colors, macroColors } from "../../../theme/colors";
import { fontStyles } from "../../../theme/fontStyles";
import { scale } from "../../../theme/utils";
import { IMeal } from "../../../services/apiTypes";
import Icon from "@expo/vector-icons/MaterialCommunityIcons";
import useUserStore, { MacroGoals } from "../../../zustand/useUserStore";
import { getGramGoal } from "./utils";
import userService from "../../../services/user";
import Slider from "@react-native-community/slider";
import AppButton from "../../../components/AppButton";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { LiquidGlassView } from "@callstack/liquid-glass";

const DailySummary = ({ meals }: { meals: IMeal[] }) => {
  const { t } = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);
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

  const averageScore = useMemo(() => {
    if (!totals || meals.length === 0) return 0;
    return Math.round(totals.score / meals.length);
  }, [totals, meals]);

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

  const getScoreColor = (score: number) => {
    if (score >= 8) return colors["color-success-400"];
    if (score >= 6) return colors["color-warning-400"];
    if (score >= 4) return colors["color-info-400"];
    if (score >= 2) return colors["color-warning-500"];
    return colors["color-danger-400"];
  };

  const saveGoals = async () => {
    userService.createOrUpdateUser({
      macroGoals: goals,
    });
    setModalVisible(false);
  };

  const proteinGoal = (goals.proteins * goals.calories) / 100 / 4;
  const isOverCalorieGoal = totals.calories > goals.calories;
  const remainingCalories = Math.max(0, goals.calories - totals.calories);
  const overCalories = Math.max(0, totals.calories - goals.calories);

  return (
    <LiquidGlassView effect="clear" style={styles.container}>
      <Animated.View entering={FadeIn} exiting={FadeOut}>
        <View style={styles.headerRow}>
          <Text style={styles.summaryTitle}>{t("dailySummary")}</Text>
          <Pressable onPress={() => setModalVisible(true)}>
            <Icon name="cog-outline" size={scale(22)} color="#888888" />
          </Pressable>
        </View>

        <View
          style={[
            styles.caloriesHero,
            isOverCalorieGoal && styles.caloriesHeroOver,
          ]}
        >
          <View style={styles.caloriesMainRow}>
            <View style={styles.caloriesConsumed}>
              <View
                style={[
                  styles.heroIconContainer,
                  isOverCalorieGoal && styles.heroIconContainerOver,
                ]}
              >
                <Icon
                  name="fire"
                  size={scale(28)}
                  color={isOverCalorieGoal ? "#E53935" : "#F5A623"}
                />
              </View>
              <View>
                <Text
                  style={[
                    styles.heroValue,
                    isOverCalorieGoal && styles.heroValueOver,
                  ]}
                >
                  {totals.calories.toFixed(0)}
                </Text>
                <Text style={styles.heroLabel}>{t("consumed")}</Text>
              </View>
            </View>

            <View style={styles.caloriesRemaining}>
              <View>
                {isOverCalorieGoal ? (
                  <>
                    <Text
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      style={styles.heroValueOver}
                    >
                      +{overCalories.toFixed(0)}
                    </Text>
                    <Text style={styles.heroLabelOver}>{t("over")}</Text>
                  </>
                ) : (
                  <>
                    <Text
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      style={styles.heroValueRemaining}
                    >
                      {remainingCalories.toFixed(0)}
                    </Text>
                    <Text style={styles.heroLabelRemaining}>
                      {t("remaining")}
                    </Text>
                  </>
                )}
              </View>
            </View>
          </View>

          <View
            style={[
              styles.heroProgressContainer,
              isOverCalorieGoal && styles.heroProgressContainerOver,
            ]}
          >
            <View
              style={[
                styles.heroProgress,
                isOverCalorieGoal && styles.heroProgressOver,
                { width: `${Math.min(progress.calories * 100, 100)}%` },
              ]}
            />
          </View>
          <Text style={styles.heroGoalText}>
            {t("goal")}: {goals.calories} kcal
          </Text>
        </View>

        {/* Protein Section */}
        <View style={styles.proteinCard}>
          <View style={styles.proteinRow}>
            <View style={styles.proteinIconContainer}>
              <Icon
                name="lightning-bolt"
                size={scale(20)}
                color={macroColors.protein}
              />
            </View>
            <View style={styles.proteinInfo}>
              <Text style={styles.proteinLabel}>{t("proteins")}</Text>
              <Text style={styles.proteinValues}>
                {totals.proteins.toFixed(0)}g{" "}
                <Text style={styles.proteinGoal}>
                  / {proteinGoal.toFixed(0)}g
                </Text>
              </Text>
            </View>
            <Text style={styles.proteinPercent}>
              {Math.round(progress.proteins * 100)}%
            </Text>
          </View>
          <View style={styles.proteinProgressContainer}>
            <View
              style={[
                styles.proteinProgress,
                { width: `${Math.min(progress.proteins * 100, 100)}%` },
              ]}
            />
          </View>
        </View>

        <View style={styles.otherMacrosRow}>
          <View style={styles.miniMacroCard}>
            <View
              style={[styles.miniMacroIcon, { backgroundColor: "#E3F2FD" }]}
            >
              <Icon
                name="bread-slice"
                size={scale(16)}
                color={macroColors.carbs}
              />
            </View>
            <Text style={styles.miniMacroLabel}>{t("carbs")}</Text>
            <Text style={styles.miniMacroValue}>
              {totals.carbs.toFixed(0)}g
            </Text>
            <View style={styles.miniProgressContainer}>
              <View
                style={[
                  styles.miniProgress,
                  {
                    width: `${Math.min(progress.carbs * 100, 100)}%`,
                    backgroundColor: "#2196F3",
                  },
                ]}
              />
            </View>
          </View>
          <View style={styles.miniMacroCard}>
            <View
              style={[styles.miniMacroIcon, { backgroundColor: "#FBE9E7" }]}
            >
              <Icon name="water" size={scale(16)} color="#FF7043" />
            </View>
            <Text style={styles.miniMacroLabel}>{t("fats")}</Text>
            <Text style={styles.miniMacroValue}>{totals.fats.toFixed(0)}g</Text>
            <View style={styles.miniProgressContainer}>
              <View
                style={[
                  styles.miniProgress,
                  {
                    width: `${Math.min(progress.fats * 100, 100)}%`,
                    backgroundColor: "#FF7043",
                  },
                ]}
              />
            </View>
          </View>

          <Pressable
            style={[styles.miniMacroCard, styles.scoreCard]}
            onPress={() => setModalVisible(true)}
          >
            <View
              style={[
                styles.miniMacroIcon,
                { backgroundColor: getScoreColor(averageScore) + "20" },
              ]}
            >
              <Icon
                name="star"
                size={scale(16)}
                color={getScoreColor(averageScore)}
              />
            </View>
            <Text style={styles.miniMacroLabel}>{t("score")}</Text>
            <Text
              style={[
                styles.miniMacroValue,
                { color: getScoreColor(averageScore) },
              ]}
            >
              {averageScore.toFixed(1)}
            </Text>
          </Pressable>
        </View>
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              {/* Header */}
              <Text style={styles.modalTitle}>{t("nutritionGoals")}</Text>

              {/* Calorie Card */}
              <View style={styles.calorieCard}>
                <View style={styles.calorieIconContainer}>
                  <Icon name="fire" size={scale(24)} color="#F5A623" />
                </View>
                <View style={styles.calorieLabelContainer}>
                  <Text style={styles.calorieLabel}>{t("calories")}</Text>
                  <Text style={styles.calorieSublabel}>{t("dailyGoal")}</Text>
                </View>
                <View style={styles.calorieValueContainer}>
                  <Text style={styles.calorieValue}>{goals.calories}</Text>
                  <Text style={styles.calorieUnit}>kcal</Text>
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
                minimumTrackTintColor="#F5A623"
                maximumTrackTintColor="#E8E8E8"
                thumbTintColor="#F5A623"
              />

              <View style={styles.sliderRow}>
                <View style={styles.sliderIconContainer}>
                  <Icon
                    name="lightning-bolt"
                    size={scale(20)}
                    color="#4CAF50"
                  />
                </View>
                <Text style={styles.sliderLabel}>{t("proteins")}</Text>
                <Text style={styles.sliderGrams}>
                  {((goals.proteins * goals.calories) / 100 / 4).toFixed(0)} g
                </Text>
                <Text style={styles.sliderPercent}>{goals.proteins}%</Text>
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
                minimumTrackTintColor="#4CAF50"
                maximumTrackTintColor="#E8E8E8"
                thumbTintColor="#4CAF50"
              />
              <View style={styles.otherRow}>
                <View style={styles.otherIconContainer}>
                  <Icon
                    name="circle-half-full"
                    size={scale(20)}
                    color="#9E9E9E"
                  />
                </View>
                <Text style={styles.otherLabel}>{t("otherCarbsFat")}</Text>

                <Text style={styles.otherPercent}>{100 - goals.proteins}%</Text>
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
    </LiquidGlassView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: scale(24),
    marginBottom: scale(16),
    paddingHorizontal: scale(24),
    marginHorizontal: scale(24),
    borderRadius: scale(24),
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: scale(16),
  },
  summaryTitle: {
    ...fontStyles.headline3,
    color: "#1A1A1A",
    fontWeight: "700",
  },
  // Calories Hero Section
  caloriesHero: {
    backgroundColor: "#FFFBF5",
    borderRadius: scale(20),
    padding: scale(16),
    marginBottom: scale(16),
  },
  caloriesHeroOver: {
    backgroundColor: "#FFF5F5",
  },
  caloriesMainRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: scale(12),
  },
  caloriesConsumed: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  heroIconContainer: {
    width: scale(48),
    height: scale(48),
    borderRadius: scale(14),
    backgroundColor: "#FFF0D4",
    justifyContent: "center",
    alignItems: "center",
    marginRight: scale(12),
  },
  heroIconContainerOver: {
    backgroundColor: "#FFEBEE",
  },
  heroValue: {
    fontSize: scale(32),
    fontWeight: "700",
    color: "#F5A623",
  },
  heroValueOver: {
    fontSize: scale(32),
    fontWeight: "700",
    color: "#E53935",
  },
  heroLabelOver: {
    ...fontStyles.caption,
    color: "#E53935",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    textAlign: "right",
  },
  heroLabel: {
    ...fontStyles.caption,
    color: "#888888",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  caloriesDivider: {
    width: 1,
    height: scale(40),
    backgroundColor: "#E8E8E8",
    marginHorizontal: scale(16),
  },
  caloriesRemaining: {
    flex: 1,
    alignItems: "flex-end",
  },
  heroValueRemaining: {
    fontSize: scale(28),
    fontWeight: "600",
    color: "#1A1A1A",
    textAlign: "right",
  },
  heroLabelRemaining: {
    ...fontStyles.caption,
    color: "#888888",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    textAlign: "right",
  },
  heroProgressContainer: {
    height: scale(8),
    backgroundColor: "#FFE4B8",
    borderRadius: scale(4),
    overflow: "hidden",
    marginBottom: scale(8),
  },
  heroProgressContainerOver: {
    backgroundColor: "#FFCDD2",
  },
  heroProgress: {
    height: "100%",
    backgroundColor: "#F5A623",
    borderRadius: scale(4),
  },
  heroProgressOver: {
    backgroundColor: "#E53935",
  },
  heroGoalText: {
    ...fontStyles.caption,
    color: "#888888",
    textAlign: "center",
  },
  // Protein Card
  proteinCard: {
    backgroundColor: "#F0F9F0",
    borderRadius: scale(16),
    padding: scale(14),
    marginBottom: scale(12),
  },
  proteinRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: scale(10),
  },
  proteinIconContainer: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(10),
    backgroundColor: "#DCEDC8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: scale(12),
  },
  proteinInfo: {
    flex: 1,
  },
  proteinLabel: {
    ...fontStyles.body2,
    color: "#1A1A1A",
    fontWeight: "600",
  },
  proteinValues: {
    ...fontStyles.body1,
    color: "#4CAF50",
    fontWeight: "700",
  },
  proteinGoal: {
    ...fontStyles.body2,
    color: "#888888",
    fontWeight: "400",
  },
  proteinPercent: {
    ...fontStyles.headline3,
    color: "#4CAF50",
    fontWeight: "700",
  },
  proteinProgressContainer: {
    height: scale(6),
    backgroundColor: "#C8E6C9",
    borderRadius: scale(3),
    overflow: "hidden",
  },
  proteinProgress: {
    height: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: scale(3),
  },
  // Other Macros Row
  otherMacrosRow: {
    flexDirection: "row",
    gap: scale(10),
  },
  miniMacroCard: {
    flex: 1,
    backgroundColor: colors["color-primary-50"],
    borderRadius: scale(14),
    padding: scale(12),
    alignItems: "center",
  },
  scoreCard: {
    backgroundColor: colors["color-primary-50"],
  },
  miniMacroIcon: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(10),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: scale(6),
  },
  miniMacroLabel: {
    ...fontStyles.caption,
    color: colors["color-primary-400"],
    marginBottom: scale(2),
  },
  miniMacroValue: {
    ...fontStyles.body1,
    color: colors["color-primary-500"],
    fontWeight: "700",
    marginBottom: scale(6),
  },
  miniProgressContainer: {
    width: "100%",
    height: scale(4),
    backgroundColor: colors["color-primary-100"],
    borderRadius: scale(2),
    overflow: "hidden",
  },
  miniProgress: {
    height: "100%",
    borderRadius: scale(2),
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    padding: scale(20),
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: scale(24),
    padding: scale(24),
    width: "100%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: scale(4),
    },
    shadowOpacity: 0.15,
    shadowRadius: scale(12),
    elevation: 8,
  },
  modalTitle: {
    ...fontStyles.headline2,
    color: "#1A1A1A",
    fontWeight: "700",
    textAlign: "center",
    marginBottom: scale(20),
  },
  // Calorie Card
  calorieCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors["color-primary-50"],
    borderRadius: scale(16),
    borderWidth: 1,
    borderColor: colors["color-primary-100"],
    padding: scale(16),
    marginBottom: scale(24),
  },
  calorieIconContainer: {
    width: scale(48),
    height: scale(48),
    borderRadius: scale(12),
    backgroundColor: "#FFF8E7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: scale(12),
  },
  calorieLabelContainer: {
    flex: 1,
  },
  calorieLabel: {
    ...fontStyles.body1,
    color: "#1A1A1A",
    fontWeight: "600",
  },
  calorieSublabel: {
    ...fontStyles.caption,
    color: macroColors.protein,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  calorieValueContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  calorieValue: {
    ...fontStyles.headline1,
    color: colors["color-primary-500"],
    fontWeight: "300",
    fontSize: scale(36),
  },
  calorieUnit: {
    ...fontStyles.body2,
    color: colors["color-primary-400"],
    marginLeft: scale(4),
  },
  // Protein Distribution
  proteinDistributionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: scale(12),
  },
  proteinDistributionTitle: {
    ...fontStyles.body1,
    color: colors["color-primary-500"],
    fontWeight: "600",
  },
  distributionBar: {
    flexDirection: "row",
    height: scale(36),
    borderRadius: scale(18),
    overflow: "hidden",
    marginBottom: scale(20),
  },
  distributionSegment: {
    justifyContent: "center",
    alignItems: "center",
  },
  proteinSegment: {
    backgroundColor: macroColors.protein,
  },
  otherSegment: {
    backgroundColor: colors["color-primary-100"],
  },
  segmentText: {
    ...fontStyles.body2,
    color: colors["color-primary-50"],
    fontWeight: "600",
  },
  segmentTextOther: {
    ...fontStyles.body2,
    color: "#888888",
    fontWeight: "500",
  },
  // Slider Row
  sliderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: scale(8),
  },
  sliderIconContainer: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(10),
    backgroundColor: "#F0F9F0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: scale(12),
  },
  sliderLabel: {
    ...fontStyles.body1,
    color: "#1A1A1A",
    fontWeight: "500",
    flex: 1,
  },
  sliderGrams: {
    ...fontStyles.body2,
    color: "#888888",
    marginRight: scale(8),
  },
  sliderPercent: {
    ...fontStyles.body1,
    color: "#4CAF50",
    fontWeight: "700",
  },
  slider: {
    width: "100%",
    height: scale(40),
    marginBottom: scale(16),
  },
  // Other Row
  otherRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: scale(24),
  },
  otherIconContainer: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(10),
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: scale(12),
  },
  otherLabel: {
    ...fontStyles.body1,
    color: "#1A1A1A",
    fontWeight: "500",
    flex: 1,
  },
  otherKcal: {
    ...fontStyles.body2,
    color: "#AAAAAA",
    marginRight: scale(8),
  },
  otherPercent: {
    ...fontStyles.body1,
    color: "#AAAAAA",
    fontWeight: "600",
  },
  // Buttons
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: scale(12),
  },
  button: {
    flex: 1,
    paddingVertical: scale(16),
    borderRadius: scale(28),
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#E57373",
  },
  saveButton: {
    backgroundColor: "#5D6B3D",
  },
  cancelButtonText: {
    ...fontStyles.body1,
    color: "white",
    fontWeight: "600",
  },
  saveButtonText: {
    ...fontStyles.body1,
    color: "white",
    fontWeight: "600",
  },
});

export default DailySummary;

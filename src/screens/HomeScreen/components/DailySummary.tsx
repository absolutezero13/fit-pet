import React, { useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
} from "react-native";
import { useTranslation } from "react-i18next";
import { colors } from "../../../theme/colors";
import { fontStyles } from "../../../theme/fontStyles";
import { scale } from "../../../theme/utils";
import { IMeal } from "../../../services/apiTypes";
import Icon from "@expo/vector-icons/MaterialCommunityIcons";
import useUserStore, { MacroGoals } from "../../../zustand/useUserStore";
import { getGramGoal } from "./utils";
import userService from "../../../services/user";
import Slider from "@react-native-community/slider";
import AppButton from "../../../components/AppButton";

const macroColors: Record<string, string> = {
  calories: colors["color-warning-400"], // golden yellow, attention-grabbing
  proteins: colors["color-success-500"], // healthy green
  carbs: colors["color-info-400"], // light blue, energetic feel
  fats: colors["color-danger-400"], // warm red-orange, rich
};

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

  const circleData = [
    {
      type: "calories",
      label: t("calories"),
      value: totals.calories,
      goal: goals.calories,
      progress: progress.calories,
      unit: "kcal",
      icon: "food",
    },
    {
      type: "proteins",
      label: t("proteins"),
      value: totals.proteins,
      goal: goals.proteins,
      progress: progress.proteins,
      unit: "g",
      icon: "weight-lifter",
      kcalValue: 4,
    },
    {
      type: "carbs",
      label: t("carbs"),
      value: totals.carbs,
      goal: goals.carbs,
      progress: progress.carbs,
      unit: "g",
      icon: "bread-slice",
      kcalValue: 4,
    },
    {
      type: "fats",
      label: t("fats"),
      value: totals.fats,
      goal: goals.fats,
      progress: progress.fats,
      unit: "g",
      icon: "oil",
      kcalValue: 9,
    },
  ];

  const saveGoals = async () => {
    userService.createOrUpdateUser({
      macroGoals: goals,
    });
    setModalVisible(false);
  };

  const proteinGoal = (goals.proteins * goals.calories) / 100 / 4;
  const carbsGoal = (goals.carbs * goals.calories) / 100 / 4;
  const fatsGoal = (goals.fats * goals.calories) / 100 / 9;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.summaryTitle}>{t("dailySummary")}</Text>
          <Pressable onPress={() => setModalVisible(true)}>
            <Icon
              name="format-list-bulleted"
              size={scale(24)}
              color={colors["color-primary-500"]}
            />
          </Pressable>
        </View>
        <TouchableOpacity
          style={[
            styles.scoreBadge,
            { backgroundColor: getScoreColor(averageScore) },
          ]}
          onPress={() => setModalVisible(true)}
        >
          <Icon
            name="star"
            size={scale(14)}
            color="white"
            style={{ marginRight: scale(6) }}
          />
          <Text style={styles.scoreBadgeText}>
            {averageScore.toFixed(1)} Puan
          </Text>
        </TouchableOpacity>
      </View>

      <>
        {/* Calories */}
        <View style={styles.macroRow}>
          <View style={styles.macroHeader}>
            <View
              style={[
                styles.macroIndicator,
                { backgroundColor: macroColors.calories },
              ]}
            />
            <View style={styles.macroTextContainer}>
              <Text style={styles.macroLabel}>{t("calories")}</Text>
              <Text style={styles.macroValue}>
                {totals.calories.toFixed(0)}{" "}
                <Text style={styles.macroGoal}>/ {goals.calories} kcal</Text>
              </Text>
            </View>
          </View>
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${Math.min(progress.calories * 100, 100)}%`,
                  backgroundColor: macroColors.calories,
                },
              ]}
            />
          </View>
        </View>

        {/* Protein */}
        <View style={styles.macroRow}>
          <View style={styles.macroHeader}>
            <View
              style={[
                styles.macroIndicator,
                { backgroundColor: macroColors.proteins },
              ]}
            />
            <View style={styles.macroTextContainer}>
              <Text style={styles.macroLabel}>{t("proteins")}</Text>
              <Text style={styles.macroValue}>
                {totals.proteins.toFixed(0)}g{" "}
                <Text style={styles.macroGoal}>
                  / {proteinGoal.toFixed(0)}g
                </Text>
              </Text>
            </View>
          </View>
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${Math.min(progress.proteins * 100, 100)}%`,
                  backgroundColor: macroColors.proteins,
                },
              ]}
            />
          </View>
        </View>

        {/* Carbs */}
        <View style={styles.macroRow}>
          <View style={styles.macroHeader}>
            <View
              style={[
                styles.macroIndicator,
                { backgroundColor: macroColors.carbs },
              ]}
            />
            <View style={styles.macroTextContainer}>
              <Text style={styles.macroLabel}>{t("carbs")}</Text>
              <Text style={styles.macroValue}>
                {totals.carbs.toFixed(0)}g{" "}
                <Text style={styles.macroGoal}>/ {carbsGoal.toFixed(0)}g</Text>
              </Text>
            </View>
          </View>
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${Math.min(progress.carbs * 100, 100)}%`,
                  backgroundColor: macroColors.carbs,
                },
              ]}
            />
          </View>
        </View>

        {/* Fats */}
        <View style={styles.macroRow}>
          <View style={styles.macroHeader}>
            <View
              style={[
                styles.macroIndicator,
                { backgroundColor: macroColors.fats },
              ]}
            />
            <View style={styles.macroTextContainer}>
              <Text style={styles.macroLabel}>{t("fats")}</Text>
              <Text style={styles.macroValue}>
                {totals.fats.toFixed(0)}g{" "}
                <Text style={styles.macroGoal}>/ {fatsGoal.toFixed(0)}g</Text>
              </Text>
            </View>
          </View>
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${Math.min(progress.fats * 100, 100)}%`,
                  backgroundColor: macroColors.fats,
                },
              ]}
            />
          </View>
        </View>
      </>
      {/* Settings Modal */}
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
                <Icon name="lightning-bolt" size={scale(20)} color="#4CAF50" />
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: scale(32),
    padding: scale(20),
    marginBottom: scale(20),
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerRow: {
    justifyContent: "space-between",
    marginBottom: scale(20),
  },
  summaryTitle: {
    ...fontStyles.headline2,
    color: colors["color-primary-800"],
    fontWeight: "700",
  },
  scoreBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: scale(12),
    paddingVertical: scale(6),
    borderRadius: scale(20),
    alignSelf: "flex-start",
  },
  scoreBadgeText: {
    ...fontStyles.body2,
    color: "white",
    fontWeight: "700",
    fontSize: scale(13),
  },
  macroRow: {
    marginBottom: scale(16),
  },
  macroHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: scale(8),
  },
  macroIndicator: {
    width: scale(4),
    height: scale(32),
    borderRadius: scale(2),
    marginRight: scale(12),
  },
  macroTextContainer: {
    flex: 1,
  },
  macroLabel: {
    ...fontStyles.caption,
    color: colors["color-primary-500"],
    marginBottom: scale(2),
  },
  macroValue: {
    ...fontStyles.body1,
    color: colors["color-primary-900"],
    fontWeight: "700",
  },
  macroGoal: {
    ...fontStyles.caption,
    color: colors["color-primary-400"],
    fontWeight: "400",
  },
  progressBarContainer: {
    height: scale(6),
    backgroundColor: colors["color-primary-100"],
    borderRadius: scale(3),
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: scale(3),
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
    backgroundColor: "#FAFAFA",
    borderRadius: scale(16),
    borderWidth: 1,
    borderColor: "#E8E8E8",
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
    color: "#4CAF50",
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
    color: "#1A1A1A",
    fontWeight: "300",
    fontSize: scale(36),
  },
  calorieUnit: {
    ...fontStyles.body2,
    color: "#888888",
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
    color: "#1A1A1A",
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
    backgroundColor: "#4CAF50",
  },
  otherSegment: {
    backgroundColor: "#E8E8E8",
  },
  segmentText: {
    ...fontStyles.body2,
    color: "white",
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

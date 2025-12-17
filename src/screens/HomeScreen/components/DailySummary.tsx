import React, { useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
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

  const handleInputChange = (field: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setGoals((prev) => ({
      ...prev,
      [field]: numValue,
    }));
  };

  const macroGoalsTotal = goals.proteins + goals.fats + goals.carbs;
  const isMacroGoalsValid = macroGoalsTotal === 100;

  const proteinGoal = (goals.proteins * goals.calories) / 100 / 4;
  const carbsGoal = (goals.carbs * goals.calories) / 100 / 4;
  const fatsGoal = (goals.fats * goals.calories) / 100 / 9;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.summaryTitle}>{t("dailySummary")}</Text>
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
            <Text style={styles.modalTitle}>{t("adjustNutritionGoals")}</Text>

            {circleData.map((data) => {
              const macroType = data.type as keyof MacroGoals;
              return (
                <View key={data.type}>
                  <View style={styles.inputRow}>
                    <View style={styles.labelContainer}>
                      <Icon
                        name={data.icon as any}
                        size={scale(18)}
                        color={macroColors[data.type]}
                        style={styles.inputIcon}
                      />
                      <Text style={styles.inputLabel}>{data.label}</Text>
                    </View>
                    <View style={styles.inputContainer}>
                      <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        value={goals[macroType].toString()}
                        onChangeText={(value) =>
                          handleInputChange(data.type, value)
                        }
                      />
                      <Text style={styles.inputUnit}>
                        {data.type === "calories" ? "kcal" : "%"}{" "}
                      </Text>
                    </View>
                  </View>
                  {data.type !== "calories" && data.kcalValue && (
                    <Text
                      style={{
                        ...fontStyles.footnote,
                        alignSelf: "flex-end",
                        position: "absolute",
                        zIndex: 99,
                        right: scale(42),
                        bottom: scale(0),
                      }}
                    >
                      {(
                        (goals[macroType] * goals.calories) /
                        100 /
                        data.kcalValue
                      ).toFixed(1)}{" "}
                      g
                    </Text>
                  )}
                </View>
              );
            })}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>{t("cancel")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.saveButton,
                  {
                    backgroundColor: isMacroGoalsValid
                      ? colors["color-primary-500"]
                      : colors["color-primary-300"],
                  },
                ]}
                onPress={saveGoals}
                disabled={!isMacroGoalsValid}
              >
                <Text style={styles.buttonText}>{t("save")}</Text>
              </TouchableOpacity>
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
    shadowColor: colors["color-primary-500"],
    shadowOffset: {
      width: 0,
      height: scale(4),
    },
    shadowOpacity: 0.08,
    shadowRadius: scale(12),
    elevation: 3,
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
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: scale(20),
  },
  modalContent: {
    marginTop: scale(120),
    backgroundColor: "white",
    borderRadius: scale(16),
    padding: scale(20),
    width: "90%",
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: scale(2),
    },
    shadowOpacity: 0.25,
    shadowRadius: scale(4),
    elevation: 5,
  },
  modalTitle: {
    ...fontStyles.headline3,
    color: colors["color-primary-500"],
    marginBottom: scale(16),
    textAlign: "center",
  },
  formContainer: {
    maxHeight: scale(300),
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: scale(16),
    paddingHorizontal: scale(4),
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  inputIcon: {
    marginRight: scale(8),
  },
  inputLabel: {
    ...fontStyles.body1,
    color: colors["color-primary-700"],
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    minWidth: scale(100),
  },
  input: {
    ...fontStyles.body1,
    borderWidth: 1,
    borderColor: colors["color-primary-300"],
    borderRadius: scale(8),
    paddingHorizontal: scale(12),
    paddingVertical: scale(8),
    textAlign: "right",
    width: scale(80),
  },
  inputUnit: {
    ...fontStyles.body1,
    color: colors["color-primary-500"],
    marginLeft: scale(8),
    width: scale(30),
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: scale(20),
  },
  button: {
    paddingVertical: scale(12),
    paddingHorizontal: scale(24),
    borderRadius: scale(8),
    minWidth: "45%",
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: colors["color-warning-600"],
  },
  saveButton: {
    backgroundColor: colors["color-primary-500"],
  },
  buttonText: {
    ...fontStyles.body1,
    color: "white",
  },
});

export default DailySummary;

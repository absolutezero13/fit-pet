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
import CircleProgress from "./CircleProgress";
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

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.summaryTitle}>{t("dailySummary")}</Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => {
            setModalVisible(true);
          }}
        >
          <Icon
            name="cog"
            size={scale(24)}
            color={colors["color-primary-500"]}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.progressContainer}>
        {circleData.map((data) => (
          <View key={data.label} style={[styles.calorieCircleContainer]}>
            <CircleProgress
              progress={data.progress}
              color={macroColors[data.type]}
              size={scale(95)}
              strokeWidth={scale(12)}
              label={data.label}
              value={data.value.toFixed(0)}
              goal={
                data.type === "calories"
                  ? data.goal
                  : (
                      (goals[data.type] * goals.calories) /
                      100 /
                      (data.kcalValue ?? 1)
                    ).toFixed(1)
              }
              unit={data.unit}
            />
          </View>
        ))}
      </View>

      <View
        style={[
          styles.scoreCircle,
          { backgroundColor: getScoreColor(averageScore) },
        ]}
      >
        <Text style={styles.scoreValue}>{averageScore}</Text>
        <Text style={styles.scoreLabel}>{t("averageScore")}</Text>
      </View>

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

            {circleData.map((data) => (
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
                      value={goals[data.type].toString()}
                      onChangeText={(value) =>
                        handleInputChange(data.type, value)
                      }
                    />
                    <Text style={styles.inputUnit}>
                      {data.type === "calories" ? "kcal" : "%"}{" "}
                    </Text>
                  </View>
                </View>
                {data.type !== "calories" && (
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
                      (goals[data.type] * goals.calories) /
                      100 /
                      data.kcalValue
                    ).toFixed(1)}{" "}
                    g
                  </Text>
                )}
              </View>
            ))}

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
    flex: 1,
    backgroundColor: "white",
    borderRadius: scale(16),
    padding: scale(10),
    marginBottom: scale(20),
    shadowColor: colors["color-primary-500"],
    shadowOffset: {
      width: 0,
      height: scale(2),
    },
    shadowOpacity: 0.1,
    shadowRadius: scale(8),
    elevation: 3,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: scale(16),
  },
  settingsButton: {
    padding: scale(4),
  },
  summaryTitle: {
    ...fontStyles.headline3,
    color: colors["color-primary-500"],
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: scale(8),
    gap: scale(8),
  },
  calorieCircleContainer: {
    // justifyContent: "center",
  },
  macroCirclesContainer: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    alignItems: "center",
  },
  progressCircleContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    margin: scale(4),
  },
  progressBackground: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  circleBackground: {
    justifyContent: "center",
    alignItems: "center",
  },
  progressForeground: {
    position: "absolute",
  },
  svgContainer: {
    transform: [{ rotate: "-90deg" }],
  },
  progressContent: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  progressIcon: {
    marginBottom: scale(2),
  },
  progressValue: {
    ...fontStyles.headline3,
    color: colors["color-primary-800"],
    lineHeight: scale(24),
  },
  progressGoal: {
    ...fontStyles.caption,
    color: colors["color-primary-400"],
    marginBottom: scale(2),
  },
  progressLabel: {
    ...fontStyles.caption,
    color: colors["color-primary-500"],
  },
  scoreCircle: {
    width: scale(70),
    height: scale(70),
    borderRadius: scale(40),
    justifyContent: "center",
    alignItems: "center",
    margin: scale(4),
    position: "absolute",
    right: scale(10),
    top: "50%",
    transform: [{ translateY: -scale(20) }],
  },
  scoreValue: {
    ...fontStyles.headline3,
    color: "white",
    fontWeight: "bold",
  },
  scoreLabel: {
    ...fontStyles.caption,
    color: "white",
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

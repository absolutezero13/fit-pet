import React, { useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { useTranslation } from "react-i18next";
import { colors } from "../../../theme/colors";
import { fontStyles } from "../../../theme/fontStyles";
import { scale } from "../../../theme/utils";
import CircleProgress from "./CircleProgress";

const DailySummary = ({ meals }) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  const userGoals = {
    calories: 2000,
    proteins: 140,
    carbs: 250,
    fats: 65,
  };

  const totals = useMemo(() => {
    if (!meals || meals.length === 0) return null;

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

  if (!totals) return null;

  const progress = {
    calories: Math.min(totals.calories / userGoals.calories, 1),
    proteins: Math.min(totals.proteins / userGoals.proteins, 1),
    carbs: Math.min(totals.carbs / userGoals.carbs, 1),
    fats: Math.min(totals.fats / userGoals.fats, 1),
  };

  const getScoreColor = (score) => {
    if (score >= 80) return colors["color-success-400"];
    if (score >= 60) return colors["color-warning-400"];
    return colors["color-danger-400"];
  };

  const getProgressColor = (progressValue, type) => {
    if (type === "calories") {
      if (progressValue > 1) return colors["color-danger-400"];
      if (progressValue > 0.9) return colors["color-warning-400"];
      return colors["color-success-400"];
    } else {
      if (progressValue >= 0.9) return colors["color-success-400"];
      if (progressValue >= 0.6) return colors["color-warning-400"];
      return colors["color-danger-400"];
    }
  };

  const toggleExpanded = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded((prev) => !prev);
  };

  const circleData = [
    {
      type: "calories",
      label: t("calories"),
      value: totals.calories,
      goal: userGoals.calories,
      progress: progress.calories,
      unit: "kcal",
      icon: "food",
    },
    {
      type: "proteins",
      label: t("proteins"),
      value: totals.proteins,
      goal: userGoals.proteins,
      progress: progress.proteins,
      unit: "g",
      icon: "weight-lifter",
    },
    {
      type: "carbs",
      label: t("carbs"),
      value: totals.carbs,
      goal: userGoals.carbs,
      progress: progress.carbs,
      unit: "g",
      icon: "bread-slice",
    },
    {
      type: "fats",
      label: t("fats"),
      value: totals.fats,
      goal: userGoals.fats,
      progress: progress.fats,
      unit: "g",
      icon: "avocado",
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.progressContainer}>
        {circleData.slice(0, isExpanded ? 4 : 1).map((data, index) => (
          <View key={data.label} style={[styles.calorieCircleContainer]}>
            <CircleProgress
              progress={data.progress}
              color={getProgressColor(data.progress, data.type)}
              size={scale(70)}
              strokeWidth={scale(7)}
              label={data.label}
              value={data.value.toFixed(1)}
              goal={data.goal}
              unit={data.unit}
            />
          </View>
        ))}
      </View>

      {/* <View
        style={{ flexDirection: "row", alignItems: "center", gap: scale(8) }}
      >
        <Text style={styles.summaryTitle}>{t("dailyGoals")}</Text>
        <View
          style={[
            styles.scoreCircle,
            { backgroundColor: getScoreColor(averageScore) },
          ]}
        >
          <Text style={styles.scoreValue}>{averageScore}</Text>
          <Text style={styles.scoreLabel}>{t("score")}</Text>
        </View>
      </View> */}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
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
  summaryTitle: {
    ...fontStyles.headline3,
    color: colors["color-primary-500"],
    marginBottom: scale(16),
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: scale(8),
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
    width: scale(50),
    height: scale(50),
    borderRadius: scale(30),
    justifyContent: "center",
    alignItems: "center",
    margin: scale(4),
  },
  scoreValue: {
    ...fontStyles.headline4,
    color: "white",
    fontWeight: "bold",
  },
  scoreLabel: {
    ...fontStyles.footnote,
    color: "white",
  },
});

export default DailySummary;

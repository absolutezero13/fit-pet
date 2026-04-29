import React, { FC, useEffect, useMemo, useState } from "react";
import { View, StyleSheet, Text, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import getMacroConfig from "../../../utils/getMacroConfig";
import { fontStyles } from "../../../theme/fontStyles";
import { scale } from "../../../theme/utils";
import { IMeal } from "../../../services/apiTypes";
import Icon from "@expo/vector-icons/MaterialCommunityIcons";
import useUserStore, { MacroGoals } from "../../../zustand/useUserStore";
import usePreferencesStore from "../../../zustand/usePreferencesStore";
import { getGramGoal } from "./utils";
import userService from "../../../services/user";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { useTheme } from "../../../theme/ThemeContext";
import MacroCard, { RingWithIcon } from "../../../components/MacroCard";
import NutritionGoalsModal from "./NutritionGoalsModal";

const DailySummary: FC<{ meals: IMeal[] }> = ({ meals }) => {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const currentMacroGoals = useUserStore((state) => state?.macroGoals);
  const homeNutritionDisplay =
    usePreferencesStore((state) => state.homeNutritionDisplay) ?? "consumed";

  const [goals, setGoals] = useState<MacroGoals>(
    currentMacroGoals as MacroGoals,
  );

  useEffect(() => {
    if (currentMacroGoals) {
      setGoals(currentMacroGoals);
    }
  }, [currentMacroGoals]);

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
  const remainingModeDisplay = isOverCalorie ? overCalories : remainingCalories;
  const calorieLargeNumber =
    homeNutritionDisplay === "consumed"
      ? Math.round(totals.calories)
      : Math.round(remainingModeDisplay);

  const calorieLabelKey =
    homeNutritionDisplay === "consumed"
      ? isOverCalorie
        ? "caloriesOver"
        : "caloriesConsumed"
      : isOverCalorie
        ? "caloriesOver"
        : "caloriesLeft";

  const [calorieLabelMain, calorieLabelSuffix] = t(calorieLabelKey).split(" ");

  const calorieConfig = getMacroConfig("calories");
  const ringColor = isOverCalorie ? colors["color-danger-400"] : colors.text;
  const trackColor = isDark
    ? colors.textTertiary + "30"
    : colors.border + "60";
  const iconBg = colors.backgroundSecondary;

  const saveGoals = async () => {
    await userService.createOrUpdateUser({
      macroGoals: goals,
    });
    setModalVisible(false);
  };

  const handleOpenGoalsModal = () => {
    if (currentMacroGoals) {
      setGoals(currentMacroGoals);
    }

    setModalVisible(true);
  };

  const handleCloseGoalsModal = () => {
    if (currentMacroGoals) {
      setGoals(currentMacroGoals);
    }

    setModalVisible(false);
  };

  return (
    <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.wrapper}>
      <View style={[styles.calorieCard, { backgroundColor: colors.surface }]}>
        <View style={styles.headerActions}>
          <Pressable
            style={styles.headerIconButton}
            onPress={handleOpenGoalsModal}
            hitSlop={12}
            accessibilityRole="button"
          >
            <Icon
              name="cog-outline"
              size={scale(18)}
              color={colors.textSecondary}
            />
          </Pressable>
        </View>
        <View style={styles.calorieTextBlock}>
          <Text style={[styles.calorieValue, { color: colors.text }]}>
            {calorieLargeNumber}
          </Text>
          <Text style={[styles.calorieLabel, { color: colors.textSecondary }]}>
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
          summaryMetric={homeNutritionDisplay}
        />
        <MacroCard
          type="carbs"
          current={totals.carbs}
          goal={carbsGoal}
          summaryMetric={homeNutritionDisplay}
        />
        <MacroCard
          type="fats"
          current={totals.fats}
          goal={fatsGoal}
          summaryMetric={homeNutritionDisplay}
        />
      </View>

      <NutritionGoalsModal
        visible={modalVisible}
        onClose={handleCloseGoalsModal}
        goals={goals}
        setGoals={setGoals}
        onSave={saveGoals}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: scale(24),
    marginBottom: scale(16),
    gap: scale(10),
  },
  headerActions: {
    position: "absolute",
    top: scale(10),
    right: scale(12),
    zIndex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: scale(8),
  },
  headerIconButton: {
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
});

export default DailySummary;

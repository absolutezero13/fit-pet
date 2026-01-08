import React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { scale } from "../../../theme/utils";
import { fontStyles } from "../../../theme/fontStyles";
import { useTheme } from "../../../theme/ThemeContext";
import { LiquidGlassView } from "@callstack/liquid-glass";
import { useTranslation } from "react-i18next";
import { IMeal } from "../../../services/apiTypes";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import formatHeaderDate from "../../../utils/formatHeaderDate";
import { useNavigation } from "@react-navigation/native";
import { TouchableOpacity } from "react-native";
import { FATS_COLOR } from "../constants";

interface DayMealsListProps {
  meals: IMeal[];
  selectedDate: Date;
  loading: boolean;
}

const MealItem: React.FC<{ meal: IMeal }> = ({ meal }) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();

  const getMealTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "breakfast":
        return "coffee";
      case "lunch":
        return "food";
      case "dinner":
        return "food-variant";
      case "snack":
        return "cookie";
      default:
        return "food";
    }
  };

  const handlePress = () => {
    if (meal._id) {
      navigation.navigate("AnalyzedMeal", { mealId: meal._id });
    }
  };

  return (
    <TouchableOpacity
      style={[styles.mealItem, { backgroundColor: colors.backgroundSecondary }]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.mealIconContainer,
          { backgroundColor: colors["color-success-100"] },
        ]}
      >
        <MaterialCommunityIcons
          name={getMealTypeIcon(meal.mealType)}
          size={scale(20)}
          color={colors["color-success-500"]}
        />
      </View>

      <View style={styles.mealInfo}>
        <Text style={[styles.mealDescription, { color: colors.text }]} numberOfLines={1}>
          {meal.description || meal.mealTypeLocalized || t(meal.mealType)}
        </Text>
        <Text style={[styles.mealType, { color: colors.textSecondary }]}>
          {meal.mealTypeLocalized || t(meal.mealType)}
        </Text>
      </View>

      <View style={styles.mealNutrition}>
        <Text style={[styles.calorieValue, { color: colors["color-warning-500"] }]}>
          {Math.round(Number(meal.calories))}
        </Text>
        <Text style={[styles.calorieUnit, { color: colors.textSecondary }]}>
          {t("cal")}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const DayMealsList: React.FC<DayMealsListProps> = ({
  meals,
  selectedDate,
  loading,
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const totals = React.useMemo(() => {
    return meals.reduce(
      (acc, meal) => ({
        calories: acc.calories + Number(meal.calories || 0),
        proteins: acc.proteins + Number(meal.proteins || 0),
        carbs: acc.carbs + Number(meal.carbs || 0),
        fats: acc.fats + Number(meal.fats || 0),
      }),
      { calories: 0, proteins: 0, carbs: 0, fats: 0 }
    );
  }, [meals]);

  return (
    <LiquidGlassView
      effect="clear"
      style={[styles.container, { backgroundColor: colors.surface }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.dateTitle, { color: colors.text }]}>
          {formatHeaderDate(selectedDate)}
        </Text>
        <Text style={[styles.mealCount, { color: colors.textSecondary }]}>
          {meals.length} {meals.length === 1 ? t("meal") : t("mealsCount")}
        </Text>
      </View>

      {/* Loading State */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors["color-success-400"]} />
        </View>
      )}

      {/* Empty State */}
      {!loading && meals.length === 0 && (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons
            name="food-off"
            size={scale(48)}
            color={colors.textTertiary}
          />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {t("noMealsForDate")}
          </Text>
        </View>
      )}

      {/* Meals List */}
      {!loading && meals.length > 0 && (
        <>
          <View style={styles.mealsContainer}>
            {meals.map((meal, index) => (
              <MealItem key={meal._id || index} meal={meal} />
            ))}
          </View>

          {/* Day Totals */}
          <View
            style={[
              styles.totalsContainer,
              { backgroundColor: colors.backgroundSecondary },
            ]}
          >
            <Text style={[styles.totalsTitle, { color: colors.text }]}>
              {t("dayTotal")}
            </Text>
            <View style={styles.totalsRow}>
              <View style={styles.totalItem}>
                <Text
                  style={[
                    styles.totalValue,
                    { color: colors["color-warning-500"] },
                  ]}
                >
                  {Math.round(totals.calories)}
                </Text>
                <Text
                  style={[styles.totalLabel, { color: colors.textSecondary }]}
                >
                  {t("cal")}
                </Text>
              </View>
              <View style={styles.totalItem}>
                <Text
                  style={[
                    styles.totalValue,
                    { color: colors["color-success-500"] },
                  ]}
                >
                  {Math.round(totals.proteins)}g
                </Text>
                <Text
                  style={[styles.totalLabel, { color: colors.textSecondary }]}
                >
                  {t("proteins")}
                </Text>
              </View>
              <View style={styles.totalItem}>
                <Text
                  style={[
                    styles.totalValue,
                    { color: colors["color-info-500"] },
                  ]}
                >
                  {Math.round(totals.carbs)}g
                </Text>
                <Text
                  style={[styles.totalLabel, { color: colors.textSecondary }]}
                >
                  {t("carbs")}
                </Text>
              </View>
              <View style={styles.totalItem}>
                <Text style={[styles.totalValue, { color: FATS_COLOR }]}>
                  {Math.round(totals.fats)}g
                </Text>
                <Text
                  style={[styles.totalLabel, { color: colors.textSecondary }]}
                >
                  {t("fats")}
                </Text>
              </View>
            </View>
          </View>
        </>
      )}
    </LiquidGlassView>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: scale(20),
    padding: scale(16),
    marginBottom: scale(16),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: scale(16),
  },
  dateTitle: {
    ...fontStyles.headline3,
  },
  mealCount: {
    ...fontStyles.body2,
  },
  loadingContainer: {
    paddingVertical: scale(40),
    alignItems: "center",
  },
  emptyContainer: {
    paddingVertical: scale(40),
    alignItems: "center",
  },
  emptyText: {
    ...fontStyles.body1,
    marginTop: scale(12),
  },
  mealsContainer: {
    gap: scale(10),
  },
  mealItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: scale(12),
    borderRadius: scale(14),
  },
  mealIconContainer: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(12),
    alignItems: "center",
    justifyContent: "center",
    marginRight: scale(12),
  },
  mealInfo: {
    flex: 1,
  },
  mealDescription: {
    ...fontStyles.body1Bold,
    marginBottom: scale(2),
  },
  mealType: {
    ...fontStyles.caption,
  },
  mealNutrition: {
    alignItems: "flex-end",
  },
  calorieValue: {
    ...fontStyles.headline3,
    fontWeight: "700",
  },
  calorieUnit: {
    ...fontStyles.caption,
  },
  totalsContainer: {
    marginTop: scale(16),
    padding: scale(16),
    borderRadius: scale(14),
  },
  totalsTitle: {
    ...fontStyles.body2,
    fontWeight: "600",
    marginBottom: scale(12),
    textAlign: "center",
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  totalItem: {
    alignItems: "center",
  },
  totalValue: {
    ...fontStyles.body1Bold,
  },
  totalLabel: {
    ...fontStyles.caption,
  },
});

export default DayMealsList;

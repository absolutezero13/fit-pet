import React from "react";
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { IMeal } from "../../services/apiTypes";
import { colors } from "../../theme/colors";
import { fontStyles } from "../../theme/fontStyles";
import { scale } from "../../theme/utils";
import useMealsStore from "../../zustand/useMealsStore";
import { deleteMeal } from "../../services/mealAnalysis";

type AnalyzedMealScreenProps = {
  mealId: string;
};

const AnalyzedMealScreen = () => {
  const { mealId } = useRoute().params as AnalyzedMealScreenProps;
  const meal = useMealsStore((state) =>
    state.loggedMeals.find((meal) => meal._id === mealId)
  );
  const { t } = useTranslation();
  const { top, bottom } = useSafeAreaInsets();
  const navigation = useNavigation();

  if (!meal) {
    return null;
  }

  const handleDelete = async () => {
    Alert.alert(t("deleteConfirmation"), t("deleteItemConfirmationMessage"), [
      {
        text: t("cancel"),
        style: "cancel",
      },
      {
        text: t("delete"),
        style: "destructive",
        onPress: async () => {
          try {
            useMealsStore.setState((state) => {
              const newMeals = state.loggedMeals.filter(
                (m) => m._id !== meal._id
              );
              deleteMeal(meal._id);
              return { loggedMeals: newMeals };
            });
            navigation.goBack();
          } catch (error) {
            console.error("Error deleting meal:", error);
            Alert.alert(t("error"), t("deleteFailed"));
          }
        },
      },
    ]);
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return colors["color-success-500"];
    if (score >= 6) return colors["color-warning-500"];
    return colors["color-danger-500"];
  };

  const getScoreLabel = (score: number) => {
    return t("score" + Math.floor(score));
  };

  const handleEdit = () => {
    navigation.navigate("LogMeal", {
      mealId: meal._id,
      selectedDate: meal.date,
    });
  };

  const renderMacroIcon = (type: string) => {
    switch (type) {
      case "protein":
        return (
          <MaterialCommunityIcons
            name="food-steak"
            size={scale(24)}
            color={colors["color-primary-500"]}
          />
        );
      case "carbs":
        return (
          <MaterialCommunityIcons
            name="bread-slice"
            size={scale(24)}
            color={colors["color-info-500"]}
          />
        );
      case "fats":
        return (
          <MaterialCommunityIcons
            name="oil"
            size={scale(24)}
            color={colors["color-warning-500"]}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.pageHeader,
          {
            paddingTop: top,
          },
        ]}
      >
        <MaterialCommunityIcons
          name="chevron-left"
          size={scale(40)}
          color={colors["color-primary-500"]}
          onPress={navigation.goBack}
        />
        <Text style={styles.title}>{t("mealAnalysis")}</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: bottom + scale(20) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {meal.image && (
          <Image
            source={{ uri: meal.image }}
            style={{
              width: scale(100),
              height: scale(100),
              borderRadius: scale(16),
              marginRight: scale(16),
              alignSelf: "center",
              marginTop: scale(12),
            }}
          />
        )}
        {/* Meal Description and Calories */}
        <View style={styles.descriptionSection}>
          <Text style={styles.mealName}>{meal.description}</Text>
          <View style={styles.calorieContainer}>
            <Text style={styles.calorieValue}>{meal.calories}</Text>
            <Text style={styles.calorieUnit}>{t("cal")}</Text>
          </View>
        </View>

        {/* Score Section with Label */}
        <View style={styles.scoreSection}>
          <View
            style={[
              styles.scoreContainer,
              { backgroundColor: getScoreColor(meal.score) },
            ]}
          >
            <Text style={styles.scoreValue}>{meal.score}</Text>
          </View>
          <View style={styles.scoreTextContainer}>
            <Text style={styles.scoreHeading}>{t("nutritionScore")}</Text>
            <Text
              style={[styles.scoreLabel, { color: getScoreColor(meal.score) }]}
            >
              {getScoreLabel(meal.score)}
            </Text>
          </View>
        </View>

        {/* Macros Section */}
        <Text style={styles.sectionHeading}>{t("macronutrients")}</Text>
        <View style={styles.macrosContainer}>
          <View style={styles.macroItem}>
            {renderMacroIcon("protein")}
            <Text style={styles.macroValue}>{meal.proteins}g</Text>
            <Text style={styles.macroLabel}>{t("proteins")}</Text>
          </View>
          <View style={styles.macroItem}>
            {renderMacroIcon("carbs")}
            <Text style={styles.macroValue}>{meal.carbs}g</Text>
            <Text style={styles.macroLabel}>{t("carbs")}</Text>
          </View>
          <View style={styles.macroItem}>
            {renderMacroIcon("fats")}
            <Text style={styles.macroValue}>{meal.fats}g</Text>
            <Text style={styles.macroLabel}>{t("fats")}</Text>
          </View>
        </View>

        {/* Insights Section */}
        {meal.insights && meal.insights.length > 0 && (
          <>
            <TouchableOpacity style={styles.insightsHeader}>
              <Text style={styles.sectionHeading}>{t("insights")}</Text>
            </TouchableOpacity>

            <View style={styles.insightsList}>
              {meal.insights.map((insight, index) => (
                <View key={index} style={styles.insightItem}>
                  <MaterialCommunityIcons
                    name="lightbulb-outline"
                    size={scale(20)}
                    color={colors["color-warning-500"]}
                    style={styles.insightIcon}
                  />
                  <Text style={styles.insightText}>{insight}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[
              styles.deleteButton,
              {
                borderColor: colors["color-danger-300"],
              },
            ]}
            onPress={handleDelete}
          >
            <MaterialCommunityIcons
              name="delete-outline"
              size={scale(20)}
              color={colors["color-danger-500"]}
            />
            <Text
              style={[
                styles.deleteText,
                {
                  color: colors["color-danger-500"],
                },
              ]}
            >
              {t("delete")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.deleteButton,
              {
                borderColor: colors["color-primary-300"],
              },
            ]}
            onPress={handleEdit}
          >
            <MaterialCommunityIcons
              name="pencil-outline"
              size={scale(20)}
              color={colors["color-primary-500"]}
            />
            <Text
              style={[
                styles.deleteText,
                {
                  color: colors["color-primary-500"],
                },
              ]}
            >
              {t("edit")}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors["color-primary-100"],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: scale(24),
  },
  pageHeader: {
    paddingHorizontal: scale(24),
    flexDirection: "row",
    alignItems: "center",
    gap: scale(4),
  },
  title: {
    ...fontStyles.headline1,
    color: colors["color-primary-500"],
  },
  topSection: {
    marginBottom: scale(12),
    paddingTop: scale(24),
  },
  mealTitle: {
    ...fontStyles.headline2,
    color: colors["color-primary-900"],
  },
  dateText: {
    ...fontStyles.body2,
    color: colors["color-primary-500"],
    marginTop: scale(4),
  },
  descriptionSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: scale(12),
    backgroundColor: "white",
    padding: scale(16),
    borderRadius: scale(16),
    shadowColor: colors["color-primary-900"],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  mealName: {
    ...fontStyles.headline3,
    color: colors["color-primary-900"],
    flex: 1,
    marginRight: scale(10),
  },
  calorieContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    backgroundColor: colors["color-primary-100"],
    paddingHorizontal: scale(12),
    paddingVertical: scale(8),
    borderRadius: scale(16),
  },
  calorieValue: {
    ...fontStyles.headline3,
    color: colors["color-success-500"],
  },
  calorieUnit: {
    ...fontStyles.body2,
    color: colors["color-success-500"],
    marginLeft: scale(4),
  },
  scoreSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: scale(32),
    backgroundColor: "white",
    padding: scale(16),
    borderRadius: scale(16),
    shadowColor: colors["color-primary-900"],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  scoreContainer: {
    width: scale(60),
    height: scale(60),
    borderRadius: scale(30),
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors["color-primary-900"],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginRight: scale(16),
  },
  scoreValue: {
    ...fontStyles.headline1,
    color: "white",
    fontWeight: "bold",
  },
  scoreTextContainer: {
    flex: 1,
  },
  scoreHeading: {
    ...fontStyles.body2,
    color: colors["color-primary-400"],
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: scale(4),
  },
  scoreLabel: {
    ...fontStyles.headline3,
    fontWeight: "600",
  },
  sectionHeading: {
    ...fontStyles.headline3,
    color: colors["color-primary-900"],
    marginBottom: scale(16),
  },
  macrosContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: scale(32),
  },
  macroItem: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "white",
    padding: scale(16),
    borderRadius: scale(16),
    marginHorizontal: scale(4),
    shadowColor: colors["color-primary-900"],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  macroValue: {
    ...fontStyles.headline3,
    color: colors["color-primary-900"],
    marginTop: scale(8),
    marginBottom: scale(4),
  },
  macroLabel: {
    ...fontStyles.footnote,
    color: colors["color-primary-600"],
    letterSpacing: 0.5,
    textAlign: "center",
  },
  insightsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  insightsList: {
    backgroundColor: "white",
    borderRadius: scale(16),
    padding: scale(16),
    marginBottom: scale(24),
    shadowColor: colors["color-primary-900"],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  insightItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: scale(14),
  },
  insightIcon: {
    marginRight: scale(12),
    marginTop: scale(2),
  },
  insightText: {
    ...fontStyles.body2,
    flex: 1,
    color: colors["color-primary-900"],
    lineHeight: scale(20),
  },
  actionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: scale(14),
    borderWidth: 1,
    borderColor: colors["color-primary-300"],
    borderRadius: scale(12),
    flex: 1,
    marginRight: scale(8),
    backgroundColor: "white",
  },
  editText: {
    ...fontStyles.body2,
    color: colors["color-primary-600"],
    marginLeft: scale(8),
    fontWeight: "500",
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: scale(14),
    borderWidth: 1,
    borderRadius: scale(12),
    flex: 1,
    marginLeft: scale(8),
    backgroundColor: "white",
  },
  deleteText: {
    ...fontStyles.body2,
    marginLeft: scale(8),
    fontWeight: "500",
  },
});

export default AnalyzedMealScreen;

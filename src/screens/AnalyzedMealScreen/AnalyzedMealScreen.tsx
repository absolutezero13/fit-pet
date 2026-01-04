import React from "react";
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { fontStyles } from "../../theme/fontStyles";
import { scale } from "../../theme/utils";
import useMealsStore from "../../zustand/useMealsStore";
import { deleteMeal } from "../../services/mealAnalysis";
import { LiquidGlassView } from "@callstack/liquid-glass";
import FastImage from "react-native-fast-image";
import { useTheme } from "../../theme/ThemeContext";

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
  const { colors } = useTheme();

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
              if (!meal._id) return state;

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
    const roundedScore = Math.max(1, Math.min(10, Math.floor(score)));
    return t("score" + roundedScore);
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
            size={scale(20)}
            color={colors.text}
          />
        );
      case "carbs":
        return (
          <MaterialCommunityIcons
            name="bread-slice"
            size={scale(20)}
            color={colors["color-info-500"]}
          />
        );
      case "fats":
        return (
          <MaterialCommunityIcons
            name="oil"
            size={scale(20)}
            color={colors["color-warning-500"]}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LiquidGlassView
        effect="clear"
        style={[styles.pageHeader, { paddingTop: top }]}
      >
        <TouchableOpacity onPress={navigation.goBack} style={styles.backButton}>
          <MaterialCommunityIcons
            name="chevron-left"
            size={scale(28)}
            color={colors.text}
          />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>{t("mealAnalysis")}</Text>
        <View style={styles.headerSpacer} />
      </LiquidGlassView>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: bottom + scale(40), paddingTop: top + scale(70) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.topSection, { backgroundColor: colors.surface }]}>
          {meal.image ? (
            <FastImage source={{ uri: meal.image }} style={styles.mealImage} />
          ) : (
            <View style={[styles.emojiContainer, { backgroundColor: colors.backgroundSecondary }]}>
              <Text style={styles.emoji}>{meal.emoji || "🍽️"}</Text>
            </View>
          )}
          <View style={styles.basicInfo}>
            <Text style={[styles.mealName, { color: colors.text }]} numberOfLines={3}>
              {meal.description}
            </Text>
            <View style={[styles.calorieContainer, { backgroundColor: colors["color-danger-100"] }]}>
              <MaterialCommunityIcons
                name="fire"
                size={scale(20)}
                color={colors["color-danger-500"]}
              />
              <Text style={styles.calorieValue}>{meal.calories}</Text>
              <Text style={styles.calorieUnit}>{t("cal")}</Text>
            </View>
          </View>
        </View>
        <View style={[styles.scoreSection, { backgroundColor: colors.surface }]}>
          <View
            style={[
              styles.scoreContainer,
              { backgroundColor: getScoreColor(meal.score) },
            ]}
          >
            <Text style={[styles.scoreValue, { color: colors.textInverse }]}>{meal.score}</Text>
          </View>
          <View style={styles.scoreTextContainer}>
            <Text style={[styles.scoreHeading, { color: colors.text }]}>{t("nutritionScore")}</Text>
            <Text
              style={[styles.scoreLabel, { color: getScoreColor(meal.score) }]}
            >
              {getScoreLabel(meal.score)}
            </Text>
          </View>
        </View>
        <Text style={[styles.sectionHeading, { color: colors.text }]}>{t("macronutrients")}</Text>
        <View style={[styles.macrosContainer, { backgroundColor: colors.surface }]}>
          <View style={styles.macroItem}>
            {renderMacroIcon("protein")}
            <Text style={[styles.macroValue, { color: colors.text }]}>{meal.proteins}g</Text>
            <Text style={[styles.macroLabel, { color: colors.textSecondary }]}>{t("proteins")}</Text>
          </View>
          <View style={styles.macroItem}>
            {renderMacroIcon("carbs")}
            <Text style={[styles.macroValue, { color: colors.text }]}>{meal.carbs}g</Text>
            <Text style={[styles.macroLabel, { color: colors.textSecondary }]}>{t("carbs")}</Text>
          </View>
          <View style={styles.macroItem}>
            {renderMacroIcon("fats")}
            <Text style={[styles.macroValue, { color: colors.text }]}>{meal.fats}g</Text>
            <Text style={[styles.macroLabel, { color: colors.textSecondary }]}>{t("fats")}</Text>
          </View>
        </View>
        {meal.insights && meal.insights.length > 0 && (
          <>
            <Text style={[styles.sectionHeading, { color: colors.text }]}>{t("insights")}</Text>
            <View style={[styles.insightsList, { backgroundColor: colors.surface }]}>
              {meal.insights.map((insight, index) => (
                <View key={index} style={styles.insightItem}>
                  <View style={[styles.insightIconContainer, { backgroundColor: colors["color-warning-100"] }]}>
                    <MaterialCommunityIcons
                      name="lightbulb"
                      size={scale(20)}
                      color={colors["color-warning-600"]}
                    />
                  </View>
                  <Text style={[styles.insightText, { color: colors.text }]}>{insight}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        <View style={styles.actionContainer}>
          <LiquidGlassView
            effect="clear"
            interactive
            style={[styles.actionButtonPrimary, { backgroundColor: colors.surface }]}
          >
            <TouchableOpacity
              style={styles.actionButtonInner}
              onPress={handleEdit}
            >
              <MaterialCommunityIcons
                name="pencil"
                size={scale(22)}
                color={colors.text}
              />
              <Text style={[styles.actionText, { color: colors.text }]}>{t("edit")}</Text>
            </TouchableOpacity>
          </LiquidGlassView>

          <LiquidGlassView
            effect="clear"
            interactive
            style={[styles.actionButtonDanger, { backgroundColor: colors["color-danger-500"] }]}
          >
            <TouchableOpacity
              style={styles.actionButtonInner}
              onPress={handleDelete}
            >
              <MaterialCommunityIcons
                name="delete-outline"
                size={scale(22)}
                color={colors.textInverse}
              />
              <Text
                style={[
                  styles.actionText,
                  { color: colors.textInverse },
                ]}
              >
                {t("delete")}
              </Text>
            </TouchableOpacity>
          </LiquidGlassView>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: scale(20),
  },
  pageHeader: {
    paddingHorizontal: scale(16),
    paddingBottom: scale(12),
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    zIndex: 1,
    width: "100%",
    borderBottomLeftRadius: scale(32),
    borderBottomRightRadius: scale(32),
  },
  backButton: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    ...fontStyles.headline1,
    flex: 1,
    textAlign: "center",
  },
  headerSpacer: {
    width: scale(40),
  },
  // Top Section
  topSection: {
    flexDirection: "row",
    marginBottom: scale(24),
    alignItems: "flex-start",
    borderRadius: scale(20),
    padding: scale(16),
  },
  mealImage: {
    width: "40%",
    height: scale(120),
    borderRadius: scale(16),
    marginRight: scale(16),
  },
  emojiContainer: {
    width: "35%",
    height: scale(100),
    borderRadius: scale(16),
    justifyContent: "center",
    alignItems: "center",
    marginRight: scale(16),
  },
  emoji: {
    fontSize: scale(40),
  },
  basicInfo: {
    flex: 1,
    justifyContent: "flex-start",
  },
  mealName: {
    ...fontStyles.headline2,
    marginBottom: scale(12),
    lineHeight: scale(28),
  },
  calorieContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: scale(14),
    paddingVertical: scale(8),
    borderRadius: scale(20),
    alignSelf: "flex-start",
  },
  calorieValue: {
    ...fontStyles.headline3,
    color: "#DC2626",
    fontWeight: "700",
    marginLeft: scale(6),
  },
  calorieUnit: {
    ...fontStyles.body2,
    color: "#DC2626",
    marginLeft: scale(2),
    fontWeight: "600",
  },
  // Score Section
  scoreSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: scale(28),
    padding: scale(20),
    borderRadius: scale(20),
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  scoreContainer: {
    width: scale(70),
    height: scale(70),
    borderRadius: scale(35),
    justifyContent: "center",
    alignItems: "center",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    marginRight: scale(18),
  },
  scoreValue: {
    ...fontStyles.headline1,
    fontSize: scale(32),
    fontWeight: "bold",
  },
  scoreTextContainer: {
    flex: 1,
  },
  scoreHeading: {
    ...fontStyles.body1,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: scale(6),
    fontWeight: "600",
  },
  scoreLabel: {
    ...fontStyles.headline2,
    fontWeight: "700",
  },
  // Macros Section
  sectionHeading: {
    ...fontStyles.headline2,
    marginBottom: scale(16),
    fontWeight: "700",
  },
  macrosContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: scale(28),
    gap: scale(12),
    borderRadius: scale(20),
  },
  macroItem: {
    flex: 1,
    alignItems: "center",
    padding: scale(16),
    borderRadius: scale(20),
    minHeight: scale(120),
    justifyContent: "center",
  },
  macroValue: {
    ...fontStyles.headline2,
    marginTop: scale(10),
    marginBottom: scale(4),
    fontWeight: "700",
  },
  macroLabel: {
    ...fontStyles.body2,
    letterSpacing: 0.5,
    textAlign: "center",
    fontWeight: "500",
  },
  // Insights Section
  insightsList: {
    borderRadius: scale(20),
    padding: scale(18),
    marginBottom: scale(28),
  },
  insightItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: scale(16),
  },
  insightIconContainer: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    justifyContent: "center",
    alignItems: "center",
    marginRight: scale(12),
    marginTop: scale(2),
  },
  insightText: {
    ...fontStyles.body1,
    flex: 1,
    lineHeight: scale(22),
  },
  // Action Buttons
  actionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: scale(10),
  },
  actionButtonPrimary: {
    flex: 1.5,
    borderRadius: scale(20),
    overflow: "hidden",
  },
  actionButtonDanger: {
    flex: 1,
    borderRadius: scale(20),
    overflow: "hidden",
  },
  actionButtonInner: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: scale(14),
    paddingHorizontal: scale(8),
    gap: scale(6),
  },
  actionText: {
    ...fontStyles.body1Bold,
    textAlign: "center",
  },
});

export default AnalyzedMealScreen;

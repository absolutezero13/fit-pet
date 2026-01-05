import React from "react";
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  Platform,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { IMeal } from "../../services/apiTypes";
import { macroColors } from "../../theme/colors";
import { fontStyles } from "../../theme/fontStyles";
import { scale, SCREEN_WIDTH } from "../../theme/utils";
import FastImage from "react-native-fast-image";
import { useTheme } from "../../theme/ThemeContext";

type MealDetailScreenProps = {
  meal: IMeal;
};

const MealDetailScreen = () => {
  const { meal } = useRoute().params as MealDetailScreenProps;
  const { t } = useTranslation();
  const { top } = useSafeAreaInsets();
  const navigation = useNavigation();
  const { colors } = useTheme();

  const shareRecipe = async () => {
    try {
      const ingredientsList = meal.ingredients.join("\n• ");
      const instructionsList = meal.instructions.join("\n\n");

      await Share.share({
        message: `${meal.mealTypeLocalized} Recipe\n\n${meal.description}\n\nIngredients:\n• ${ingredientsList}\n\nInstructions:\n${instructionsList}\n\nNutrition:\nCalories: ${meal.calories}, Protein: ${meal.proteins}g, Carbs: ${meal.carbs}g, Fat: ${meal.fats}g`,
        title: meal.mealTypeLocalized,
      });
    } catch (error) {
      console.error("Error sharing recipe:", error);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return colors["color-success-500"];
    if (score >= 6) return colors["color-warning-500"];
    if (score >= 4) return colors["color-info-500"];
    return colors["color-danger-500"];
  };

  const renderMacroCard = (
    icon: string,
    label: string,
    value: string,
    color: string
  ) => (
    <View
      style={[
        styles.macroCard,
        { backgroundColor: colors.backgroundSecondary },
      ]}
    >
      <View style={[styles.macroIconContainer]}>
        <MaterialCommunityIcons
          name={icon as any}
          size={scale(18)}
          color={color}
        />
      </View>
      <Text style={[styles.macroValue, { color }]}>{value}</Text>
      <Text style={[styles.macroLabel, { color: colors.textSecondary }]}>
        {label}
      </Text>
    </View>
  );

  const renderNutritionBar = () => {
    const total =
      parseInt(meal.proteins) + parseInt(meal.carbs) + parseInt(meal.fats);
    const proteinPercentage = Math.round(
      (parseInt(meal.proteins) / total) * 100
    );
    const carbsPercentage = Math.round((parseInt(meal.carbs) / total) * 100);
    const fatsPercentage = Math.round((parseInt(meal.fats) / total) * 100);

    return (
      <View style={styles.nutritionBarContainer}>
        <View style={[styles.nutritionBar, { backgroundColor: colors.border }]}>
          <View
            style={[
              styles.nutritionSegment,
              {
                width: `${proteinPercentage}%`,
                backgroundColor: macroColors.protein,
              },
            ]}
          />
          <View
            style={[
              styles.nutritionSegment,
              {
                width: `${carbsPercentage}%`,
                backgroundColor: macroColors.carbs,
              },
            ]}
          />
          <View
            style={[
              styles.nutritionSegment,
              {
                width: `${fatsPercentage}%`,
                backgroundColor: macroColors.fats,
              },
            ]}
          />
        </View>
        <View style={styles.nutritionLegend}>
          <View style={styles.legendItem}>
            <View
              style={[
                styles.legendDot,
                { backgroundColor: macroColors.protein },
              ]}
            />
            <Text style={[styles.legendText, { color: colors.textSecondary }]}>
              {t("proteins")} {proteinPercentage}%
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendDot, { backgroundColor: macroColors.carbs }]}
            />
            <Text style={[styles.legendText, { color: colors.textSecondary }]}>
              {t("carbs")} {carbsPercentage}%
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendDot, { backgroundColor: macroColors.fats }]}
            />
            <Text style={[styles.legendText, { color: colors.textSecondary }]}>
              {t("fats")} {fatsPercentage}%
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: Platform.select({ android: top, default: 0 }),
        },
      ]}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Buttons */}
        <View style={[styles.headerButtons, { top: scale(24) }]}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons
              name="chevron-left"
              size={scale(40)}
              color={colors.text}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={shareRecipe}>
            <MaterialCommunityIcons
              name="share-variant"
              size={scale(32)}
              color={colors.text}
            />
          </TouchableOpacity>
        </View>
        <View
          style={[styles.imageContainer, { backgroundColor: colors.border }]}
        >
          {meal.image ? (
            <FastImage
              source={{ uri: meal.image }}
              style={styles.mealImage}
              resizeMode="cover"
            />
          ) : (
            <View
              style={[
                styles.placeholderImage,
                { backgroundColor: colors.backgroundSecondary },
              ]}
            >
              <Text style={styles.placeholderEmoji}>{meal.emoji || "🍽️"}</Text>
            </View>
          )}
        </View>
        <View style={[styles.contentCard, { backgroundColor: colors.surface }]}>
          <View style={styles.titleSection}>
            <View style={styles.titleRow}>
              <Text style={[styles.mealTitle, { color: colors.text }]}>
                {meal.mealTypeLocalized}
              </Text>
              {meal.score > 0 && (
                <View
                  style={[
                    styles.scoreBadge,
                    { backgroundColor: getScoreColor(meal.score) + "15" },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="star"
                    size={scale(14)}
                    color={getScoreColor(meal.score)}
                  />
                  <Text
                    style={[
                      styles.scoreText,
                      { color: getScoreColor(meal.score) },
                    ]}
                  >
                    {meal.score.toFixed(1)}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.timeRow}>
              <MaterialCommunityIcons
                name="clock-outline"
                size={scale(16)}
                color={colors.textSecondary}
              />
              <Text style={[styles.timeText, { color: colors.textSecondary }]}>
                {meal.preparationTime}
              </Text>
            </View>
          </View>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {meal.description}
          </Text>

          <View style={styles.macrosGrid}>
            {renderMacroCard(
              "fire",
              t("calories"),
              `${meal.calories}`,
              macroColors.calories
            )}
            {renderMacroCard(
              "lightning-bolt",
              t("proteins"),
              `${meal.proteins}g`,
              macroColors.protein
            )}
            {renderMacroCard(
              "bread-slice",
              t("carbs"),
              `${meal.carbs}g`,
              macroColors.carbs
            )}
            {renderMacroCard(
              "water",
              t("fats"),
              `${meal.fats}g`,
              macroColors.fats
            )}
          </View>

          {renderNutritionBar()}

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View
                style={[styles.sectionIcon, { backgroundColor: "#E8F5E9" }]}
              >
                <MaterialCommunityIcons
                  name="food-apple"
                  size={scale(20)}
                  color={macroColors.protein}
                />
              </View>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {t("ingredients")}
              </Text>
            </View>
            <View style={styles.ingredientsList}>
              {meal.ingredients.map((ingredient, index) => (
                <View key={index} style={styles.ingredientItem}>
                  <View style={styles.ingredientBullet} />
                  <Text
                    style={[
                      styles.ingredientText,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {ingredient}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Instructions */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View
                style={[styles.sectionIcon, { backgroundColor: "#E3F2FD" }]}
              >
                <MaterialCommunityIcons
                  name="chef-hat"
                  size={scale(20)}
                  color={macroColors.carbs}
                />
              </View>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {t("instructions")}
              </Text>
            </View>
            <View style={styles.instructionsList}>
              {meal.instructions.map((instruction, index) => (
                <View key={index} style={styles.instructionItem}>
                  <View style={styles.instructionNumber}>
                    <Text style={styles.instructionNumberText}>
                      {index + 1}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.instructionText,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {instruction}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Insights */}
          {meal.insights && meal.insights.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View
                  style={[styles.sectionIcon, { backgroundColor: "#FFF8E7" }]}
                >
                  <MaterialCommunityIcons
                    name="lightbulb-outline"
                    size={scale(20)}
                    color={macroColors.calories}
                  />
                </View>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  {t("insights")}
                </Text>
              </View>
              <View>
                {meal.insights.map((insight, index) => (
                  <View
                    key={index}
                    style={[
                      styles.insightItem,
                      { backgroundColor: colors.backgroundSecondary },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="check-circle"
                      size={scale(18)}
                      color={macroColors.protein}
                      style={styles.insightIcon}
                    />
                    <Text
                      style={[
                        styles.insightText,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {insight}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
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
    paddingBottom: scale(40),
  },
  // Header Buttons
  headerButtons: {
    position: "absolute",
    left: scale(16),
    right: scale(16),
    flexDirection: "row",
    justifyContent: "space-between",
    zIndex: 10,
  },
  headerButton: {
    width: scale(44),
    height: scale(44),
    borderRadius: scale(14),
    justifyContent: "center",
    alignItems: "center",
  },
  // Image
  imageContainer: {
    width: "100%",
    height: SCREEN_WIDTH * 0.85,
  },
  mealImage: {
    width: "100%",
    height: "100%",
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderEmoji: {
    fontSize: scale(80),
  },
  // Content Card
  contentCard: {
    borderTopLeftRadius: scale(28),
    borderTopRightRadius: scale(28),
    marginTop: -scale(28),
    padding: scale(24),
    paddingTop: scale(28),
    minHeight: scale(400),
  },
  // Title Section
  titleSection: {
    marginBottom: scale(16),
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  mealTitle: {
    ...fontStyles.headline2,
    fontWeight: "700",
    flex: 1,
  },
  scoreBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: scale(10),
    paddingVertical: scale(6),
    borderRadius: scale(12),
    gap: scale(4),
  },
  scoreText: {
    ...fontStyles.body2,
    fontWeight: "700",
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: scale(8),
    gap: scale(6),
  },
  timeText: {
    ...fontStyles.body2,
  },
  // Description
  description: {
    ...fontStyles.body1,
    lineHeight: scale(24),
    marginBottom: scale(24),
  },
  // Macros Grid
  macrosGrid: {
    flexDirection: "row",
    gap: scale(10),
    marginBottom: scale(20),
  },
  macroCard: {
    flex: 1,
    borderRadius: scale(16),
    padding: scale(12),
    alignItems: "center",
  },
  macroIconContainer: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(10),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: scale(8),
  },
  macroValue: {
    ...fontStyles.headline4,
    fontWeight: "700",
    marginBottom: scale(2),
  },
  macroLabel: {
    ...fontStyles.caption,
  },
  // Nutrition Bar
  nutritionBarContainer: {
    marginBottom: scale(24),
  },
  nutritionBar: {
    height: scale(10),
    flexDirection: "row",
    borderRadius: scale(5),
    overflow: "hidden",
    marginBottom: scale(12),
  },
  nutritionSegment: {
    height: "100%",
  },
  nutritionLegend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: scale(16),
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(6),
  },
  legendDot: {
    width: scale(10),
    height: scale(10),
    borderRadius: scale(5),
  },
  legendText: {
    ...fontStyles.caption,
  },
  // Sections
  section: {
    marginBottom: scale(24),
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: scale(16),
    gap: scale(12),
  },
  sectionIcon: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(12),
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    ...fontStyles.headline3,
    fontWeight: "600",
  },
  // Ingredients
  ingredientsList: {},
  ingredientItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: scale(10),
    paddingLeft: scale(4),
  },
  ingredientBullet: {
    width: scale(6),
    height: scale(6),
    borderRadius: scale(3),
    backgroundColor: macroColors.protein,
    marginTop: scale(8),
    marginRight: scale(12),
  },
  ingredientText: {
    ...fontStyles.body2,
    flex: 1,
    lineHeight: scale(22),
  },
  // Instructions
  instructionsList: {},
  instructionItem: {
    flexDirection: "row",
    marginBottom: scale(16),
    alignItems: "center",
  },
  instructionNumber: {
    width: scale(28),
    height: scale(28),
    borderRadius: scale(10),
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
    marginRight: scale(12),
  },
  instructionNumberText: {
    ...fontStyles.body2,
    fontWeight: "700",
    color: macroColors.carbs,
  },
  instructionText: {
    ...fontStyles.body2,
    flex: 1,
    lineHeight: scale(22),
  },
  insightItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: scale(12),
    padding: scale(12),
    borderRadius: scale(12),
  },
  insightIcon: {
    marginRight: scale(10),
    marginTop: scale(2),
  },
  insightText: {
    ...fontStyles.body2,
    flex: 1,
    lineHeight: scale(20),
  },
});

export default MealDetailScreen;

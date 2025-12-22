import React, { useRef } from "react";
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
  Share,
  Platform,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { IMeal } from "../../services/apiTypes";
import { colors } from "../../theme/colors";
import { fontStyles } from "../../theme/fontStyles";
import { scale, SCREEN_WIDTH } from "../../theme/utils";
import FastImage from "react-native-fast-image";

type MealDetailScreenProps = {
  meal: IMeal;
};
const start = scale(50);
const end = scale(200);

const MealDetailScreen = () => {
  const { meal } = useRoute().params as MealDetailScreenProps;
  const { t } = useTranslation();
  const { top } = useSafeAreaInsets();
  const navigation = useNavigation();
  const scrollY = useRef(new Animated.Value(0)).current;

  // Calculate header opacity based on scroll position

  const headerOpacity = scrollY.interpolate({
    inputRange: [start, end],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

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

  const renderNutritionBar = () => {
    const total =
      parseInt(meal.proteins) + parseInt(meal.carbs) + parseInt(meal.fats);
    const proteinPercentage = Math.round(
      (parseInt(meal.proteins) / total) * 100
    );
    const carbsPercentage = Math.round((parseInt(meal.carbs) / total) * 100);
    const fatsPercentage = Math.round((parseInt(meal.fats) / total) * 100);

    return (
      <View style={styles.macroPercentagesContainer}>
        <View style={styles.macroPercentageBar}>
          <View
            style={[
              styles.macroPercentageFill,
              {
                width: `${proteinPercentage}%`,
                backgroundColor: colors["color-success-400"],
              },
            ]}
          />
          <View
            style={[
              styles.macroPercentageFill,
              {
                width: `${carbsPercentage}%`,
                backgroundColor: colors["color-info-400"],
              },
            ]}
          />
          <View
            style={[
              styles.macroPercentageFill,
              {
                width: `${fatsPercentage}%`,
                backgroundColor: colors["color-primary-400"],
              },
            ]}
          />
        </View>
        <View style={styles.macroLegendContainer}>
          <View style={styles.macroLegendItem}>
            <View
              style={[
                styles.macroLegendColor,
                { backgroundColor: colors["color-success-400"] },
              ]}
            />
            <Text style={styles.macroLegendText}>{t("proteins")}</Text>
          </View>
          <View style={styles.macroLegendItem}>
            <View
              style={[
                styles.macroLegendColor,
                { backgroundColor: colors["color-info-400"] },
              ]}
            />
            <Text style={styles.macroLegendText}>{t("carbs")}</Text>
          </View>
          <View style={styles.macroLegendItem}>
            <View
              style={[
                styles.macroLegendColor,
                { backgroundColor: colors["color-primary-400"] },
              ]}
            />
            <Text style={styles.macroLegendText}>{t("fats")}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: Platform.select({ android: top, default: 0 }) },
      ]}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent]}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        <View style={[styles.headerSection, { paddingTop: scale(24) }]}>
          <TouchableOpacity
            style={styles.backButtonTransparent}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={scale(24)}
              color="white"
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.shareButtonTransparent}
            onPress={shareRecipe}
          >
            <MaterialCommunityIcons
              name="share-variant"
              size={scale(24)}
              color="white"
            />
          </TouchableOpacity>
        </View>

        {/* Meal image or placeholder */}
        <View style={styles.imageContainer}>
          {meal.image ? (
            <FastImage
              source={{ uri: meal.image }}
              style={styles.mealImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderImage}>
              <MaterialCommunityIcons
                name="food"
                size={scale(80)}
                color={colors["color-primary-300"]}
              />
            </View>
          )}
        </View>

        {/* Meal info card */}
        <View style={styles.mealInfoCard}>
          <View style={styles.mealHeader}>
            <View style={styles.mealTitleContainer}>
              <Text style={styles.mealTitle}>{meal.mealTypeLocalized}</Text>
              <View style={styles.timeContainer}>
                <MaterialCommunityIcons
                  name="clock-outline"
                  size={scale(18)}
                  color={colors["color-success-400"]}
                />
                <Text style={styles.mealTime}>{meal.time}</Text>
              </View>
            </View>
          </View>

          <Text style={styles.mealDescription}>{meal.description}</Text>

          {/* Macros */}
          <View style={styles.macrosContainer}>
            <View style={styles.macroItem}>
              <Text style={styles.macroValue}>{meal.calories}</Text>
              <Text style={styles.macroLabel}>{t("calories")}</Text>
            </View>
            <View style={[styles.macroSeparator]} />
            <View style={styles.macroItem}>
              <Text style={styles.macroValue}>{meal.proteins}g</Text>
              <Text style={styles.macroLabel}>{t("proteins")}</Text>
            </View>
            <View style={[styles.macroSeparator]} />
            <View style={styles.macroItem}>
              <Text style={styles.macroValue}>{meal.carbs}g</Text>
              <Text style={styles.macroLabel}>{t("carbs")}</Text>
            </View>
            <View style={[styles.macroSeparator]} />
            <View style={styles.macroItem}>
              <Text style={styles.macroValue}>{meal.fats}g</Text>
              <Text style={styles.macroLabel}>{t("fats")}</Text>
            </View>
          </View>

          {/* Nutrition Bar */}
          {renderNutritionBar()}

          {/* Ingredients */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons
                name="food-apple"
                size={scale(24)}
                color={colors["color-success-400"]}
              />
              <Text style={styles.sectionTitle}>{t("ingredients")}</Text>
            </View>
            <View style={styles.ingredientsList}>
              {meal.ingredients.map((ingredient, index) => (
                <View key={index} style={styles.ingredientItem}>
                  <View style={styles.ingredientBullet} />
                  <Text style={styles.ingredientText}>{ingredient}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Instructions */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons
                name="chef-hat"
                size={scale(24)}
                color={colors["color-info-400"]}
              />
              <Text style={styles.sectionTitle}>{t("instructions")}</Text>
            </View>
            <View style={styles.instructionsList}>
              {meal.instructions.map((instruction, index) => (
                <View key={index} style={styles.instructionItem}>
                  <View style={styles.instructionNumberContainer}>
                    <Text style={styles.instructionNumber}>{index + 1}</Text>
                  </View>
                  <Text style={styles.instructionText}>{instruction}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Insights */}
          {meal.insights && meal.insights.length > 0 && (
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons
                  name="lightbulb-outline"
                  size={scale(24)}
                  color={colors["color-primary-400"]}
                />
                <Text style={styles.sectionTitle}>{t("insights")}</Text>
              </View>
              <View style={styles.insightsList}>
                {meal.insights.map((insight, index) => (
                  <View key={index} style={styles.insightItem}>
                    <MaterialCommunityIcons
                      name="star-circle"
                      size={scale(20)}
                      color={colors["color-primary-400"]}
                      style={styles.insightIcon}
                    />
                    <Text style={styles.insightText}>{insight}</Text>
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
    backgroundColor: colors["color-primary-100"],
  },
  headerTitle: {
    ...fontStyles.headline3,
    flex: 1,
    textAlign: "center",
    marginHorizontal: scale(10),
  },
  backButton: {
    padding: scale(8),
  },
  shareButton: {
    padding: scale(8),
  },
  scrollView: {
    flex: 1,
    backgroundColor: "white",
  },
  scrollContent: {
    paddingBottom: scale(100),
    backgroundColor: "white",
  },
  headerSection: {
    paddingHorizontal: scale(16),
    paddingBottom: scale(16),
    flexDirection: "row",
    justifyContent: "space-between",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  backButtonTransparent: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  shareButtonTransparent: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  imageContainer: {
    position: "absolute",
    width: "100%",
    height: SCREEN_WIDTH,
    backgroundColor: colors["color-primary-200"],
  },
  mealImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors["color-primary-200"],
  },
  mealInfoCard: {
    marginTop: SCREEN_WIDTH - scale(30),
    backgroundColor: "white",
    borderTopLeftRadius: scale(30),
    borderTopRightRadius: scale(30),
    padding: scale(24),
    paddingTop: scale(30),
  },
  mealHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: scale(16),
  },
  mealTitleContainer: {
    flex: 1,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: scale(8),
  },
  mealTitle: {
    ...fontStyles.headline2,
  },
  mealTime: {
    ...fontStyles.body2,
    color: colors["color-primary-400"],
    marginLeft: scale(6),
  },
  scoreContainer: {
    backgroundColor: colors["color-success-100"],
    borderRadius: scale(12),
    padding: scale(8),
    alignItems: "center",
    minWidth: scale(50),
  },
  scoreValue: {
    ...fontStyles.headline3,
    color: colors["color-success-500"],
  },
  scoreLabel: {
    ...fontStyles.caption,
    color: colors["color-success-500"],
    textTransform: "uppercase",
  },
  mealDescription: {
    ...fontStyles.body1,
    marginBottom: scale(24),
  },
  macrosContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: colors["color-primary-100"],
    borderBottomWidth: 1,
    borderBottomColor: colors["color-primary-100"],
    paddingVertical: scale(20),
    marginBottom: scale(20),
  },
  macroItem: {
    flex: 1,
    alignItems: "center",
  },
  macroValue: {
    ...fontStyles.headline3,
    color: colors["color-success-400"],
    marginBottom: scale(6),
  },
  macroLabel: {
    ...fontStyles.footnote,
    color: colors["color-primary-400"],
    textAlign: "center",
  },
  macroSeparator: {
    width: 1,
    height: scale(40),
    backgroundColor: colors["color-primary-100"],
  },
  macroPercentagesContainer: {},
  macroPercentageBar: {
    height: scale(16),
    flexDirection: "row",
    backgroundColor: colors["color-primary-100"],
    borderRadius: scale(8),
    overflow: "hidden",
    marginBottom: scale(16),
  },
  macroPercentageFill: {
    height: "100%",
  },
  macroLegendContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  macroLegendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: scale(10),
  },
  macroLegendColor: {
    width: scale(12),
    height: scale(12),
    borderRadius: scale(6),
    marginRight: scale(6),
  },
  macroLegendText: {
    ...fontStyles.footnote,
    color: colors["color-primary-400"],
  },
  sectionContainer: {
    marginTop: scale(24),
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: scale(16),
  },
  sectionTitle: {
    ...fontStyles.headline3,
    marginLeft: scale(10),
  },
  ingredientsList: {
    marginLeft: scale(10),
  },
  ingredientItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: scale(12),
  },
  ingredientBullet: {
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
    backgroundColor: colors["color-success-400"],
    marginTop: scale(6),
    marginRight: scale(12),
  },
  ingredientText: {
    ...fontStyles.body2,
    flex: 1,
  },
  instructionsList: {
    marginLeft: scale(10),
  },
  instructionItem: {
    flexDirection: "row",
    marginBottom: scale(20),
  },
  instructionNumberContainer: {
    width: scale(28),
    height: scale(28),
    borderRadius: scale(14),
    backgroundColor: colors["color-info-100"],
    justifyContent: "center",
    alignItems: "center",
    marginRight: scale(12),
    marginTop: scale(2),
  },
  instructionNumber: {
    ...fontStyles.headline4,
    color: colors["color-info-500"],
  },
  instructionText: {
    ...fontStyles.body2,
    flex: 1,
    lineHeight: scale(22),
  },
  insightsList: {
    marginLeft: scale(10),
  },
  insightItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: scale(12),
  },
  insightIcon: {
    marginRight: scale(12),
    marginTop: scale(2),
  },
  insightText: {
    ...fontStyles.body2,
    flex: 1,
    color: colors["color-primary-500"],
  },
});

export default MealDetailScreen;

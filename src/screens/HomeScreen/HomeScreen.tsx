import React, { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { scale } from "../../theme/utils";
import { colors } from "../../theme/colors";
import { fontStyles } from "../../theme/fontStyles";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import LogMealModal from "./components/LogMeaBottomSheet";

const EmptyState = ({ onPress }) => {
  return (
    <View style={styles.emptyStateContainer}>
      {/* <Image
        source={require("../../assets/images/empty-plate.png")}
        style={styles.emptyStateImage}
        resizeMode="contain"
      /> */}
      <Text style={styles.emptyStateTitle}>No meals logged yet</Text>
      <Text style={styles.emptyStateDescription}>
        Track your nutrition by logging your meals throughout the day
      </Text>
      <TouchableOpacity style={styles.emptyStateButton} onPress={onPress}>
        <Text style={styles.emptyStateButtonText}>Log Your First Meal</Text>
        <MaterialCommunityIcons
          name="plus-circle-outline"
          size={scale(18)}
          color="white"
          style={{ marginLeft: scale(8) }}
        />
      </TouchableOpacity>
    </View>
  );
};

const NutritionScore = ({ score }) => {
  // Determine color based on score
  const getScoreColor = () => {
    if (score >= 8) return colors["color-success-400"];
    if (score >= 6) return colors["color-info-400"];
    if (score >= 4) return colors["color-warning-400"];
    return colors["color-danger-400"];
  };

  return (
    <View style={styles.scoreContainer}>
      <Text style={styles.scoreLabel}>Nutrition Score</Text>
      <View style={[styles.scoreCircle, { backgroundColor: getScoreColor() }]}>
        <Text style={styles.scoreValue}>{score}</Text>
      </View>
    </View>
  );
};

const MacroCards = ({ proteins, carbs, fats }) => {
  return (
    <View style={styles.macroContainer}>
      <View style={styles.macroCard}>
        <MaterialCommunityIcons
          name="food-steak"
          size={scale(20)}
          color={colors["color-primary-500"]}
        />
        <Text style={styles.macroValue}>{proteins}g</Text>
        <Text style={styles.macroLabel}>Protein</Text>
      </View>

      <View style={styles.macroCard}>
        <MaterialCommunityIcons
          name="bread-slice"
          size={scale(20)}
          color={colors["color-primary-500"]}
        />
        <Text style={styles.macroValue}>{carbs}g</Text>
        <Text style={styles.macroLabel}>Carbs</Text>
      </View>

      <View style={styles.macroCard}>
        <MaterialCommunityIcons
          name="oil"
          size={scale(20)}
          color={colors["color-primary-500"]}
        />
        <Text style={styles.macroValue}>{fats}g</Text>
        <Text style={styles.macroLabel}>Fats</Text>
      </View>
    </View>
  );
};

const MealInsights = ({ meal }) => {
  // Generate insights based on meal data
  const getInsights = () => {
    const insights = [];

    // Protein insight
    if (parseInt(meal.proteins) > 30) {
      insights.push("High in protein, great for muscle recovery");
    } else if (parseInt(meal.proteins) < 10) {
      insights.push("Consider adding more protein sources");
    }

    // Carbs insight
    if (parseInt(meal.carbs) > 40) {
      insights.push("Rich in energy-providing carbohydrates");
    } else if (parseInt(meal.carbs) < 15) {
      insights.push("Low-carb option, good for fat metabolism");
    }

    // Fat insight
    if (parseInt(meal.fats) > 20) {
      insights.push("Contains healthy fats for hormone production");
    } else if (parseInt(meal.fats) < 5) {
      insights.push("Low in fats, consider adding healthy fats");
    }

    // Calorie insight
    if (parseInt(meal.calories) > 500) {
      insights.push("Higher calorie meal, ideal for active days");
    } else if (parseInt(meal.calories) < 200) {
      insights.push("Light meal or snack, perfect between main meals");
    }

    // Return only 2 insights
    return insights.slice(0, 2);
  };

  const insights = getInsights();

  if (insights.length === 0) return null;

  return (
    <View style={styles.insightsContainer}>
      <Text style={styles.insightsTitle}>Insights</Text>
      {insights.map((insight, index) => (
        <View key={index} style={styles.insightRow}>
          <View style={styles.bulletPoint} />
          <Text style={styles.insightText}>{insight}</Text>
        </View>
      ))}
    </View>
  );
};

// Calculate nutrition score based on macros and calories
const calculateScore = (meal) => {
  const { proteins, carbs, fats, calories } = meal;

  const proteinScore = Math.min(parseInt(proteins) / 5, 4);
  const carbsScore = Math.min(Math.max(parseInt(carbs) / 10, 0), 3);
  const fatsScore = Math.min(Math.max(parseInt(fats) / 5, 0), 3);

  // Simple balanced diet score calculation
  let score = proteinScore + carbsScore + fatsScore;

  // Cap at 10
  score = Math.min(Math.round(score), 10);

  return score;
};

const MealTypeSection = ({ title, meals, onPressItem }) => {
  if (meals.length === 0) return null;

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>{title}</Text>

      {meals.map((meal) => (
        <TouchableOpacity
          key={meal.id}
          style={styles.mealItem}
          onPress={() => onPressItem(meal)}
        >
          <View style={styles.mealItemHeader}>
            <View style={styles.mealItemLeft}>
              <Text style={styles.mealItemTitle}>
                {meal.description.split(".")[0]}
              </Text>
              <Text style={styles.mealItemTime}>{meal.time}</Text>
            </View>

            <View style={styles.mealItemRight}>
              <Text style={styles.caloriesText}>{meal.calories} cal</Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={scale(24)}
                color={colors["color-primary-300"]}
              />
            </View>
          </View>

          <View style={styles.mealItemDetails}>
            <MacroCards
              proteins={meal.proteins}
              carbs={meal.carbs}
              fats={meal.fats}
            />

            <View style={styles.detailsBottomRow}>
              <MealInsights meal={meal} />
              <NutritionScore score={calculateScore(meal)} />
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const LoggedMealsScreen = () => {
  const { bottom } = useSafeAreaInsets();
  const [meals, setMeals] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  const navigation = useNavigation();

  // useEffect(() => {
  //   // In a real app, this would fetch from local storage or an API
  //   // For now using sample data
  //   const sampleMeals = [
  //     {
  //       id: "1",
  //       mealType: "Breakfast",
  //       description: "Oatmeal with berries and honey. Rich in fiber.",
  //       time: "7:30 AM",
  //       calories: "350",
  //       proteins: "12",
  //       carbs: "45",
  //       fats: "8",
  //     },
  //     {
  //       id: "2",
  //       mealType: "Lunch",
  //       description:
  //         "Grilled chicken salad with olive oil dressing. High protein lunch.",
  //       time: "12:30 PM",
  //       calories: "450",
  //       proteins: "35",
  //       carbs: "20",
  //       fats: "15",
  //     },
  //     {
  //       id: "3",
  //       mealType: "Dinner",
  //       description: "Salmon with roasted vegetables. Omega-3 rich dinner.",
  //       time: "6:45 PM",
  //       calories: "520",
  //       proteins: "38",
  //       carbs: "25",
  //       fats: "22",
  //     },
  //     {
  //       id: "4",
  //       mealType: "Snack",
  //       description: "Greek yogurt with nuts. Protein-rich afternoon snack.",
  //       time: "3:15 PM",
  //       calories: "180",
  //       proteins: "15",
  //       carbs: "10",
  //       fats: "8",
  //     },
  //   ];

  //   setMeals(sampleMeals);

  //   // For testing empty state, uncomment the line below
  //   // setMeals([]);
  // }, []);

  // Group meals by type
  const getMealsByType = (type) => {
    return meals.filter(
      (meal) => meal.mealType.toLowerCase() === type.toLowerCase()
    );
  };

  const breakfastMeals = getMealsByType("breakfast");
  const lunchMeals = getMealsByType("lunch");
  const dinnerMeals = getMealsByType("dinner");
  const snackMeals = getMealsByType("snack");

  const handleMealPress = (meal) => {
    // Navigate to meal detail or edit screen
    console.log("Meal pressed:", meal);
    // navigation.navigate('MealDetail', { meal });
  };

  const handleAddMeal = (newMeal) => {
    // Generate a unique ID for the new meal
    const newId = (meals.length + 1).toString();
    const mealWithId = { ...newMeal, id: newId };

    // Add new meal to the meals array
    setMeals((prevMeals) => [...prevMeals, mealWithId]);
  };

  const handleOpenModal = () => {
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Logged Meals</Text>
        <Text style={styles.date}>
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </Text>
      </View>

      {meals.length > 0 ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <MealTypeSection
            title="Breakfast"
            meals={breakfastMeals}
            onPressItem={handleMealPress}
          />

          <MealTypeSection
            title="Lunch"
            meals={lunchMeals}
            onPressItem={handleMealPress}
          />

          <MealTypeSection
            title="Dinner"
            meals={dinnerMeals}
            onPressItem={handleMealPress}
          />

          <MealTypeSection
            title="Snacks"
            meals={snackMeals}
            onPressItem={handleMealPress}
          />
        </ScrollView>
      ) : (
        <EmptyState onPress={handleOpenModal} />
      )}

      {meals.length > 0 && (
        <TouchableOpacity
          style={[
            styles.addButton,
            {
              bottom: bottom + scale(64),
            },
          ]}
          onPress={handleOpenModal}
        >
          <MaterialCommunityIcons name="plus" size={scale(24)} color="white" />
        </TouchableOpacity>
      )}

      <LogMealModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAddMeal={handleAddMeal}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors["color-primary-100"],
  },
  header: {
    padding: scale(24),
    paddingTop: scale(60),
    paddingBottom: scale(32),
    backgroundColor: colors["color-primary-200"],
    borderBottomLeftRadius: scale(30),
    borderBottomRightRadius: scale(30),
    shadowColor: colors["color-primary-500"],
    shadowOffset: {
      width: 0,
      height: scale(4),
    },
    shadowOpacity: 0.1,
    shadowRadius: scale(12),
  },
  title: {
    ...fontStyles.headline1,
  },
  date: {
    ...fontStyles.headline4,
    color: colors["color-primary-400"],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: scale(24),
    paddingBottom: scale(100),
  },
  sectionContainer: {
    marginBottom: scale(24),
  },
  sectionTitle: {
    ...fontStyles.headline3,
    color: colors["color-primary-500"],
    marginBottom: scale(12),
  },
  mealItem: {
    backgroundColor: "white",
    borderRadius: scale(16),
    marginBottom: scale(12),
    shadowColor: colors["color-primary-500"],
    shadowOffset: {
      width: 0,
      height: scale(2),
    },
    shadowOpacity: 0.05,
    shadowRadius: scale(8),
    elevation: 3,
    overflow: "hidden",
  },
  mealItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: scale(16),
    borderBottomWidth: 1,
    borderBottomColor: colors["color-primary-100"],
  },
  mealItemDetails: {
    padding: scale(16),
  },
  mealItemLeft: {
    flex: 1,
  },
  mealItemTitle: {
    ...fontStyles.headline4,
    marginBottom: scale(4),
  },
  mealItemTime: {
    ...fontStyles.caption,
    color: colors["color-primary-400"],
  },
  mealItemRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  caloriesText: {
    ...fontStyles.body2,
    color: colors["color-success-400"],
    marginRight: scale(8),
  },
  // Macro cards styles
  macroContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: scale(16),
  },
  macroCard: {
    width: "30%",
    backgroundColor: colors["color-primary-100"],
    borderRadius: scale(12),
    padding: scale(12),
    alignItems: "center",
  },
  macroValue: {
    ...fontStyles.headline3,
    color: colors["color-primary-500"],
    marginVertical: scale(4),
  },
  macroLabel: {
    ...fontStyles.caption,
    color: colors["color-primary-400"],
  },
  // Insights styles
  detailsBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  insightsContainer: {
    flex: 1,
    marginRight: scale(16),
  },
  insightsTitle: {
    ...fontStyles.headline4,
    color: colors["color-primary-500"],
    marginBottom: scale(8),
  },
  insightRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: scale(6),
  },
  bulletPoint: {
    width: scale(6),
    height: scale(6),
    borderRadius: scale(3),
    backgroundColor: colors["color-primary-400"],
    marginRight: scale(8),
  },
  insightText: {
    ...fontStyles.body2,
    color: colors["color-primary-400"],
    flex: 1,
  },
  // Score styles
  scoreContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  scoreLabel: {
    ...fontStyles.caption,
    color: colors["color-primary-400"],
    marginBottom: scale(4),
  },
  scoreCircle: {
    width: scale(50),
    height: scale(50),
    borderRadius: scale(25),
    justifyContent: "center",
    alignItems: "center",
  },
  scoreValue: {
    ...fontStyles.headline3,
    color: "white",
    fontWeight: "bold",
  },
  addButton: {
    position: "absolute",
    bottom: scale(32),
    right: scale(32),
    width: scale(64),
    height: scale(64),
    borderRadius: scale(32),
    backgroundColor: colors["color-success-400"],
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors["color-success-500"],
    shadowOffset: {
      width: 0,
      height: scale(4),
    },
    shadowOpacity: 0.2,
    shadowRadius: scale(8),
    elevation: 5,
  },
  // Empty state styles
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: scale(32),
  },
  emptyStateImage: {
    width: scale(180),
    height: scale(180),
    marginBottom: scale(24),
  },
  emptyStateTitle: {
    ...fontStyles.headline2,
    color: colors["color-primary-500"],
    marginBottom: scale(12),
    textAlign: "center",
  },
  emptyStateDescription: {
    ...fontStyles.body1,
    color: colors["color-primary-400"],
    textAlign: "center",
    marginBottom: scale(32),
  },
  emptyStateButton: {
    backgroundColor: colors["color-success-400"],
    paddingHorizontal: scale(20),
    paddingVertical: scale(14),
    borderRadius: scale(12),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors["color-success-500"],
    shadowOffset: {
      width: 0,
      height: scale(4),
    },
    shadowOpacity: 0.2,
    shadowRadius: scale(8),
    elevation: 4,
  },
  emptyStateButtonText: {
    ...fontStyles.headline4,
    color: "white",
  },
});

export default LoggedMealsScreen;

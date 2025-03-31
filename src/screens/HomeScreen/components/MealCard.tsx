import React, { FC, useEffect, useState } from "react";
import {
  LayoutAnimation,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { colors } from "../../../theme/colors";
import { scale } from "../../../theme/utils";
import MacroCards from "./MacroCards";
import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import { fontStyles } from "../../../theme/fontStyles";
import { IMeal } from "../../../services/apiTypes";
import useMealsStore from "../../../zustand/useMealsStore";

interface Props {
  meal: IMeal;
  onPress: (meal: IMeal) => void;
}

const MealCard: FC<Props> = ({ meal, onPress }) => {
  const renderNutritionScore = () => {
    // Determine color based on score
    const getScoreColor = () => {
      if (meal.score >= 8) return colors["color-success-400"];
      if (meal.score >= 6) return colors["color-info-400"];
      if (meal.score >= 4) return colors["color-warning-400"];
      return colors["color-danger-400"];
    };

    return (
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreLabel}>Score</Text>
        <View
          style={[styles.scoreCircle, { backgroundColor: getScoreColor() }]}
        >
          <Text style={styles.scoreValue}>{meal.score}</Text>
        </View>
      </View>
    );
  };

  const onDeletePress = () => {
    useMealsStore.setState((state) => {
      const newMeals = state.loggedMeals.filter((m) => m.id !== meal.id);
      return { loggedMeals: newMeals };
    });
  };

  const renderMealInsights = () => {
    const [expanded, setExpanded] = useState(false);

    // Generate insights based on meal data
    if (meal.insights.length === 0) return null;

    const toggleExpand = () => {
      // Configure the animation
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setExpanded(!expanded);
    };

    return (
      <View style={styles.insightsContainer}>
        <TouchableOpacity
          style={styles.insightsTitleContainer}
          onPress={toggleExpand}
          activeOpacity={0.9}
        >
          {renderNutritionScore()}

          <Text style={styles.insightsTitle}>Insights</Text>
          <MaterialCommunityIcons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={scale(20)}
            color={colors["color-primary-500"]}
          />
        </TouchableOpacity>

        {expanded && (
          <View style={styles.insightsContent}>
            {meal.insights.map((insight, index) => (
              <View key={index} style={styles.insightRow}>
                <View style={styles.bulletPoint} />
                <Text style={styles.insightText}>{insight}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      key={meal.description}
      style={styles.mealItem}
      onPress={() => onPress(meal)}
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

        {renderMealInsights()}
      </View>

      <TouchableOpacity
        onPress={onDeletePress}
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          gap: scale(4),
          alignSelf: "flex-end",
          borderWidth: 1,
          borderColor: colors["color-danger-400"],
          borderRadius: scale(8),
          padding: scale(4),
          marginRight: scale(16),
          marginBottom: scale(16),
        }}
      >
        <Text
          style={{
            color: colors["color-danger-400"],
            textAlign: "center",
          }}
        >
          Delete
        </Text>
        <AntDesign
          name="delete"
          size={scale(16)}
          color={colors["color-danger-400"]}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default MealCard;

const styles = StyleSheet.create({
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
    ...fontStyles.headline3,
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
    ...fontStyles.body1,
    color: colors["color-success-400"],
    marginRight: scale(8),
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
  insightsTitleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: scale(8),
  },
  insightsTitle: {
    ...fontStyles.headline4,
    color: colors["color-primary-500"],
  },
  insightsContent: {
    marginTop: scale(4),
  },
  insightRow: {
    flexDirection: "row",
    marginBottom: scale(6),
  },
  bulletPoint: {
    width: scale(6),
    height: scale(6),
    borderRadius: scale(3),
    backgroundColor: colors["color-primary-400"],
    marginRight: scale(8),
    marginTop: scale(6),
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
    ...fontStyles.headline4,
    color: colors["color-primary-800"],
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
});

import React, { FC } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "../../../theme/colors";
import { scale } from "../../../theme/utils";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { fontStyles } from "../../../theme/fontStyles";
import { IMeal } from "../../../services/apiTypes";
import { LiquidGlassView } from "@callstack/liquid-glass";

interface Props {
  meal: IMeal;
  onPress: (meal: IMeal) => void;
}

const MealCard: FC<Props> = ({ meal, onPress }) => {
  return (
    <LiquidGlassView effect="regular" interactive style={styles.mealItem}>
      <TouchableOpacity
        activeOpacity={1}
        key={meal.description}
        style={styles.liquid}
        onPress={() => onPress(meal)}
      >
        <View style={styles.mealItemLeft}>
          <Text style={styles.mealItemTitle}>
            {meal.emoji} {meal.description}
          </Text>
        </View>

        <View style={styles.mealItemRight}>
          <Text style={styles.caloriesText}>{meal.calories} cal</Text>
          <MaterialCommunityIcons
            name="chevron-right"
            size={scale(24)}
            color={colors["color-primary-300"]}
          />
        </View>
      </TouchableOpacity>
    </LiquidGlassView>
  );
};

export default MealCard;

const styles = StyleSheet.create({
  liquid: {
    flexDirection: "row",
    flex: 1,
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
    flexDirection: "row",
    padding: scale(16),
  },
  mealItemDetails: {
    padding: scale(16),
  },
  mealItemLeft: {
    flex: 0.9,
    flexDirection: "row",
  },
  mealItemTitle: {
    ...fontStyles.headline4,
  },
  mealItemTime: {
    ...fontStyles.caption,
    color: colors["color-primary-400"],
  },
  mealItemRight: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: "auto",
  },
  caloriesText: {
    ...fontStyles.body1,
    color: colors["color-success-400"],
    marginRight: scale(2),
  },
});

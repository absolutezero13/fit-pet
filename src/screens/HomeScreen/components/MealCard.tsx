import React, { FC } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { scale } from "../../../theme/utils";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { fontStyles } from "../../../theme/fontStyles";
import { IMeal } from "../../../services/apiTypes";
import { LiquidGlassView } from "@callstack/liquid-glass";
import { useTheme } from "../../../theme/ThemeContext";

interface Props {
  meal: IMeal;
  onPress: (meal: IMeal) => void;
}

const MealCard: FC<Props> = ({ meal, onPress }) => {
  const { colors } = useTheme();

  return (
    <LiquidGlassView effect="clear" interactive style={[styles.mealItem, { backgroundColor: colors.surface }]}>
      <TouchableOpacity
        activeOpacity={1}
        key={meal.description}
        style={styles.liquid}
        onPress={() => onPress(meal)}
      >
        <View style={styles.mealItemLeft}>
          <Text style={[styles.mealItemTitle, { color: colors.text }]}>
            {meal.emoji} {meal.description}
          </Text>
        </View>

        <View style={styles.mealItemRight}>
          <Text style={[styles.caloriesText, { color: colors["color-success-400"] }]}>{meal.calories} kcal</Text>
          <MaterialCommunityIcons
            name="chevron-right"
            size={scale(24)}
            color={colors.textTertiary}
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
    borderRadius: scale(28),
    marginBottom: scale(12),
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
    flex: 1,
    flexDirection: "row",
  },
  mealItemTitle: {
    ...fontStyles.body1Bold,
  },
  mealItemTime: {
    ...fontStyles.caption,
  },
  mealItemRight: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: "auto",
  },
  caloriesText: {
    ...fontStyles.body1,
    marginRight: scale(2),
  },
});

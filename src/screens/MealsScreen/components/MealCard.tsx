import React, { FC } from "react";
import { Text, View } from "react-native";
import { colors } from "../../../theme/colors";
import { scale } from "../../../theme/utils";
import { fontStyles } from "../../../theme/fontStyles";
import { StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { IMeal } from "../../../services/apiTypes";
import { TouchableOpacity } from "react-native-gesture-handler";

type Props = {
  meal: IMeal;
  onPress: (meal: IMeal) => void;
};

const MealCard: FC<Props> = ({ meal, onPress }) => (
  <TouchableOpacity
    activeOpacity={0.8}
    style={styles.mealCard}
    onPress={() => onPress(meal)}
  >
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
      <MaterialCommunityIcons
        name="food-fork-drink"
        size={scale(32)}
        color={colors["color-success-400"]}
      />
    </View>

    <Text style={styles.mealDescription}>{meal.description}</Text>

    <View style={styles.macrosContainer}>
      <View style={styles.macroItem}>
        <Text style={styles.macroValue}>{meal.calories}</Text>
        <Text style={styles.macroLabel}>calories</Text>
      </View>
      <View style={[styles.macroSeparator]} />
      <View style={styles.macroItem}>
        <Text style={styles.macroValue}>{meal.proteins}g</Text>
        <Text style={styles.macroLabel}>proteins</Text>
      </View>
      <View style={[styles.macroSeparator]} />
      <View style={styles.macroItem}>
        <Text style={styles.macroValue}>{meal.carbs}g</Text>
        <Text style={styles.macroLabel}>carbs</Text>
      </View>
      <View style={[styles.macroSeparator]} />
      <View style={styles.macroItem}>
        <Text style={styles.macroValue}>{meal.fats}g</Text>
        <Text style={styles.macroLabel}>fats</Text>
      </View>
    </View>
  </TouchableOpacity>
);

export default MealCard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors["color-primary-100"],
  },
  header: {
    paddingHorizontal: scale(24),
    paddingBottom: scale(24),
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
    paddingBottom: scale(100), // Increased to accommodate tab bar
  },
  mealCard: {
    backgroundColor: "white",
    borderRadius: scale(24),
    padding: scale(24),
    marginBottom: scale(24),
    shadowColor: colors["color-primary-500"],
    shadowOffset: {
      width: 0,
      height: scale(4),
    },
    shadowOpacity: 0.08,
    shadowRadius: scale(12),
    elevation: 5,
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
    paddingTop: scale(20),
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
    ...fontStyles.caption,
    color: colors["color-primary-400"],
    textTransform: "uppercase",
  },
  macroSeparator: {
    width: 1,
    height: scale(40),
    backgroundColor: colors["color-primary-100"],
  },
  macroPercentagesContainer: {
    marginTop: scale(8),
  },
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
    marginTop: scale(8),
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
});

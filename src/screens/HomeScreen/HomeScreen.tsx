import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { scale } from "../../theme/utils";
import { colors } from "../../theme/colors";
import { fontStyles } from "../../theme/fontStyles";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MealCard from "./components/MealCard";
import { IMeal, IMealType } from "../../services/apiTypes";
import useMealsStore from "../../zustand/useMealsStore";
import { useTranslation } from "react-i18next";
import EmptyState from "./components/EmptyState";
import { TAB_BAR_HEIGHT } from "../../navigation/constants";
import DailySummary from "./components/DailySummary";

const MealTypeSection = ({
  title,
  meals,
  onPressItem,
}: {
  title: string;
  meals: IMeal[];
  onPressItem: (meal: IMeal) => void;
}) => {
  if (meals.length === 0) return null;

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>{title}</Text>

      {meals.map((meal, index) => (
        <MealCard
          meal={meal}
          key={meal.description + index}
          onPress={() => onPressItem(meal)}
        />
      ))}
    </View>
  );
};

const LoggedMealsScreen = () => {
  const { bottom, top } = useSafeAreaInsets();
  const { t } = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const meals = useMealsStore((state) => state.loggedMeals).filter(
    (m) => m.date === selectedDate.toLocaleDateString("en-US")
  );

  console.log("useMealsStore", useMealsStore.getState());

  const navigation = useNavigation();

  useEffect(() => {
    if (modalVisible) {
      navigation.setOptions({
        tabBarVisible: false,
      });
    } else {
      navigation.setOptions({
        tabBarVisible: true,
      });
    }
  }, [modalVisible]);

  // Group meals by type
  const getMealsByType = (type: IMealType) => {
    return meals.filter(
      (meal) => meal.mealType.toLowerCase() === type.toLowerCase()
    );
  };

  const breakfastMeals = getMealsByType("breakfast");
  const lunchMeals = getMealsByType("lunch");
  const dinnerMeals = getMealsByType("dinner");
  const snackMeals = getMealsByType("snack");

  const handleMealPress = (meal: IMeal) => {
    navigation.navigate("AnalyzedMeal", { meal });
  };

  const navigateLogMeal = () => {
    navigation.navigate("LogMeal");
  };

  const isToday =
    selectedDate.toLocaleDateString() === new Date().toLocaleDateString();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.header,
          {
            paddingTop: top,
          },
        ]}
      >
        <Text style={styles.title}>{t("loggedMeals")}</Text>
        <View
          style={{
            flexDirection: "row",
            alignSelf: "center",
            gap: scale(10),
            alignItems: "center",
          }}
        >
          <MaterialCommunityIcons
            onPress={() =>
              setSelectedDate(
                new Date(selectedDate.setDate(selectedDate.getDate() - 1))
              )
            }
            name="chevron-left"
            size={scale(36)}
          />
          <Text style={styles.date}>
            {selectedDate.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </Text>
          <MaterialCommunityIcons
            disabled={isToday}
            color={isToday ? colors["color-primary-300"] : "black"}
            onPress={() =>
              setSelectedDate(
                new Date(selectedDate.setDate(selectedDate.getDate() + 1))
              )
            }
            name="chevron-right"
            size={scale(36)}
          />
        </View>

        <TouchableOpacity
          style={{
            position: "absolute",
            top: top + scale(12),
            right: scale(24),
          }}
          onPress={() => navigation.navigate("Settings")}
        >
          <MaterialIcons
            name="settings"
            size={scale(24)}
            color={colors["color-primary-500"]}
          />
        </TouchableOpacity>
      </View>

      {meals.length > 0 ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* <DailySummary meals={meals} /> */}

          <MealTypeSection
            title={t("breakfast")}
            meals={breakfastMeals}
            onPressItem={handleMealPress}
          />

          <MealTypeSection
            title={t("lunch")}
            meals={lunchMeals}
            onPressItem={handleMealPress}
          />

          <MealTypeSection
            title={t("dinner")}
            meals={dinnerMeals}
            onPressItem={handleMealPress}
          />

          <MealTypeSection
            title={t("snack")}
            meals={snackMeals}
            onPressItem={handleMealPress}
          />
        </ScrollView>
      ) : (
        <EmptyState onPress={navigateLogMeal} />
      )}

      {meals.length > 0 && (
        <TouchableOpacity
          style={[
            styles.addButton,
            {
              bottom: TAB_BAR_HEIGHT + bottom + scale(16),
            },
          ]}
          onPress={navigateLogMeal}
        >
          <MaterialCommunityIcons name="plus" size={scale(24)} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
};

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
    textAlign: "center",
  },
  // New compact summary styles
  dailySummaryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: scale(20),
  },
  macroCard: {
    flex: 3,
    backgroundColor: "white",
    borderRadius: scale(16),
    padding: scale(12),
    shadowColor: colors["color-primary-500"],
    shadowOffset: {
      width: 0,
      height: scale(2),
    },
    shadowOpacity: 0.05,
    shadowRadius: scale(8),
    elevation: 3,
    marginRight: scale(10),
  },
  summaryTitle: {
    ...fontStyles.headline4,
    color: colors["color-primary-500"],
    marginBottom: scale(8),
  },
  macroGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  macroItem: {
    width: "48%",
    marginBottom: scale(8),
  },
  macroValue: {
    ...fontStyles.headline3,
    color: colors["color-primary-800"],
  },
  macroLabel: {
    ...fontStyles.caption,
    color: colors["color-primary-400"],
  },
  scoreCard: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: scale(16),
    padding: scale(12),
    shadowColor: colors["color-primary-500"],
    shadowOffset: {
      width: 0,
      height: scale(2),
    },
    shadowOpacity: 0.05,
    shadowRadius: scale(8),
    elevation: 3,
  },
  scoreTitle: {
    ...fontStyles.headline4,
    color: colors["color-primary-500"],
    marginBottom: scale(8),
    textAlign: "center",
  },
  scoreContent: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
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
  // Original styles
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: scale(24),
    paddingBottom: TAB_BAR_HEIGHT + scale(72),
  },
  sectionContainer: {
    marginBottom: scale(12),
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

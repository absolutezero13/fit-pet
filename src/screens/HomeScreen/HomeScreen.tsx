import React, { useEffect, useState } from "react";
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
import { IMeal } from "../../services/apiTypes";
import useLoggedMealsStore from "../../zustand/useLoggedMealsStore";
import { useTranslation } from "react-i18next";

const EmptyState = ({ onPress }) => {
  const { t } = useTranslation();
  return (
    <View style={styles.emptyStateContainer}>
      <Text style={styles.emptyStateTitle}>{t("noMealsLogged")}</Text>
      <Text style={styles.emptyStateDescription}>
        {t("trackYourNutrition")}
      </Text>
      <TouchableOpacity style={styles.emptyStateButton} onPress={onPress}>
        <Text style={styles.emptyStateButtonText}>{t("logYourFirstMeal")}</Text>
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
  const meals = useLoggedMealsStore((state) => state.loggedMeals);

  console.log("useMealsStore", useLoggedMealsStore.getState());
  useEffect(() => {
    // useLoggedMealsStore.setState((state) => {
    //   const newMeals = state.loggedMeals.filter((m) => {
    //     console.log("m.date", m.date);
    //     console.log("new Date(m.date)", new Date(m.date));
    //     console.log(
    //       "new Date().toLocaleDateString()",
    //       new Date().toLocaleDateString()
    //     );
    //     console.log(
    //       "new Date(m.date).toLocaleDateString()",
    //       new Date(m.date).toLocaleDateString()
    //     );
    //     return (
    //       new Date(m.date).toLocaleDateString() ===
    //       new Date().toLocaleDateString()
    //     );
    //   });
    //   return { loggedMeals: newMeals };
    // });
  }, []);

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
  const getMealsByType = (type) => {
    return meals.filter(
      (meal) => meal.mealType.toLowerCase() === type.toLowerCase()
    );
  };

  const breakfastMeals = getMealsByType("breakfast");
  const lunchMeals = getMealsByType("lunch");
  const dinnerMeals = getMealsByType("dinner");
  const snackMeals = getMealsByType("snack");

  const handleMealPress = (meal: IMeal) => {
    // Navigate to meal detail or edit screen
    console.log("Meal pressed:", meal);
    // navigation.navigate('MealDetail', { meal });
  };

  const navigateLogMeal = () => {
    navigation.navigate("LogMeal");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("loggedMeals")}</Text>
        <Text style={styles.date}>
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </Text>

        <TouchableOpacity
          style={{ position: "absolute", top: scale(70), right: scale(24) }}
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
              bottom: bottom + scale(64),
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

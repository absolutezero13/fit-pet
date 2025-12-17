import React, { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
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
import { getMealsByDate } from "../../services/mealAnalysis";
import { LiquidGlassView } from "@callstack/liquid-glass";
import GradientSpinner from "../../components/GradientSpinner";
import formatHeaderDate from "../../utils/formatHeaderDate";

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
  const navigation = useNavigation();
  const { bottom, top } = useSafeAreaInsets();
  const { t } = useTranslation();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const meals = useMealsStore((state) => state.loggedMeals);
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
    navigation.navigate("AnalyzedMeal", { mealId: meal._id ?? "" });
  };

  const navigateLogMeal = () => {
    navigation.navigate("LogMeal", {
      selectedDate: selectedDate.toISOString(),
    });
  };

  const isToday =
    selectedDate.toLocaleDateString() === new Date().toLocaleDateString();

  const mealTypesData = [
    { type: "breakfast", meals: breakfastMeals },
    { type: "lunch", meals: lunchMeals },
    { type: "dinner", meals: dinnerMeals },
    { type: "snack", meals: snackMeals },
  ];

  useEffect(() => {
    const getMeals = async () => {
      try {
        setLoading(true);
        const fetchedMeals = await getMealsByDate(selectedDate.toISOString());
        useMealsStore.setState({ loggedMeals: fetchedMeals });
      } catch (error) {
        console.error("fetch meal error");
      } finally {
        setLoading(false);
      }
    };
    getMeals();
  }, [selectedDate]);

  return (
    <View style={styles.container}>
      <LiquidGlassView
        effect={"clear"}
        tintColor={colors["color-primary-200"]}
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
          <Text style={styles.date}>{formatHeaderDate(selectedDate)}</Text>
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
      </LiquidGlassView>

      {meals.length > 0 ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <DailySummary meals={meals} />
          {mealTypesData.map(({ type, meals }) => (
            <MealTypeSection
              key={type}
              title={t(type)}
              meals={meals}
              onPressItem={handleMealPress}
            />
          ))}
        </ScrollView>
      ) : loading ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <GradientSpinner />
        </View>
      ) : (
        <EmptyState onPress={navigateLogMeal} />
      )}
      {meals.length > 0 && (
        <LiquidGlassView
          effect={"clear"}
          interactive
          style={{
            position: "absolute",
            bottom: TAB_BAR_HEIGHT + bottom + scale(16),
            right: scale(32),
            borderRadius: scale(32),
          }}
        >
          <Pressable style={[styles.addButton, {}]} onPress={navigateLogMeal}>
            <MaterialCommunityIcons
              name="plus"
              size={scale(24)}
              color="white"
            />
          </Pressable>
        </LiquidGlassView>
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
    borderBottomLeftRadius: scale(30),
    borderBottomRightRadius: scale(30),
    position: "absolute",
    width: "100%",
    zIndex: 10,
  },
  title: {
    ...fontStyles.headline1,
  },
  date: {
    ...fontStyles.headline4,
    color: colors["color-primary-400"],
    textAlign: "center",
  },
  // Original styles
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: scale(24),
    paddingBottom: TAB_BAR_HEIGHT + scale(72),
    paddingTop: scale(180),
  },
  sectionContainer: {
    marginBottom: scale(12),
  },
  sectionTitle: {
    ...fontStyles.headline2,
    color: colors["color-primary-500"],
    marginBottom: scale(12),
  },
  addButton: {
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

export default LoggedMealsScreen;

import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  Alert,
  Image,
  Pressable,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { scale } from "../theme/utils";
import { colors } from "../theme/colors";
import { fontStyles } from "../theme/fontStyles";
import { createGeminiCompletion } from "../services/gptApi";
import { createMealPrompt } from "../utils/mealPrompt";
import GradientSpinner from "../components/GradientSpinner";
import { storageService } from "../storage/AsyncStorageService";
import useOnboardingStore from "../zustand/useOnboardingStore";
import { IMeal } from "../services/apiTypes";
import { useTranslation } from "react-i18next";
import useMealsStore from "../zustand/useMealsStore";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

const TotalNutrition = ({ meals }: { meals: IMeal[] }) => {
  const { t } = useTranslation();
  const totals = useMemo(() => {
    return meals.reduce(
      (acc, meal) => {
        return {
          calories: acc.calories + parseInt(meal.calories),
          proteins: acc.proteins + parseInt(meal.proteins),
          carbs: acc.carbs + parseInt(meal.carbs),
          fats: acc.fats + parseInt(meal.fats),
        };
      },
      { calories: 0, proteins: 0, carbs: 0, fats: 0 }
    );
  }, [meals]);

  return (
    <View style={styles.totalCard}>
      <View style={styles.totalHeaderRow}>
        <MaterialCommunityIcons
          name="calculator"
          size={scale(24)}
          color={colors["color-info-400"]}
          style={styles.totalIcon}
        />
        <Text style={styles.totalTitle}>{t("dailyTotal")}</Text>
      </View>

      <View style={styles.totalMacrosContainer}>
        <View style={styles.totalMacroItem}>
          <Text style={styles.totalMacroValue}>{totals.calories}</Text>
          <Text style={styles.totalMacroLabel}>{t("calories")}</Text>
        </View>
        <View style={styles.totalMacroItem}>
          <Text style={styles.totalMacroValue}>{totals.proteins}g</Text>
          <Text style={styles.totalMacroLabel}>{t("proteins")}</Text>
        </View>
        <View style={styles.totalMacroItem}>
          <Text style={styles.totalMacroValue}>{totals.carbs}g</Text>
          <Text style={styles.totalMacroLabel}>{t("carbs")} </Text>
        </View>
        <View style={styles.totalMacroItem}>
          <Text style={styles.totalMacroValue}>{totals.fats}g</Text>
          <Text style={styles.totalMacroLabel}>{t("fats")} </Text>
        </View>
      </View>

      <View style={styles.macroPercentagesContainer}>
        <View style={styles.macroPercentageBar}>
          <View
            style={[
              styles.macroPercentageFill,
              {
                width: `${Math.round(
                  ((totals.proteins * 4) / totals.calories) * 100
                )}%`,
                backgroundColor: colors["color-success-400"],
              },
            ]}
          />
          <View
            style={[
              styles.macroPercentageFill,
              {
                width: `${Math.round(
                  ((totals.carbs * 4) / totals.calories) * 100
                )}%`,
                backgroundColor: colors["color-info-400"],
              },
            ]}
          />
          <View
            style={[
              styles.macroPercentageFill,
              {
                width: `${Math.round(
                  ((totals.fats * 9) / totals.calories) * 100
                )}%`,
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
            <Text style={styles.macroLegendText}>
              {t("proteins").toUpperCase()}
            </Text>
          </View>
          <View style={styles.macroLegendItem}>
            <View
              style={[
                styles.macroLegendColor,
                { backgroundColor: colors["color-info-400"] },
              ]}
            />
            <Text style={styles.macroLegendText}>
              {t("carbs").toUpperCase()}
            </Text>
          </View>
          <View style={styles.macroLegendItem}>
            <View
              style={[
                styles.macroLegendColor,
                { backgroundColor: colors["color-primary-400"] },
              ]}
            />
            <Text style={styles.macroLegendText}>
              {t("fats").toUpperCase()}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const MealCard = ({ meal, onPress }) => (
  <Pressable style={styles.mealCard} onPress={() => onPress(meal)}>
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
    {/* <View style={{ marginTop: scale(20) }}>
      {meal.insights?.map((insight, index) => (
        <Text
          key={index}
          style={{
            ...fontStyles.body2,
            color: colors["color-primary-400"],
            marginTop: scale(8),
          }}
        >
          * {insight}
        </Text>
      ))}
    </View> */}
  </Pressable>
);

const MealsScreen = () => {
  const { t } = useTranslation();
  const { top } = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const onMealPress = (meal: IMeal) => {
    navigation.navigate("MealDetail", { meal });
  };

  const meals = useMealsStore((state) => state.suggestedMeals);
  const getMeals = async () => {
    const storageItem = await storageService.getItem("User");

    useOnboardingStore.setState({
      age: storageItem?.age,
      weight: storageItem?.weight,
      height: storageItem?.height,
      gender: storageItem?.gender,
      goals: storageItem?.goals,
    });

    setLoading(true);
    try {
      const data = await createGeminiCompletion(
        createMealPrompt(storageItem),
        "recipe"
      );

      useMealsStore.setState({
        suggestedMeals: JSON.parse(
          data.response.candidates[0].content.parts[0].text
        ) as IMeal[],
      });

      if (storageItem) {
        storageService.setItem("User", {
          ...storageItem,
          mealInfo: {
            date: new Date().toLocaleDateString("en-US"),
            meals: JSON.parse(
              data.response.candidates[0].content.parts[0].text
            ) as IMeal[],
          },
        });
      }
    } catch (error) {
      Alert.alert("Error", "Failed to fetch meals");
      console.log("error", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (meals.length === 0) {
      getMeals();
    }
  }, []);

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
        <Text style={styles.title}>{t("todaysMenu")}</Text>
        <Text style={styles.date}>
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </Text>
      </View>

      {loading ? (
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
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {meals.map((meal, index) => (
            <MealCard key={index} meal={meal} onPress={onMealPress} />
          ))}
          {meals.length > 0 && <TotalNutrition meals={meals} />}
        </ScrollView>
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

  // Total Card Styles
  totalCard: {
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
  totalHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: scale(20),
  },
  totalIcon: {
    marginRight: scale(12),
  },
  totalTitle: {
    ...fontStyles.headline2,
    color: colors["color-info-500"],
  },
  totalMacrosContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: scale(24),
  },
  totalMacroItem: {
    flex: 1,
    alignItems: "center",
  },
  totalMacroValue: {
    ...fontStyles.headline2,
    color: colors["color-info-500"],
    marginBottom: scale(6),
  },
  totalMacroLabel: {
    ...fontStyles.caption,
    color: colors["color-primary-400"],
    textTransform: "uppercase",
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

export default MealsScreen;

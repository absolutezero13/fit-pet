import React, { useEffect, useState } from "react";
import { View, ScrollView, Text, StyleSheet, Alert } from "react-native";
import { scale } from "../../theme/utils";
import { colors } from "../../theme/colors";
import { fontStyles } from "../../theme/fontStyles";
import { createGeminiCompletion } from "../../services/gptApi";
import { createMealPrompt } from "../../utils/mealPrompt";
import GradientSpinner from "../../components/GradientSpinner";
import { storageService } from "../../storage/AsyncStorageService";
import useOnboardingStore from "../../zustand/useOnboardingStore";
import { IMeal } from "../../services/apiTypes";
import { useTranslation } from "react-i18next";
import useMealsStore from "../../zustand/useMealsStore";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import MealCard from "./components/MealCard";
import TotalNutrition from "./components/TotalNutritionCard";

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
});

export default MealsScreen;

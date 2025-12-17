import React, { useEffect, useState } from "react";
import { View, ScrollView, StyleSheet, Alert, Text } from "react-native";
import { scale } from "../../theme/utils";
import { colors } from "../../theme/colors";
import { fontStyles } from "../../theme/fontStyles";
import {
  createGeminiCompletion,
  createGeminiImage,
} from "../../services/gptApi";
import GradientSpinner from "../../components/GradientSpinner";
import { IMeal } from "../../services/apiTypes";
import { useTranslation } from "react-i18next";
import useMealsStore from "../../zustand/useMealsStore";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import MealCard from "./components/MealCard";
import TotalNutrition from "./components/TotalNutritionCard";
import promptBuilder from "../../utils/promptBuilder";
import useUserStore from "../../zustand/useUserStore";
import { storageService } from "../../storage/AsyncStorageService";
import { LiquidGlassView } from "@callstack/liquid-glass";
import formatHeaderDate from "../../utils/formatHeaderDate";
import { getCrashlytics } from "@react-native-firebase/crashlytics";

const MealsScreen = () => {
  const { t } = useTranslation();
  const { top } = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const onMealPress = (meal: IMeal) => {
    navigation.navigate("MealDetail", { meal });
  };

  const mealsStore = useMealsStore((state) => state);
  const { suggestedMeals: meals } = mealsStore;
  const getMeals = async () => {
    const mealStore = await storageService.getItem("meals");
    const mealsInStore = mealStore?.meals as IMeal[] | undefined;
    const date = mealStore?.date as string | undefined;
    if (
      mealsInStore &&
      mealsInStore.length > 0 &&
      date === new Date().toISOString().split("T")[0]
    ) {
      useMealsStore.setState({ suggestedMeals: mealsInStore });
      return;
    }

    const todaysMeals = meals.filter(
      (m) => m.date === new Date().toLocaleDateString("en-US")
    );

    if (todaysMeals.length > 0) {
      return;
    }

    setLoading(true);
    try {
      const data = await createGeminiCompletion(
        promptBuilder.createMealPrompt(useUserStore.getState() as any),
        "recipe"
      );
      const responseMeals = JSON.parse(
        data.response.candidates[0].content.parts[0].text
      ) as IMeal[];

      const mealsWithDates = responseMeals.map((meal) => ({
        ...meal,
        date: new Date().toLocaleDateString("en-US"),
      }));

      if (mealsWithDates.length === 0) {
        throw new Error("No meals generated");
      }

      useMealsStore.setState({
        suggestedMeals: mealsWithDates,
      });

      storageService.setItem("meals", {
        meals: useMealsStore.getState().suggestedMeals,
        date: new Date().toISOString().split("T")[0],
      });

      const imagePromises = responseMeals.map((meal) => {
        return createGeminiImage(
          promptBuilder.createImagePrompt(meal.description)
        );
      });
      const images = await Promise.all(imagePromises);
      const mealsWithGeneratedImages = mealsWithDates.map((meal, index) => ({
        ...meal,
        image: images[index].data,
      }));

      useMealsStore.setState({
        suggestedMeals: mealsWithGeneratedImages,
      });
    } catch (error) {
      Alert.alert("Error", "Failed to fetch meals");
      console.log("error", error);
      getCrashlytics().recordError(error as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getMeals();
  }, []);

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
        <Text style={styles.title}>{t("todaysMenu")}</Text>
        <Text style={styles.date}>{formatHeaderDate(new Date())}</Text>
      </LiquidGlassView>

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
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: top + scale(100),
            },
          ]}
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
    borderBottomLeftRadius: scale(30),
    borderBottomRightRadius: scale(30),
    position: "absolute",
    zIndex: 1,
    width: "100%",
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

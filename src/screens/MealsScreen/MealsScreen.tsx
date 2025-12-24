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
import useUserStore, { IUser } from "../../zustand/useUserStore";
import { storageService } from "../../storage/AsyncStorageService";
import {
  isLiquidGlassSupported,
  LiquidGlassView,
} from "@callstack/liquid-glass";
import formatHeaderDate from "../../utils/formatHeaderDate";
import { getCrashlytics } from "@react-native-firebase/crashlytics";

const MealsScreen = () => {
  const { t } = useTranslation();
  const { top } = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const userStore = useUserStore((state) => state);

  const onMealPress = (meal: IMeal) => {
    navigation.navigate("MealDetail", { meal });
  };

  const mealsStore = useMealsStore((state) => state);
  const { suggestedMeals: meals } = mealsStore;
  const user = useUserStore((state) => state);
  const getMeals = async () => {
    if (!userStore) {
      return;
    }
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

    setLoading(true);
    try {
      const data = await createGeminiCompletion(
        promptBuilder.createMealPrompt(user as IUser),
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

      // we can end loading here
      setLoading(false);

      const images: { data: string }[] = [];

      if (!__DEV__) {
        for (const meal of mealsWithDates) {
          const image = await createGeminiImage(
            promptBuilder.createImagePrompt(meal.description)
          );
          images.push(image);
        }
      }

      const mealsWithGeneratedImages = mealsWithDates.map((meal, index) => ({
        ...meal,
        image: images[index]?.data ?? null,
      }));

      useMealsStore.setState({
        suggestedMeals: mealsWithGeneratedImages,
      });

      storageService.setItem("meals", {
        meals: mealsWithGeneratedImages,
        date: new Date().toISOString().split("T")[0],
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
  }, [userStore]);

  return (
    <View style={styles.container}>
      <LiquidGlassView
        effect={"clear"}
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
    backgroundColor: isLiquidGlassSupported
      ? undefined
      : colors["color-primary-50"],
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

import React, { useEffect, useRef, useState } from "react";
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
import { fontStyles } from "../../theme/fontStyles";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SwipeableMealCard from "./components/SwipeableMealCard";
import { IMeal, IMealType } from "../../services/apiTypes";
import useMealsStore from "../../zustand/useMealsStore";
import { useTranslation } from "react-i18next";
import { TAB_BAR_HEIGHT, TrueSheetNames } from "../../navigation/constants";
import DailySummary from "./components/DailySummary";
import { getMealsByDate } from "../../services/mealAnalysis";
import {
  isLiquidGlassSupported,
  LiquidGlassView,
} from "@callstack/liquid-glass";
import { HomeScreenSkeleton } from "./components/HomeScreenSkeleton";
import formatHeaderDate from "../../utils/formatHeaderDate";
import MealTypeEmptyState from "./components/MealTypeEmptyState";
import LogMealTrueSheet from "./components/LogMealTrueSheet";
import ScanMealTrueSheet from "./components/ScanMealTrueSheet";
import { TrueSheet, TrueSheetRef } from "@lodev09/react-native-true-sheet";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { useTheme } from "../../theme/ThemeContext";
import { ThemeColors } from "../../theme/colors";
import { getAuth } from "@react-native-firebase/auth";

const MealTypeSection = ({
  title,
  meals,
  onPressItem,
  onPressAddMeal,
  selectedDate,
  type,
  colors,
}: {
  type: string;
  meals: IMeal[];
  onPressItem: (meal: IMeal) => void;
  selectedDate: Date;
  title: string;
  onPressAddMeal: () => void;
  colors: ThemeColors;
}) => {
  const navigation = useNavigation();

  return (
    <View style={styles.sectionContainer}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>

      {meals.length > 0 ? (
        meals.map((meal, index) => (
          <SwipeableMealCard
            meal={meal}
            key={meal.description + index}
            onPress={() => onPressItem(meal)}
          />
        ))
      ) : (
        <MealTypeEmptyState onPress={onPressAddMeal} />
      )}
    </View>
  );
};

const LoggedMealsScreen = () => {
  const navigation = useNavigation();
  const { bottom, top } = useSafeAreaInsets();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const meals = useMealsStore((state) => state.loggedMeals);
  const [selectedMealType, setSelectedMealType] = useState<string>(
    t("breakfast")
  );
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

  const navigateLogMeal = (type?: IMealType) => {
    console.log("navigating to log meal", type);
    setSelectedMealType(type ?? "breakfast");
    TrueSheet.present(TrueSheetNames.LOG_MEAL);
  };

  const isToday =
    selectedDate.toLocaleDateString() === new Date().toLocaleDateString();

  const mealTypesData: {
    type: IMealType;
    meals: IMeal[];
  }[] = [
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
    <>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LiquidGlassView
          effect={"clear"}
          style={[
            styles.header,
            {
              paddingTop: top,
              backgroundColor: isLiquidGlassSupported
                ? undefined
                : colors.backgroundSecondary,
            },
          ]}
        >
          <Text style={[styles.title, { color: colors.text }]}>
            {t("loggedMeals")}
          </Text>
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
              color={colors.text}
            />
            <Text style={[styles.date, { color: colors.textSecondary }]}>
              {formatHeaderDate(selectedDate)}
            </Text>
            <MaterialCommunityIcons
              disabled={isToday}
              color={isToday ? colors.textTertiary : colors.text}
              onPress={() =>
                setSelectedDate(
                  new Date(selectedDate.setDate(selectedDate.getDate() + 1))
                )
              }
              name="chevron-right"
              size={scale(36)}
            />
          </View>
        </LiquidGlassView>

        <Animated.ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <Animated.View
              key={"skeleton"}
              entering={FadeIn.duration(300)}
              exiting={FadeOut.duration(300)}
            >
              <HomeScreenSkeleton />
            </Animated.View>
          ) : (
            <Animated.View
              key={"content"}
              entering={FadeIn.duration(500)}
              exiting={FadeOut.duration(500)}
            >
              <DailySummary meals={meals} />
              {mealTypesData.map(({ type, meals }) => (
                <MealTypeSection
                  onPressAddMeal={() => navigateLogMeal(type)}
                  key={type}
                  title={t(type)}
                  type={type}
                  meals={meals}
                  onPressItem={handleMealPress}
                  selectedDate={selectedDate}
                  colors={colors}
                />
              ))}
            </Animated.View>
          )}
        </Animated.ScrollView>

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
          <Pressable
            style={[
              styles.addButton,
              { backgroundColor: colors["color-success-400"] },
            ]}
            onPress={() => TrueSheet.present(TrueSheetNames.SCAN_MEAL)}
          >
            <MaterialCommunityIcons
              name="camera"
              size={scale(24)}
              color={colors.textInverse}
            />
          </Pressable>
        </LiquidGlassView>
        <LiquidGlassView
          effect={"clear"}
          interactive
          style={{
            position: "absolute",
            bottom: TAB_BAR_HEIGHT + bottom + scale(16),
            left: scale(32),
            borderRadius: scale(32),
          }}
        >
          <Pressable
            style={[
              styles.addButton,
              { backgroundColor: colors["color-success-400"] },
            ]}
            onPress={() => navigateLogMeal(undefined)}
          >
            <MaterialCommunityIcons
              name="pencil"
              size={scale(24)}
              color={colors.textInverse}
            />
          </Pressable>
        </LiquidGlassView>
        <LogMealTrueSheet
          params={{
            selectedDate: selectedDate.toISOString(),
            mealType: selectedMealType,
          }}
        />
        <ScanMealTrueSheet
          params={{
            selectedDate: selectedDate.toISOString(),
            mealType: selectedMealType,
          }}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    textAlign: "center",
  },
  // Original styles
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: TAB_BAR_HEIGHT + scale(120),
    paddingTop: scale(180),
  },
  sectionContainer: {
    marginBottom: scale(12),
  },
  sectionTitle: {
    ...fontStyles.headline2,
    marginBottom: scale(12),
    paddingHorizontal: scale(24),
  },
  addButton: {
    width: scale(64),
    height: scale(64),
    borderRadius: scale(32),
    justifyContent: "center",
    alignItems: "center",
  },
});

export default LoggedMealsScreen;

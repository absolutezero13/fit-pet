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
import MealCard from "./components/MealCard";
import { IMeal, IMealType } from "../../services/apiTypes";
import useMealsStore from "../../zustand/useMealsStore";
import { useTranslation } from "react-i18next";
import { TAB_BAR_HEIGHT } from "../../navigation/constants";
import DailySummary from "./components/DailySummary";
import { getMealsByDate } from "../../services/mealAnalysis";
import {
  isLiquidGlassSupported,
  LiquidGlassView,
} from "@callstack/liquid-glass";
import GradientSpinner from "../../components/GradientSpinner";
import formatHeaderDate from "../../utils/formatHeaderDate";
import MealTypeEmptyState from "./components/MealTypeEmptyState";
import LogMealTrueSheet from "./components/LogMealTrueSheet";
import ScanMealTrueSheet from "./components/ScanMealTrueSheet";
import { TrueSheetRef } from "@lodev09/react-native-true-sheet";
import { useTheme } from "../../theme/ThemeContext";
import { ThemeColors } from "../../theme/colors";

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
  colors: ThemeColors;
}) => {
  const navigation = useNavigation();

  return (
    <View style={styles.sectionContainer}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>

      {meals.length > 0 ? (
        meals.map((meal, index) => (
          <MealCard
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
  const scanMealTrueSheetRef = useRef<TrueSheetRef>(null);
  const logMealTrueSheetRef = useRef<TrueSheetRef>(null);
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
    logMealTrueSheetRef.current?.present();
  };

  const isToday =
    selectedDate.toLocaleDateString() === new Date().toLocaleDateString();

  const mealTypesData = [
    { type: t("breakfast"), meals: breakfastMeals },
    { type: t("lunch"), meals: lunchMeals },
    { type: t("dinner"), meals: dinnerMeals },
    { type: t("snack"), meals: snackMeals },
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
              backgroundColor: isLiquidGlassSupported ? undefined : colors.backgroundSecondary,
            },
          ]}
        >
          <Text style={[styles.title, { color: colors.text }]}>{t("loggedMeals")}</Text>
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
            <Text style={[styles.date, { color: colors.textSecondary }]}>{formatHeaderDate(selectedDate)}</Text>
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
              color={colors.text}
            />
          </TouchableOpacity>
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
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
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
          </ScrollView>
        )}
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
            style={[styles.addButton, { backgroundColor: colors["color-success-400"] }]}
            onPress={() => scanMealTrueSheetRef.current?.present()}
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
            style={[styles.addButton, { backgroundColor: colors["color-success-400"] }]}
            onPress={() => navigateLogMeal(undefined)}
          >
            <MaterialCommunityIcons
              name="pencil"
              size={scale(24)}
              color={colors.textInverse}
            />
          </Pressable>
        </LiquidGlassView>
      </View>
      <LogMealTrueSheet
        ref={logMealTrueSheetRef}
        params={{
          selectedDate: selectedDate.toISOString(),
          mealType: selectedMealType,
        }}
      />
      <ScanMealTrueSheet
        ref={scanMealTrueSheetRef}
        params={{
          selectedDate: selectedDate.toISOString(),
          mealType: selectedMealType,
        }}
      />
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
    padding: scale(24),
    paddingBottom: TAB_BAR_HEIGHT + scale(120),
    paddingTop: scale(180),
  },
  sectionContainer: {
    marginBottom: scale(12),
  },
  sectionTitle: {
    ...fontStyles.headline2,
    marginBottom: scale(12),
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

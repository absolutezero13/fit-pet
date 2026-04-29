import { Platform } from "react-native";
import useMealsStore from "../zustand/useMealsStore";
import useUserStore from "../zustand/useUserStore";
import { getLocalDateKey } from "../utils/dateUtils";
import { getGramGoal } from "../screens/HomeScreen/components/utils";
import {
  endMealLiveActivity,
  isLiveActivitySupported,
  startMealLiveActivity,
  updateMealLiveActivity,
  LiveActivityPayload,
} from "./mealLiveActivity";
import { eventBus, AppEvent } from "./EventBus";

let activityRunning = false;
let activityDateKey: string | null = null;

const DEFAULT_GOALS = {
  calories: 2000,
  proteins: 30,
  carbs: 40,
  fats: 30,
};

const toInt = (v: string | number | undefined): number => {
  const n = typeof v === "string" ? parseFloat(v) : (v ?? 0);
  return Number.isFinite(n) ? Math.round(n as number) : 0;
};

export const syncMealLiveActivity = async (dateKey: string) => {
  if (Platform.OS !== "ios" || !isLiveActivitySupported()) return;
  const todayKey = getLocalDateKey(new Date());
  console.log("syncing meal live activity", dateKey, "todayKey", todayKey);
  console.log("dateKey comparison", dateKey === todayKey);
  if (dateKey !== todayKey) return;

  const user = useUserStore.getState();
  const goals = user?.macroGoals ?? DEFAULT_GOALS;

  const meals = useMealsStore.getState().loggedMeals;
  console.log("meals", meals);
  const totals = meals.reduce(
    (acc, m) => ({
      calories: acc.calories + toInt(m.calories),
      proteins: acc.proteins + toInt(m.proteins),
      carbs: acc.carbs + toInt(m.carbs),
      fats: acc.fats + toInt(m.fats),
    }),
    { calories: 0, proteins: 0, carbs: 0, fats: 0 },
  );

  const last = meals[meals.length - 1];

  const payload: LiveActivityPayload = {
    caloriesConsumed: totals.calories,
    caloriesGoal: Math.round(goals.calories),
    proteinsGrams: totals.proteins,
    proteinsGoal: Math.round(
      getGramGoal({
        calorieGoal: goals.calories,
        kcalCoefficent: 4,
        percentage: goals.proteins,
      }),
    ),
    carbsGrams: totals.carbs,
    carbsGoal: Math.round(
      getGramGoal({
        calorieGoal: goals.calories,
        kcalCoefficent: 4,
        percentage: goals.carbs,
      }),
    ),
    fatsGrams: totals.fats,
    fatsGoal: Math.round(
      getGramGoal({
        calorieGoal: goals.calories,
        kcalCoefficent: 9,
        percentage: goals.fats,
      }),
    ),
    lastMealTitle: last?.title ?? "",
    lastMealEmoji: last?.emoji ?? "🍽",
    mealCount: meals.length,
  };

  console.log("syncMealLiveActivity", payload);
  if (!activityRunning || activityDateKey !== todayKey) {
    await startMealLiveActivity(payload);
    activityRunning = true;
    activityDateKey = todayKey;
  } else {
    await updateMealLiveActivity(payload);
  }
};

export const resetMealLiveActivity = async () => {
  await endMealLiveActivity();
  activityRunning = false;
  activityDateKey = null;
};

let listenerRegistered = false;

export const onMealsChanged = ({ date }: { date?: string }) => {
  if (!date) {
    return;
  }
  syncMealLiveActivity(date);
};

export const onMealUpdated = ({ id }: { id?: string }) => {
  console.log("onMealUpdated", id);
  if (!id) {
    return;
  }

  const meal = useMealsStore.getState().loggedMeals.find((m) => m.id === id);
  console.log("meal", meal);
  if (!meal) {
    return;
  }
  syncMealLiveActivity(meal.date);
};

export const initMealLiveActivityListener = () => {
  if (listenerRegistered) {
    return;
  }
  listenerRegistered = true;

  eventBus.subscribe(AppEvent.MealChanged, onMealsChanged);
  eventBus.subscribe(AppEvent.MealUpdated, onMealUpdated);
};

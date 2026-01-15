import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type MealType = "breakfast" | "lunch" | "dinner";

export interface MealTime {
  hour: number;
  minute: number;
}

export interface NotificationPreferences {
  // Global toggle
  notificationsEnabled: boolean;

  // Per-meal toggles
  breakfastEnabled: boolean;
  lunchEnabled: boolean;
  dinnerEnabled: boolean;

  // Meal times
  breakfastTime: MealTime;
  lunchTime: MealTime;
  dinnerTime: MealTime;

  // Progressive enablement tracking
  // Array of unique dates (ISO strings) when user logged meals
  mealLogDates: string[];

  // Whether user has been offered to enable breakfast/lunch
  progressiveUnlockOffered: boolean;
}

export interface NotificationStore extends NotificationPreferences {
  // Actions
  setNotificationsEnabled: (enabled: boolean) => void;
  setBreakfastEnabled: (enabled: boolean) => void;
  setLunchEnabled: (enabled: boolean) => void;
  setDinnerEnabled: (enabled: boolean) => void;
  setBreakfastTime: (time: MealTime) => void;
  setLunchTime: (time: MealTime) => void;
  setDinnerTime: (time: MealTime) => void;
  addMealLogDate: (date: string) => void;
  setProgressiveUnlockOffered: (offered: boolean) => void;
  getUniqueMealLogDays: () => number;
  shouldUnlockAllMeals: () => boolean;
}

const DEFAULT_MEAL_TIMES: Record<MealType, MealTime> = {
  breakfast: { hour: 8, minute: 0 },
  lunch: { hour: 12, minute: 0 },
  dinner: { hour: 19, minute: 0 },
};

const INITIAL_STATE: NotificationPreferences = {
  notificationsEnabled: false,
  breakfastEnabled: false,
  lunchEnabled: false,
  dinnerEnabled: true, // Dinner is enabled by default per requirements
  breakfastTime: DEFAULT_MEAL_TIMES.breakfast,
  lunchTime: DEFAULT_MEAL_TIMES.lunch,
  dinnerTime: DEFAULT_MEAL_TIMES.dinner,
  mealLogDates: [],
  progressiveUnlockOffered: false,
};

const useNotificationStore = create(
  persist<NotificationStore>(
    (set, get) => ({
      ...INITIAL_STATE,

      setNotificationsEnabled: (enabled) =>
        set({ notificationsEnabled: enabled }),

      setBreakfastEnabled: (enabled) => set({ breakfastEnabled: enabled }),

      setLunchEnabled: (enabled) => set({ lunchEnabled: enabled }),

      setDinnerEnabled: (enabled) => set({ dinnerEnabled: enabled }),

      setBreakfastTime: (time) => set({ breakfastTime: time }),

      setLunchTime: (time) => set({ lunchTime: time }),

      setDinnerTime: (time) => set({ dinnerTime: time }),

      addMealLogDate: (date) => {
        const state = get();
        // Normalize date to just the date part (YYYY-MM-DD)
        const normalizedDate = date.split("T")[0];
        if (!state.mealLogDates.includes(normalizedDate)) {
          set({ mealLogDates: [...state.mealLogDates, normalizedDate] });
        }
      },

      setProgressiveUnlockOffered: (offered) =>
        set({ progressiveUnlockOffered: offered }),

      getUniqueMealLogDays: () => {
        return get().mealLogDates.length;
      },

      shouldUnlockAllMeals: () => {
        const state = get();
        return (
          state.mealLogDates.length >= 2 && !state.progressiveUnlockOffered
        );
      },
    }),
    {
      name: "notification-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useNotificationStore;

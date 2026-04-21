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
}

export interface NotificationStore extends NotificationPreferences {
  setNotificationsEnabled: (enabled: boolean) => void;
  setBreakfastEnabled: (enabled: boolean) => void;
  setLunchEnabled: (enabled: boolean) => void;
  setDinnerEnabled: (enabled: boolean) => void;
  setBreakfastTime: (time: MealTime) => void;
  setLunchTime: (time: MealTime) => void;
  setDinnerTime: (time: MealTime) => void;
}

const DEFAULT_MEAL_TIMES: Record<MealType, MealTime> = {
  breakfast: { hour: 8, minute: 0 },
  lunch: { hour: 12, minute: 0 },
  dinner: { hour: 19, minute: 0 },
};

const INITIAL_STATE: NotificationPreferences = {
  notificationsEnabled: false,
  breakfastEnabled: true,
  lunchEnabled: true,
  dinnerEnabled: true,
  breakfastTime: DEFAULT_MEAL_TIMES.breakfast,
  lunchTime: DEFAULT_MEAL_TIMES.lunch,
  dinnerTime: DEFAULT_MEAL_TIMES.dinner,
};

const useNotificationStore = create(
  persist<NotificationStore>(
    (set) => ({
      ...INITIAL_STATE,

      setNotificationsEnabled: (enabled) =>
        set({ notificationsEnabled: enabled }),

      setBreakfastEnabled: (enabled) => set({ breakfastEnabled: enabled }),

      setLunchEnabled: (enabled) => set({ lunchEnabled: enabled }),

      setDinnerEnabled: (enabled) => set({ dinnerEnabled: enabled }),

      setBreakfastTime: (time) => set({ breakfastTime: time }),

      setLunchTime: (time) => set({ lunchTime: time }),

      setDinnerTime: (time) => set({ dinnerTime: time }),
    }),
    {
      name: "notification-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useNotificationStore;

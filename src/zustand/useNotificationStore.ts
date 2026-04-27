import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type MealType = "breakfast" | "lunch" | "dinner";

export interface MealTime {
  hour: number;
  minute: number;
}

export interface NotificationPreferences {
  notificationsEnabled: boolean;
  breakfastEnabled: boolean;
  lunchEnabled: boolean;
  dinnerEnabled: boolean;
  breakfastTime: MealTime;
  lunchTime: MealTime;
  dinnerTime: MealTime;
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
  persist<NotificationPreferences>(() => INITIAL_STATE, {
    name: "notification-storage",
    storage: createJSONStorage(() => AsyncStorage),
  }),
);

export default useNotificationStore;

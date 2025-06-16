import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { DietTypeEnum, GenderEnum, GoalEnum } from "./useOnboardingStore";

export type MacroGoals = {
  calories: number;
  carbs: number;
  proteins: number;
  fats: number;
};

export interface IUser {
  email: string;
  displayName?: string;
  photoURL?: string;
  onboarding: {
    goals: GoalEnum;
    gender: GenderEnum | null;
    age: number | null;
    weight: number | null;
    height: number | null;
    dietTypes: DietTypeEnum;
  };
  macroGoals: MacroGoals;
}

export const INITIAL_USER_STORE = null;

const useUserStore = create(
  persist<IUser | null>(() => INITIAL_USER_STORE, {
    name: "user-storage",
    storage: createJSONStorage(() => AsyncStorage),
  })
);

export default useUserStore;

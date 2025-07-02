import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { OnboardingStore } from "./useOnboardingStore";

export type MacroGoals = {
  calories: number;
  carbs: number;
  proteins: number;
  fats: number;
};

export interface IUser {
  email?: string;
  displayName?: string;
  picture?: string;
  onboarding?: OnboardingStore;
  macroGoals?: MacroGoals;
  createdAt?: Date;
  name?: string;
  onboardingCompleted?: boolean;
}

export const INITIAL_USER_STORE = null;

const useUserStore = create(
  persist<IUser | null>(() => INITIAL_USER_STORE, {
    name: "user-storage",
    storage: createJSONStorage(() => AsyncStorage),
  })
);

export default useUserStore;

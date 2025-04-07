import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "@react-native-google-signin/google-signin";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { OnboardingStore } from "./useOnboardingStore";

export type MacroGoals = {
  calories: number;
  carbs: number;
  proteins: number;
  fats: number;
};

export type UserStore = {
  // FIXME: change type after google sign in
  user:
    | (OnboardingStore & {
        macroGoals: MacroGoals;
      })
    | null;
};

export const INITIAL_USER_STORE: UserStore = {
  user: null,
};

const useUserStore = create(
  persist<UserStore>(() => INITIAL_USER_STORE, {
    name: "user-storage",
    storage: createJSONStorage(() => AsyncStorage),
  })
);

export default useUserStore;

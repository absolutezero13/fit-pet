import { create } from "zustand";
import { IMeal } from "../services/apiTypes";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface LoggedMealState {
  loggedMeals: IMeal[];
  suggestedMeals: IMeal[];
}

export const INITIAL_LOGGED_MEAL_STATE: LoggedMealState = {
  loggedMeals: [],
  suggestedMeals: [],
};

const useMealsStore = create(
  persist<LoggedMealState>(() => INITIAL_LOGGED_MEAL_STATE, {
    name: "logged-meals",
    storage: createJSONStorage(() => AsyncStorage),
  })
);

export default useMealsStore;

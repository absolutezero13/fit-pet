import { create } from "zustand";
import { IMeal } from "../services/apiTypes";

interface LoggedMealState {
  loggedMeals: IMeal[];
  suggestedMeals: IMeal[];
}

export const INITIAL_LOGGED_MEAL_STATE: LoggedMealState = {
  loggedMeals: [],
  suggestedMeals: [],
};

const useMealsStore = create(() => INITIAL_LOGGED_MEAL_STATE);

export default useMealsStore;

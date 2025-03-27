import { create } from "zustand";
import { IMeal } from "../services/apiTypes";

interface LoggedMealState {
  meals: IMeal[];
}

const useLoggedMealsStore = create<LoggedMealState>((set) => ({
  meals: [],
}));

export default useLoggedMealsStore;

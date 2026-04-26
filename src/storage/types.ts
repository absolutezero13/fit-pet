import { IMeal, LatestCookSession } from "../services/apiTypes";
import { OnboardingStore } from "../zustand/useOnboardingStore";

export interface PersistedCookRecipe {
  recipe: import("../services/apiTypes").CookRecipe;
  savedAt: string;
}

// Define a key-to-type mapping
export interface StorageItems {
  User: OnboardingStore;
  token: string;
  meals: {
    meals: IMeal[];
    date: string;
  } | null;
  language: {
    code: string;
  };
  hasLaunched: boolean;
  latestCook: LatestCookSession | null;
  myRecipes: PersistedCookRecipe[];
}

import { IMeal } from "../services/gptApi";
import { OnboardingStore } from "../zustand/useOnboardingStore";

export interface User {
  mealInfo: {
    date: string;
    meals: IMeal[];
  };
}

// typedStorage.ts

// Define a key-to-type mapping
export interface StorageItems {
  User: OnboardingStore & User;
  token: string;
  // Add other storage keys and their types here
}

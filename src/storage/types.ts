import { IMeal } from "../services/apiTypes";
import { OnboardingStore } from "../zustand/useOnboardingStore";

// typedStorage.ts

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
  // Add other storage keys and their types here
}

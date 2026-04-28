import { IMeal, LatestCookSession } from "../services/apiTypes";
import { OnboardingStore } from "../zustand/useOnboardingStore";

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
}

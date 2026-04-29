import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export enum AITone {
  Harsh = "harsh",
  Friendly = "friendly",
  Funny = "funny",
  Nerdy = "nerdy",
  Supportive = "supportive",
}

export type HomeNutritionDisplayMode = "consumed" | "remaining";

type PreferenceStore = {
  aiTone: AITone;
  setAiTone: (tone: AITone) => void;
  homeNutritionDisplay: HomeNutritionDisplayMode;
  setHomeNutritionDisplay: (mode: HomeNutritionDisplayMode) => void;
};

const usePreferencesStore = create(
  persist<PreferenceStore>(
    (set) => ({
      aiTone: AITone.Harsh,
      setAiTone: (tone) => set({ aiTone: tone }),
      homeNutritionDisplay: "consumed",
      setHomeNutritionDisplay: (homeNutritionDisplay) =>
        set({ homeNutritionDisplay }),
    }),
    {
      name: "preferences-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default usePreferencesStore;

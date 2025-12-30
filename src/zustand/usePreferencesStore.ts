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

type PreferenceStore = {
  aiTone: AITone;
  setAiTone: (tone: AITone) => void;
};

const usePreferencesStore = create(
  persist<PreferenceStore>(
    (set) => ({
      aiTone: AITone.Harsh,
      setAiTone: (tone) => set({ aiTone: tone }),
    }),
    {
      name: "preferences-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default usePreferencesStore;

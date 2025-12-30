import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type AITone =
  | "harsh"
  | "friendly"
  | "funny"
  | "nerdy"
  | "supportive";

type PreferenceStore = {
  aiTone: AITone;
  setAiTone: (tone: AITone) => void;
};

const usePreferencesStore = create(
  persist<PreferenceStore>(
    (set) => ({
      aiTone: "harsh",
      setAiTone: (tone) => set({ aiTone: tone }),
    }),
    {
      name: "preferences-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default usePreferencesStore;

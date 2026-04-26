import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { DEFAULT_THEME_ID, ThemeId, themes } from "../theme/colors";

interface ThemeStore {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
}

const isValidTheme = (value: unknown): value is ThemeId =>
  typeof value === "string" && Object.prototype.hasOwnProperty.call(themes, value);

const useThemeStore = create(
  persist<ThemeStore>(
    (set) => ({
      theme: DEFAULT_THEME_ID,
      setTheme: (theme: ThemeId) => set({ theme }),
    }),
    {
      name: "theme-storage",
      storage: createJSONStorage(() => AsyncStorage),
      version: 2,
      migrate: (persistedState) => {
        const state = (persistedState ?? {}) as Record<string, unknown>;
        const legacyMode = state.mode;
        if (legacyMode === "light") {
          return { theme: ThemeId.Ivory } as ThemeStore;
        }
        if (legacyMode === "dark") {
          return { theme: DEFAULT_THEME_ID } as ThemeStore;
        }
        if (isValidTheme(state.theme)) {
          return { theme: state.theme } as ThemeStore;
        }
        return { theme: DEFAULT_THEME_ID } as ThemeStore;
      },
    }
  )
);

export default useThemeStore;

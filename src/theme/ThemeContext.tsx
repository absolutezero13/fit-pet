import React, { createContext, useContext, useMemo } from "react";
import useThemeStore from "../zustand/useThemeStore";
import {
  DEFAULT_THEME_ID,
  ThemeColors,
  ThemeId,
  themes,
} from "./colors";

interface ThemeContextValue {
  colors: ThemeColors;
  theme: ThemeId;
  isDark: boolean;
  setTheme: (theme: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { theme, setTheme } = useThemeStore();

  const value = useMemo<ThemeContextValue>(() => {
    const definition = themes[theme] ?? themes[DEFAULT_THEME_ID];
    return {
      colors: definition.colors,
      theme: definition.id,
      isDark: definition.isDark,
      setTheme,
    };
  }, [theme, setTheme]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    const fallback = themes[DEFAULT_THEME_ID];
    return {
      colors: fallback.colors,
      theme: fallback.id,
      isDark: fallback.isDark,
      setTheme: () => {},
    };
  }
  return context;
};

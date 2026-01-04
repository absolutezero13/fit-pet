import React, { createContext, useContext, useMemo } from "react";
import useThemeStore from "../zustand/useThemeStore";
import { lightColors, darkColors, ThemeColors, ThemeMode } from "./colors";

interface ThemeContextValue {
  colors: ThemeColors;
  mode: ThemeMode;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { mode, toggleMode, setMode } = useThemeStore();

  const value = useMemo<ThemeContextValue>(
    () => ({
      colors: mode === "dark" ? darkColors : lightColors,
      mode,
      isDark: mode === "dark",
      toggleTheme: toggleMode,
      setTheme: setMode,
    }),
    [mode, toggleMode, setMode]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    // Emergency fallback for components not wrapped in ThemeProvider (development/testing only)
    return {
      colors: lightColors,
      mode: "light",
      isDark: false,
      toggleTheme: () => {},
      setTheme: () => {},
    };
  }
  return context;
};

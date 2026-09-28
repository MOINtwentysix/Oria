import React, { createContext, useContext, useCallback, useEffect, useState } from 'react';
import * as Font from 'expo-font';
import { Colors } from './Colors';
import { Spacing, BorderRadius, Shadows, GlassStyles, Layout } from './Layout';
import { Typography, TextStyles } from './Typography';
import { Animation, Transitions } from './Animation';

type ColorScheme = 'light' | 'dark';

interface ThemeContextType {
  colorScheme: ColorScheme;
  toggleTheme: () => void;
  setColorScheme: (scheme: ColorScheme) => void;
  fontsLoaded: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const colorScheme: ColorScheme = 'light';
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    Font.loadAsync({
      // Keep binary asset paths relative: Metro's `@/` alias is intentionally
      // mapped to `src/`, while fonts live at the repository root in `assets/`.
      'AlbertSans': require('../../assets/fonts/AlbertSans.ttf'),
      'Almarai': require('../../assets/fonts/Almarai-Regular.ttf'),
      'Almarai-Bold': require('../../assets/fonts/Almarai-Bold.ttf'),
    }).then(() => setFontsLoaded(true)).catch(() => setFontsLoaded(true));
  }, []);

  const toggleTheme = useCallback(() => {
    // Theme is locked to light while backgrounds are hardcoded.
  }, []);

  const setColorScheme = useCallback((_scheme: ColorScheme) => {
    // No-op while locked to light.
  }, []);

  return (
    <ThemeContext.Provider value={{ colorScheme, toggleTheme, setColorScheme, fontsLoaded }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const useColorScheme = (): ColorScheme => {
  const { colorScheme } = useTheme();
  return colorScheme;
};

export const useFontsLoaded = (): boolean => {
  const { fontsLoaded } = useTheme();
  return fontsLoaded;
};

export const getTheme = (colorScheme: 'light' | 'dark') => ({
  colors: Colors[colorScheme],
  spacing: Spacing,
  borderRadius: BorderRadius,
  shadows: Shadows,
  glassStyles: GlassStyles,
  layout: Layout,
  typography: Typography,
  textStyles: TextStyles,
  animation: Animation,
  transitions: Transitions,
});

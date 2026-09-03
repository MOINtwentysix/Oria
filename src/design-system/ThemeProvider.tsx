import React, { createContext, useContext, useCallback } from 'react';
import { Colors } from './Colors';
import { Spacing, BorderRadius, Shadows, GlassStyles, Layout } from './Layout';
import { Typography, TextStyles } from './Typography';
import { Animation, Transitions } from './Animation';

type ColorScheme = 'light' | 'dark';

interface ThemeContextType {
  colorScheme: ColorScheme;
  toggleTheme: () => void;
  setColorScheme: (scheme: ColorScheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// NOTE: The app currently hardcodes light backgrounds across all screens.
// Forcing 'light' keeps text/UI colors consistent with those backgrounds.
// If true dark-mode is added later, make the backgrounds theme-aware (`theme.colors.background`)
// and re-enable Appearance detection below.
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const colorScheme: ColorScheme = 'light';

  const toggleTheme = useCallback(() => {
    // Theme is locked to light while backgrounds are hardcoded.
    // setColorSchemeState(prev => prev === 'light' ? 'dark' : 'light');
  }, []);

  const setColorScheme = useCallback((_scheme: ColorScheme) => {
    // No-op while locked to light.
  }, []);

  return (
    <ThemeContext.Provider value={{ colorScheme, toggleTheme, setColorScheme }}>
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
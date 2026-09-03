import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
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

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const systemScheme = Appearance.getColorScheme() as ColorScheme;
    setColorSchemeState(systemScheme || 'light');

    const subscription = Appearance.addChangeListener(({ colorScheme: newScheme }) => {
      setColorSchemeState((newScheme as ColorScheme) || 'light');
    });

    return () => subscription?.remove();
  }, []);

  const toggleTheme = useCallback(() => {
    setColorSchemeState(prev => prev === 'light' ? 'dark' : 'light');
  }, []);

  const setColorScheme = useCallback((scheme: ColorScheme) => {
    setColorSchemeState(scheme);
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

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
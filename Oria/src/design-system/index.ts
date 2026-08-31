export * from './Colors';
export * from './Layout';
export * from './Typography';
export * from './Animation';
export * from './ThemeProvider';

import { Colors } from './Colors';
import { Spacing, BorderRadius, Shadows, GlassStyles, Layout } from './Layout';
import { Typography, TextStyles } from './Typography';
import { Animation, Transitions } from './Animation';

export const Theme = {
  colors: Colors,
  spacing: Spacing,
  borderRadius: BorderRadius,
  shadows: Shadows,
  glassStyles: GlassStyles,
  layout: Layout,
  typography: Typography,
  textStyles: TextStyles,
  animation: Animation,
  transitions: Transitions,
};

export type ThemeType = typeof Theme;

export const getTheme = (colorScheme: 'light' | 'dark') => ({
  ...Theme,
  colors: Colors[colorScheme],
  glassStyles: colorScheme === 'dark' ? GlassStyles.dark : GlassStyles.light,
});
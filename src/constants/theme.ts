import { Platform } from 'react-native';

export const Gradients = {
  light: {
    primary: ['#007AFF', '#0A84FF'] as const,
    accent: ['#6366F1', '#8B5CF6'] as const,
  },
  dark: {
    primary: ['#0A84FF', '#5E5CE6'] as const,
    accent: ['#818CF8', '#A78BFA'] as const,
  },
} as const;

export const Colors = {
  light: {
    primary: '#007AFF', // Apple system blue
    primaryLight: 'rgba(0, 122, 255, 0.12)',
    accent: '#6366F1', // Indigo / Oria AI
    accentLight: 'rgba(99, 102, 241, 0.12)',
    success: '#34C759', // Apple system green
    warning: '#FF9500', // Apple system orange
    danger: '#FF3B30', // Apple system red
    
    text: '#1C1C1E',
    textSecondary: '#636366',
    textTertiary: '#8E8E93',
    textInverse: '#FFFFFF',

    background: '#F2F2F7',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#E5E5EA',
    cardBackground: 'rgba(255, 255, 255, 0.85)',
    cardBorder: 'rgba(0, 0, 0, 0.06)',
    
    glassBackground: 'rgba(255, 255, 255, 0.72)',
    glassBorder: 'rgba(255, 255, 255, 0.5)',
    glassShadow: 'rgba(0, 0, 0, 0.08)',
    
    divider: 'rgba(60, 60, 67, 0.12)',
    surfaceElevated: '#FFFFFF',
  },
  dark: {
    primary: '#0A84FF',
    primaryLight: 'rgba(10, 132, 255, 0.18)',
    accent: '#818CF8',
    accentLight: 'rgba(129, 140, 248, 0.18)',
    success: '#30D158',
    warning: '#FF9F0A',
    danger: '#FF453A',

    text: '#FFFFFF',
    textSecondary: '#AEAEB2',
    textTertiary: '#636366',
    textInverse: '#000000',

    background: '#000000',
    backgroundElement: '#1C1C1E',
    backgroundSelected: '#2C2C2E',
    cardBackground: 'rgba(28, 28, 30, 0.75)',
    cardBorder: 'rgba(255, 255, 255, 0.12)',

    glassBackground: 'rgba(30, 30, 35, 0.75)',
    glassBorder: 'rgba(255, 255, 255, 0.14)',
    glassShadow: 'rgba(0, 0, 0, 0.45)',

    divider: 'rgba(84, 84, 88, 0.36)',
    surfaceElevated: '#1C1C1E',
  },
} as const;

export type ThemeType = 'light' | 'dark';
export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const CategoryColors = {
  restaurant: '#FF9500', // Gastronomy Orange
  cafe: '#A2845E', // Warm Coffee
  park: '#34C759', // Nature Green
  attraction: '#AF52DE', // Landmark Purple
  museum: '#5856D6', // Culture Indigo
  shopping: '#FF2D55', // Shopping Rose
  entertainment: '#007AFF', // Entertainment Blue
  nightlife: '#BF5AF2', // Nightlife Violet
  hotel: '#32ADE6', // Hospitality Sky
  partner: '#10B981', // Partner Emerald
} as const;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    serif: 'ui-serif, Georgia, serif',
    rounded: '"SF Pro Rounded", "Arial Rounded MT Bold", sans-serif',
    mono: 'ui-monospace, Menlo, Monaco, Consolas, monospace',
  },
});

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  massive: 48,

  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
} as const;

export const Shadows = {
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  glass: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 8,
  },
} as const;

export const BottomTabInset = Platform.select({ ios: 68, android: 80 }) ?? 68;
export const MaxContentWidth = 840;

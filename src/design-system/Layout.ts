export const Spacing = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const BorderRadius = {
  none: 0,
  tight: 10,
  card: 18,
  sheet: 28,
  pill: 9999,
  full: 9999,
};

export const Shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: '#0D1B1E',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: '#0D1B1E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#0D1B1E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#0D1B1E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: '#0D1B1E',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
  },
  inner: {
    shadowColor: '#0D1B1E',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 0,
  },
};

export const GlassStyles = {
  heavy: {
    backgroundColor: 'rgba(254, 251, 246, 0.94)',
    borderColor: 'rgba(13, 27, 30, 0.05)',
    borderWidth: 1,
    shadowColor: '#0D1B1E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  heavyDark: {
    backgroundColor: 'rgba(13, 27, 30, 0.92)',
    borderColor: 'rgba(245, 240, 232, 0.07)',
    borderWidth: 1,
  },
  light: {
    backgroundColor: 'rgba(254, 251, 246, 0.85)',
    borderColor: 'rgba(13, 27, 30, 0.04)',
    borderWidth: 1,
    shadowColor: '#0D1B1E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  dark: {
    backgroundColor: 'rgba(13, 27, 30, 0.82)',
    borderColor: 'rgba(245, 240, 232, 0.05)',
    borderWidth: 1,
  },
};

export const Layout = {
  screenPadding: 16,
  screenPaddingHorizontal: 24,
  screenPaddingVertical: 24,
  cardPadding: 16,
  cardPaddingLarge: 24,
  sectionGap: 36,
  componentGap: 24,
  elementGap: 16,
  tinyGap: 8,
  microGap: 4,
  tabBarHeight: 88,
  tabBarHeightCompact: 72,
  headerHeight: 56,
  searchBarHeight: 52,
  bottomSheetHandleHeight: 6,
  bottomSheetHandleWidth: 36,
  maxContentWidth: 680,
};

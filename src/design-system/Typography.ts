export const Typography = {
  fontFamily: {
    display: 'AlbertSans',     // Headlines, display text - distinctive, geometric
    body: 'Almarai',           // Body, UI, buttons - clean, readable, Arabic/German support
    mono: 'Menlo',
  },
  fontSize: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    xxxl: 28,
    huge: 32,
    massive: 36,
    giant: 40,
    display: 52,
    displayLg: 64,
  },
  lineHeight: {
    tight: 1.1,
    snug: 1.2,
    normal: 1.4,
    relaxed: 1.6,
    loose: 1.75,
  },
  letterSpacing: {
    tight: -0.8,
    snug: -0.4,
    normal: 0,
    wide: 0.3,
    wider: 0.6,
    widest: 1.2,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
};

export const TextStyles = {
  // Display / Hero - distinctive, not generic
  display: {
    fontFamily: Typography.fontFamily.display,
    fontSize: Typography.fontSize.display,
    fontWeight: Typography.fontWeight.extrabold,
    lineHeight: Typography.fontSize.display * Typography.lineHeight.tight,
    letterSpacing: Typography.letterSpacing.tight,
  },
  displayLg: {
    fontFamily: Typography.fontFamily.display,
    fontSize: Typography.fontSize.displayLg,
    fontWeight: Typography.fontWeight.extrabold,
    lineHeight: Typography.fontSize.displayLg * Typography.lineHeight.tight,
    letterSpacing: Typography.letterSpacing.tight,
  },
  h1: {
    fontFamily: Typography.fontFamily.display,
    fontSize: Typography.fontSize.huge,
    fontWeight: Typography.fontWeight.extrabold,
    lineHeight: Typography.fontSize.huge * Typography.lineHeight.snug,
    letterSpacing: Typography.letterSpacing.snug,
  },
  h2: {
    fontFamily: Typography.fontFamily.display,
    fontSize: Typography.fontSize.xxxl,
    fontWeight: Typography.fontWeight.bold,
    lineHeight: Typography.fontSize.xxxl * Typography.lineHeight.normal,
    letterSpacing: Typography.letterSpacing.normal,
  },
  h3: {
    fontFamily: Typography.fontFamily.display,
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.semibold,
    lineHeight: Typography.fontSize.xxl * Typography.lineHeight.normal,
    letterSpacing: Typography.letterSpacing.normal,
  },
  h4: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    lineHeight: Typography.fontSize.lg * Typography.lineHeight.normal,
    letterSpacing: Typography.letterSpacing.normal,
  },
  h5: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    lineHeight: Typography.fontSize.md * Typography.lineHeight.normal,
    letterSpacing: Typography.letterSpacing.normal,
  },
  h6: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    lineHeight: Typography.fontSize.sm * Typography.lineHeight.normal,
    letterSpacing: Typography.letterSpacing.normal,
  },
  
  // Body text - comfortable reading
  bodyLarge: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.regular,
    lineHeight: Typography.fontSize.lg * Typography.lineHeight.relaxed,
    letterSpacing: Typography.letterSpacing.normal,
  },
  body: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.regular,
    lineHeight: Typography.fontSize.md * Typography.lineHeight.relaxed,
    letterSpacing: Typography.letterSpacing.normal,
  },
  bodySmall: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.regular,
    lineHeight: Typography.fontSize.sm * Typography.lineHeight.relaxed,
    letterSpacing: Typography.letterSpacing.normal,
  },
  caption: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.regular,
    lineHeight: Typography.fontSize.xs * Typography.lineHeight.normal,
    letterSpacing: Typography.letterSpacing.wide,
  },
  overline: {
    fontFamily: Typography.fontFamily.display,
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    lineHeight: Typography.fontSize.xs * Typography.lineHeight.normal,
    letterSpacing: Typography.letterSpacing.widest,
    textTransform: 'uppercase' as const,
  },
  
  // Interactive
  button: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    lineHeight: Typography.fontSize.md * Typography.lineHeight.normal,
    letterSpacing: Typography.letterSpacing.normal,
  },
  buttonLarge: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    lineHeight: Typography.fontSize.lg * Typography.lineHeight.normal,
    letterSpacing: Typography.letterSpacing.normal,
  },
  link: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
    lineHeight: Typography.fontSize.md * Typography.lineHeight.normal,
    letterSpacing: Typography.letterSpacing.normal,
    textDecorationLine: 'underline' as const,
  },
  
  // Input
  input: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.regular,
    lineHeight: Typography.fontSize.md * Typography.lineHeight.normal,
    letterSpacing: Typography.letterSpacing.normal,
  },
  inputLabel: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    lineHeight: Typography.fontSize.sm * Typography.lineHeight.normal,
    letterSpacing: Typography.letterSpacing.normal,
  },
};

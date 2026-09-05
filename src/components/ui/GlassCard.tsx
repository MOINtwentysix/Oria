import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme, getTheme } from '@/design-system/ThemeProvider';

interface GlassCardProps {
  children: React.ReactNode;
  style?: any;
  variant?: 'light' | 'dark' | 'heavy' | 'heavyDark';
  blurIntensity?: number;
  onPress?: () => void;
  pressable?: boolean;
  hitSlop?: number;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  variant = 'light',
  blurIntensity = 80,
  onPress,
  pressable = false,
  hitSlop = 8,
}) => {
  const { colorScheme } = useTheme();
  const theme = getTheme(colorScheme);

  const glassStyle = variant === 'heavy'
    ? theme.glassStyles.heavy
    : variant === 'heavyDark'
    ? theme.glassStyles.heavyDark
    : variant === 'dark'
    ? theme.glassStyles.dark
    : variant === 'light'
    ? theme.glassStyles.light
    : colorScheme === 'dark'
    ? theme.glassStyles.dark
    : theme.glassStyles.light;

  const Content = pressable ? Pressable : View;

  return (
    <BlurView
      intensity={blurIntensity}
      style={[
        styles.container,
        glassStyle,
        {
          borderRadius: theme.borderRadius.xxl,
        },
        style,
      ]}
    >
      <Content
        onPress={onPress}
        hitSlop={hitSlop}
        style={styles.content}
        accessibilityRole={pressable ? 'button' : undefined}
        accessibilityState={pressable ? { disabled: false } : undefined}
      >
        {children}
      </Content>
    </BlurView>
  );
};

const s0 = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  content: {
    padding: 0,
  },
});

export interface GlassSurfaceProps {
  children: React.ReactNode;
  style?: any;
  variant?: 'light' | 'dark' | 'heavy' | 'heavyDark';
  blurIntensity?: number;
  borderRadius?: number;
}

export const GlassSurface: React.FC<GlassSurfaceProps> = ({
  children,
  style,
  variant = 'light',
  blurIntensity = 60,
  borderRadius,
}) => {
  const { colorScheme } = useTheme();
  const theme = getTheme(colorScheme);

  const glassStyle = variant === 'heavy'
    ? theme.glassStyles.heavy
    : variant === 'heavyDark'
    ? theme.glassStyles.heavyDark
    : variant === 'dark'
    ? theme.glassStyles.dark
    : variant === 'light'
    ? theme.glassStyles.light
    : colorScheme === 'dark'
    ? theme.glassStyles.dark
    : theme.glassStyles.light;

  return (
    <BlurView
      intensity={blurIntensity}
      style={[
        styles.surface,
        glassStyle,
        {
          borderRadius: borderRadius ?? theme.borderRadius.xl,
        },
        style,
      ]}
    >
      {children}
    </BlurView>
  );
};

const s1 = StyleSheet.create({
  surface: {
    overflow: 'hidden',
  },
});

export interface GlassTabBarProps {
  children: React.ReactNode;
  style?: any;
  variant?: 'light' | 'dark' | 'heavy' | 'heavyDark';
  blurIntensity?: number;
  height?: number;
}

export const GlassTabBar: React.FC<GlassTabBarProps> = ({
  children,
  style,
  variant = 'heavy',
  blurIntensity = 90,
  height = 88,
}) => {
  const { colorScheme } = useTheme();
  const theme = getTheme(colorScheme);

  const glassStyle = variant === 'heavy'
    ? theme.glassStyles.heavy
    : variant === 'heavyDark'
    ? theme.glassStyles.heavyDark
    : variant === 'dark'
    ? theme.glassStyles.dark
    : variant === 'light'
    ? theme.glassStyles.light
    : colorScheme === 'dark'
    ? theme.glassStyles.dark
    : theme.glassStyles.light;

  return (
    <BlurView
      intensity={blurIntensity}
      style={[
        styles.tabBar,
        glassStyle,
        {
          height,
          borderTopLeftRadius: theme.borderRadius.xxxl,
          borderTopRightRadius: theme.borderRadius.xxxl,
          borderWidth: 0,
        },
        style,
      ]}
    >
      {children}
    </BlurView>
  );
};

const s2 = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 8,
    paddingBottom: 12,
    paddingHorizontal: 8,
    overflow: 'hidden',
  },
});
const styles = { ...s0, ...s1, ...s2 };

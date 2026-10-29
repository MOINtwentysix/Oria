import React from 'react';
import { Platform, StyleSheet, View, ViewProps, ViewStyle, useColorScheme } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors } from '../constants/theme';

interface LiquidGlassViewProps extends ViewProps {
  intensity?: number;
  borderRadius?: number;
  style?: ViewStyle | ViewStyle[];
  children?: React.ReactNode;
}

export function LiquidGlassView({
  intensity = 60,
  borderRadius = 20,
  style,
  children,
  ...props
}: LiquidGlassViewProps) {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  const glassStyle: ViewStyle = {
    borderRadius,
    overflow: 'hidden',
    backgroundColor: colors.glassBackground,
    borderColor: colors.glassBorder,
    borderWidth: 1,
    shadowColor: colors.glassShadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: scheme === 'dark' ? 0.35 : 0.1,
    shadowRadius: 16,
    elevation: 4,
  };

  if (Platform.OS === 'web') {
    return (
      <View
        style={[
          glassStyle,
          {
            // @ts-ignore Web-only CSS backdrop filter
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          },
          style,
        ]}
        {...props}
      >
        {children}
      </View>
    );
  }

  return (
    <View style={[glassStyle, style]} {...props}>
      <BlurView
        intensity={intensity}
        tint={scheme === 'dark' ? 'dark' : 'light'}
        style={StyleSheet.absoluteFill}
      />
      {children}
    </View>
  );
}

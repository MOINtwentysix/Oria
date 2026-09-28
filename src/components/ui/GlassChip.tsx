import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Animated, Easing, Image } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme, getTheme } from '@/design-system/ThemeProvider';

interface GlassChipProps {
  children: React.ReactNode;
  style?: any;
  variant?: 'default' | 'selected' | 'outline' | 'filter';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onPress?: () => void;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  removable?: boolean;
  onRemove?: () => void;
  hitSlop?: number;
}

export const GlassChip: React.FC<GlassChipProps> = ({
  children,
  style,
  variant = 'default',
  size = 'md',
  disabled = false,
  onPress,
  icon,
  iconPosition = 'left',
  removable = false,
  onRemove,
  hitSlop = 8,
}) => {
  const { colorScheme } = useTheme();
  const theme = getTheme(colorScheme);

  const [pressAnim] = React.useState(new Animated.Value(1));

  const handlePressIn = () => {
    if (!disabled && onPress) {
      Animated.timing(pressAnim, {
        toValue: 0.92,
        duration: 60,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePressOut = () => {
    Animated.timing(pressAnim, {
      toValue: 1,
      duration: 100,
      easing: Easing.out(Easing.back(2)),
      useNativeDriver: true,
    }).start();
  };

  const getVariantStyles = () => {
    const base = {
      default: {
        backgroundColor: colorScheme === 'dark' ? 'rgba(245,240,232,0.08)' : 'rgba(13,27,30,0.04)',
        borderColor: theme.colors.glassBorder,
        textColor: theme.colors.ink,
        glass: false,
      },
      selected: {
        backgroundColor: theme.colors.accent,
        borderColor: theme.colors.accent,
        textColor: theme.colors.textOnPrimary,
        glass: false,
      },
      outline: {
        backgroundColor: 'transparent',
        borderColor: theme.colors.border,
        textColor: theme.colors.inkMuted,
        glass: false,
      },
      filter: {
        backgroundColor: colorScheme === 'dark' ? 'rgba(13,27,30,0.82)' : 'rgba(254,251,246,0.9)',
        borderColor: theme.colors.glassBorder,
        textColor: theme.colors.ink,
        glass: true,
      },
    };
    return base[variant];
  };

  const variantStyle = getVariantStyles();

  const sizeStyles = {
    sm: {
      paddingVertical: 4,
      paddingHorizontal: 10,
      borderRadius: theme.borderRadius.pill,
      fontSize: theme.typography.fontSize.xs,
      iconSize: 12,
      gap: 4,
      removeSize: 16,
    },
    md: {
      paddingVertical: 6,
      paddingHorizontal: 14,
      borderRadius: theme.borderRadius.pill,
      fontSize: theme.typography.fontSize.sm,
      iconSize: 14,
      gap: 6,
      removeSize: 20,
    },
    lg: {
      paddingVertical: 10,
      paddingHorizontal: 18,
      borderRadius: theme.borderRadius.pill,
      fontSize: theme.typography.fontSize.md,
      iconSize: 18,
      gap: 8,
      removeSize: 24,
    },
  };

  const s = sizeStyles[size];

  const containerStyle = [
    styles.container,
    {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: s.gap,
      paddingVertical: s.paddingVertical,
      paddingHorizontal: s.paddingHorizontal,
      borderRadius: s.borderRadius,
      borderWidth: variantStyle.glass ? 1 : (variant === 'outline' ? 1 : 0),
      borderColor: variantStyle.borderColor,
      opacity: disabled ? 0.5 : 1,
    },
    !variantStyle.glass && { backgroundColor: variantStyle.backgroundColor },
    style,
  ];

  const textStyle = [
    styles.text,
    {
      fontSize: s.fontSize,
      fontWeight: '600' as const,
      fontFamily: theme.typography.fontFamily.body,
      color: variantStyle.textColor,
    },
  ];

  const animatedStyle = {
    transform: [{ scale: pressAnim }],
  };

  const ChipComponent = variantStyle.glass ? BlurView : View;

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      hitSlop={hitSlop}
      activeOpacity={1}
      accessibilityRole="button"
      accessibilityState={{ selected: variant === 'selected', disabled }}
    >
      <Animated.View style={animatedStyle}>
        <ChipComponent intensity={60} style={containerStyle}>
          {icon && iconPosition === 'left' && (
            <View style={{ width: s.iconSize, height: s.iconSize }}>
              {icon}
            </View>
          )}
          <Text style={textStyle}>{children}</Text>
          {icon && iconPosition === 'right' && (
            <View style={{ width: s.iconSize, height: s.iconSize }}>
              {icon}
            </View>
          )}
          {removable && onRemove && (
            <TouchableOpacity
              onPress={onRemove}
              hitSlop={6}
              style={[
                styles.removeButton,
                { width: s.removeSize, height: s.removeSize },
              ]}
            >
              <Text style={[
                styles.removeIcon,
                { fontSize: s.iconSize, color: variantStyle.textColor },
              ]}>
                ✕
              </Text>
            </TouchableOpacity>
          )}
        </ChipComponent>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  text: {
    includeFontPadding: false,
  },
  removeButton: {
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeIcon: {
    includeFontPadding: false,
  },
});

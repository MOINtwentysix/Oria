import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Animated, Easing, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme, getTheme } from '@/design-system/ThemeProvider';

interface GlassButtonProps {
  children: React.ReactNode;
  style?: any;
  variant?: 'primary' | 'secondary' | 'ghost' | 'glass';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  onPress?: () => void;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  hitSlop?: number;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  children,
  style,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  onPress,
  icon,
  iconPosition = 'left',
  hitSlop = 12,
}) => {
  const { colorScheme } = useTheme();
  const theme = getTheme(colorScheme);

  const [pressAnim] = React.useState(new Animated.Value(1));

  const handlePressIn = () => {
    if (!disabled && !loading) {
      Animated.timing(pressAnim, {
        toValue: 0.96,
        duration: 80,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePressOut = () => {
    Animated.timing(pressAnim, {
      toValue: 1,
      duration: 120,
      easing: Easing.out(Easing.back(1.5)),
      useNativeDriver: true,
    }).start();
  };

  const getVariantStyles = () => {
    const base = {
      primary: {
        backgroundColor: theme.colors.accent,
        textColor: theme.colors.textOnPrimary,
        borderColor: 'transparent',
        glass: false,
      },
      secondary: {
        backgroundColor: theme.colors.paperElevated,
        textColor: theme.colors.ink,
        borderColor: theme.colors.border,
        glass: false,
      },
      ghost: {
        backgroundColor: 'transparent',
        textColor: theme.colors.accent,
        borderColor: 'transparent',
        glass: false,
      },
      glass: {
        backgroundColor: 'transparent',
        textColor: theme.colors.ink,
        borderColor: theme.colors.glassBorder,
        glass: true,
      },
    };
    return base[variant];
  };

  const variantStyle = getVariantStyles();

  const sizeStyles = {
    sm: {
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: theme.borderRadius.tight,
      fontSize: theme.textStyles.button.fontSize,
      iconSize: 16,
      gap: 8,
    },
    md: {
      paddingVertical: 14,
      paddingHorizontal: 20,
      borderRadius: theme.borderRadius.card,
      fontSize: theme.textStyles.button.fontSize,
      iconSize: 20,
      gap: 10,
    },
    lg: {
      paddingVertical: 18,
      paddingHorizontal: 28,
      borderRadius: theme.borderRadius.card,
      fontSize: theme.textStyles.buttonLarge.fontSize,
      iconSize: 24,
      gap: 12,
    },
    xl: {
      paddingVertical: 22,
      paddingHorizontal: 32,
      borderRadius: theme.borderRadius.sheet,
      fontSize: theme.textStyles.buttonLarge.fontSize + 2,
      iconSize: 28,
      gap: 14,
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
      width: fullWidth ? '100%' : 'auto',
      opacity: disabled || loading ? 0.5 : 1,
      borderWidth: variantStyle.glass ? 1 : (variant === 'secondary' ? 1 : 0),
      borderColor: variantStyle.borderColor,
      backgroundColor: variantStyle.glass ? undefined : variantStyle.backgroundColor,
    },
    style,
  ];

  const textStyle = [
    styles.text,
    {
      fontSize: s.fontSize,
      fontWeight: theme.textStyles.button.fontWeight,
      fontFamily: theme.typography.fontFamily.body,
      color: variantStyle.textColor,
    },
  ];

  const animatedStyle = {
    transform: [{ scale: pressAnim }],
  };

  const ButtonComponent = variantStyle.glass ? BlurView : View;

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      hitSlop={hitSlop}
      activeOpacity={1}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
    >
      <Animated.View style={animatedStyle}>
        <ButtonComponent
          intensity={80}
          style={containerStyle}
        >
          {loading ? (
            <Animated.View
              style={[styles.spinner, { width: s.iconSize, height: s.iconSize, borderColor: variantStyle.textColor }]}
            />
          ) : (
            <>
              {icon && iconPosition === 'left' && <View>{icon}</View>}
              <Text style={textStyle}>{children}</Text>
              {icon && iconPosition === 'right' && <View>{icon}</View>}
            </>
          )}
        </ButtonComponent>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  text: {
    textAlign: 'center',
    includeFontPadding: false,
  },
  spinner: {
    borderWidth: 2,
    borderRadius: 9999,
    borderColor: 'transparent',
    borderTopColor: 'currentColor',
  },
});

export default GlassButton;

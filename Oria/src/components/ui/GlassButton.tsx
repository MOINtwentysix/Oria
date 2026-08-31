import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Animated, Easing } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme, getTheme } from '@/design-system/ThemeProvider';

interface GlassButtonProps {
  children: React.ReactNode;
  style?: any;
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'glass';
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

  const [pressAnim] = React.useState(new Animated.Value(0));

  const handlePressIn = () => {
    if (!disabled && !loading) {
      Animated.timing(pressAnim, {
        toValue: 0.95,
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

  const getButtonStyles = () => {
    const baseStyles = {
      primary: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
        textColor: theme.colors.textOnPrimary,
        glass: false,
      },
      secondary: {
        backgroundColor: theme.colors.backgroundTertiary,
        borderColor: theme.colors.border,
        textColor: theme.colors.text,
        glass: false,
      },
      accent: {
        backgroundColor: theme.colors.accent,
        borderColor: theme.colors.accent,
        textColor: theme.colors.textOnPrimary,
        glass: false,
      },
      ghost: {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        textColor: theme.colors.primary,
        glass: false,
      },
      glass: {
        backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.7)',
        borderColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.3)',
        textColor: colorScheme === 'dark' ? theme.colors.text : theme.colors.text,
        glass: true,
      },
    };

    return baseStyles[variant];
  };

  const buttonStyle = getButtonStyles();

  const sizeStyles = {
    sm: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: theme.borderRadius.lg,
      fontSize: theme.textStyles.button.fontSize,
      iconSize: 16,
      gap: 8,
    },
    md: {
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: theme.borderRadius.xl,
      fontSize: theme.textStyles.button.fontSize,
      iconSize: 20,
      gap: 10,
    },
    lg: {
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: theme.borderRadius.xxl,
      fontSize: theme.textStyles.buttonLarge.fontSize,
      iconSize: 24,
      gap: 12,
    },
    xl: {
      paddingVertical: 20,
      paddingHorizontal: 32,
      borderRadius: theme.borderRadius.xxxl,
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
      opacity: disabled || loading ? 0.6 : 1,
    },
    !buttonStyle.glass && { backgroundColor: buttonStyle.backgroundColor },
    buttonStyle.glass && {},
    { borderWidth: buttonStyle.glass ? 1 : 0, borderColor: buttonStyle.borderColor },
    style,
  ];

  const textStyle = [
    styles.text,
    {
      fontSize: s.fontSize,
      fontWeight: theme.textStyles.button.fontWeight,
      color: buttonStyle.textColor,
    },
  ];

  const animatedStyle = {
    transform: [{ scale: pressAnim }],
  };

  const ButtonComponent = buttonStyle.glass ? BlurView : View;

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
              style={[
                styles.spinner,
                { width: s.iconSize, height: s.iconSize },
              ]}
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
  },
  spinner: {
    borderWidth: 2,
    borderRadius: 9999,
    borderColor: 'transparent',
  },
});
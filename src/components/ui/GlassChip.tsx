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

  const [pressAnim] = React.useState(new Animated.Value(0));

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
        backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.05)',
        borderColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.08)',
        textColor: theme.colors.text,
        glass: false,
      },
      selected: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
        textColor: theme.colors.textOnPrimary,
        glass: false,
      },
      outline: {
        backgroundColor: 'transparent',
        borderColor: theme.colors.border,
        textColor: theme.colors.textSecondary,
        glass: false,
      },
      filter: {
        backgroundColor: colorScheme === 'dark' ? 'rgba(30,41,59,0.7)' : 'rgba(255,255,255,0.7)',
        borderColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.3)',
        textColor: theme.colors.text,
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
              accessibilityLabel="Remove"
            >
              <View style={styles.removeIcon} />
            </TouchableOpacity>
          )}
        </ChipComponent>
      </Animated.View>
    </TouchableOpacity>
  );
};

const s0 = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  text: {
    textAlign: 'center',
  },
  removeButton: {
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  removeIcon: {
    width: 12,
    height: 12,
    borderWidth: 1.5,
    borderColor: 'currentColor',
    borderRadius: 2,
    transform: [{ rotate: '45deg' }],
  },
});

export interface GlassCategoryChipProps extends Omit<GlassChipProps, 'variant'> {
  category: {
    id: string;
    name: string;
    icon: string;
    color: string;
  };
  selected?: boolean;
  onSelect?: (category: GlassCategoryChipProps['category']) => void;
}

export const GlassCategoryChip: React.FC<GlassCategoryChipProps> = ({
  category,
  selected = false,
  onSelect,
  style,
  size = 'md',
  disabled = false,
  hitSlop = 8,
}) => {
  const { colorScheme } = useTheme();
  const theme = getTheme(colorScheme);

  const variant = selected ? 'selected' : 'filter';

  return (
    <GlassChip
      variant={variant}
      size={size}
      disabled={disabled}
      onPress={() => onSelect?.(category)}
      hitSlop={hitSlop}
      style={[
        style,
        selected && {
          shadowColor: theme.colors[category.color as keyof typeof theme.colors] || theme.colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 4,
        },
      ]}
      icon={
        <View
          style={[
            styles.categoryIcon,
            { backgroundColor: theme.colors[category.color as keyof typeof theme.colors] || theme.colors.primary },
          ]}
        >
          <Text style={styles.categoryIconText}>{category.icon}</Text>
        </View>
      }
      iconPosition="left"
    >
      {category.name}
    </GlassChip>
  );
};

const categoryIconStyles = StyleSheet.create({
  categoryIcon: {
    borderRadius: 9999,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryIconText: {
    fontSize: 10,
    color: 'white',
  },
});

const styles = { ...s0, ...categoryIconStyles };

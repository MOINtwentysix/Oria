import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Animated, Easing, Image } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme, getTheme } from '@/design-system/ThemeProvider';

interface GlassCardListItemProps {
  title: string;
  subtitle?: string;
  description?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  image?: any;
  imageUri?: string;
  imageStyle?: any;
  onPress?: () => void;
  onLongPress?: () => void;
  style?: any;
  variant?: 'default' | 'elevated' | 'glass' | 'bordered';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  divider?: boolean;
  disabled?: boolean;
  hitSlop?: number;
  badge?: string | number;
  badgeColor?: string;
  trailing?: React.ReactNode;
}

export const GlassCardListItem: React.FC<GlassCardListItemProps> = ({
  title,
  subtitle,
  description,
  leftIcon,
  rightIcon,
  image,
  imageUri,
  imageStyle,
  onPress,
  onLongPress,
  style,
  variant = 'default',
  padding = 'md',
  divider = false,
  disabled = false,
  hitSlop = 12,
  badge,
  badgeColor,
  trailing,
}) => {
  const { colorScheme } = useTheme();
  const theme = getTheme(colorScheme);

  const [pressAnim] = React.useState(new Animated.Value(1));

  const handlePressIn = () => {
    if (!disabled && onPress) {
      Animated.timing(pressAnim, {
        toValue: 0.98,
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
      easing: Easing.out(Easing.back(1.5)),
      useNativeDriver: true,
    }).start();
  };

  const getVariantStyle = () => {
    const base = {
      default: {
        backgroundColor: colorScheme === 'dark' ? 'rgba(30,41,59,0.6)' : 'rgba(255,255,255,0.6)',
        borderColor: 'transparent',
        glass: false,
      },
      elevated: {
        backgroundColor: theme.colors.surface,
        borderColor: 'transparent',
        glass: false,
        shadow: theme.shadows.sm,
      },
      glass: {
        backgroundColor: colorScheme === 'dark' ? 'rgba(30,41,59,0.7)' : 'rgba(255,255,255,0.7)',
        borderColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.3)',
        glass: true,
      },
      bordered: {
        backgroundColor: 'transparent',
        borderColor: theme.colors.border,
        glass: false,
      },
    };
    return base[variant];
  };

  const variantStyle: any = getVariantStyle();

  const paddingStyles = {
    none: { vertical: 0, horizontal: 0 },
    sm: { vertical: 10, horizontal: 14 },
    md: { vertical: 14, horizontal: 16 },
    lg: { vertical: 18, horizontal: 20 },
  };

  const p = paddingStyles[padding];

  const containerStyle = [
    styles.container,
    {
      paddingVertical: p.vertical,
      paddingHorizontal: p.horizontal,
      borderBottomWidth: divider ? 1 : 0,
      borderBottomColor: theme.colors.borderLight,
      opacity: disabled ? 0.6 : 1,
    },
    variantStyle.glass ? {} : { backgroundColor: variantStyle.backgroundColor },
    variantStyle.shadow ? variantStyle.shadow : {},
    { borderWidth: variantStyle.glass ? 1 : (variant === 'bordered' ? 1 : 0), borderColor: variantStyle.borderColor },
    style,
  ];

  const animatedStyle = {
    transform: [{ scale: pressAnim }],
  };

  const hasImage = image || imageUri;

  const ContentWrapper = onPress ? TouchableOpacity : View;

  return (
    <Animated.View style={animatedStyle}>
      <BlurView intensity={variantStyle.glass ? 60 : 0} style={containerStyle}>
        <ContentWrapper
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onLongPress={onLongPress}
          disabled={disabled}
          hitSlop={hitSlop}
          activeOpacity={1}
          style={styles.contentWrapper}
          accessibilityRole={onPress ? 'button' : undefined}
          accessibilityState={{ disabled }}
        >
          <View style={styles.row}>
            {hasImage && (
              <View style={styles.imageWrapper}>
                <Image
                  source={image || { uri: imageUri! }}
                  style={[
                    styles.image,
                    {
                      width: 56,
                      height: 56,
                      borderRadius: theme.borderRadius.lg,
                    },
                    imageStyle,
                  ]}
                  resizeMode="cover"
                />
              </View>
            )}

            {leftIcon && !hasImage && (
              <View style={styles.iconWrapper}>
                {leftIcon}
              </View>
            )}

            <View style={styles.textContainer}>
              <View style={styles.titleRow}>
                <Text style={[
                  styles.title,
                  { color: theme.colors.text },
                ]}>
                  {title}
                </Text>
                {badge && (
                  <View style={[
                    styles.badge,
                    { backgroundColor: badgeColor || theme.colors.primary },
                  ]}>
                    <Text style={styles.badgeText}>{badge}</Text>
                  </View>
                )}
              </View>

              {subtitle && (
                <Text style={[
                  styles.subtitle,
                  { color: theme.colors.textSecondary },
                ]}>
                  {subtitle}
                </Text>
              )}

              {description && (
                <Text style={[
                  styles.description,
                  { color: theme.colors.textTertiary },
                ]}>
                  {description}
                </Text>
              )}
            </View>

            <View style={styles.trailingContainer}>
              {trailing}
              {rightIcon && (
                <View style={styles.iconWrapper}>
                  {rightIcon}
                </View>
              )}
            </View>
          </View>
        </ContentWrapper>
      </BlurView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 0,
    overflow: 'hidden',
  },
  contentWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  imageWrapper: {
    marginRight: 12,
  },
  image: {
    borderRadius: 12,
  },
  iconWrapper: {
    marginRight: 12,
    width: 40,
    height: 40,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    flexWrap: 'wrap',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    marginBottom: 2,
  },
  description: {
    fontSize: 13,
    fontWeight: '400',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
    minWidth: 20,
    alignItems: 'center',
    marginLeft: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: 'white',
  },
  trailingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
});
import React from 'react';
import { StyleSheet, View, Text, Animated, Easing, Image } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme, getTheme } from '@/design-system/ThemeProvider';

interface GlassProgressProps {
  value: number;
  max?: number;
  style?: any;
  trackStyle?: any;
  thumbStyle?: any;
  trackHeight?: number;
  showValue?: boolean;
  variant?: 'default' | 'circular' | 'ring';
  size?: number;
  strokeWidth?: number;
  animated?: boolean;
  color?: string;
  trackColor?: string;
}

export const GlassProgress: React.FC<GlassProgressProps> = ({
  value,
  max = 100,
  style,
  trackStyle,
  thumbStyle,
  trackHeight = 4,
  showValue = false,
  variant = 'default',
  size = 48,
  strokeWidth = 4,
  animated = true,
  color,
  trackColor,
}) => {
  const { colorScheme } = useTheme();
  const theme = getTheme(colorScheme);

  const progress = Math.min(Math.max(value / max, 0), 1);
  const progressColor = color || theme.colors.primary;
  const trackBgColor = trackColor || (colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.1)');

  const [anim] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
    if (animated) {
      Animated.timing(anim, {
        toValue: progress,
        duration: 500,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }).start();
    } else {
      anim.setValue(progress);
    }
  }, [progress]);

  if (variant === 'circular' || variant === 'ring') {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference * (1 - anim._value);

    return (
      <View style={[
        styles.circularContainer,
        { width: size, height: size },
        style,
      ]}>
        <Animated.View
          style={[
            styles.circularTrack,
            {
              width: size,
              height: size,
              borderWidth: strokeWidth,
              borderColor: trackBgColor,
              borderRadius: size / 2,
            },
            trackStyle,
          ]}
        />
        <Animated.View
          style={[
            styles.circularProgress,
            {
              width: size,
              height: size,
              borderWidth: strokeWidth,
              borderColor: progressColor,
              borderRadius: size / 2,
              transform: [{ rotate: '-90deg' }],
            },
          ]}
        >
          <Animated.View
            style={[
              styles.circularStroke,
              {
                width: size,
                height: size,
                borderWidth: strokeWidth,
                borderColor: progressColor,
                borderRadius: size / 2,
                borderTopColor: 'transparent',
                borderRightColor: 'transparent',
                borderBottomColor: 'transparent',
                transform: [
                  { rotate: '-90deg' },
                ],
              },
            ]}
          />
        </Animated.View>
        {showValue && (
          <Animated.Text
            style={[
              styles.circularValue,
              { color: theme.colors.text },
            ]}
          >
            {Math.round(progress * 100)}%
          </Animated.Text>
        )}
      </View>
    );
  }

  const animatedWidth = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[
      styles.linearContainer,
      style,
    ]}>
      <BlurView intensity={40} style={[
        styles.linearTrack,
        {
          height: trackHeight,
          borderRadius: trackHeight / 2,
          backgroundColor: trackBgColor,
          overflow: 'hidden',
        },
        trackStyle,
      ]}>
        <Animated.View
          style={[
            styles.linearProgress,
            {
              height: '100%',
              borderRadius: trackHeight / 2,
              backgroundColor: progressColor,
              width: animatedWidth,
            },
            thumbStyle,
          ]}
        />
      </BlurView>
      {showValue && (
        <Text style={[
          styles.linearValue,
          { color: theme.colors.textSecondary },
        ]}>
          {Math.round(progress * 100)}%
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  linearContainer: {
    gap: 8,
  },
  linearTrack: {
    flex: 1,
  },
  linearProgress: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },
  linearValue: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
  },
  circularContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circularTrack: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  circularProgress: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  circularStroke: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  circularValue: {
    position: 'absolute',
    fontSize: 14,
    fontWeight: '700',
  },
});

export interface GlassSkeletonProps {
  style?: any;
  variant?: 'text' | 'circular' | 'rectangular' | 'card' | 'list-item';
  width?: number | string;
  height?: number;
  lines?: number;
  lineHeight?: number;
  spacing?: number;
  borderRadius?: number;
  animated?: boolean;
}

export const GlassSkeleton: React.FC<GlassSkeletonProps> = ({
  style,
  variant = 'text',
  width = '100%',
  height = 16,
  lines = 1,
  lineHeight = 16,
  spacing = 8,
  borderRadius = 8,
  animated = true,
}) => {
  const { colorScheme } = useTheme();
  const theme = getTheme(colorScheme);

  const baseColor = colorScheme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.06)';
  const highlightColor = colorScheme === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(15,23,42,0.12)';

  const [anim] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
    if (animated) {
      Animated.timing(anim, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: false,
      }).start(() => {
        anim.setValue(0);
      });
    }
  }, []);

  const shimmerStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: highlightColor,
    opacity: anim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 1, 0],
    }),
    transform: [
      { translateX: anim.interpolate({
        inputRange: [0, 1],
        outputRange: [-100, 200],
      }) },
    ],
  };

  const renderSkeleton = () => {
    switch (variant) {
      case 'circular':
        return (
          <View style={[
            styles.skeleton,
            { width, height: width, borderRadius: width / 2, backgroundColor: baseColor },
            style,
          ]}>
            <Animated.View style={shimmerStyle} />
          </View>
        );
      case 'rectangular':
        return (
          <View style={[
            styles.skeleton,
            { width, height, borderRadius, backgroundColor: baseColor },
            style,
          ]}>
            <Animated.View style={shimmerStyle} />
          </View>
        );
      case 'card':
        return (
          <View style={[
            styles.skeletonCard,
            style,
          ]}>
            <View style={[
              styles.skeleton,
              { width: '100%', height: 200, borderRadius: 16, backgroundColor: baseColor },
            ]}>
              <Animated.View style={shimmerStyle} />
            </View>
            <View style={styles.skeletonCardContent}>
              <View style={[
                styles.skeleton,
                { width: '60%', height: 20, borderRadius: 4, backgroundColor: baseColor, marginBottom: 8 },
              ]}>
                <Animated.View style={shimmerStyle} />
              </View>
              <View style={[
                styles.skeleton,
                { width: '40%', height: 14, borderRadius: 4, backgroundColor: baseColor, marginBottom: 16 },
              ]}>
                <Animated.View style={shimmerStyle} />
              </View>
              <View style={[
                styles.skeleton,
                { width: '80%', height: 14, borderRadius: 4, backgroundColor: baseColor },
              ]}>
                <Animated.View style={shimmerStyle} />
              </View>
            </View>
          </View>
        );
      case 'list-item':
        return (
          <View style={[
            styles.skeletonListItem,
            style,
          ]}>
            <View style={[
              styles.skeleton,
              { width: 56, height: 56, borderRadius: 12, backgroundColor: baseColor },
            ]}>
              <Animated.View style={shimmerStyle} />
            </View>
            <View style={styles.skeletonListItemContent}>
              <View style={[
                styles.skeleton,
                { width: '50%', height: 18, borderRadius: 4, backgroundColor: baseColor, marginBottom: 6 },
              ]}>
                <Animated.View style={shimmerStyle} />
              </View>
              <View style={[
                styles.skeleton,
                { width: '70%', height: 14, borderRadius: 4, backgroundColor: baseColor },
              ]}>
                <Animated.View style={shimmerStyle} />
              </View>
            </View>
          </View>
        );
      default:
        return (
          <View style={[
            styles.skeletonContainer,
            style,
          ]}>
            {Array.from({ length: lines }).map((_, i) => (
              <View key={i} style={[
                styles.skeleton,
                {
                  width: i === lines - 1 ? width * 0.7 : width,
                  height: lineHeight,
                  borderRadius,
                  backgroundColor: baseColor,
                  marginBottom: i < lines - 1 ? spacing : 0,
                },
              ]}>
                <Animated.View style={shimmerStyle} />
              </View>
            ))}
          </View>
        );
    }
  };

  return renderSkeleton();
};

const skeletonStyles = StyleSheet.create({
  skeleton: {
    overflow: 'hidden',
  },
  skeletonContainer: {
    gap: spacing,
  },
  skeletonCard: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  skeletonCardContent: {
    padding: 16,
    gap: 8,
  },
  skeletonListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  skeletonListItemContent: {
    flex: 1,
    gap: 6,
  },
});
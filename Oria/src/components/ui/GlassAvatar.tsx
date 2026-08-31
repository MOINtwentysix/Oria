import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Animated, Easing, Image } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme, getTheme } from '@/design-system/ThemeProvider';

interface GlassAvatarProps {
  source?: any;
  uri?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  style?: any;
  borderColor?: string;
  borderWidth?: number;
  onPress?: () => void;
  hitSlop?: number;
}

export const GlassAvatar: React.FC<GlassAvatarProps> = ({
  source,
  uri,
  name,
  size = 'md',
  style,
  borderColor,
  borderWidth = 2,
  onPress,
  hitSlop = 8,
}) => {
  const { colorScheme } = useTheme();
  const theme = getTheme(colorScheme);

  const [pressAnim] = React.useState(new Animated.Value(1));

  const handlePressIn = () => {
    if (onPress) {
      Animated.timing(pressAnim, {
        toValue: 0.9,
        duration: 80,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePressOut = () => {
    Animated.timing(pressAnim, {
      toValue: 1,
      duration: 150,
      easing: Easing.out(Easing.back(2)),
      useNativeDriver: true,
    }).start();
  };

  const sizeMap = {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 56,
    xl: 72,
    xxl: 96,
  };

  const fontSizeMap = {
    xs: 9,
    sm: 12,
    md: 15,
    lg: 20,
    xl: 26,
    xxl: 34,
  };

  const diameter = sizeMap[size];
  const fontSize = fontSizeMap[size];

  const initials = name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const getColorFromName = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    return `hsl(${hue}, 65%, 55%)`;
  };

  const bgColor = name ? getColorFromName(name) : theme.colors.primary;

  const containerStyle = [
    styles.container,
    {
      width: diameter,
      height: diameter,
      borderRadius: diameter / 2,
      borderWidth,
      borderColor: borderColor || (colorScheme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.5)'),
      overflow: 'hidden',
    },
    style,
  ];

  const animatedStyle = {
    transform: [{ scale: pressAnim }],
  };

  const PressableWrapper = onPress ? TouchableOpacity : View;

  return (
    <PressableWrapper
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      hitSlop={hitSlop}
      activeOpacity={1}
      style={animatedStyle}
    >
      <BlurView intensity={40} style={containerStyle}>
        {(source || uri) ? (
          <Image
            source={source || { uri: uri! }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : name ? (
          <View style={[styles.initialsContainer, { backgroundColor: bgColor }]}>
            <Text style={[styles.initialsText, { fontSize, color: 'white' }]}>
              {initials}
            </Text>
          </View>
        ) : (
          <View style={[styles.placeholderContainer, { backgroundColor: theme.colors.backgroundTertiary }]}>
            <Text style={[styles.placeholderText, { fontSize, color: theme.colors.textTertiary }]}>
              ?
            </Text>
          </View>
        )}
      </BlurView>
    </PressableWrapper>
  );
};

const s0 = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 9999,
  },
  initialsContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9999,
  },
  initialsText: {
    fontWeight: '700',
  },
  placeholderContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9999,
  },
  placeholderText: {
    fontWeight: '700',
  },
});

export interface GlassAvatarGroupProps {
  avatars: Array<{
    uri?: string;
    name?: string;
    source?: any;
  }>;
  size?: 'sm' | 'md' | 'lg';
  maxVisible?: number;
  style?: any;
  onPress?: () => void;
}

export const GlassAvatarGroup: React.FC<GlassAvatarGroupProps> = ({
  avatars,
  size = 'md',
  maxVisible = 4,
  style,
  onPress,
}) => {
  const { colorScheme } = useTheme();
  const theme = getTheme(colorScheme);

  const sizeMap = { sm: 32, md: 40, lg: 56 };
  const diameter = sizeMap[size];
  const overlap = diameter * 0.3;

  const visibleAvatars = avatars.slice(0, maxVisible);
  const remainingCount = avatars.length - maxVisible;

  return (
    <View style={[styles.groupContainer, { marginRight: -overlap * (visibleAvatars.length - 1) }, style]}>
      {visibleAvatars.map((avatar, index) => (
        <GlassAvatar
          key={index}
          uri={avatar.uri}
          name={avatar.name}
          source={avatar.source}
          size={size}
          style={[
            styles.groupAvatar,
            {
              marginLeft: index === 0 ? 0 : -overlap,
              borderWidth: 2,
              borderColor: colorScheme === 'dark' ? theme.colors.background : theme.colors.background,
              zIndex: maxVisible - index,
            },
          ]}
        />
      ))}
      {remainingCount > 0 && (
        <GlassAvatar
          name={`+${remainingCount}`}
          size={size}
          style={[
            styles.groupAvatar,
            { marginLeft: -overlap, zIndex: 0 },
          ]}
        >
          <View style={styles.plusBadge}>
            <Text style={styles.plusText}>+{remainingCount}</Text>
          </View>
        </GlassAvatar>
      )}
    </View>
  );
};

const s1 = StyleSheet.create({
  groupContainer: {
    flexDirection: 'row',
  },
  groupAvatar: {
    position: 'relative',
  },
  plusBadge: {
    position: 'absolute',
    inset: 0,
    borderRadius: 9999,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 12,
  },
});
const styles = { ...s0, ...s1 };

import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Animated, Easing, Image } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme, getTheme } from '@/design-system/ThemeProvider';

interface GlassAvatarProps {
  source?: any;
  uri?: string | null;
  name?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  style?: any;
  onPress?: () => void;
  showOnline?: boolean;
  group?: GlassAvatarProps[];
  maxGroup?: number;
}

const sizeMap = {
  xs: { width: 24, height: 24, fontSize: 10, borderWidth: 1.5 },
  sm: { width: 32, height: 32, fontSize: 12, borderWidth: 2 },
  md: { width: 40, height: 40, fontSize: 14, borderWidth: 2 },
  lg: { width: 48, height: 48, fontSize: 16, borderWidth: 2.5 },
  xl: { width: 64, height: 64, fontSize: 22, borderWidth: 3 },
  xxl: { width: 80, height: 80, fontSize: 28, borderWidth: 3 },
};

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const getColorFromName = (name: string) => {
  const colors = [
    '#E85D3A', '#2D8C4A', '#D14A2E', '#D4A83D',
    '#1E5AA0', '#4A148C', '#B71C1C', '#006064',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export const GlassAvatar: React.FC<GlassAvatarProps> = ({
  source,
  uri,
  name,
  size = 'md',
  style,
  onPress,
  showOnline = false,
  group,
  maxGroup = 3,
}) => {
  const { colorScheme } = useTheme();
  const theme = getTheme(colorScheme);

  const s = sizeMap[size];

  const [pressAnim] = React.useState(new Animated.Value(1));

  const handlePressIn = () => {
    Animated.timing(pressAnim, {
      toValue: 0.92,
      duration: 60,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(pressAnim, {
      toValue: 1,
      duration: 150,
      easing: Easing.out(Easing.back(2)),
      useNativeDriver: true,
    }).start();
  };

  const initials = name ? getInitials(name) : '?';
  const bgColor = name ? getColorFromName(name) : theme.colors.accent;

  const avatarSource = source || (uri ? { uri } : null);

  if (group && group.length > 0) {
    return (
      <View style={[styles.groupContainer, style]}>
        {group.slice(0, maxGroup).map((avatar, index) => (
          <GlassAvatar
            key={index}
            {...avatar}
            size={size}
            style={[
              styles.groupAvatar,
              { marginLeft: index === 0 ? 0 : -s.width * 0.3 },
            ]}
          />
        ))}
        {group.length > maxGroup && (
          <View style={[
            styles.groupMore,
            { width: s.width, height: s.height, borderWidth: s.borderWidth },
          ]}>
            <Text style={[
              styles.groupMoreText,
              { fontSize: s.fontSize, color: theme.colors.inkMuted },
            ]}>
              +{group.length - maxGroup}
            </Text>
          </View>
        )}
      </View>
    );
  }

  const avatarStyle = [
    styles.avatar,
    {
      width: s.width,
      height: s.height,
      borderRadius: s.width / 2,
      borderWidth: s.borderWidth,
      borderColor: theme.colors.accent,
    },
    style,
  ];

  const initialsStyle = [
    styles.initials,
    {
      fontSize: s.fontSize,
      fontWeight: '700',
      color: theme.colors.textOnPrimary,
      fontFamily: theme.typography.fontFamily.body,
    },
  ];

  const animatedStyle = {
    transform: [{ scale: pressAnim }],
  };

  const Content = onPress ? TouchableOpacity : View;

  const onlineIndicatorStyle = [
    styles.onlineIndicator,
    {
      width: s.width * 0.25,
      height: s.width * 0.25,
      borderWidth: s.borderWidth,
      bottom: -2,
      right: -2,
      borderColor: colorScheme === 'dark' ? theme.colors.paper : theme.colors.paper,
    },
  ];

  return (
    <Animated.View style={animatedStyle}>
      <Content
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={avatarStyle}
        activeOpacity={1}
        hitSlop={4}
        accessibilityRole={onPress ? 'button' : 'image'}
        accessibilityLabel={name || 'Avatar'}
      >
        {avatarSource ? (
          <Image
            source={avatarSource}
            style={[
              styles.image,
              { width: s.width, height: s.height, borderRadius: s.width / 2 },
            ]}
            resizeMode="cover"
          />
        ) : (
          <View style={[
            styles.placeholder,
            { width: s.width, height: s.height, borderRadius: s.width / 2, backgroundColor: bgColor },
          ]}>
            <Text style={initialsStyle}>{initials}</Text>
          </View>
        )}
        {showOnline && (
          <View style={onlineIndicatorStyle} />
        )}
      </Content>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    borderRadius: 9999,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    includeFontPadding: false,
  },
  onlineIndicator: {
    position: 'absolute',
    borderRadius: 9999,
    backgroundColor: '#2D8C4A',
  },
  groupContainer: {
    flexDirection: 'row',
  },
  groupAvatar: {
    borderWidth: 2,
    borderColor: '#FEFBF6',
  },
  groupMore: {
    borderRadius: 9999,
    backgroundColor: 'rgba(13,27,30,0.04)',
    borderColor: '#E8E0D8',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -8,
  },
  groupMoreText: {
    fontWeight: '700',
    includeFontPadding: false,
  },
});

export default GlassAvatar;

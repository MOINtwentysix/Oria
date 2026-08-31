import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Animated, Easing } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme, getTheme } from '@/design-system/ThemeProvider';

interface LiquidTabBarProps {
  tabs: Array<{
    id: string;
    label: string;
    icon: React.ReactNode;
    selectedIcon?: React.ReactNode;
    badge?: string | number;
  }>;
  activeTab: string;
  onTabPress: (tabId: string) => void;
  style?: any;
  variant?: 'floating' | 'bottom' | 'minimal';
  backgroundColor?: string;
  indicatorColor?: string;
  labelStyle?: any;
  iconStyle?: any;
}

export const LiquidTabBar: React.FC<LiquidTabBarProps> = ({
  tabs,
  activeTab,
  onTabPress,
  style,
  variant = 'floating',
  backgroundColor,
  indicatorColor,
  labelStyle,
  iconStyle,
}) => {
  const { colorScheme } = useTheme();
  const theme = getTheme(colorScheme);

  const [activeIndex, setActiveIndex] = React.useState(
    tabs.findIndex(t => t.id === activeTab)
  );

  const tabWidth = 100 / tabs.length;

  const indicatorTranslateX = React.useMemo(
    () => activeIndex * (tabWidth * 1),
    [activeIndex]
  );

  const handleTabPress = (index: number, tabId: string) => {
    setActiveIndex(index);
    onTabPress(tabId);
  };

  const tabContainerStyle = [
    styles.tabContainer,
    {
      backgroundColor: backgroundColor || (colorScheme === 'dark' ? 'rgba(30,41,59,0.85)' : 'rgba(255,255,255,0.85)'),
      borderColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.08)',
      borderWidth: 1,
      borderTopLeftRadius: variant === 'floating' ? theme.borderRadius.xxxl : 0,
      borderTopRightRadius: variant === 'floating' ? theme.borderRadius.xxxl : 0,
    },
    style,
  ];

  return (
    <BlurView intensity={90} style={tabContainerStyle}>
      <Animated.View
        style={[
          styles.indicator,
          {
            width: `${tabWidth}%`,
            backgroundColor: indicatorColor || theme.colors.primary,
            transform: [{ translateX: `${indicatorTranslateX}%` }],
          },
        ]}
      />
      <View style={styles.tabsWrapper}>
        {tabs.map((tab, index) => (
          <TouchableOpacity
            key={tab.id}
            onPress={() => handleTabPress(index, tab.id)}
            style={[
              styles.tab,
              { width: `${tabWidth}%` },
            ]}
            hitSlop={16}
            accessibilityRole="tab"
            accessibilityState={{ selected: tab.id === activeTab }}
            accessibilityLabel={tab.label}
          >
            <Animated.View
              style={[
                styles.iconWrapper,
                {
                  opacity: tab.id === activeTab ? 1 : 0.6,
                  transform: [
                    { scale: tab.id === activeTab ? 1.1 : 1 },
                  ],
                },
                iconStyle,
              ]}
            >
              {tab.id === activeTab && tab.selectedIcon ? tab.selectedIcon : tab.icon}
            </Animated.View>
            <Animated.Text
              style={[
                styles.label,
                {
                  color: tab.id === activeTab ? theme.colors.primary : theme.colors.textTertiary,
                  fontWeight: tab.id === activeTab ? '700' : '500',
                },
                labelStyle,
              ]}
            >
              {tab.label}
            </Animated.Text>
            {tab.badge && (
              <View style={[
                styles.badge,
                { backgroundColor: theme.colors.accent },
              ]}>
                <Text style={styles.badgeText}>{tab.badge}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </BlurView>
  );
};

const s0 = StyleSheet.create({
  tabContainer: {
    position: 'relative',
    overflow: 'hidden',
    flexDirection: 'column',
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: 3,
    borderRadius: 3,
  },
  tabsWrapper: {
    flexDirection: 'row',
    height: 64,
  },
  tab: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
  },
  iconWrapper: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 11,
    lineHeight: 14,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: 'white',
  },
});

export interface LiquidTabBarItemProps {
  label: string;
  icon: React.ReactNode;
  selectedIcon?: React.ReactNode;
  badge?: string | number;
  active?: boolean;
  onPress?: () => void;
  style?: any;
}

export const LiquidTabBarItem: React.FC<LiquidTabBarItemProps> = ({
  label,
  icon,
  selectedIcon,
  badge,
  active = false,
  onPress,
  style,
}) => {
  const { colorScheme } = useTheme();
  const theme = getTheme(colorScheme);

  return (
    <TouchableOpacity
      onPress={onPress}
      hitSlop={16}
      style={[
        styles.item,
        style,
      ]}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
    >
      <Animated.View
        style={[
          styles.itemIconWrapper,
          {
            opacity: active ? 1 : 0.5,
            transform: [{ scale: active ? 1.15 : 1 }],
          },
        ]}
      >
        {active && selectedIcon ? selectedIcon : icon}
      </Animated.View>
      <Animated.Text
        style={[
          styles.itemLabel,
          {
            color: active ? theme.colors.primary : theme.colors.textTertiary,
            fontWeight: active ? '700' : '500',
          },
        ]}
      >
        {label}
      </Animated.Text>
      {badge && (
        <View style={[
          styles.itemBadge,
          { backgroundColor: theme.colors.accent },
        ]}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const s2 = StyleSheet.create({
  item: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
  },
  itemIconWrapper: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemLabel: {
    fontSize: 11,
    lineHeight: 14,
  },
  itemBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
});
const styles = { ...s0, ...s2 };

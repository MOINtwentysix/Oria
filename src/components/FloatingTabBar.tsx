import React from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import { Compass, Sparkles, Bookmark, User } from 'lucide-react-native';
import { BorderRadius, Colors, Shadows } from '../constants/theme';
import { LiquidGlassView } from './LiquidGlassView';

export type TabKey = 'explore' | 'ai' | 'lists' | 'profile';

interface FloatingTabBarProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

const TABS: { key: TabKey; label: string; icon: React.ComponentType<any> }[] = [
  { key: 'explore', label: 'Explore', icon: Compass },
  { key: 'ai', label: 'Oria AI', icon: Sparkles },
  { key: 'lists', label: 'Lists', icon: Bookmark },
  { key: 'profile', label: 'Profile', icon: User },
];

export function FloatingTabBar({ activeTab, onTabChange }: FloatingTabBarProps) {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  return (
    <View style={styles.floatingContainer} pointerEvents="box-none">
      <LiquidGlassView
        borderRadius={BorderRadius.full}
        intensity={80}
        style={[
          styles.tabBar,
          {
            backgroundColor:
              scheme === 'dark'
                ? 'rgba(25, 25, 30, 0.85)'
                : 'rgba(255, 255, 255, 0.88)',
            borderColor: colors.cardBorder,
          },
          Shadows.glass,
        ]}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const Icon = tab.icon;
          const isAI = tab.key === 'ai';

          return (
            <TouchableOpacity
              key={tab.key}
              activeOpacity={0.7}
              onPress={() => onTabChange(tab.key)}
              style={[
                styles.tabItem,
                isActive && {
                  backgroundColor: isAI
                    ? colors.accentLight
                    : colors.primaryLight,
                },
              ]}
            >
              <Icon
                size={20}
                color={
                  isActive
                    ? isAI
                      ? colors.accent
                      : colors.primary
                    : colors.textSecondary
                }
                strokeWidth={isActive ? 2.5 : 2}
              />
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: isActive
                      ? isAI
                        ? colors.accent
                        : colors.primary
                      : colors.textSecondary,
                    fontWeight: isActive ? '600' : '500',
                  },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </LiquidGlassView>
    </View>
  );
}

const styles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 16,
    left: 16,
    right: 16,
    alignItems: 'center',
    zIndex: 9999,
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    paddingVertical: 6,
    maxWidth: 500,
    width: '100%',
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.full,
    gap: 3,
  },
  tabLabel: {
    fontSize: 11,
  },
});

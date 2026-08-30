import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Animated, Easing, Image, ScrollView } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme, getTheme } from '@/design-system/ThemeProvider';
import { GlassButton } from '@/components/ui';

interface LiquidSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  onSubmit?: () => void;
  onClear?: () => void;
  onFilterPress?: () => void;
  onVoicePress?: () => void;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: any;
  showFilter?: boolean;
  showVoice?: boolean;
  autoFocus?: boolean;
  disabled?: boolean;
  blurOnSubmit?: boolean;
}

export const LiquidSearchBar: React.FC<LiquidSearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search places...',
  onFocus,
  onBlur,
  onSubmit,
  onClear,
  onFilterPress,
  onVoicePress,
  leftIcon,
  rightIcon,
  style,
  showFilter = true,
  showVoice = false,
  autoFocus = false,
  disabled = false,
  blurOnSubmit = false,
}) => {
  const { colorScheme } = useTheme();
  const theme = getTheme(colorScheme);

  const [focused, setFocused] = React.useState(false);
  const [expanded, setExpanded] = React.useState(false);

  const searchIcon = leftIcon || (
    <View style={styles.searchIcon}>
      <Text style={styles.searchIconText}>🔍</Text>
    </View>
  );

  const clearIcon = (
    <TouchableOpacity
      onPress={onClear}
      hitSlop={12}
      style={styles.clearButton}
      accessibilityLabel="Clear search"
    >
      <View style={styles.clearIcon} />
    </TouchableOpacity>
  );

  const filterIcon = showFilter && (
    <TouchableOpacity
      onPress={onFilterPress}
      hitSlop={12}
      style={styles.filterButton}
      accessibilityLabel="Filter"
      accessibilityState={{ expanded }}
    >
      <View style={styles.filterIcon}>
        <Text style={styles.filterIconText}>⌃</Text>
      </View>
    </TouchableOpacity>
  );

  const voiceIcon = showVoice && (
    <TouchableOpacity
      onPress={onVoicePress}
      hitSlop={12}
      style={styles.voiceButton}
      accessibilityLabel="Voice search"
    >
      <View style={styles.voiceIcon}>
        <Text style={styles.voiceIconText}>🎤</Text>
      </View>
    </TouchableOpacity>
  );

  const containerStyle = [
    styles.container,
    {
      backgroundColor: colorScheme === 'dark' ? 'rgba(30,41,59,0.7)' : 'rgba(255,255,255,0.7)',
      borderColor: focused ? theme.colors.primary : (colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.08)'),
      borderWidth: focused ? 2 : 1,
      shadowColor: focused ? theme.colors.primary : 'transparent',
      shadowOffset: { width: 0, height: focused ? 8 : 0 },
      shadowOpacity: focused ? 0.15 : 0,
      shadowRadius: focused ? 24 : 0,
      elevation: focused ? 8 : 0,
    },
    style,
  ];

  return (
    <BlurView intensity={60} style={containerStyle}>
      <View style={styles.row}>
        {searchIcon}
        <TextInput
          style={[
            styles.input,
            {
              color: theme.colors.text,
              fontSize: 16,
              flex: 1,
            },
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textTertiary}
          onFocus={(e) => { setFocused(true); setExpanded(true); onFocus?.(); }}
          onBlur={(e) => { setFocused(false); onBlur?.(); }}
          onSubmitEditing={onSubmit}
          blurOnSubmit={blurOnSubmit}
          autoFocus={autoFocus}
          disabled={disabled}
          selectionColor={theme.colors.primary}
          autoCapitalize="none"
          autoCompleteType="off"
          autoCorrect={false}
          spellCheck={false}
        />
        {value.length > 0 ? clearIcon : null}
        {rightIcon}
        {filterIcon}
        {voiceIcon}
      </View>
    </BlurView>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 52,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  searchIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchIconText: {
    fontSize: 18,
  },
  clearButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  clearIcon: {
    width: 16,
    height: 16,
    borderWidth: 2,
    borderColor: 'currentColor',
    borderRadius: 2,
    transform: [{ rotate: '45deg' }],
    opacity: 0.5,
  },
  filterButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  filterIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterIconText: {
    fontSize: 16,
    transform: [{ rotate: '90deg' }],
  },
  voiceButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  voiceIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceIconText: {
    fontSize: 18,
  },
});

export interface LiquidCategoryPillProps {
  categories: Array<{
    id: string;
    name: string;
    icon: string;
    color: string;
    count?: number;
  }>;
  selectedCategories: string[];
  onCategoryPress: (categoryId: string) => void;
  style?: any;
  scrollable?: boolean;
  maxVisible?: number;
}

export const LiquidCategoryPill: React.FC<LiquidCategoryPillProps> = ({
  categories,
  selectedCategories,
  onCategoryPress,
  style,
  scrollable = true,
  maxVisible,
}) => {
  const { colorScheme } = useTheme();
  const theme = getTheme(colorScheme);

  const visibleCategories = maxVisible ? categories.slice(0, maxVisible) : categories;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[
        styles.pillContainer,
        { paddingHorizontal: 16 },
        style,
      ]}
    >
      {visibleCategories.map((category) => {
        const selected = selectedCategories.includes(category.id);
        const catColor = theme.colors[category.color as keyof typeof theme.colors] || theme.colors.primary;

        return (
          <TouchableOpacity
            key={category.id}
            onPress={() => onCategoryPress(category.id)}
            hitSlop={8}
            style={[
              styles.pill,
              {
                backgroundColor: selected ? catColor : (colorScheme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.05)'),
                borderColor: selected ? catColor : (colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.08)'),
                borderWidth: selected ? 0 : 1,
              },
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected }}
          >
            <View style={[
              styles.pillIcon,
              { backgroundColor: selected ? 'rgba(255,255,255,0.2)' : catColor },
            ]}>
              <Text style={styles.pillIconText}>{category.icon}</Text>
            </View>
            <Text style={[
              styles.pillLabel,
              { color: selected ? 'white' : theme.colors.text },
            ]}>
              {category.name}
            </Text>
            {category.count !== undefined && (
              <View style={[
                styles.pillCount,
                { backgroundColor: selected ? 'rgba(255,255,255,0.3)' : catColor },
              ]}>
                <Text style={styles.pillCountText}>{category.count}</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const pillStyles = StyleSheet.create({
  pillContainer: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  pillIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillIconText: {
    fontSize: 12,
    color: 'white',
  },
  pillLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  pillCount: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  pillCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: 'white',
  },
});
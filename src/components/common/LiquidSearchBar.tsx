import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, Animated, Easing, Platform, ScrollView } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme, getTheme } from '@/design-system/ThemeProvider';
import { GlassChip } from '@/components/ui';
import { CATEGORIES } from '@/constants';

interface LiquidSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onSubmitEditing?: () => void;
  placeholder?: string;
  selectedCategories?: string[];
  onCategoryPress?: (categoryId: string) => void;
  style?: any;
  showsCategories?: boolean;
  autoFocus?: boolean;
  blurOnSubmit?: boolean;
}

export const LiquidSearchBar: React.FC<LiquidSearchBarProps> = ({
  value,
  onChangeText,
  onFocus,
  onBlur,
  onSubmitEditing,
  placeholder = 'Orte suchen...',
  selectedCategories = [],
  onCategoryPress,
  style,
  showsCategories = true,
  autoFocus = false,
  blurOnSubmit = true,
}) => {
  const { colorScheme } = useTheme();
  const theme = getTheme(colorScheme);

  const [focused, setFocused] = React.useState(false);
  const [categoriesExpanded, setCategoriesExpanded] = React.useState(false);

  const handleFocus = () => {
    setFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setFocused(false);
    setCategoriesExpanded(false);
    onBlur?.();
  };

  return (
    <View style={[styles.container, style]}>
      <BlurView intensity={80} style={[
        styles.searchWrapper,
        {
          backgroundColor: focused ? theme.colors.glass : colorScheme === 'dark' ? 'rgba(13,27,30,0.82)' : 'rgba(254,251,246,0.9)',
          borderColor: focused ? theme.colors.accent : theme.colors.glassBorder,
          borderWidth: focused ? 2 : 1,
          shadowColor: focused ? theme.colors.accent : 'transparent',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: focused ? 0.15 : 0,
          shadowRadius: focused ? 16 : 0,
          elevation: focused ? 6 : 0,
        },
      ]}>
        <TouchableOpacity onPress={handleFocus} hitSlop={8} style={styles.searchTouchArea}>
          <View style={styles.searchInner}>
            <Text style={[
              styles.searchIcon,
              { color: focused ? theme.colors.accent : theme.colors.inkSubtle },
            ]}>
              ⌕
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  color: theme.colors.ink,
                  fontSize: theme.typography.fontSize.md,
                  fontFamily: theme.typography.fontFamily.body,
                  flex: 1,
                  placeholderTextColor: theme.colors.inkSubtle,
                  selectionColor: theme.colors.accent,
                },
              ]}
              value={value}
              onChangeText={onChangeText}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onSubmitEditing={onSubmitEditing}
              placeholder={placeholder}
              autoFocus={autoFocus}
              blurOnSubmit={blurOnSubmit}
              autoCapitalize="sentences"
              autoCorrect={true}
              spellCheck={true}
              editable={true}
            />
            {value.length > 0 && (
              <TouchableOpacity onPress={() => onChangeText('')} hitSlop={8} style={styles.clearButton}>
                <Text style={styles.clearIcon}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>

        {showsCategories && focused && (
          <Animated.View
            style={[
              styles.categoriesWrapper,
              {
                opacity: categoriesExpanded ? 1 : 0,
                height: categoriesExpanded ? undefined : 0,
              },
            ]}
          >
            <ScrollView
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesContainer}
              onScrollBeginDrag={() => setCategoriesExpanded(true)}
            >
              {CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  onPress={() => onCategoryPress?.(category.id)}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor: selectedCategories.includes(category.id)
                        ? theme.colors[category.color as keyof typeof theme.colors] || theme.colors.accent
                        : 'transparent',
                      borderColor: selectedCategories.includes(category.id)
                        ? theme.colors[category.color as keyof typeof theme.colors] || theme.colors.accent
                        : theme.colors.border,
                      borderWidth: selectedCategories.includes(category.id) ? 0 : 1,
                    },
                  ]}
                  hitSlop={8}
                >
                  <Text style={[
                    styles.categoryChipText,
                    { color: selectedCategories.includes(category.id) ? 'white' : theme.colors.ink, fontFamily: theme.typography.fontFamily.body },
                  ]}>
                    {category.icon} {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>
        )}
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  searchWrapper: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  searchTouchArea: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchIcon: {
    fontSize: 22,
    fontWeight: '300',
  },
  input: {
    flex: 1,
    includeFontPadding: false,
  },
  clearButton: {
    padding: 4,
  },
  clearIcon: {
    fontSize: 18,
    color: '#8B9FA3',
  },
  categoriesWrapper: {
    overflow: 'hidden',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  categoriesContainer: {
    gap: 8,
    paddingBottom: 4,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 9999,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
    includeFontPadding: false,
  },
});

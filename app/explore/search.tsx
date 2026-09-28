import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, SafeAreaView, TextInput, FlatList, Keyboard } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme, getTheme } from '@/design-system/ThemeProvider';
import { GlassButton, GlassCard, GlassInput, GlassChip } from '@/components/ui';
import { useSearchStore } from '@/store';
import { usePlaces } from '@/hooks/usePlaces';
import { Place } from '@/types';
import { useRouter } from 'expo-router';
import { CATEGORIES } from '@/constants';

export const SearchScreen: React.FC = () => {
  const { colorScheme } = useTheme();
  const theme = getTheme(colorScheme);
  const { query, setQuery, selectedCategories, toggleCategory, filters, setFilters, recentSearches, addRecentSearch, clearRecentSearches, suggestions, setSuggestions, loading, error, reset } = useSearchStore();
  const { searchNearby } = usePlaces();
  const router = useRouter();

  const handleSearch = async (searchQuery: string) => {
    setQuery(searchQuery);
    if (searchQuery.trim()) {
      addRecentSearch(searchQuery);
      // Perform search
    }
  };

  const handleCategoryPress = (categoryId: string) => {
    toggleCategory(categoryId);
  };

  const handleResultPress = (place: Place) => {
    router.push('/explore');
  };

  const handleClearRecent = () => {
    clearRecentSearches();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.paper }]}>
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={16} style={styles.backButton}>
          <Text style={[styles.backIcon, { color: theme.colors.ink }]}>‹</Text>
        </TouchableOpacity>
        <GlassInput
          style={styles.searchInput}
          value={query}
          onChangeText={handleSearch}
          placeholder="Orte suchen..."
          autoFocus={true}
          onSubmitEditing={() => Keyboard.dismiss()}
        />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {query.length === 0 && (
            <>
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={[
                    styles.sectionTitle,
                    { color: theme.colors.inkSubtle, fontFamily: theme.typography.fontFamily.display },
                  ]}>
                    Kategorien
                  </Text>
                </View>
                <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryChips}>
                  {CATEGORIES.map((category) => (
                    <TouchableOpacity
                      key={category.id}
                      onPress={() => handleCategoryPress(category.id)}
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
              </View>

              {recentSearches.length > 0 && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={[
                      styles.sectionTitle,
                      { color: theme.colors.inkSubtle, fontFamily: theme.typography.fontFamily.display },
                    ]}>
                      Letzte Suchen
                    </Text>
                    <TouchableOpacity onPress={handleClearRecent} hitSlop={8} style={styles.clearButton}>
                      <Text style={[
                        styles.clearText,
                        { color: theme.colors.accent, fontFamily: theme.typography.fontFamily.body },
                      ]}>
                        Alles löschen
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.recentList}>
                    {recentSearches.map((search, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => handleSearch(search)}
                        style={[
                          styles.recentItem,
                          { backgroundColor: theme.colors.glass, borderColor: theme.colors.glassBorder },
                        ]}
                        hitSlop={8}
                      >
                        <Text style={[styles.recentIcon, { color: theme.colors.accent }]}>⌕</Text>
                        <Text style={[
                          styles.recentText,
                          { color: theme.colors.ink, fontFamily: theme.typography.fontFamily.body },
                        ]}>
                          {search}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </>
          )}

          {query.length > 0 && (
            <>
              {suggestions.length > 0 && (
                <View style={styles.section}>
                  <Text style={[
                    styles.sectionTitle,
                    { color: theme.colors.inkSubtle, fontFamily: theme.typography.fontFamily.display },
                  ]}>
                    Vorschläge
                  </Text>
                  <View style={styles.suggestionChips}>
                    {suggestions.map((suggestion) => (
                      <TouchableOpacity
                        key={suggestion}
                        onPress={() => handleSearch(suggestion)}
                        style={[
                          styles.suggestionChip,
                          { backgroundColor: theme.colors.glass, borderColor: theme.colors.glassBorder },
                        ]}
                        hitSlop={8}
                      >
                        <Text style={[
                          styles.suggestionChipText,
                          { color: theme.colors.ink, fontFamily: theme.typography.fontFamily.body },
                        ]}>
                          {suggestion}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {loading && (
                <View style={styles.loadingContainer}>
                  <Text style={[
                    styles.loadingText,
                    { color: theme.colors.inkMuted, fontFamily: theme.typography.fontFamily.body },
                  ]}>
                    Suche...
                  </Text>
                </View>
              )}

              {error && (
                <View style={[styles.errorContainer, { backgroundColor: theme.colors.errorSoft }]}>
                  <Text style={[
                    styles.errorText,
                    { color: theme.colors.error, fontFamily: theme.typography.fontFamily.body },
                  ]}>
                    {error}
                  </Text>
                </View>
              )}

              {suggestions.length === 0 && !loading && !error && (
                <View style={[styles.emptyContainer, { backgroundColor: theme.colors.paperElevated }]}>
                  <Text style={styles.emptyIcon}>🔍</Text>
                  <Text style={[
                    styles.emptyText,
                    { color: theme.colors.inkMuted, fontFamily: theme.typography.fontFamily.body },
                  ]}>
                    Keine Ergebnisse für "{query}"
                  </Text>
                  <Text style={[
                    styles.emptySubtext,
                    { color: theme.colors.inkSubtle, fontFamily: theme.typography.fontFamily.body },
                  ]}>
                    Versuche einen anderen Suchbegriff oder ändere die Filter
                  </Text>
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: { fontSize: 38, lineHeight: 38, fontWeight: '300', includeFontPadding: false },
  searchInput: {
    flex: 1,
    height: 44,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 24,
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    includeFontPadding: false,
  },
  categoryChips: {
    gap: 8,
    paddingHorizontal: 4,
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
  recentList: {
    gap: 8,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  recentIcon: {
    fontSize: 16,
  },
  recentText: {
    fontSize: 15,
    flex: 1,
    includeFontPadding: false,
  },
  clearButton: {
    padding: 4,
  },
  clearText: {
    fontSize: 13,
    fontWeight: '600',
    includeFontPadding: false,
  },
  suggestionChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  suggestionChipText: {
    fontSize: 13,
    fontWeight: '500',
    includeFontPadding: false,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  suggestionImagePlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionImageIcon: {
    fontSize: 24,
  },
  suggestionInfo: {
    flex: 1,
    gap: 4,
  },
  suggestionName: {
    fontSize: 16,
    fontWeight: '600',
    includeFontPadding: false,
  },
  suggestionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  suggestionCategory: {
    fontSize: 12,
    fontWeight: '500',
    includeFontPadding: false,
  },
  suggestionAddress: {
    fontSize: 13,
    includeFontPadding: false,
  },
  suggestionDistance: {
    fontSize: 13,
    fontWeight: '600',
    includeFontPadding: false,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
    includeFontPadding: false,
  },
  errorContainer: {
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    lineHeight: 20,
    includeFontPadding: false,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: 8,
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    includeFontPadding: false,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    includeFontPadding: false,
  },
});

export default SearchScreen;

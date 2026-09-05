import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, SafeAreaView, Image } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme, getTheme } from '@/design-system/ThemeProvider';
import { GlassButton, GlassCard, GlassChip, GlassInput } from '@/components/ui';
import { LiquidSearchBar, LiquidCategoryPill } from '@/components/common';
import { LiquidTabBar } from '@/components/common';
import { useSearchStore } from '@/store';
import { useAuth } from '@/services/auth';
import { useUIStore } from '@/store';
import { CATEGORIES, ERROR_MESSAGES } from '@/constants';
import { useAppNavigation } from '@/hooks/useAppNavigation';
import { usePlaces } from '@/hooks/usePlaces';
import { PlaceBottomSheet } from '@/components/sheets';

export const SearchScreen: React.FC = () => {
  const { colorScheme } = useTheme();
  const theme = getTheme(colorScheme);
  const { user, isSignedIn } = useAuth();
  const { query, selectedCategories, filters, recentSearches, suggestions, loading, error, setQuery, setSelectedCategories, setFilters, addRecentSearch, clearRecentSearches, setSuggestions } = useSearchStore();
  const { bottomSheetVisible, setBottomSheetVisible, tabBarVisible, setTabBarVisible } = useUIStore();
  const router = useAppNavigation();

  const { places, selectedPlace, clusters, searchByQuery, loadPlaceDetails, selectPlace } = usePlaces();

  React.useEffect(() => {
    setTabBarVisible(false);
  }, [setTabBarVisible]);

  const handleSearch = (text: string) => {
    setQuery(text);
  };

  const handleCategoryToggle = (categoryId: string) => {
    const newCategories = selectedCategories.includes(categoryId)
      ? selectedCategories.filter(c => c !== categoryId)
      : [...selectedCategories, categoryId];
    setSelectedCategories(newCategories);
  };

  const handlePlacePress = (place: any) => {
    addRecentSearch(query);
    selectPlace(place);
    loadPlaceDetails(place.id);
    setBottomSheetVisible(true);
  };

  const handleFilterPress = () => {};
  const handleVoicePress = () => {};
  const handleClear = () => setQuery('');
  const handleSuggestionPress = (suggestion: string) => setQuery(suggestion);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= 1) {
        const matchingCategories = CATEGORIES
          .filter(c => c.name.toLowerCase().includes(query.toLowerCase()))
          .map(c => c.name);
        setSuggestions(matchingCategories.slice(0, 5));
      } else {
        setSuggestions([]);
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [query, setSuggestions]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={16} style={styles.backButton}>
          <View style={styles.backIcon} />
        </TouchableOpacity>
        <LiquidSearchBar
          value={query}
          onChangeText={handleSearch}
          placeholder="Search places..."
          onClear={handleClear}
          onFilterPress={handleFilterPress}
          onVoicePress={handleVoicePress}
          showFilter={true}
          showVoice={true}
          autoFocus={true}
        />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>

          {selectedCategories.length > 0 && (
            <View style={styles.chipsContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsContent}>
                {selectedCategories.map((catId) => {
                  const category = CATEGORIES.find(c => c.id === catId);
                  if (!category) return null;
                  return (
                    <GlassChip
                      key={catId}
                      variant="selected"
                      size="sm"
                      removable
                      onRemove={() => handleCategoryToggle(catId)}
                      icon={<Text style={styles.chipIcon}>{category.icon}</Text>}
                      iconPosition="left"
                    >
                      {category.name}
                    </GlassChip>
                  );
                })}
              </ScrollView>
            </View>
          )}

          <View style={styles.categoriesSection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
              Categories
            </Text>
            <LiquidCategoryPill
              categories={CATEGORIES}
              selectedCategories={selectedCategories}
              onCategoryPress={handleCategoryToggle}
              scrollable={true}
            />
          </View>

          {recentSearches.length > 0 && (
            <View style={styles.recentSection}>
              <View style={styles.recentHeader}>
                <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
                  Recent Searches
                </Text>
                <TouchableOpacity onPress={clearRecentSearches} hitSlop={8}>
                  <Text style={[styles.clearText, { color: theme.colors.textTertiary }]}>
                    Clear
                  </Text>
                </TouchableOpacity>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recentContent}>
                {recentSearches.map((search, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleSuggestionPress(search)}
                    style={styles.recentChip}
                    hitSlop={8}
                  >
                    <Text style={styles.recentChipIcon}>🕐</Text>
                    <Text style={[styles.recentChipText, { color: theme.colors.text }]}>
                      {search}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {suggestions.length > 0 && (
            <View style={styles.suggestionsSection}>
              <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
                Suggestions
              </Text>
              {suggestions.map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleSuggestionPress(suggestion)}
                  style={styles.suggestionChip}
                  hitSlop={8}
                >
                  <Text style={styles.suggestionChipIcon}>🔍</Text>
                  <Text style={[styles.suggestionChipText, { color: theme.colors.text }]}>
                    {suggestion}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {query && (
            <View style={styles.resultsSection}>
              <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
                Results
              </Text>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
                    Searching...
                  </Text>
                </View>
              ) : places.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                    {ERROR_MESSAGES.noPlacesFound}
                  </Text>
                  <Text style={[styles.emptySubtext, { color: theme.colors.textTertiary }]}>
                    Try adjusting your search or filters
                  </Text>
                </View>
              ) : (
                <View style={styles.resultsList}>
                  {places.map((place) => (
                    <TouchableOpacity
                      key={place.id}
                      onPress={() => handlePlacePress(place)}
                      style={styles.resultItem}
                      hitSlop={8}
                    >
                      <View style={styles.resultItemContent}>
                        {place.photos[0] && (
                          <Image
                            source={{ uri: place.photos[0].url || `${place.photos[0].prefix}original${place.photos[0].suffix}` }}
                            style={styles.resultImage}
                            resizeMode="cover"
                          />
                        )}
                        {!place.photos[0] && (
                          <View style={[styles.resultImagePlaceholder, { backgroundColor: theme.colors.backgroundTertiary }]}>
                            <Text style={styles.resultImagePlaceholderText}>
                              {place.categories[0]?.icon || '📍'}
                            </Text>
                          </View>
                        )}

                        <View style={styles.resultInfo}>
                          <View style={styles.resultTopRow}>
                            <Text style={[styles.resultName, { color: theme.colors.text }]}>
                              {place.name}
                            </Text>
                            {place.rating && (
                              <View style={styles.resultRating}>
                                <Text style={styles.resultRatingText}>⭐ {place.rating.toFixed(1)}</Text>
                              </View>
                            )}
                          </View>

                          {place.categories[0] && (
                            <View style={styles.resultCategory}>
                              <Text style={[styles.resultCategoryText, { color: theme.colors.textSecondary }]}>
                                {place.categories[0].icon} {place.categories[0].name}
                              </Text>
                            </View>
                          )}

                          {place.location.formatted_address && (
                            <Text style={[styles.resultAddress, { color: theme.colors.textTertiary }]}>
                              {place.location.formatted_address}
                            </Text>
                          )}

                          {place.distance !== undefined && (
                            <View style={styles.resultDistance}>
                              <Text style={[styles.resultDistanceText, { color: theme.colors.primary }]}>
                                📍 {(place.distance / 1000).toFixed(1)} km
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      <PlaceBottomSheet
        place={selectedPlace}
        visible={bottomSheetVisible}
        onClose={() => { selectPlace(null); setBottomSheetVisible(false); }}
        onSave={(place) => {}}
        onDirections={(place) => {}}
        onShare={(place) => {}}
        saved={false}
      />

      <LiquidTabBar
        tabs={[
          { id: 'explore', label: 'Explore', icon: <Text style={styles.tabIcon}>🗺️</Text>, selectedIcon: <Text style={styles.tabIcon}>🗺️</Text> },
          { id: 'ai', label: 'Oria AI', icon: <Text style={styles.tabIcon}>✨</Text>, selectedIcon: <Text style={styles.tabIcon}>✨</Text> },
          { id: 'saved', label: 'Saved', icon: <Text style={styles.tabIcon}>❤️</Text>, selectedIcon: <Text style={styles.tabIcon}>❤️</Text> },
          { id: 'profile', label: 'Profile', icon: <Text style={styles.tabIcon}>👤</Text>, selectedIcon: <Text style={styles.tabIcon}>👤</Text> },
        ]}
        activeTab="explore"
        onTabPress={(tabId) => router.push(`/${tabId}` as any)}
        variant="floating"
        style={styles.tabBar}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FC' },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  backButton: { position: 'absolute', left: 0, top: 8, width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  backIcon: { width: 24, height: 24, borderWidth: 2, borderColor: 'currentColor', borderRadius: 2, transform: [{ rotate: '45deg' }], opacity: 0.6 },
  scrollView: { flex: 1 },
  content: { paddingHorizontal: 16, paddingVertical: 16, gap: 24 },
  chipsContainer: { marginTop: -8 },
  chipsContent: { gap: 8, paddingBottom: 8 },
  chipIcon: { fontSize: 12 },
  categoriesSection: { gap: 12 },
  sectionTitle: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  recentSection: { gap: 12 },
  recentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  clearText: { fontSize: 13, fontWeight: '600' },
  recentContent: { gap: 8 },
  recentChip: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.6)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  recentChipIcon: { fontSize: 14 },
  recentChipText: { fontSize: 14, fontWeight: '500' },
  suggestionsSection: { gap: 10 },
  suggestionChip: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.6)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  suggestionChipIcon: { fontSize: 16 },
  suggestionChipText: { fontSize: 15, fontWeight: '500' },
  resultsSection: { gap: 16 },
  loadingContainer: { paddingVertical: 40, alignItems: 'center' },
  loadingText: { fontSize: 16, fontWeight: '500' },
  emptyContainer: { paddingVertical: 60, alignItems: 'center', gap: 8 },
  emptyText: { fontSize: 18, fontWeight: '600', textAlign: 'center' },
  emptySubtext: { fontSize: 14, textAlign: 'center' },
  resultsList: { gap: 12 },
  resultItem: { borderRadius: 16, overflow: 'hidden' },
  resultItemContent: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.6)' },
  resultImage: { width: 80, height: 80, borderRadius: 12 },
  resultImagePlaceholder: { width: 80, height: 80, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  resultImagePlaceholderText: { fontSize: 28 },
  resultInfo: { flex: 1, padding: 12, justifyContent: 'center', gap: 4 },
  resultTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  resultName: { fontSize: 16, fontWeight: '600', flex: 1, paddingRight: 8 },
  resultRating: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, backgroundColor: 'rgba(255,184,0,0.15)' },
  resultRatingText: { fontSize: 12, fontWeight: '600' },
  resultCategory: { flexDirection: 'row', alignItems: 'center' },
  resultCategoryText: { fontSize: 13 },
  resultAddress: { fontSize: 12, lineHeight: 18 },
  resultDistance: { marginTop: 4 },
  resultDistanceText: { fontSize: 12, fontWeight: '600' },
  tabBar: { position: 'absolute', bottom: 0, left: 16, right: 16, marginBottom: 20 },
  tabIcon: { fontSize: 22 },
});

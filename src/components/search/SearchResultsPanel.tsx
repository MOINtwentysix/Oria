import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Animated, Easing, TextInput, Image } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme, getTheme } from '@/design-system/ThemeProvider';
import { GlassButton, GlassChip, GlassCard, GlassInput, GlassAvatar } from '@/components/ui';
import { LiquidSearchBar, LiquidCategoryPill } from '@/components/common';
import { Place } from '@/types';
import { CATEGORIES, ERROR_MESSAGES } from '@/constants';

interface SearchResultsPanelProps {
  visible: boolean;
  query: string;
  places: Place[];
  selectedCategories: string[];
  filters: any;
  loading: boolean;
  error: string | null;
  onQueryChange: (query: string) => void;
  onCategoryToggle: (categoryId: string) => void;
  onFilterPress: () => void;
  onVoicePress: () => void;
  onPlacePress: (place: Place) => void;
  onClear: () => void;
  onClose: () => void;
  style?: any;
}

export const SearchResultsPanel: React.FC<SearchResultsPanelProps> = ({
  visible,
  query,
  places,
  selectedCategories,
  filters,
  loading,
  error,
  onQueryChange,
  onCategoryToggle,
  onFilterPress,
  onVoicePress,
  onPlacePress,
  onClear,
  onClose,
  style,
}) => {
  const { colorScheme } = useTheme();
  const theme = getTheme(colorScheme);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.panelContainer,
        { opacity: visible ? 1 : 0 },
        style,
      ]}
      pointerEvents={visible ? 'auto' : 'none'}
    >
      <BlurView intensity={90} style={[styles.panel, { backgroundColor: theme.colors.paperOverlay }]}>
        <View style={styles.header}>
          <LiquidSearchBar
            value={query}
            onChangeText={onQueryChange}
            placeholder="Orte suchen..."
            onClear={onClear}
            onFilterPress={onFilterPress}
            onVoicePress={onVoicePress}
            showFilter={true}
            showVoice={true}
            autoFocus={true}
          />
        </View>

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
                    onRemove={() => onCategoryToggle(catId)}
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
          <LiquidCategoryPill
            categories={CATEGORIES}
            selectedCategories={selectedCategories}
            onCategoryPress={onCategoryToggle}
            scrollable={true}
          />
        </View>

        {error && (
          <GlassCard variant="heavy" style={[styles.errorCard, { borderColor: theme.colors.error }]}>
            <View style={styles.errorContent}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={[styles.errorText, { color: theme.colors.error, fontFamily: theme.typography.fontFamily.body }]}>
                {error}
              </Text>
            </View>
          </GlassCard>
        )}

        {loading ? (
          <View style={styles.loadingContainer}>
            <GlassCard variant="heavy" style={styles.loadingCard}>
              <View style={styles.loadingContent}>
                <Text style={[styles.loadingText, { color: theme.colors.inkMuted, fontFamily: theme.typography.fontFamily.body }]}>Sucht...</Text>
              </View>
            </GlassCard>
          </View>
        ) : places.length === 0 && query ? (
          <View style={styles.emptyContainer}>
            <GlassCard variant="heavy" style={styles.emptyCard}>
              <View style={styles.emptyContent}>
                <Text style={styles.emptyIcon}>🔍</Text>
                <Text style={[styles.emptyText, { color: theme.colors.inkMuted, fontFamily: theme.typography.fontFamily.body }]}>{ERROR_MESSAGES.noPlacesFound}</Text>
                <Text style={[styles.emptySubtext, { color: theme.colors.inkSubtle, fontFamily: theme.typography.fontFamily.body }]}>Versuche es mit anderer Suche oder Filtern</Text>
              </View>
            </GlassCard>
          </View>
        ) : (
          <ScrollView style={styles.resultsList} showsVerticalScrollIndicator={false}>
            {places.map((place) => (
              <TouchableOpacity
                key={place.id}
                onPress={() => onPlacePress(place)}
                style={[styles.resultCard, { backgroundColor: theme.colors.paperElevated, borderColor: theme.colors.border }]}
                hitSlop={12}
              >
                <View style={styles.resultImageWrapper}>
                  {place.photos && place.photos[0] && (
                    <Image
                      source={{ uri: place.photos[0].url || `${place.photos[0].prefix}original${place.photos[0].suffix}` }}
                      style={styles.resultImage}
                      resizeMode="cover"
                    />
                  )}
                  {!place.photos && (
                    <View style={[styles.resultImagePlaceholder, { backgroundColor: theme.colors.border }]} />
                  )}
                  {place.saved && (
                    <View style={styles.savedBadge}>
                      <Text style={styles.savedBadgeText}>❤️</Text>
                    </View>
                  )}
                </View>
                <View style={styles.resultInfo}>
                  <View style={styles.resultHeader}>
                    <Text style={[
                      styles.resultName,
                      { color: theme.colors.ink, fontFamily: theme.typography.fontFamily.body },
                    ]} numberOfLines={1}>
                      {place.name}
                    </Text>
                    {place.rating && (
                      <View style={[styles.resultRating, { backgroundColor: theme.colors.accentSoft }]}>
                        <Text style={[styles.resultRatingText, { color: theme.colors.accent, fontFamily: theme.typography.fontFamily.body }]}>⭐ {place.rating.toFixed(1)}</Text>
                      </View>
                    )}
                  </View>
                  {place.categories[0] && (
                    <View style={styles.resultCategory}>
                      <Text style={[
                        styles.resultCategoryText,
                        { color: theme.colors.inkMuted, fontFamily: theme.typography.fontFamily.body },
                      ]}>
                        {place.categories[0].icon || '📍'} {place.categories[0].name}
                      </Text>
                    </View>
                  )}
                  {place.address && (
                    <Text style={[
                      styles.resultAddress,
                      { color: theme.colors.inkSubtle, fontFamily: theme.typography.fontFamily.body },
                    ]} numberOfLines={1}>
                      {place.address}
                    </Text>
                  )}
                  {place.distance && (
                    <View style={styles.resultDistance}>
                      <Text style={[
                        styles.resultDistanceText,
                        { color: theme.colors.accent, fontFamily: theme.typography.fontFamily.body },
                      ]}>
                        {place.distance < 1000 ? `${Math.round(place.distance)}m` : `${(place.distance / 1000).toFixed(1)}km`}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </BlurView>
    </Animated.View>
  );
};

const s0 = StyleSheet.create({
  panelContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 50,
  },
  panel: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  chipsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  chipsContent: {
    gap: 8,
  },
  chipIcon: {
    fontSize: 12,
  },
  categoriesSection: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  errorCard: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  errorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
  },
  errorIcon: {
    fontSize: 20,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingCard: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 15,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyCard: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyContent: {
    alignItems: 'center',
    gap: 10,
  },
  emptyIcon: {
    fontSize: 32,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 13,
    textAlign: 'center',
  },
  resultsList: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 100,
    gap: 10,
  },
  resultCard: {
    flexDirection: 'row',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
  },
  resultImageWrapper: {
    position: 'relative',
    width: 96,
    height: 96,
  },
  resultImage: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  resultImagePlaceholder: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  savedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  savedBadgeText: {
    fontSize: 14,
  },
  resultInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  resultName: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    paddingRight: 8,
  },
  resultRating: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  resultRatingText: {
    fontSize: 12,
    fontWeight: '600',
  },
  resultCategory: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultCategoryText: {
    fontSize: 13,
  },
  resultAddress: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 4,
  },
  resultDistance: {
    marginTop: 4,
  },
  resultDistanceText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

interface SearchSuggestionsProps {
  visible: boolean;
  suggestions: string[];
  recentSearches: string[];
  onSuggestionPress: (suggestion: string) => void;
  onClearRecent: () => void;
  style?: any;
}

export const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({
  visible,
  suggestions,
  recentSearches,
  onSuggestionPress,
  onClearRecent,
  style,
}) => {
  const { colorScheme } = useTheme();
  const theme = getTheme(colorScheme);

  if (!visible || (suggestions.length === 0 && recentSearches.length === 0)) return null;

  return (
    <Animated.View
      style={[
        styles.suggestionsContainer,
        { opacity: visible ? 1 : 0 },
        style,
      ]}
      pointerEvents={visible ? 'auto' : 'none'}
    >
      <BlurView intensity={90} style={[styles.suggestionsPanel, { backgroundColor: theme.colors.paperOverlay }]}>
        {suggestions.length > 0 && (
          <View style={styles.suggestionsSection}>
            <Text style={[styles.suggestionsTitle, { color: theme.colors.inkSubtle, fontFamily: theme.typography.fontFamily.display }]}>
              Vorschläge
            </Text>
            {suggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => onSuggestionPress(suggestion)}
                style={styles.suggestionItem}
                hitSlop={12}
              >
                <Text style={[styles.suggestionIcon, { color: theme.colors.accent }]}>🔍</Text>
                <Text style={[styles.suggestionText, { color: theme.colors.ink, fontFamily: theme.typography.fontFamily.body }]}>{suggestion}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {recentSearches.length > 0 && (
          <View style={styles.suggestionsSection}>
            <View style={styles.recentHeader}>
              <Text style={[styles.suggestionsTitle, { color: theme.colors.inkSubtle, fontFamily: theme.typography.fontFamily.display }]}>
                Kürzlich
              </Text>
              <TouchableOpacity onPress={onClearRecent} hitSlop={8}>
                <Text style={[styles.clearRecentText, { color: theme.colors.accent, fontFamily: theme.typography.fontFamily.body }]}>Löschen</Text>
              </TouchableOpacity>
            </View>
            {recentSearches.map((search, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => onSuggestionPress(search)}
                style={styles.suggestionItem}
                hitSlop={12}
              >
                <Text style={[styles.suggestionIcon, { color: theme.colors.inkSubtle }]}>🕐</Text>
                <Text style={[styles.suggestionText, { color: theme.colors.ink, fontFamily: theme.typography.fontFamily.body }]}>{search}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </BlurView>
    </Animated.View>
  );
};

const s1 = StyleSheet.create({
  suggestionsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 60,
  },
  suggestionsPanel: {
    flex: 1,
    paddingTop: 120,
    backgroundColor: 'transparent',
  },
  suggestionsSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  suggestionsTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  clearRecentText: {
    fontSize: 13,
    fontWeight: '600',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
  },
  suggestionIcon: {
    fontSize: 18,
    width: 24,
  },
  suggestionText: {
    flex: 1,
    fontSize: 15,
  },
});
const styles = { ...s0, ...s1 };

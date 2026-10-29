import React, { useEffect, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import * as Location from 'expo-location';
import {
  Search,
  X,
  Crosshair,
  Map as MapIcon,
  List as ListIcon,
} from 'lucide-react-native';
import { CategoryType, Place } from '../types';
import { BorderRadius, Colors, Shadows, Spacing } from '../constants/theme';
import { CategoryPills } from '../components/CategoryPills';
import { PlaceCard } from '../components/PlaceCard';
import { MapViewComponent } from '../components/MapViewComponent';
import { PlaceDetailModal } from '../components/PlaceDetailModal';
import { SaveToListModal } from '../components/SaveToListModal';
import { LiquidGlassView } from '../components/LiquidGlassView';
import {
  fetchNearbyPlaces,
  geocodeLocation,
  searchPlacesNominatim,
} from '../services/overpass';
import { isPlaceSaved } from '../services/storage';

interface ExploreScreenProps {
  onOpenRoutePlanner?: (initialPlace?: Place) => void;
}

// Default to a world-class culturally rich city if location permission is not granted
const DEFAULT_COORDS = { latitude: 48.137154, longitude: 11.576124, city: 'Munich' };

export function ExploreScreen({ onOpenRoutePlanner }: ExploreScreenProps) {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  // State
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number }>(
    DEFAULT_COORDS
  );
  const [locationName, setLocationName] = useState<string>('Munich');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all');
  const [places, setPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

  // Modals state
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [isDetailVisible, setIsDetailVisible] = useState<boolean>(false);
  const [isSaveModalVisible, setIsSaveModalVisible] = useState<boolean>(false);
  const [placeToSave, setPlaceToSave] = useState<Place | null>(null);
  const [savedStatusMap, setSavedStatusMap] = useState<Record<string, boolean>>({});

  // 1. Load places from real OpenStreetMap Overpass
  const loadPlaces = useCallback(
    async (lat: number, lon: number, category: CategoryType) => {
      setIsLoading(true);
      try {
        const data = await fetchNearbyPlaces(lat, lon, category, 2500);
        setPlaces(data);

        // Check saved status
        const statusMap: Record<string, boolean> = {};
        for (const p of data.slice(0, 15)) {
          statusMap[p.id] = await isPlaceSaved(p.id);
        }
        setSavedStatusMap(statusMap);
      } catch (err) {
        console.error('Failed to load places:', err);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // 2. Initialize location with privacy-conscious explanation
  const requestLocation = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        const coords = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        };
        setUserLocation(coords);
        setLocationName('Current Location');
        loadPlaces(coords.latitude, coords.longitude, selectedCategory);
        return;
      }
    } catch (e) {
      console.warn('Location permission request skipped or unavailable:', e);
    }

    // Fallback gracefully to default city
    loadPlaces(DEFAULT_COORDS.latitude, DEFAULT_COORDS.longitude, selectedCategory);
  }, [loadPlaces, selectedCategory]);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  // 3. Category change
  const handleCategorySelect = (category: CategoryType) => {
    setSelectedCategory(category);
    loadPlaces(userLocation.latitude, userLocation.longitude, category);
  };

  // 4. Search submit
  const handleSearchSubmit = async () => {
    if (!searchQuery.trim()) return;
    Keyboard.dismiss();
    setIsLoading(true);

    try {
      const geocoded = await geocodeLocation(searchQuery.trim());
      if (geocoded) {
        setUserLocation({
          latitude: geocoded.latitude,
          longitude: geocoded.longitude,
        });
        setLocationName(searchQuery.trim());
        await loadPlaces(geocoded.latitude, geocoded.longitude, selectedCategory);
      } else {
        const results = await searchPlacesNominatim(searchQuery.trim());
        setPlaces(results);
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    loadPlaces(userLocation.latitude, userLocation.longitude, selectedCategory);
  };

  const handleSelectPlace = (place: Place) => {
    setSelectedPlace(place);
    setIsDetailVisible(true);
  };

  const handleOpenSaveModal = (place: Place) => {
    setPlaceToSave(place);
    setIsSaveModalVisible(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Floating Apple Header */}
      <SafeAreaView style={styles.headerSafeArea}>
        <View style={styles.topHeader}>
          {/* Liquid Glass Search Bar */}
          <LiquidGlassView
            intensity={90}
            borderRadius={BorderRadius.full}
            style={[
              styles.searchBar,
              {
                backgroundColor:
                  scheme === 'dark'
                    ? 'rgba(28, 28, 30, 0.82)'
                    : 'rgba(255, 255, 255, 0.88)',
              },
              Shadows.medium,
            ]}
          >
            <Search size={18} color={colors.textSecondary} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder={`Search in ${locationName}...`}
              placeholderTextColor={colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearchSubmit}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={handleClearSearch} style={styles.clearBtn}>
                <X size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </LiquidGlassView>

          {/* Quick toggle Map / List view */}
          <TouchableOpacity
            style={[
              styles.toggleViewBtn,
              {
                backgroundColor:
                  scheme === 'dark'
                    ? 'rgba(28, 28, 30, 0.85)'
                    : 'rgba(255, 255, 255, 0.88)',
                borderColor: colors.cardBorder,
              },
              Shadows.soft,
            ]}
            onPress={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
          >
            {viewMode === 'map' ? (
              <ListIcon size={18} color={colors.text} />
            ) : (
              <MapIcon size={18} color={colors.text} />
            )}
          </TouchableOpacity>
        </View>

        {/* Category Pills Slider */}
        <CategoryPills
          selectedCategory={selectedCategory}
          onSelectCategory={handleCategorySelect}
        />
      </SafeAreaView>

      {/* Main Content: Map View or List View */}
      {viewMode === 'map' ? (
        <View style={styles.mapContainer}>
          <MapViewComponent
            places={places}
            userLocation={userLocation}
            selectedPlace={selectedPlace}
            onSelectPlace={handleSelectPlace}
          />

          {/* Recenter / Relocate button */}
          <TouchableOpacity
            style={[
              styles.recenterBtn,
              {
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.cardBorder,
              },
              Shadows.medium,
            ]}
            onPress={requestLocation}
          >
            <Crosshair size={20} color={colors.primary} />
          </TouchableOpacity>

          {/* Bottom Places Carousel on top of Map */}
          <View style={styles.carouselContainer} pointerEvents="box-none">
            {isLoading ? (
              <View
                style={[
                  styles.loadingCard,
                  { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder },
                  Shadows.soft,
                ]}
              >
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                  Discovering real places with OpenStreetMap...
                </Text>
              </View>
            ) : places.length === 0 ? (
              <View
                style={[
                  styles.loadingCard,
                  { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder },
                  Shadows.soft,
                ]}
              >
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                  No places found nearby. Try another category!
                </Text>
              </View>
            ) : (
              <FlatList
                horizontal
                data={places.slice(0, 10)}
                keyExtractor={(item) => item.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.carouselScroll}
                renderItem={({ item }) => (
                  <PlaceCard
                    place={item}
                    layout="vertical"
                    isSaved={savedStatusMap[item.id]}
                    onPress={() => handleSelectPlace(item)}
                    onSavePress={() => handleOpenSaveModal(item)}
                    onDirectionsPress={() => handleSelectPlace(item)}
                  />
                )}
              />
            )}
          </View>
        </View>
      ) : (
        <View style={styles.listContainer}>
          {isLoading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.centerText, { color: colors.textSecondary }]}>
                Searching verified places...
              </Text>
            </View>
          ) : (
            <FlatList
              data={places}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.flatListContent}
              renderItem={({ item }) => (
                <PlaceCard
                  place={item}
                  layout="horizontal"
                  isSaved={savedStatusMap[item.id]}
                  onPress={() => handleSelectPlace(item)}
                  onSavePress={() => handleOpenSaveModal(item)}
                  onDirectionsPress={() => handleSelectPlace(item)}
                />
              )}
            />
          )}
        </View>
      )}

      {/* Place Details Half-Sheet Modal */}
      <PlaceDetailModal
        place={selectedPlace}
        visible={isDetailVisible}
        onClose={() => setIsDetailVisible(false)}
        onSaveToList={handleOpenSaveModal}
        onAddToRoute={(p) => {
          if (onOpenRoutePlanner) onOpenRoutePlanner(p);
        }}
        isSaved={selectedPlace ? savedStatusMap[selectedPlace.id] : false}
      />

      {/* Save to Collection Modal */}
      <SaveToListModal
        place={placeToSave}
        visible={isSaveModalVisible}
        onClose={() => setIsSaveModalVisible(false)}
        onListsUpdated={async () => {
          if (placeToSave) {
            const saved = await isPlaceSaved(placeToSave.id);
            setSavedStatusMap((prev) => ({ ...prev, [placeToSave.id]: saved }));
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerSafeArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Platform.OS === 'android' ? 44 : 8,
    paddingBottom: Spacing.xs,
    gap: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 46,
    paddingHorizontal: 14,
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    height: '100%',
  },
  clearBtn: {
    padding: 4,
  },
  toggleViewBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  listContainer: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 140 : 120,
  },
  flatListContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 110,
  },
  recenterBtn: {
    position: 'absolute',
    right: 16,
    top: Platform.OS === 'android' ? 140 : 124,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    zIndex: 50,
  },
  carouselContainer: {
    position: 'absolute',
    bottom: 96,
    left: 0,
    right: 0,
    zIndex: 50,
  },
  carouselScroll: {
    paddingHorizontal: Spacing.lg,
  },
  loadingCard: {
    marginHorizontal: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
  },
  loadingText: {
    fontSize: 13,
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: 12,
  },
  centerText: {
    fontSize: 14,
  },
});

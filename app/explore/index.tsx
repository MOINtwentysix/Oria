import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme, getTheme } from '@/design-system/ThemeProvider';
import { GlassButton, GlassAvatar } from '@/components/ui';
import { LiquidTabBar } from '@/components/common';
import { useAuth } from '@/services/auth';
import { useUIStore, useUserStore, useSavedStore } from '@/store';
import { useRouter } from 'expo-router';
import { useLocation } from '@/hooks/useLocation';
import { usePlaces } from '@/hooks/usePlaces';
import { ExploreMap, MapControls } from '@/components/map';
import { PlaceBottomSheet } from '@/components/sheets';

export default function ExploreScreen() {
  const { colorScheme } = useTheme();
  const theme = getTheme(colorScheme);
  const { user, isSignedIn } = useAuth();
  const { bottomSheetVisible, setBottomSheetVisible, tabBarVisible, setTabBarVisible } = useUIStore();
  const { savedPlaces, lists, addSavedPlace, createList, updateList } = useSavedStore();
  const { currentLocation, loading: locationLoading, requestPermission, getCurrentLocation } = useLocation();
  const { places, selectedPlace, clusters, loading: placesLoading, searchNearby, loadPlaceDetails, selectPlace } = usePlaces();

  const router = useRouter();

  React.useEffect(() => {
    setTabBarVisible(true);
    const loadPlaces = async () => {
      const location = currentLocation || await getCurrentLocation();
      const center = location || { latitude: 52.52, longitude: 13.405 };
      await searchNearby(center.latitude, center.longitude);
    };
    loadPlaces();
  }, []);

  const handlePlacePress = (place: any) => {
    selectPlace(place);
    loadPlaceDetails(place.id);
    setBottomSheetVisible(true);
  };

  const handleMapPress = () => {
    selectPlace(null);
    setBottomSheetVisible(false);
  };

  const handleMyLocation = async () => {
    const permissionGranted = await requestPermission();
    if (!permissionGranted) return;
    getCurrentLocation().then(loc => {
      if (loc) {
        // Animate map to user location
      }
    });
  };

  const handleSavePlace = async (place: any) => {
    if (!isSignedIn || !user) {
      router.push('/auth');
      return;
    }
    if (savedPlaces.some((savedPlace: any) => savedPlace.place_id === place.id)) return;

    const targetList = lists.find((list) => list.is_default) || lists[0] || await createList(user.id, 'Favoriten');
    addSavedPlace({
      id: `saved-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      user_id: user.id,
      place_id: place.id,
      place_data: place,
      list_id: targetList?.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    if (targetList) {
      updateList({ ...targetList, place_count: (targetList.place_count || 0) + 1, updated_at: new Date().toISOString() });
    }
    setBottomSheetVisible(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.paper }]}>
      <View style={styles.mapContainer}>
        <ExploreMap
          places={places}
          selectedPlaceId={selectedPlace?.id || null}
          clusters={clusters}
          onPlacePress={handlePlacePress}
          onMapPress={handleMapPress}
          onRegionChange={() => {}}
          userLocation={currentLocation}
          followUser={false}
          showUserLocation={true}
          showsMyLocationButton={false}
          showsCompass={true}
          mapType="standard"
        />

        <View style={styles.topBar}>
          <BlurView intensity={80} style={[
            styles.topBarInner,
            { backgroundColor: colorScheme === 'dark' ? 'rgba(13,27,30,0.9)' : 'rgba(254,251,246,0.94)' },
          ]}>
            <View style={styles.topBarContent}>
              <Text style={[
                styles.title,
                { color: theme.colors.ink, fontFamily: theme.typography.fontFamily.display },
              ]}>
                Oria
              </Text>
              <TouchableOpacity onPress={() => router.push('/explore/search')} hitSlop={12} style={styles.searchTrigger}>
                <View style={[
                  styles.searchTriggerInner,
                  { backgroundColor: theme.colors.glass, borderColor: theme.colors.glassBorder },
                ]}>
                  <Text style={styles.searchTriggerIcon}>⌕</Text>
                  <Text style={[
                    styles.searchTriggerText,
                    { color: theme.colors.inkSubtle, fontFamily: theme.typography.fontFamily.body },
                  ]}>
                    Orte suchen...
                  </Text>
                </View>
              </TouchableOpacity>
              {isSignedIn && (
                <TouchableOpacity onPress={() => router.push('/profile')} hitSlop={12} style={styles.avatarButton}>
                  <GlassAvatar name={user?.firstName} uri={user?.imageUrl} size="sm" />
                </TouchableOpacity>
              )}
            </View>
          </BlurView>
        </View>

        <MapControls
          onMyLocation={handleMyLocation}
          onMapStyleChange={() => {}}
          currentMapStyle="standard"
          onZoomIn={() => {}}
          onZoomOut={() => {}}
          style={styles.mapControls}
        />
      </View>

      <PlaceBottomSheet
        visible={bottomSheetVisible}
        onClose={() => setBottomSheetVisible(false)}
        place={selectedPlace}
        onSave={handleSavePlace}
        isSaved={savedPlaces.some((p: any) => p.place_id === selectedPlace?.id)}
        onNavigate={() => {}}
        onShare={() => {}}
      />

      <LiquidTabBar
        tabs={[
          { id: 'explore', label: 'Entdecken', icon: <Text style={styles.tabIcon}>🗺️</Text>, selectedIcon: <Text style={styles.tabIcon}>🗺️</Text> },
          { id: 'ai', label: 'Oria AI', icon: <Text style={styles.tabIcon}>✨</Text>, selectedIcon: <Text style={styles.tabIcon}>✨</Text> },
          { id: 'saved', label: 'Gespeichert', icon: <Text style={styles.tabIcon}>❤️</Text>, selectedIcon: <Text style={styles.tabIcon}>❤️</Text> },
          { id: 'profile', label: 'Profil', icon: <Text style={styles.tabIcon}>👤</Text>, selectedIcon: <Text style={styles.tabIcon}>👤</Text> },
        ]}
        activeTab="explore"
        onTabPress={(tabId) => router.push(`/${tabId}` as any)}
        variant="floating"
        style={styles.tabBar}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    flex: 1,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingTop: 8,
    paddingHorizontal: 16,
  },
  topBarInner: {
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(13,27,30,0.05)',
  },
  topBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    includeFontPadding: false,
  },
  searchTrigger: {
    flex: 1,
    marginHorizontal: 16,
  },
  searchTriggerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  searchTriggerIcon: {
    fontSize: 20,
  },
  searchTriggerText: {
    fontSize: 15,
    fontWeight: '400',
    includeFontPadding: false,
  },
  avatarButton: {
    padding: 4,
  },
  mapControls: {
    position: 'absolute',
    right: 16,
    bottom: 120,
  },
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 16,
    right: 16,
    marginBottom: 20,
  },
  tabIcon: {
    fontSize: 22,
  },
});

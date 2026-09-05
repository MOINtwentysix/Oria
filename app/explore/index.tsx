import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme, getTheme } from '@/design-system/ThemeProvider';
import { GlassButton, GlassAvatar } from '@/components/ui';
import { LiquidTabBar } from '@/components/common';
import { useAuth } from '@/services/auth';
import { useUIStore, useUserStore } from '@/store';
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
  const { currentLocation, loading: locationLoading, getCurrentLocation } = useLocation();
  const { places, selectedPlace, clusters, loading: placesLoading, searchNearby, loadPlaceDetails, selectPlace } = usePlaces();

  const router = useRouter();

  React.useEffect(() => {
    setTabBarVisible(true);
    if (currentLocation) {
      searchNearby(currentLocation.latitude, currentLocation.longitude);
    } else {
      getCurrentLocation().then(loc => {
        if (loc) {
          searchNearby(loc.latitude, loc.longitude);
        }
      });
    }
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

  const handleMyLocation = () => {
    getCurrentLocation().then(loc => {
      if (loc) {
        // Animate map to user location
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
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
          <BlurView intensity={80} style={styles.topBarInner}>
            <View style={styles.topBarContent}>
              <Text style={[
                styles.title,
                { color: theme.colors.text },
              ]}>
                Oria
              </Text>
              <TouchableOpacity onPress={() => router.push('/explore/search')} hitSlop={12} style={styles.searchTrigger}>
                <View style={styles.searchTriggerInner}>
                  <Text style={styles.searchTriggerIcon}>\ud83d\udd0d</Text>
                  <Text style={[
                    styles.searchTriggerText,
                    { color: theme.colors.textSecondary },
                  ]}>
                    Search places...
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
          { id: 'explore', label: 'Explore', icon: <Text style={styles.tabIcon}>\ud83d\uddfa\ufe0f</Text>, selectedIcon: <Text style={styles.tabIcon}>\ud83d\uddfa\ufe0f</Text> },
          { id: 'ai', label: 'Oria AI', icon: <Text style={styles.tabIcon}>\u2728</Text>, selectedIcon: <Text style={styles.tabIcon}>\u2728</Text> },
          { id: 'saved', label: 'Saved', icon: <Text style={styles.tabIcon}>\u2764\ufe0f</Text>, selectedIcon: <Text style={styles.tabIcon}>\u2764\ufe0f</Text> },
          { id: 'profile', label: 'Profile', icon: <Text style={styles.tabIcon}>\ud83d\udc64</Text>, selectedIcon: <Text style={styles.tabIcon}>\ud83d\udc64</Text> },
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
    backgroundColor: '#F7F9FC',
  },
  mapContainer: {
    flex: 1,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    paddingTop: 0,
  },
  topBarInner: {
    borderRadius: 0,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  topBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  searchTrigger: {
    flex: 1,
    maxWidth: 280,
    marginHorizontal: 16,
  },
  searchTriggerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  searchTriggerIcon: {
    fontSize: 18,
  },
  searchTriggerText: {
    fontSize: 15,
    fontWeight: '500',
  },
  avatarButton: {
    padding: 4,
  },
  mapControls: {
    top: 140,
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

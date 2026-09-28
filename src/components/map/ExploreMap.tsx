import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Animated, Easing, Image, ScrollView, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme, getTheme } from '@/design-system/ThemeProvider';
import { GlassCard, GlassButton, GlassChip, GlassAvatar } from '@/components/ui';
import { Place, Coordinates } from '@/types';
import { MAP_CONFIG } from '@/constants';

let MapView: any = null;
let Marker: any = null;
let Callout: any = null;
let MapViewProps: any = {};

if (Platform.OS !== 'web') {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
  Callout = Maps.Callout;
  MapViewProps = Maps.MapViewProps || {};
}

interface MapPinProps {
  place: Place;
  selected?: boolean;
  onPress: () => void;
  clusterCount?: number;
}

const MapPin: React.FC<MapPinProps> = ({ place, selected, onPress, clusterCount }) => {
  const { colorScheme } = useTheme();
  const theme = getTheme(colorScheme);

  const [pressAnim] = React.useState(new Animated.Value(1));

  const handlePressIn = () => {
    Animated.timing(pressAnim, {
      toValue: 0.85,
      duration: 60,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(pressAnim, {
      toValue: 1,
      duration: 150,
      easing: Easing.out(Easing.back(2)),
      useNativeDriver: true,
    }).start();
  };

  if (clusterCount && clusterCount > 1) {
    return (
      <Animated.View
        style={[styles.clusterPin, {
          width: MAP_CONFIG.clusterMinSize + Math.min(clusterCount, 20) * 1.5,
          height: MAP_CONFIG.clusterMinSize + Math.min(clusterCount, 20) * 1.5,
          backgroundColor: theme.colors.pinCluster,
          transform: [{ scale: pressAnim }],
        }]}
      >
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}
          style={styles.clusterPinInner}
        >
          <Text style={styles.clusterCount}>{clusterCount}</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  const pinColor = selected ? theme.colors.pinSelected : theme.colors.pinDefault;
  const pinSize = selected ? MAP_CONFIG.selectedPinSize : MAP_CONFIG.pinSize;

  return (
    <Animated.View style={[styles.pinWrapper, { transform: [{ scale: pressAnim }] }]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        hitSlop={8}
      >
        <View style={[
          styles.pin,
          {
            width: pinSize,
            height: pinSize,
            backgroundColor: pinColor,
            borderColor: theme.colors.paper,
            borderWidth: 3,
            shadowColor: pinColor,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.4,
            shadowRadius: 8,
            elevation: 6,
          },
        ]}>
          {place.categories[0] && (
            <Text style={styles.pinIcon}>
              {place.categories[0].icon || '📍'}
            </Text>
          )}
        </View>
        {selected && (
          <View style={styles.pinShadow}>
            <View style={[styles.pinShadowInner, { backgroundColor: pinColor }]} />
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const s1 = StyleSheet.create({
  pinWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pin: {
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinIcon: {
    fontSize: 18,
  },
  pinShadow: {
    position: 'absolute',
    bottom: -4,
    width: 20,
    height: 8,
  },
  pinShadowInner: {
    width: 20,
    height: 8,
    borderRadius: 10,
    opacity: 0.3,
  },
  clusterPin: {
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  clusterPinInner: {
    width: '100%',
    height: '100%',
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  clusterCount: {
    color: 'white',
    fontWeight: '800',
    fontSize: 14,
  },
});

interface ExploreMapProps {
  places: Place[];
  selectedPlaceId: string | null;
  clusters: Map<string, Place[]>;
  onPlacePress: (place: Place) => void;
  onMapPress: (coordinates: Coordinates) => void;
  onRegionChange: (region: any) => void;
  userLocation: Coordinates | null;
  followUser: boolean;
  onFollowUserChange: (follow: boolean) => void;
  mapStyle: 'standard' | 'satellite';
  onMapStyleChange: (style: string) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export const ExploreMap: React.FC<ExploreMapProps> = ({
  places,
  selectedPlaceId,
  clusters,
  onPlacePress,
  onMapPress,
  onRegionChange,
  userLocation,
  followUser,
  onFollowUserChange,
  mapStyle,
  onMapStyleChange,
  onZoomIn,
  onZoomOut,
}) => {
  const { colorScheme } = useTheme();
  const theme = getTheme(colorScheme);

  const mapRef = React.useRef<MapView>(null);

  const handleMapPress = (event: any) => {
    if (event.nativeEvent.coordinate) {
      onMapPress(event.nativeEvent.coordinate);
    }
  };

  const renderPins = () => {
    if (Platform.OS === 'web') {
      return renderWebPins();
    }

    return (
      <>
        {Array.from(clusters.entries()).map(([clusterId, clusterPlaces]) => {
          if (clusterPlaces.length === 1) {
            const place = clusterPlaces[0];
            return (
              <Marker
                key={place.id}
                coordinate={place.coordinates}
                onPress={() => onPlacePress(place)}
              >
                <MapPin place={place} selected={place.id === selectedPlaceId} onPress={() => onPlacePress(place)} />
              </Marker>
            );
          }
          const centerLat = clusterPlaces.reduce((sum, p) => sum + p.coordinates.latitude, 0) / clusterPlaces.length;
          const centerLng = clusterPlaces.reduce((sum, p) => sum + p.coordinates.longitude, 0) / clusterPlaces.length;
          return (
            <Marker
              key={clusterId}
              coordinate={{ latitude: centerLat, longitude: centerLng }}
              onPress={() => onPlacePress(clusterPlaces[0])}
            >
              <MapPin place={clusterPlaces[0]} clusterCount={clusterPlaces.length} onPress={() => onPlacePress(clusterPlaces[0])} />
            </Marker>
          );
        })}
      </>
    );
  };

  const renderWebPins = () => {
    const center = userLocation || { latitude: 52.52, longitude: 13.405 };
    const scale = 100000;

    return (
      <>
        <View style={[
          styles.webUserLocation,
          { 
            left: '50%', 
            top: '50%',
            backgroundColor: theme.colors.accent,
            borderColor: theme.colors.paper,
            shadowColor: theme.colors.accent,
          }
        ]} />
        {places.map((place) => {
          const deltaLat = (place.coordinates.latitude - center.latitude) * scale;
          const deltaLng = (place.coordinates.longitude - center.longitude) * scale;
          const isSelected = place.id === selectedPlaceId;
          return (
            <View
              key={place.id}
              style={[
                styles.webPlaceMarker,
                {
                  left: `calc(50% + ${deltaLng}px)`,
                  top: `calc(50% - ${deltaLat}px)`,
                  borderColor: isSelected ? theme.colors.accent : theme.colors.border,
                  backgroundColor: isSelected ? theme.colors.accentSoft : theme.colors.paper,
                },
              ]}
              onClick={() => onPlacePress(place)}
            >
              <Text style={[
                styles.webPlaceMarkerText,
                { color: isSelected ? theme.colors.paper : theme.colors.ink },
              ]}>
                {place.categories[0]?.icon || '📍'}
              </Text>
            </View>
          );
        })}
      </>
    );
  };

  const mapProps: any = {
    ref: mapRef,
    style: Platform.OS === 'web' ? styles.webMap : styles.map,
    onPress: handleMapPress,
    onRegionChange: onRegionChange,
    onRegionChangeComplete: onRegionChange,
    initialRegion: userLocation
      ? { latitude: userLocation.latitude, longitude: userLocation.longitude, latitudeDelta: 0.02, longitudeDelta: 0.02 }
      : { latitude: 52.52, longitude: 13.405, latitudeDelta: 0.02, longitudeDelta: 0.02 },
    showsUserLocation: true,
    showsMyLocationButton: false,
    showsCompass: false,
    showsScale: false,
    showsTraffic: false,
    showsBuildings: true,
    showsIndoors: false,
    mapType: mapStyle,
    followsUserLocation: followUser,
    rotateEnabled: true,
    scrollEnabled: true,
    zoomEnabled: true,
    pitchEnabled: true,
    minZoomLevel: MAP_CONFIG.minZoom,
    maxZoomLevel: MAP_CONFIG.maxZoom,
    ...mapProps,
  };

  if (Platform.OS === 'web') {
    return (
      <View style={styles.webMapContainer}>
        <View style={[
          styles.webMap,
          { backgroundColor: theme.colors.paper },
        ]} {...mapProps}>
          {renderPins()}
        </View>
        <View style={styles.webMapAttribution}>
          <Text style={[
            styles.webMapAttributionText,
            { color: theme.colors.inkSubtle },
          ]}>© OpenStreetMap contributors</Text>
        </View>
        <View style={styles.webPlaceList}>
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.webPlaceListContent}>
            {places.map((place) => (
              <TouchableOpacity
                key={place.id}
                onPress={() => onPlacePress(place)}
                style={[
                  styles.webPlaceCard,
                  place.id === selectedPlaceId && styles.webPlaceCardSelected,
                ]}
              >
                <Text style={[
                  styles.webPlaceName,
                  { color: theme.colors.ink, fontFamily: theme.typography.fontFamily.body },
                ]} numberOfLines={1}>
                  {place.name}
                </Text>
                <Text style={[
                  styles.webPlaceCategory,
                  { color: theme.colors.inkMuted, fontFamily: theme.typography.fontFamily.body },
                ]} numberOfLines={1}>
                  {place.categories[0]?.name || 'Place'}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    );
  }

  return (
    <MapView {...mapProps}>
      {renderPins()}
    </MapView>
  );
};

const s0 = StyleSheet.create({
  map: {
    flex: 1,
  },
  webMapContainer: {
    flex: 1,
    minHeight: 360,
    overflow: 'hidden',
  },
  webMap: {
    flex: 1,
    minHeight: 360,
    overflow: 'hidden',
  },
  webUserLocation: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: 18,
    height: 18,
    marginLeft: -9,
    marginTop: -9,
    borderRadius: 9,
    borderWidth: 3,
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 5,
  },
  webPlaceMarker: {
    position: 'absolute',
    width: 32,
    height: 32,
    marginLeft: -16,
    marginTop: -16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
    zIndex: 4,
  },
  webPlaceMarkerText: {
    fontSize: 16,
  },
  webMapAttribution: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  webMapAttributionText: {
    fontSize: 10,
  },
  webPlaceList: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
  },
  webPlaceListContent: {
    gap: 8,
  },
  webPlaceCard: {
    width: 150,
    padding: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.94)',
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 6,
    elevation: 3,
  },
  webPlaceCardSelected: {
    borderWidth: 2,
  },
  webPlaceName: {
    fontSize: 13,
    fontWeight: '700',
  },
  webPlaceCategory: {
    fontSize: 11,
    marginTop: 3,
  },
});

export interface MapControlsProps {
  onMyLocation: () => void;
  onMapStyleChange: (style: string) => void;
  currentMapStyle: string;
  onZoomIn: () => void;
  onZoomOut: () => void;
  style?: any;
}

export const MapControls: React.FC<MapControlsProps> = ({
  onMyLocation,
  onMapStyleChange,
  currentMapStyle,
  onZoomIn,
  onZoomOut,
  style,
}) => {
  const { colorScheme } = useTheme();
  const theme = getTheme(colorScheme);

  return (
    <View style={[styles.controlsContainer, style]}>
      <GlassCard variant="heavy" style={styles.controlGroup}>
        <TouchableOpacity onPress={onZoomIn} hitSlop={12} style={styles.controlButton} accessibilityLabel="Zoom in">
          <Text style={styles.controlButtonText}>+</Text>
        </TouchableOpacity>
        <View style={styles.controlDivider} />
        <TouchableOpacity onPress={onZoomOut} hitSlop={12} style={styles.controlButton} accessibilityLabel="Zoom out">
          <Text style={styles.controlButtonText}>−</Text>
        </TouchableOpacity>
      </GlassCard>

      <GlassCard variant="heavy" style={[styles.controlGroup, { marginTop: 12 }]}>
        <TouchableOpacity onPress={onMyLocation} hitSlop={12} style={styles.controlButton} accessibilityLabel="My location">
          <View style={[styles.locationIcon, { backgroundColor: theme.colors.accent }]} />
        </TouchableOpacity>
      </GlassCard>

      <GlassCard variant="heavy" style={[styles.controlGroup, { marginTop: 12 }]}>
        <TouchableOpacity onPress={() => onMapStyleChange(currentMapStyle === 'standard' ? 'satellite' : 'standard')} hitSlop={12} style={styles.controlButton} accessibilityLabel="Toggle map style">
          <Text style={styles.controlButtonText}>
            {currentMapStyle === 'standard' ? '🛰' : '🗺'}
          </Text>
        </TouchableOpacity>
      </GlassCard>
    </View>
  );
};

const s2 = StyleSheet.create({
  controlsContainer: {
    position: 'absolute',
    top: 60,
    right: 16,
    zIndex: 10,
  },
  controlGroup: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  controlButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlButtonText: {
    fontSize: 20,
    fontWeight: '700',
  },
  controlDivider: {
    width: 1,
    height: '60%',
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  locationIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'white',
  },
});
const styles = { ...s0, ...s1, ...s2 };

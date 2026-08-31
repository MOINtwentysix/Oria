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
        style={[
          styles.clusterPin,
          {
            width: MAP_CONFIG.clusterMinSize + Math.min(clusterCount, 20) * 1.5,
            height: MAP_CONFIG.clusterMinSize + Math.min(clusterCount, 20) * 1.5,
            backgroundColor: theme.colors.pinCluster,
            transform: [{ scale: pressAnim }],
          },
        ]}
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
    <Animated.View
      style={[
        styles.pinWrapper,
        { transform: [{ scale: pressAnim }] },
      ]}
    >
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
            borderColor: colorScheme === 'dark' ? theme.colors.background : theme.colors.background,
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
            <View style={[
              styles.pinShadowInner,
              { backgroundColor: pinColor },
            ]} />
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
  style?: any;
  showUserLocation?: boolean;
  showsMyLocationButton?: boolean;
  showsCompass?: boolean;
  showsScale?: boolean;
  showsTraffic?: boolean;
  showsBuildings?: boolean;
  showsIndoors?: boolean;
  mapType?: 'standard' | 'satellite' | 'hybrid' | 'terrain' | 'mutedStandard';
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
  style,
  showUserLocation = true,
  showsMyLocationButton = false,
  showsCompass = true,
  showsScale = false,
  showsTraffic = false,
  showsBuildings = true,
  showsIndoors = true,
  mapType = 'standard',
  ...mapProps
}) => {
  const { colorScheme } = useTheme();
  const theme = getTheme(colorScheme);

  if (Platform.OS === 'web') {
    return (
      <View style={[{ flex: 1, backgroundColor: colorScheme === 'dark' ? '#1E293B' : '#E2E8F0', alignItems: 'center', justifyContent: 'center' }, style]}>
        <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '600' }}>Map</Text>
        <Text style={{ color: theme.colors.textSecondary, fontSize: 13, marginTop: 4 }}>{places.length} places</Text>
      </View>
    );
  }

  const [mapRef, setMapRef] = React.useState<any>(null);

  const handleRegionChange = (region: any) => {
    onRegionChange(region);
  };

  const handleMapPress = (event: any) => {
    onMapPress({
      latitude: event.nativeEvent.coordinate.latitude,
      longitude: event.nativeEvent.coordinate.longitude,
    });
  };

  const renderPins = () => {
    if (clusters.size > 0) {
      return Array.from(clusters.entries()).map(([key, clusterPlaces]) => {
        const [latStr, lngStr] = key.split(',');
        const latitude = parseFloat(latStr);
        const longitude = parseFloat(lngStr);
        const representative = clusterPlaces[0];

        return (
          <Marker
            key={key}
            coordinate={{ latitude, longitude }}
            onPress={() => onPlacePress(representative)}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <MapPin place={representative} clusterCount={clusterPlaces.length} onPress={() => onPlacePress(representative)} />
          </Marker>
        );
      });
    }

    return places.map((place) => (
      <Marker
        key={place.id}
        coordinate={{
          latitude: place.location.latitude,
          longitude: place.location.longitude,
        }}
        onPress={() => onPlacePress(place)}
        anchor={{ x: 0.5, y: 0.5 }}
        tracksViewChanges={false}
      >
        <MapPin
          place={place}
          selected={place.id === selectedPlaceId}
          onPress={() => onPlacePress(place)}
        />
      </Marker>
    ));
  };

  const mapStyle = [
    styles.map,
    { backgroundColor: colorScheme === 'dark' ? '#1E293B' : '#E2E8F0' },
    style,
  ];

  return (
    <MapView
      ref={setMapRef}
      style={mapStyle}
      initialRegion={{
        latitude: userLocation?.latitude || 52.5200,
        longitude: userLocation?.longitude || 13.4050,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }}
      onRegionChange={handleRegionChange}
      onRegionChangeComplete={handleRegionChange}
      onPress={handleMapPress}
      showsUserLocation={showUserLocation}
      showsMyLocationButton={showsMyLocationButton}
      showsCompass={showsCompass}
      showsScale={showsScale}
      showsTraffic={showsTraffic}
      showsBuildings={showsBuildings}
      showsIndoors={showsIndoors}
      mapType={mapType}
      followsUserLocation={followUser}
      rotateEnabled={true}
      scrollEnabled={true}
      zoomEnabled={true}
      pitchEnabled={true}
      minZoomLevel={MAP_CONFIG.minZoom}
      maxZoomLevel={MAP_CONFIG.maxZoom}
      {...mapProps}
    >
      {renderPins()}
    </MapView>
  );
};

const s0 = StyleSheet.create({
  map: {
    flex: 1,
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
          <View style={[
            styles.locationIcon,
            { backgroundColor: theme.colors.primary },
          ]} />
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

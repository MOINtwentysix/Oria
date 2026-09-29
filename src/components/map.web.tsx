import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Coordinates, Place } from '@/core/types';
import { theme } from '@/core/theme';

type MapCanvasProps = {
  center?: Coordinates;
  places: Place[];
  selectedPlace?: Place | null;
  userLocation?: Coordinates | null;
  onSelect: (place: Place) => void;
  onCenterChange?: (center: Coordinates) => void;
};

const LeafletMap = React.lazy(() => import('./leaflet-map.web'));

export function MapCanvas(props: MapCanvasProps) {
  const [ready, setReady] = React.useState(false);
  React.useEffect(() => setReady(true), []);

  if (!ready) return <MapFallback label="Karte wird vorbereitet …" />;
  return <React.Suspense fallback={<MapFallback label="Karte wird geladen …" />}><LeafletMap {...props} /></React.Suspense>;
}

function MapFallback({ label }: { label: string }) {
  return <View style={styles.fallback}><View style={styles.orbit}><ActivityIndicator color={theme.colors.moss} /><Text style={styles.label}>{label}</Text></View></View>;
}

const styles = StyleSheet.create({
  fallback: { flex: 1, backgroundColor: theme.colors.mapWater, alignItems: 'center', justifyContent: 'center' },
  orbit: { alignItems: 'center', gap: 12 },
  label: { color: theme.colors.muted, fontSize: 13, fontWeight: '700' },
});

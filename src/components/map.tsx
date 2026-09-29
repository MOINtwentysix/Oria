import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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

export function MapCanvas({ center = { latitude: 52.52, longitude: 13.405 }, places, onSelect, onCenterChange }: MapCanvasProps) {
  if (Platform.OS !== 'web') {
    try {
      const Maps = require('react-native-maps'); const MapView = Maps.default; const Marker = Maps.Marker;
      return <MapView style={styles.map} initialRegion={{ ...center, latitudeDelta: 0.055, longitudeDelta: 0.055 }} onRegionChangeComplete={(region: any) => onCenterChange?.({ latitude: region.latitude, longitude: region.longitude })}>{places.map((place) => <Marker key={place.id} coordinate={{ latitude: place.latitude, longitude: place.longitude }} onPress={() => onSelect(place)} title={place.name} />)}</MapView>;
    } catch { /* A small fallback keeps the native screen usable without a maps provider. */ }
  }
  return <View style={styles.webMap}><View style={styles.grid} />{places.slice(0, 18).map((place, index) => <TouchableOpacity key={place.id} onPress={() => onSelect(place)} style={[styles.pin, { left: `${8 + ((index * 37) % 78)}%`, top: `${10 + ((index * 53) % 70)}%` }]}><Text style={styles.pinText}>{place.icon}</Text></TouchableOpacity>)}<Text style={styles.mapNote}>Karte wird geladen …</Text></View>;
}
const styles = StyleSheet.create({ map: { flex: 1 }, webMap: { flex: 1, backgroundColor: '#DDE8DD', overflow: 'hidden' }, grid: { ...StyleSheet.absoluteFill, opacity: 0.45, borderWidth: 24, borderColor: '#EAF0E7' }, pin: { position: 'absolute', width: 38, height: 38, borderRadius: 19, backgroundColor: theme.colors.signal, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: theme.colors.surface }, pinText: { fontSize: 16 }, mapNote: { position: 'absolute', top: 110, left: 20, color: theme.colors.night, fontSize: 13, fontFamily: 'Almarai' } });

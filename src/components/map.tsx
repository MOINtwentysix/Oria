import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Place } from '@/core/types';
import { theme } from '@/core/theme';

export function MapCanvas({ places, onSelect }: { places: Place[]; onSelect: (place: Place) => void }) {
  if (Platform.OS !== 'web') {
    try { const MapView = require('react-native-maps').default; const Marker = require('react-native-maps').Marker; return <MapView style={styles.map} initialRegion={{ latitude: 52.52, longitude: 13.405, latitudeDelta: 0.07, longitudeDelta: 0.07 }}>{places.map((place) => <Marker key={place.id} coordinate={{ latitude: place.latitude, longitude: place.longitude }} onPress={() => onSelect(place)} title={place.name} />)}</MapView>; } catch { /* fall through */ }
  }
  return <View style={styles.webMap}><View style={styles.grid} />{places.slice(0, 18).map((place, index) => <TouchableOpacity key={place.id} onPress={() => onSelect(place)} style={[styles.pin, { left: `${8 + ((index * 37) % 78)}%`, top: `${10 + ((index * 53) % 70)}%` }]}><Text style={styles.pinText}>{place.icon}</Text></TouchableOpacity>)}<Text style={styles.mapNote}>Karte · Orte in deiner Nähe</Text></View>;
}
const styles = StyleSheet.create({ map: { flex: 1 }, webMap: { flex: 1, backgroundColor: '#DDE8DD', overflow: 'hidden' }, grid: { ...StyleSheet.absoluteFill, opacity: 0.45, borderWidth: 24, borderColor: '#EAF0E7' }, pin: { position: 'absolute', width: 38, height: 38, borderRadius: 19, backgroundColor: theme.colors.signal, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: theme.colors.surface }, pinText: { fontSize: 16 }, mapNote: { position: 'absolute', top: 110, left: 20, color: theme.colors.night, fontSize: 13, fontFamily: 'Almarai' } });

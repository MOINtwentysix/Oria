import React from 'react';
import * as Location from 'expo-location';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { MapCanvas } from '@/components/map';
import { TabBar } from '@/components/ui';
import { Coordinates, Place } from '@/core/types';
import { theme } from '@/core/theme';
import { discoverPlaces } from '@/services/places';
import { useAppState } from '@/core/state';

const berlin = { latitude: 52.52, longitude: 13.405 };
const filters = [
  { id: 'all', label: 'Alles' },
  { id: 'food', label: 'Essen' },
  { id: 'coffee', label: 'Kaffee' },
  { id: 'culture', label: 'Kultur' },
  { id: 'outside', label: 'Draußen' },
] as const;
type FilterId = (typeof filters)[number]['id'];

const distanceLabel = (distance?: number) => !distance ? 'in deiner Nähe' : distance < 1000 ? `${distance} m entfernt` : `${(distance / 1000).toFixed(1).replace('.', ',')} km entfernt`;
const matchesFilter = (place: Place, filter: FilterId) => {
  if (filter === 'all') return true;
  const category = place.category.toLowerCase();
  if (filter === 'food') return /restaurant|bar|pub|fast food|biergarten/.test(category);
  if (filter === 'coffee') return /cafe|bakery/.test(category);
  if (filter === 'culture') return /museum|gallery|theatre|library|arts centre|attraction/.test(category);
  return /park|garden|nature reserve|viewpoint/.test(category);
};

export default function Explore() {
  const router = useRouter();
  const { addSaved, removeSaved, saved, pendingPlace, setPendingPlace } = useAppState();
  const [mapCenter, setMapCenter] = React.useState<Coordinates>(berlin);
  const [loadedCenter, setLoadedCenter] = React.useState<Coordinates>(berlin);
  const [userLocation, setUserLocation] = React.useState<Coordinates | null>(null);
  const [places, setPlaces] = React.useState<Place[]>([]);
  const [selected, setSelected] = React.useState<Place | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [filter, setFilter] = React.useState<FilterId>('all');
  const [locationNote, setLocationNote] = React.useState('Berlin');

  const load = React.useCallback(async (at: Coordinates) => {
    setLoading(true); setError(null);
    try {
      const next = await discoverPlaces(at);
      setPlaces(next); setLoadedCenter(at);
    } catch {
      setPlaces([]); setError('Orte konnten gerade nicht geladen werden.');
    } finally { setLoading(false); }
  }, []);

  const locate = React.useCallback(async () => {
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') {
        setUserLocation(null); setLocationNote('Berlin'); setMapCenter(berlin); await load(berlin); return;
      }
      const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const at = { latitude: current.coords.latitude, longitude: current.coords.longitude };
      setUserLocation(at); setLocationNote('Deine Umgebung'); setMapCenter(at); await load(at);
    } catch {
      setUserLocation(null); setLocationNote('Berlin'); setMapCenter(berlin); await load(berlin);
    }
  }, [load]);

  React.useEffect(() => { void locate(); }, [locate]);
  React.useEffect(() => {
    if (!pendingPlace) return;
    setMapCenter({ latitude: pendingPlace.latitude, longitude: pendingPlace.longitude });
    setSelected(pendingPlace); setPendingPlace(null);
  }, [pendingPlace, setPendingPlace]);

  const visiblePlaces = React.useMemo(() => places.filter((place) => matchesFilter(place, filter)), [filter, places]);
  const areaChanged = Math.abs(mapCenter.latitude - loadedCenter.latitude) > 0.001 || Math.abs(mapCenter.longitude - loadedCenter.longitude) > 0.001;
  const savedAlready = selected ? saved.some((place) => place.id === selected.id) : false;
  const toggleSaved = () => { if (!selected) return; if (savedAlready) removeSaved(selected.id); else addSaved(selected); };

  return <SafeAreaView style={styles.page}>
    <View style={styles.mapArea}>
      <MapCanvas center={mapCenter} userLocation={userLocation} places={visiblePlaces} selectedPlace={selected} onSelect={setSelected} onCenterChange={setMapCenter} />

      <View style={styles.topArea} pointerEvents="box-none">
        <View style={styles.brandRow}>
          <View><Text style={styles.wordmark}>oria</Text><Text style={styles.location}>{locationNote}</Text></View>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Meinen Standort anzeigen" onPress={() => void locate()} style={styles.locate}><Text style={styles.locateIcon}>◎</Text></TouchableOpacity>
        </View>
        <TouchableOpacity accessibilityRole="button" onPress={() => router.push('/explore/search')} style={styles.search}><Text style={styles.searchIcon}>⌕</Text><Text style={styles.searchText}>Orte, Kategorien, Namen</Text><Text style={styles.searchArrow}>›</Text></TouchableOpacity>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          {filters.map((item) => <TouchableOpacity key={item.id} accessibilityRole="button" accessibilityState={{ selected: filter === item.id }} onPress={() => setFilter(item.id)} style={[styles.filter, filter === item.id && styles.filterActive]}><Text style={[styles.filterText, filter === item.id && styles.filterTextActive]}>{item.label}</Text></TouchableOpacity>)}
        </ScrollView>
      </View>

      {areaChanged && <TouchableOpacity onPress={() => void load(mapCenter)} style={styles.searchArea}><Text style={styles.searchAreaText}>In diesem Bereich suchen</Text></TouchableOpacity>}
      {loading && <View style={styles.loading}><ActivityIndicator color={theme.colors.moss} /><Text style={styles.loadingText}>Orte werden gesucht</Text></View>}
      {error && <View style={styles.error}><Text style={styles.errorText}>{error}</Text><TouchableOpacity onPress={() => void load(loadedCenter)}><Text style={styles.retry}>Erneut versuchen</Text></TouchableOpacity></View>}

      {!loading && !error && !selected && <View style={styles.placeRail}>
        <Text style={styles.railTitle}>{visiblePlaces.length ? `${visiblePlaces.length} passende Orte` : 'Keine Orte in dieser Kategorie'}</Text>
        {visiblePlaces.slice(0, 3).map((place) => <TouchableOpacity key={place.id} onPress={() => setSelected(place)} style={styles.railPlace}><Text style={styles.railIcon}>{place.icon}</Text><View style={styles.railCopy}><Text numberOfLines={1} style={styles.railName}>{place.name}</Text><Text numberOfLines={1} style={styles.railMeta}>{place.category} · {distanceLabel(place.distance)}</Text></View><Text style={styles.railArrow}>›</Text></TouchableOpacity>)}
      </View>}

      {selected && <View style={styles.sheet}>
        <View style={styles.sheetHandle} />
        <View style={styles.sheetTop}><View style={styles.placeBadge}><Text style={styles.placeBadgeText}>{selected.icon}</Text></View><View style={styles.sheetCopy}><Text numberOfLines={1} style={styles.placeName}>{selected.name}</Text><Text style={styles.placeMeta}>{selected.category} · {distanceLabel(selected.distance)}</Text></View><TouchableOpacity accessibilityRole="button" accessibilityLabel="Ort schließen" onPress={() => setSelected(null)} style={styles.close}><Text style={styles.closeText}>×</Text></TouchableOpacity></View>
        <Text numberOfLines={1} style={styles.address}>{selected.address || 'Ort in deiner Nähe'}</Text>
        <TouchableOpacity accessibilityRole="button" onPress={toggleSaved} style={[styles.save, savedAlready && styles.saveActive]}><Text style={[styles.saveText, savedAlready && styles.saveTextActive]}>{savedAlready ? 'In Gemerkte' : 'Ort merken'}</Text><Text style={[styles.saveMark, savedAlready && styles.saveTextActive]}>{savedAlready ? '✓' : '+'}</Text></TouchableOpacity>
      </View>}
    </View>
    <TabBar floating />
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: theme.colors.night },
  mapArea: { flex: 1, overflow: 'hidden' },
  topArea: { position: 'absolute', top: 8, left: 14, right: 14, gap: 10 },
  brandRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  wordmark: { color: theme.colors.white, fontSize: 31, fontWeight: '900', letterSpacing: -1.5 },
  location: { color: theme.colors.moss, fontSize: 12, fontWeight: '700', marginTop: -2 },
  locate: { width: 46, height: 46, borderRadius: 16, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.line, alignItems: 'center', justifyContent: 'center' },
  locateIcon: { color: theme.colors.moss, fontSize: 25, lineHeight: 25 },
  search: { minHeight: 54, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 18, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.line, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 14, elevation: 8 },
  searchIcon: { color: theme.colors.moss, fontSize: 23, lineHeight: 24 }, searchText: { flex: 1, color: theme.colors.ink, fontSize: 14, fontWeight: '600' }, searchArrow: { color: theme.colors.muted, fontSize: 25 },
  filters: { gap: 8, paddingRight: 18 }, filter: { paddingHorizontal: 15, paddingVertical: 10, borderRadius: 999, backgroundColor: 'rgba(6, 27, 43, 0.84)', borderWidth: 1, borderColor: 'rgba(166, 189, 199, 0.34)' }, filterActive: { backgroundColor: theme.colors.moss, borderColor: theme.colors.moss }, filterText: { color: theme.colors.ink, fontSize: 13, fontWeight: '700' }, filterTextActive: { color: theme.colors.night },
  searchArea: { position: 'absolute', top: 178, alignSelf: 'center', backgroundColor: theme.colors.moss, borderRadius: 999, paddingHorizontal: 17, paddingVertical: 11, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 8 }, searchAreaText: { color: theme.colors.night, fontSize: 13, fontWeight: '800' },
  loading: { position: 'absolute', top: 180, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 99, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.line }, loadingText: { color: theme.colors.ink, fontSize: 12, fontWeight: '700' },
  error: { position: 'absolute', top: 180, left: 22, right: 22, padding: 14, borderRadius: 16, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.danger, alignItems: 'center', gap: 7 }, errorText: { color: theme.colors.ink, fontSize: 13, textAlign: 'center' }, retry: { color: theme.colors.signal, fontSize: 13, fontWeight: '800' },
  placeRail: { position: 'absolute', left: 14, right: 14, bottom: 85, padding: 14, gap: 4, borderRadius: 22, backgroundColor: 'rgba(13, 42, 59, 0.96)', borderWidth: 1, borderColor: theme.colors.line, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.24, shadowRadius: 18, elevation: 10 }, railTitle: { color: theme.colors.moss, fontSize: 12, fontWeight: '800', marginBottom: 4 }, railPlace: { minHeight: 49, flexDirection: 'row', alignItems: 'center', gap: 10 }, railIcon: { width: 32, height: 32, borderRadius: 11, backgroundColor: theme.colors.signalSoft, color: theme.colors.signal, overflow: 'hidden', textAlign: 'center', lineHeight: 32, fontSize: 15 }, railCopy: { flex: 1 }, railName: { color: theme.colors.ink, fontSize: 14, fontWeight: '800' }, railMeta: { color: theme.colors.muted, fontSize: 11, marginTop: 2 }, railArrow: { color: theme.colors.moss, fontSize: 24 },
  sheet: { position: 'absolute', left: 12, right: 12, bottom: 82, padding: 16, borderRadius: 24, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.line, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 24, elevation: 15 }, sheetHandle: { alignSelf: 'center', width: 36, height: 4, borderRadius: 4, backgroundColor: theme.colors.line, marginBottom: 13 }, sheetTop: { flexDirection: 'row', alignItems: 'center', gap: 11 }, placeBadge: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.signalSoft }, placeBadgeText: { color: theme.colors.signal, fontSize: 22 }, sheetCopy: { flex: 1 }, placeName: { color: theme.colors.ink, fontSize: 17, fontWeight: '800' }, placeMeta: { color: theme.colors.moss, fontSize: 12, fontWeight: '700', marginTop: 3 }, close: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surfaceRaised }, closeText: { color: theme.colors.muted, fontSize: 22, lineHeight: 23 }, address: { color: theme.colors.muted, fontSize: 12, marginTop: 11 }, save: { minHeight: 46, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, marginTop: 14, borderRadius: 14, backgroundColor: theme.colors.moss }, saveActive: { backgroundColor: theme.colors.mossSoft, borderWidth: 1, borderColor: theme.colors.moss }, saveText: { color: theme.colors.night, fontSize: 14, fontWeight: '800' }, saveTextActive: { color: theme.colors.moss }, saveMark: { color: theme.colors.night, fontSize: 18, fontWeight: '800' },
});

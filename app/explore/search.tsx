import React from 'react';
import * as Location from 'expo-location';
import { ActivityIndicator, FlatList, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Place } from '@/core/types';
import { discoverPlaces } from '@/services/places';
import { theme } from '@/core/theme';
import { useAppState } from '@/core/state';

const berlin = { latitude: 52.52, longitude: 13.405 };

export default function Search() {
  const router = useRouter();
  const setPendingPlace = useAppState((state) => state.setPendingPlace);
  const [query, setQuery] = React.useState('');
  const [items, setItems] = React.useState<Place[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [center, setCenter] = React.useState(berlin);
  const [locationName, setLocationName] = React.useState('Berlin');

  React.useEffect(() => {
    void (async () => {
      try {
        const permission = await Location.getForegroundPermissionsAsync();
        if (permission.status !== 'granted') return;
        const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setCenter({ latitude: current.coords.latitude, longitude: current.coords.longitude }); setLocationName('deiner Umgebung');
      } catch { /* Berlin stays a helpful, explicit fallback. */ }
    })();
  }, []);

  const search = React.useCallback(async () => {
    const term = query.trim(); if (!term || loading) return;
    setLoading(true); setError(null);
    try { setItems(await discoverPlaces(center, term)); }
    catch { setItems([]); setError('Die Suche ist gerade nicht erreichbar.'); }
    finally { setLoading(false); }
  }, [center, loading, query]);

  const pick = (place: Place) => { setPendingPlace(place); router.back(); };
  return <SafeAreaView style={styles.page}>
    <View style={styles.header}>
      <TouchableOpacity accessibilityRole="button" accessibilityLabel="Zurück zur Karte" onPress={() => router.back()} style={styles.back}><Text style={styles.backText}>‹</Text></TouchableOpacity>
      <View style={styles.inputShell}><Text style={styles.searchIcon}>⌕</Text><TextInput autoFocus value={query} onChangeText={setQuery} onSubmitEditing={() => void search()} returnKeyType="search" placeholder="Ort oder Kategorie suchen" placeholderTextColor={theme.colors.muted} style={styles.input} /><TouchableOpacity accessibilityRole="button" onPress={() => void search()} style={styles.submit}><Text style={styles.submitText}>Los</Text></TouchableOpacity></View>
    </View>
    <Text style={styles.context}>Suche in {locationName}</Text>
    {loading ? <View style={styles.state}><ActivityIndicator color={theme.colors.moss} /><Text style={styles.stateText}>Orte werden durchsucht</Text></View> : <FlatList data={items} keyExtractor={(item) => item.id} contentContainerStyle={styles.results} ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyTitle}>{error || (query ? 'Keine passenden Orte gefunden' : 'Wohin soll es gehen?')}</Text><Text style={styles.emptyCopy}>{error ? 'Versuche es gleich noch einmal.' : 'Suche zum Beispiel nach Café, Park, Museum oder einem konkreten Namen.'}</Text>{error && <TouchableOpacity onPress={() => void search()} style={styles.retry}><Text style={styles.retryText}>Erneut versuchen</Text></TouchableOpacity>}</View>} renderItem={({ item }) => <TouchableOpacity accessibilityRole="button" onPress={() => pick(item)} style={styles.row}><View style={styles.iconWrap}><Text style={styles.icon}>{item.icon}</Text></View><View style={styles.copy}><Text numberOfLines={1} style={styles.name}>{item.name}</Text><Text numberOfLines={1} style={styles.meta}>{item.category}{item.distance ? ` · ${item.distance < 1000 ? `${item.distance} m` : `${(item.distance / 1000).toFixed(1)} km`}` : ''}</Text>{item.address ? <Text numberOfLines={1} style={styles.address}>{item.address}</Text> : null}</View><Text style={styles.chevron}>›</Text></TouchableOpacity>} />}
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: theme.colors.paper, paddingHorizontal: 14 },
  header: { flexDirection: 'row', gap: 10, alignItems: 'center', paddingTop: 8 },
  back: { width: 44, height: 50, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.line }, backText: { color: theme.colors.ink, fontSize: 35, lineHeight: 35 },
  inputShell: { flex: 1, minHeight: 50, paddingLeft: 13, flexDirection: 'row', alignItems: 'center', borderRadius: 16, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.line }, searchIcon: { color: theme.colors.moss, fontSize: 22 }, input: { flex: 1, minWidth: 0, color: theme.colors.ink, fontSize: 15, paddingHorizontal: 9, paddingVertical: 13 }, submit: { alignSelf: 'stretch', justifyContent: 'center', paddingHorizontal: 14, borderTopRightRadius: 15, borderBottomRightRadius: 15, backgroundColor: theme.colors.moss }, submitText: { color: theme.colors.night, fontSize: 13, fontWeight: '800' },
  context: { color: theme.colors.moss, fontSize: 12, fontWeight: '700', marginLeft: 56, marginTop: 9, marginBottom: 8 },
  results: { paddingBottom: 30, flexGrow: 1 },
  state: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }, stateText: { color: theme.colors.muted, fontSize: 13 },
  empty: { alignItems: 'center', paddingHorizontal: 28, paddingTop: 100 }, emptyTitle: { color: theme.colors.ink, fontSize: 19, fontWeight: '800', textAlign: 'center' }, emptyCopy: { color: theme.colors.muted, fontSize: 14, lineHeight: 21, textAlign: 'center', marginTop: 8 }, retry: { marginTop: 18, paddingHorizontal: 16, paddingVertical: 11, borderRadius: 12, backgroundColor: theme.colors.mossSoft, borderWidth: 1, borderColor: theme.colors.moss }, retryText: { color: theme.colors.moss, fontWeight: '800' },
  row: { minHeight: 72, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 6, borderBottomWidth: 1, borderColor: theme.colors.line }, iconWrap: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: theme.colors.signalSoft }, icon: { color: theme.colors.signal, fontSize: 19 }, copy: { flex: 1 }, name: { color: theme.colors.ink, fontSize: 15, fontWeight: '800' }, meta: { color: theme.colors.moss, fontSize: 12, fontWeight: '700', marginTop: 3 }, address: { color: theme.colors.muted, fontSize: 11, marginTop: 2 }, chevron: { color: theme.colors.moss, fontSize: 25 },
});

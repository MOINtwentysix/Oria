import { Coordinates, Place } from '@/core/types';

const ICONS: Record<string, string> = { cafe: '☕', restaurant: '🍽', bar: '◒', park: '●', museum: '▣', attraction: '◇', bakery: '◐' };
const label = (value: string) => value.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
const distance = (a: Coordinates, b: Coordinates) => {
  const lat = (b.latitude - a.latitude) * 111_320;
  const lng = (b.longitude - a.longitude) * 111_320 * Math.cos(a.latitude * Math.PI / 180);
  return Math.round(Math.hypot(lat, lng));
};

export async function discoverPlaces(center: Coordinates, query = ''): Promise<Place[]> {
  const selector = query ? `["name"~"${query.replace(/["\\]/g, '')}",i]` : '["name"]';
  const overpass = `[out:json][timeout:12];(nwr${selector}(around:3200,${center.latitude},${center.longitude})[amenity];nwr${selector}(around:3200,${center.latitude},${center.longitude})[tourism];nwr${selector}(around:3200,${center.latitude},${center.longitude})[leisure];);out center 36;`;
  const response = await fetch('https://overpass-api.de/api/interpreter', { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: overpass });
  if (!response.ok) throw new Error('Orte konnten nicht geladen werden.');
  const data = await response.json();
  return (data.elements || []).map((entry: any): Place | null => {
    const latitude = entry.lat ?? entry.center?.lat;
    const longitude = entry.lon ?? entry.center?.lon;
    const tags = entry.tags || {};
    if (!latitude || !longitude || !tags.name) return null;
    const kind = tags.amenity || tags.tourism || tags.leisure || 'place';
    return { id: `osm-${entry.type}-${entry.id}`, name: tags.name, category: label(kind), icon: ICONS[kind] || '⌖', latitude, longitude, address: [tags['addr:street'], tags['addr:housenumber'], tags['addr:city']].filter(Boolean).join(' '), distance: distance(center, { latitude, longitude }) };
  }).filter(Boolean).sort((a: Place, b: Place) => (a.distance || 0) - (b.distance || 0));
}

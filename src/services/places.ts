import { Coordinates, Place } from '@/core/types';

type OverpassElement = {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

const ICONS: Record<string, string> = {
  cafe: '☕', restaurant: '🍽', bar: '◒', pub: '◒', bakery: '◐', fast_food: '◉', biergarten: '◒',
  park: '●', garden: '●', nature_reserve: '●', museum: '▣', gallery: '▣', theatre: '◈',
  attraction: '◇', viewpoint: '◇', library: '▤', arts_centre: '◈',
};

const title = (value: string) => value.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());

const metresBetween = (a: Coordinates, b: Coordinates) => {
  const lat = (b.latitude - a.latitude) * 111_320;
  const lng = (b.longitude - a.longitude) * 111_320 * Math.cos(a.latitude * Math.PI / 180);
  return Math.round(Math.hypot(lat, lng));
};

const toPlace = (entry: OverpassElement, center: Coordinates): Place | null => {
  const latitude = entry.lat ?? entry.center?.lat;
  const longitude = entry.lon ?? entry.center?.lon;
  const tags = entry.tags || {};
  if (latitude === undefined || longitude === undefined || !tags.name) return null;
  const kind = tags.amenity || tags.tourism || tags.leisure || 'place';
  const address = [tags['addr:street'], tags['addr:housenumber'], tags['addr:postcode'], tags['addr:city']].filter(Boolean).join(' ');
  return {
    id: `osm-${entry.type}-${entry.id}`,
    name: tags.name,
    category: title(kind),
    icon: ICONS[kind] || '⌖',
    latitude,
    longitude,
    address,
    distance: metresBetween(center, { latitude, longitude }),
  };
};

async function requestPlaces(center: Coordinates, query: string) {
  const params = new URLSearchParams({ latitude: String(center.latitude), longitude: String(center.longitude) });
  if (query) params.set('q', query);
  const response = await fetch(`/api/places?${params.toString()}`);
  if (!response.ok) throw new Error('Die Orte sind gerade nicht erreichbar.');
  const data = await response.json() as { elements?: OverpassElement[] };
  return data.elements || [];
}

// Local development has no Vercel function. Keep the same data source available
// there, while production uses the server-side proxy above.
async function requestPlacesDirectly(center: Coordinates, query: string) {
  const escaped = query.replace(/[\\^$.*+?()[\]{}|]/g, '\\$&').replace(/"/g, '');
  const named = query ? `["name"~"${escaped}",i]` : '["name"]';
  const around = `(around:1800,${center.latitude},${center.longitude})`;
  const overpass = `[out:json][timeout:12];(node${named}${around}["amenity"~"cafe|restaurant|bar|pub|bakery|fast_food|biergarten|library|arts_centre|theatre"];node${named}${around}["tourism"~"museum|gallery|attraction|viewpoint"];node${named}${around}["leisure"~"park|garden|nature_reserve"];);out 60;`;
  const endpoints = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter'];
  let lastError: unknown;
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${endpoint}?data=${encodeURIComponent(overpass)}`, { headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error(`Overpass returned ${response.status}`);
      const data = await response.json() as { elements?: OverpassElement[] };
      return data.elements || [];
    } catch (error) { lastError = error; }
  }
  throw lastError || new Error('Die Orte sind gerade nicht erreichbar.');
}

export async function discoverPlaces(center: Coordinates, query = ''): Promise<Place[]> {
  let elements: OverpassElement[];
  try { elements = await requestPlaces(center, query.trim()); }
  catch { elements = await requestPlacesDirectly(center, query.trim()); }
  const seen = new Set<string>();
  return elements
    .map((entry) => toPlace(entry, center))
    .filter((place): place is Place => Boolean(place))
    .filter((place) => !seen.has(place.id) && Boolean(seen.add(place.id)))
    .sort((a, b) => (a.distance || 0) - (b.distance || 0));
}

import { Coordinates, Place } from '@/core/types';

type OverpassElement = {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};
type NominatimResult = { osm_type: string; osm_id: number; lat: string; lon: string; name?: string; display_name: string; category?: string; type?: string; address?: Record<string, string> };

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

const pause = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

// Local development has no Vercel function. Use Nominatim as a fast, public
// fallback there (and if a proxy happens to be unavailable in production).
async function requestPlacesDirectly(center: Coordinates, query: string) {
  const terms = query ? [query.slice(0, 80)] : ['cafe', 'restaurant', 'museum'];
  const longitudeDelta = 0.035; const latitudeDelta = 0.024;
  const viewbox = [center.longitude - longitudeDelta, center.latitude + latitudeDelta, center.longitude + longitudeDelta, center.latitude - latitudeDelta].join(',');
  const elements: OverpassElement[] = [];
  for (const [index, term] of terms.entries()) {
    const params = new URLSearchParams({ q: term, format: 'jsonv2', limit: '20', addressdetails: '1', bounded: '1', viewbox });
    const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error(`Nominatim returned ${response.status}`);
    const results = await response.json() as NominatimResult[];
    elements.push(...results.map((result) => {
      const address = result.address || {};
      const category = ['amenity', 'tourism', 'leisure'].includes(result.category || '') ? result.category as 'amenity' | 'tourism' | 'leisure' : 'amenity';
      return { type: result.osm_type, id: Number(result.osm_id), lat: Number(result.lat), lon: Number(result.lon), tags: { name: result.name || result.display_name.split(',')[0], [category]: result.type || 'place', 'addr:street': address.road || '', 'addr:housenumber': address.house_number || '', 'addr:postcode': address.postcode || '', 'addr:city': address.city || address.town || address.village || '' } };
    }));
    if (index < terms.length - 1) await pause(1050);
  }
  return elements;
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

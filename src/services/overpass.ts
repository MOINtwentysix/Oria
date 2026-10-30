import { CategoryType, GeocodingResult, Place } from '../types';
import { CATEGORY_DEFAULT_IMAGES } from '../constants/categories';

// Overpass API fallback mirrors with fast timeouts
const OVERPASS_ENDPOINTS = [
  'https://overpass.kumi.systems/api/interpreter',
  'https://lz4.overpass-api.de/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
  'https://overpass-api.de/api/interpreter',
];

const PHOTON_ENDPOINT = 'https://photon.komoot.io/api';
const NOMINATIM_ENDPOINT = 'https://nominatim.openstreetmap.org';

// Fast in-memory cache for queries within the session
const queryCache = new Map<string, { timestamp: number; data: Place[] }>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

export function formatDistance(meters?: number): string {
  if (meters === undefined || meters === null) return '';
  if (meters < 1000) {
    return `${meters} m`;
  }
  const km = (meters / 1000).toFixed(1);
  return `${km} km`;
}

/**
 * Determine the Oria category from OSM tags
 */
export function determineCategory(tags: Record<string, string>): CategoryType {
  const amenity = tags.amenity || '';
  const tourism = tags.tourism || '';
  const leisure = tags.leisure || '';
  const shop = tags.shop || '';
  const historic = tags.historic || '';

  if (amenity === 'cafe') return 'cafe';
  if (['restaurant', 'fast_food', 'food_court'].includes(amenity)) return 'restaurant';
  if (['bar', 'pub', 'nightclub', 'biergarten'].includes(amenity)) return 'nightlife';
  if (['cinema', 'theatre', 'bowling_alley', 'amusement_arcade'].includes(amenity) || leisure === 'bowling_alley') {
    return 'entertainment';
  }
  if (['museum', 'gallery'].includes(tourism) || amenity === 'arts_centre') return 'museum';
  if (['attraction', 'viewpoint'].includes(tourism) || historic !== '') return 'attraction';
  if (['park', 'garden', 'nature_reserve'].includes(leisure)) return 'park';
  if (shop !== '') return 'shopping';

  return 'attraction';
}

/**
 * Assign a legally sound, high-res stock photo for the place category
 */
function getImageForPlace(category: CategoryType, id: number): string {
  const list = CATEGORY_DEFAULT_IMAGES[category] || CATEGORY_DEFAULT_IMAGES.all;
  const index = Math.abs(id) % list.length;
  return list[index];
}

/**
 * Transform raw Overpass element to typed Place
 */
function parseOverpassElement(
  element: any,
  userLat?: number,
  userLon?: number
): Place | null {
  const tags = element.tags || {};
  const name = tags.name || tags['name:en'] || tags['name:de'] || tags.brand;
  
  if (!name || name.trim().length === 0) {
    return null;
  }

  const lat = element.lat ?? element.center?.lat;
  const lon = element.lon ?? element.center?.lon;

  if (typeof lat !== 'number' || typeof lon !== 'number') {
    return null;
  }

  const category = determineCategory(tags);
  const distance =
    userLat && userLon ? calculateDistanceMeters(userLat, userLon, lat, lon) : undefined;

  const address = [
    tags['addr:street'] && tags['addr:housenumber']
      ? `${tags['addr:street']} ${tags['addr:housenumber']}`
      : tags['addr:street'],
    tags['addr:postcode'],
    tags['addr:city'],
  ]
    .filter(Boolean)
    .join(', ');

  return {
    id: `${element.type || 'node'}/${element.id}`,
    osmId: element.id,
    osmType: element.type || 'node',
    name: name.trim(),
    category,
    subCategory: tags.cuisine || tags.amenity || tags.tourism || tags.leisure || tags.shop,
    latitude: lat,
    longitude: lon,
    address: address || undefined,
    city: tags['addr:city'] || undefined,
    postcode: tags['addr:postcode'] || undefined,
    street: tags['addr:street'] || undefined,
    housenumber: tags['addr:housenumber'] || undefined,
    phone: tags.phone || tags['contact:phone'] || undefined,
    website: tags.website || tags['contact:website'] || undefined,
    openingHours: tags.opening_hours || undefined,
    wheelchair: tags.wheelchair || undefined,
    cuisine: tags.cuisine || undefined,
    imageUrl: getImageForPlace(category, element.id),
    distanceMeters: distance,
    tags,
  };
}

/**
 * Fast OSM discovery via Komoot Photon cluster (~200ms)
 */
async function fetchNearbyPhoton(
  latitude: number,
  longitude: number,
  category: CategoryType,
  radiusMeters: number
): Promise<Place[]> {
  // Map category to effective OSM query keyword
  let queryTerm = 'cafe';
  switch (category) {
    case 'cafe': queryTerm = 'cafe'; break;
    case 'restaurant': queryTerm = 'restaurant'; break;
    case 'park': queryTerm = 'park'; break;
    case 'attraction': queryTerm = 'tourism'; break;
    case 'museum': queryTerm = 'museum'; break;
    case 'shopping': queryTerm = 'shop'; break;
    case 'nightlife': queryTerm = 'bar'; break;
    case 'entertainment': queryTerm = 'cinema'; break;
    case 'all': default: queryTerm = 'cafe'; break;
  }

  const url = `${PHOTON_ENDPOINT}/?lat=${latitude}&lon=${longitude}&q=${encodeURIComponent(queryTerm)}&limit=35`;
  
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3500);

  const response = await fetch(url, {
    signal: controller.signal,
    headers: {
      'User-Agent': 'OriaLocationDiscovery/1.0 (https://oria.moin26.dev)',
    },
  });
  clearTimeout(timer);

  if (!response.ok) {
    throw new Error(`Photon responded with status ${response.status}`);
  }

  const json = await response.json();
  const features = json.features || [];
  const places: Place[] = [];
  const seenNames = new Set<string>();

  for (const f of features) {
    const props = f.properties || {};
    const coords = f.geometry?.coordinates;
    if (!coords || !props.name || props.name.trim().length === 0) continue;

    const lon = coords[0];
    const lat = coords[1];
    const dist = calculateDistanceMeters(latitude, longitude, lat, lon);

    // Limit to search radius (or up to 4km max)
    if (dist > Math.max(radiusMeters, 3500)) continue;

    const key = props.name.toLowerCase().trim();
    if (seenNames.has(key)) continue;
    seenNames.add(key);

    const osmId = props.osm_id || Math.floor(Math.random() * 1000000);
    const osmType = props.osm_type === 'N' ? 'node' : props.osm_type === 'W' ? 'way' : 'node';

    const tags: Record<string, string> = {
      name: props.name,
      amenity: props.osm_value,
      [props.osm_key]: props.osm_value,
    };

    const resolvedCategory = category === 'all' ? determineCategory(tags) : category;

    const address = [props.street, props.housenumber, props.postcode, props.city]
      .filter(Boolean)
      .join(', ');

    places.push({
      id: `${osmType}/${osmId}`,
      osmId,
      osmType,
      name: props.name.trim(),
      category: resolvedCategory,
      subCategory: props.osm_value || category,
      latitude: lat,
      longitude: lon,
      address: address || undefined,
      city: props.city || undefined,
      postcode: props.postcode || undefined,
      street: props.street || undefined,
      housenumber: props.housenumber || undefined,
      imageUrl: getImageForPlace(resolvedCategory, osmId),
      distanceMeters: dist,
      tags,
    });
  }

  places.sort((a, b) => (a.distanceMeters ?? 0) - (b.distanceMeters ?? 0));
  return places;
}

/**
 * Overpass fallback query with strict 3-second timeout
 */
async function fetchNearbyOverpass(
  latitude: number,
  longitude: number,
  category: CategoryType,
  radiusMeters: number
): Promise<Place[]> {
  const delta = 0.025; // ~2.5km bbox for lightning speed index lookup
  const s = (latitude - delta).toFixed(5);
  const w = (longitude - delta).toFixed(5);
  const n = (latitude + delta).toFixed(5);
  const e = (longitude + delta).toFixed(5);

  let filters = '';
  switch (category) {
    case 'cafe':
      filters = `node["amenity"="cafe"](${s},${w},${n},${e});`;
      break;
    case 'restaurant':
      filters = `node["amenity"~"restaurant|fast_food"](${s},${w},${n},${e});`;
      break;
    case 'park':
      filters = `node["leisure"~"park|garden"](${s},${w},${n},${e});`;
      break;
    case 'attraction':
      filters = `node["tourism"~"attraction|viewpoint"](${s},${w},${n},${e});`;
      break;
    case 'museum':
      filters = `node["tourism"~"museum|gallery"](${s},${w},${n},${e});`;
      break;
    case 'shopping':
      filters = `node["shop"](${s},${w},${n},${e});`;
      break;
    case 'entertainment':
      filters = `node["amenity"~"cinema|theatre"](${s},${w},${n},${e});`;
      break;
    case 'nightlife':
      filters = `node["amenity"~"bar|pub|nightclub"](${s},${w},${n},${e});`;
      break;
    case 'all':
    default:
      filters = `
        node["amenity"~"cafe|restaurant|bar|cinema"](${s},${w},${n},${e});
        node["tourism"~"attraction|museum"](${s},${w},${n},${e});
        node["leisure"="park"](${s},${w},${n},${e});
      `;
      break;
  }

  const overpassQl = `[out:json][timeout:4];(${filters});out 40;`;

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 3500);

      const response = await fetch(endpoint, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
          'User-Agent': 'OriaLocationDiscovery/1.0',
        },
        body: `data=${encodeURIComponent(overpassQl)}`,
      });
      clearTimeout(timer);

      if (!response.ok) continue;

      const json = await response.json();
      const rawElements = json.elements || [];

      const places: Place[] = [];
      const seenNames = new Set<string>();

      for (const el of rawElements) {
        const place = parseOverpassElement(el, latitude, longitude);
        if (place && !seenNames.has(place.name.toLowerCase())) {
          seenNames.add(place.name.toLowerCase());
          places.push(place);
        }
      }

      if (places.length > 0) {
        places.sort((a, b) => (a.distanceMeters ?? 0) - (b.distanceMeters ?? 0));
        return places;
      }
    } catch {
      // Continue to next mirror quickly
    }
  }

  return [];
}

/**
 * Fetch real places around coordinates (High-Speed Photon first, Overpass fallback)
 */
export async function fetchNearbyPlaces(
  latitude: number,
  longitude: number,
  category: CategoryType = 'all',
  radiusMeters: number = 2500
): Promise<Place[]> {
  const cacheKey = `${latitude.toFixed(3)},${longitude.toFixed(3)}_${category}`;
  const cached = queryCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  // 1. High-speed primary: Photon OpenStreetMap (~250ms)
  try {
    const places = await fetchNearbyPhoton(latitude, longitude, category, radiusMeters);
    if (places.length > 0) {
      queryCache.set(cacheKey, { timestamp: Date.now(), data: places });
      return places;
    }
  } catch (err) {
    console.warn('Photon fast query fallback to Overpass:', err);
  }

  // 2. High-speed secondary: Overpass BBOX query (~1-2s)
  try {
    const overpassPlaces = await fetchNearbyOverpass(latitude, longitude, category, radiusMeters);
    if (overpassPlaces.length > 0) {
      queryCache.set(cacheKey, { timestamp: Date.now(), data: overpassPlaces });
      return overpassPlaces;
    }
  } catch (err) {
    console.warn('Overpass fallback failed:', err);
  }

  return cached?.data || [];
}

/**
 * Search places by text query in Nominatim (e.g. "Eiffel Tower", "Central Park", "Munich")
 */
export async function searchPlacesNominatim(query: string): Promise<Place[]> {
  if (!query || query.trim().length < 2) return [];

  try {
    const url = `${NOMINATIM_ENDPOINT}/search?q=${encodeURIComponent(
      query
    )}&format=json&addressdetails=1&extratags=1&limit=20`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'OriaLocationDiscovery/1.0 (contact@oria.app)',
      },
    });
    clearTimeout(timer);

    if (!response.ok) return [];

    const data = await response.json();
    return data.map((item: any) => {
      const lat = parseFloat(item.lat);
      const lon = parseFloat(item.lon);
      const tags = item.extratags || {};
      const category = determineCategory({
        amenity: item.type || tags.amenity,
        tourism: item.type || tags.tourism,
        leisure: item.type || tags.leisure,
        shop: tags.shop,
      });

      return {
        id: `${item.osm_type || 'node'}/${item.osm_id}`,
        osmId: item.osm_id,
        osmType: item.osm_type || 'node',
        name: item.name || item.display_name?.split(',')[0] || 'Unknown Place',
        category,
        latitude: lat,
        longitude: lon,
        address: item.display_name,
        city: item.address?.city || item.address?.town || item.address?.village,
        postcode: item.address?.postcode,
        imageUrl: getImageForPlace(category, item.osm_id),
        tags,
      };
    });
  } catch (err) {
    console.error('Nominatim search failed:', err);
    return [];
  }
}

/**
 * Geocode a city or address name to coordinates
 */
export async function geocodeLocation(query: string): Promise<GeocodingResult | null> {
  try {
    const url = `${NOMINATIM_ENDPOINT}/search?q=${encodeURIComponent(
      query
    )}&format=json&limit=1`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'OriaLocationDiscovery/1.0 (contact@oria.app)',
      },
    });
    clearTimeout(timer);

    if (!response.ok) return null;
    const data = await response.json();
    if (data && data.length > 0) {
      const first = data[0];
      return {
        placeId: first.place_id,
        displayName: first.display_name,
        latitude: parseFloat(first.lat),
        longitude: parseFloat(first.lon),
        type: first.type,
        importance: first.importance,
      };
    }
  } catch (e) {
    console.error('Geocoding error:', e);
  }
  return null;
}

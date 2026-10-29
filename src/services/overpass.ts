import { CategoryType, GeocodingResult, Place } from '../types';
import { CATEGORY_DEFAULT_IMAGES } from '../constants/categories';

// Overpass API public endpoints with fallback mirrors
const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

const NOMINATIM_ENDPOINT = 'https://nominatim.openstreetmap.org';

// Simple in-memory cache for queries within the session
const queryCache = new Map<string, { timestamp: number; data: Place[] }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

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
  
  // Must have a real name (OpenStreetMap standard places)
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
    id: `${element.type}/${element.id}`,
    osmId: element.id,
    osmType: element.type,
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
 * Fetch real places around coordinates via Overpass API
 */
export async function fetchNearbyPlaces(
  latitude: number,
  longitude: number,
  category: CategoryType = 'all',
  radiusMeters: number = 2500
): Promise<Place[]> {
  const cacheKey = `${latitude.toFixed(3)},${longitude.toFixed(3)}_${category}_${radiusMeters}`;
  const cached = queryCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  // Build Overpass QL query
  let queryFilters = '';
  switch (category) {
    case 'cafe':
      queryFilters = `node["amenity"="cafe"](around:${radiusMeters},${latitude},${longitude});`;
      break;
    case 'restaurant':
      queryFilters = `
        node["amenity"="restaurant"](around:${radiusMeters},${latitude},${longitude});
        node["amenity"="fast_food"](around:${radiusMeters},${latitude},${longitude});
      `;
      break;
    case 'park':
      queryFilters = `
        node["leisure"="park"](around:${radiusMeters},${latitude},${longitude});
        way["leisure"="park"](around:${radiusMeters},${latitude},${longitude});
        node["leisure"="garden"](around:${radiusMeters},${latitude},${longitude});
      `;
      break;
    case 'attraction':
      queryFilters = `
        node["tourism"="attraction"](around:${radiusMeters},${latitude},${longitude});
        node["historic"="monument"](around:${radiusMeters},${latitude},${longitude});
        node["tourism"="viewpoint"](around:${radiusMeters},${latitude},${longitude});
      `;
      break;
    case 'museum':
      queryFilters = `
        node["tourism"="museum"](around:${radiusMeters},${latitude},${longitude});
        node["tourism"="gallery"](around:${radiusMeters},${latitude},${longitude});
        node["amenity"="theatre"](around:${radiusMeters},${latitude},${longitude});
      `;
      break;
    case 'shopping':
      queryFilters = `
        node["shop"](around:${radiusMeters},${latitude},${longitude});
      `;
      break;
    case 'entertainment':
      queryFilters = `
        node["amenity"="cinema"](around:${radiusMeters},${latitude},${longitude});
        node["leisure"="bowling_alley"](around:${radiusMeters},${latitude},${longitude});
      `;
      break;
    case 'nightlife':
      queryFilters = `
        node["amenity"="bar"](around:${radiusMeters},${latitude},${longitude});
        node["amenity"="pub"](around:${radiusMeters},${latitude},${longitude});
        node["amenity"="nightclub"](around:${radiusMeters},${latitude},${longitude});
      `;
      break;
    case 'all':
    default:
      queryFilters = `
        node["amenity"~"cafe|restaurant|bar|pub|cinema"](around:${radiusMeters},${latitude},${longitude});
        node["tourism"~"attraction|museum|viewpoint|gallery"](around:${radiusMeters},${latitude},${longitude});
        node["leisure"~"park|garden"](around:${radiusMeters},${latitude},${longitude});
      `;
      break;
  }

  const overpassQl = `
    [out:json][timeout:15];
    (
      ${queryFilters}
    );
    out center 60;
  `;

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
          'User-Agent': 'OriaLocationDiscovery/1.0 (https://oria.app)',
        },
        body: `data=${encodeURIComponent(overpassQl)}`,
      });

      if (!response.ok) {
        continue;
      }

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

      // Sort by distance
      places.sort((a, b) => (a.distanceMeters ?? 0) - (b.distanceMeters ?? 0));

      // Cache result
      queryCache.set(cacheKey, { timestamp: Date.now(), data: places });
      return places;
    } catch (e) {
      console.warn(`Overpass endpoint ${endpoint} failed, trying next mirror:`, e);
    }
  }

  // Graceful fallback: return empty array or cached if exists
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

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'OriaLocationDiscovery/1.0 (contact@oria.app)',
      },
    });

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
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'OriaLocationDiscovery/1.0 (contact@oria.app)',
      },
    });

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

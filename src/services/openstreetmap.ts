import { Place, PlaceCategory, SearchParams, SearchResult, Coordinates } from '@/types';

const OVERPASS_API_URL = 'https://overpass-api.de/api/interpreter';
const NOMINATIM_API_URL = 'https://nominatim.openstreetmap.org';

interface OverpassElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  tags: Record<string, string>;
  bounds?: { minlat: number; minlon: number; maxlat: number; maxlon: number };
}

interface OverpassResponse {
  elements: OverpassElement[];
}

interface NominatimResult {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  lat: string;
  lon: string;
  display_name: string;
  address: Record<string, string>;
  boundingbox: string[];
}

const OSM_TAG_MAP: Record<string, string[]> = {
  cafes: ['amenity=cafe', 'amenity=bar', 'amenity=pub'],
  restaurants: ['amenity=restaurant', 'amenity=fast_food', 'amenity=biergarten'],
  sports: ['leisure=sports_centre', 'leisure=fitness_centre', 'leisure=stadium', 'leisure=pitch', 'shop=sports'],
  photography: ['amenity=photo_studio', 'shop=photo', 'tourism=attraction'],
  entertainment: ['amenity=cinema', 'amenity=nightclub', 'amenity=bowling_alley', 'leisure=amusement_arcade', 'leisure=playground'],
  nature: ['leisure=park', 'natural=wood', 'leisure=nature_reserve', 'landuse=forest', 'leisure=garden'],
  culture: ['amenity=arts_centre', 'amenity=library', 'tourism=museum', 'tourism=gallery', 'amenity=theatre'],
  shopping: ['shop=supermarket', 'shop=convenience', 'shop=clothes', 'shop=electronics', 'shop=mall', 'shop=bakery'],
  music: ['amenity=music_venue', 'shop=music', 'amenity=concert_hall'],
  sights: ['tourism=museum', 'tourism=attraction', 'tourism=monument', 'tourism=viewpoint', 'historic=castle', 'historic=church', 'historic=memorial'],
};

const CATEGORY_ICONS: Record<string, string> = {
  cafe: '☕',
  bar: '🍸',
  pub: '🍺',
  restaurant: '🍽️',
  fast_food: '🍔',
  biergarten: '🍺',
  sports_centre: '🏀',
  fitness_centre: '💪',
  stadium: '🏟️',
  pitch: '⚽',
  sports: '🏀',
  cinema: '🎬',
  nightclub: '🎶',
  bowling_alley: '🎳',
  amusement_arcade: '🎮',
  playground: '🎠',
  park: '🌳',
  wood: '🌲',
  nature_reserve: '🌿',
  forest: '🌲',
  garden: '🌱',
  arts_centre: '🎨',
  library: '📚',
  museum: '🏛️',
  gallery: '🖼️',
  theatre: '🎭',
  supermarket: '🛒',
  convenience: '🏪',
  clothes: '👗',
  electronics: '💻',
  mall: '🛍️',
  bakery: '🥐',
  music_venue: '🎵',
  music: '🎵',
  concert_hall: '🎶',
  attraction: '⭐',
  monument: '🗿',
  viewpoint: '🔭',
  castle: '🏰',
  church: '⛪',
  memorial: '🪦',
  photo_studio: '📸',
  photo: '📸',
};

function osmTagsToOverpassQuery(tags: string[]): string {
  return tags.map(tag => {
    const [key, value] = tag.split('=');
    return `["${key}"="${value}"]`;
  }).join('');
}

function buildOverpassQuery(
  latitude: number,
  longitude: number,
  radius: number,
  categoryKeys?: string[],
  limit: number = 50
): string {
  const radiusMeters = radius;
  const center = `${latitude},${longitude}`;

  let tagFilters = '';
  if (categoryKeys && categoryKeys.length > 0) {
    const allTags: string[] = [];
    for (const key of categoryKeys) {
      const tags = OSM_TAG_MAP[key];
      if (tags) {
        allTags.push(...tags);
      }
    }
    if (allTags.length > 0) {
      tagFilters = allTags.map(tag => {
        const [k, v] = tag.split('=');
        return `["${k}"="${v}"]`;
      }).join('');
    }
  }

  return `
    [out:json][timeout:25];
    (
      node${tagFilters}(${center},${radiusMeters});
      way${tagFilters}(${center},${radiusMeters});
      relation${tagFilters}(${center},${radiusMeters});
    );
    out center body ${limit};
  `;
}

function transformElementToPlace(element: OverpassElement): Place {
  const lat = element.lat ?? element.bounds?.minlat ?? 0;
  const lon = element.lon ?? element.bounds?.minlon ?? 0;
  const centerLat = element.lat ?? element.bounds ? ((element.bounds!.minlat + element.bounds!.maxlat) / 2) : lat;
  const centerLon = element.lon ?? element.bounds ? ((element.bounds!.minlon + element.bounds!.maxlon) / 2) : lon;

  const tags = element.tags;
  const name = tags.name || tags['name:en'] || tags['name:de'] || 'Unknown Place';

  const categories: PlaceCategory[] = [];
  if (tags.amenity) {
    categories.push({
      id: `amenity_${tags.amenity}`,
      name: tags.amenity.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      icon: CATEGORY_ICONS[tags.amenity] || '📍',
    });
  }
  if (tags.shop) {
    categories.push({
      id: `shop_${tags.shop}`,
      name: tags.shop.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      icon: CATEGORY_ICONS[tags.shop] || '🛍️',
    });
  }
  if (tags.tourism) {
    categories.push({
      id: `tourism_${tags.tourism}`,
      name: tags.tourism.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      icon: CATEGORY_ICONS[tags.tourism] || '⭐',
    });
  }
  if (tags.leisure) {
    categories.push({
      id: `leisure_${tags.leisure}`,
      name: tags.leisure.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      icon: CATEGORY_ICONS[tags.leisure] || '🎯',
    });
  }
  if (tags.historic) {
    categories.push({
      id: `historic_${tags.historic}`,
      name: tags.historic.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      icon: CATEGORY_ICONS[tags.historic] || '🏛️',
    });
  }
  if (tags.natural) {
    categories.push({
      id: `natural_${tags.natural}`,
      name: tags.natural.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      icon: CATEGORY_ICONS[tags.natural] || '🌿',
    });
  }
  if (tags.cuisine) {
    categories.push({
      id: `cuisine_${tags.cuisine}`,
      name: tags.cuisine.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      icon: '🍴',
    });
  }

  if (categories.length === 0) {
    categories.push({
      id: `osm_${element.type}_${element.id}`,
      name: 'Place',
      icon: '📍',
    });
  }

  const address = [
    tags['addr:housenumber'],
    tags['addr:street'],
    tags['addr:city'],
    tags['addr:postcode'],
  ].filter(Boolean).join(' ');

  const openingHours = tags.opening_hours;
  let is_open: boolean | undefined;
  if (openingHours) {
    try {
      is_open = parseOpeningHours(openingHours);
    } catch {
      is_open = undefined;
    }
  }

  const website = tags.website || tags.url;
  const phone = tags.phone || tags['contact:phone'];

  const photoUrl = tags.image || tags['image:street_level'];

  return {
    id: `osm_${element.type}_${element.id}`,
    name,
    categories,
    location: {
      address: tags['addr:street'] || address || undefined,
      locality: tags['addr:city'] || undefined,
      region: tags['addr:state'] || undefined,
      postcode: tags['addr:postcode'] || undefined,
      country: tags['addr:country'] || undefined,
      formatted_address: address || undefined,
      latitude: parseFloat(String(centerLat)),
      longitude: parseFloat(String(centerLon)),
      geocodes: {
        main: { latitude: parseFloat(String(centerLat)), longitude: parseFloat(String(centerLon)) },
      },
    },
    distance: undefined,
    rating: tags.stars ? parseFloat(tags.stars) : undefined,
    price: tags.outdoor_seating === 'yes' ? undefined : undefined,
    hours: openingHours ? {
      display: openingHours,
      is_open,
      open_now: is_open,
    } : undefined,
    website: website || undefined,
    phone: phone || undefined,
    photos: photoUrl ? [{
      id: `photo_${element.id}`,
      prefix: photoUrl,
      suffix: '',
      width: 0,
      height: 0,
      created_at: '',
      url: photoUrl,
    }] : [],
    description: tags.description || tags['description:en'] || undefined,
    tips: undefined,
    features: {
      payment: {
        credit_card: tags.payment_cards === 'yes' || tags['payment:credit_cards'] === 'yes',
        nfc: tags['payment:nfc'] === 'yes' || tags.contact_nfc === 'yes',
      },
      services: {
        delivery: tags.delivery === 'yes' || tags['delivery:principal'] === 'yes',
        takeout: tags.takeaway === 'yes' || tags.takeaway === 'only',
        dine_in: tags.outdoor_seating === 'yes' || tags.indoor_seating === 'yes',
        outdoor_seating: tags.outdoor_seating === 'yes',
        wifi: tags.wifi === 'yes' || tags.internet_access === 'wlan',
      },
      dietary: {
        vegetarian: tags.diet_vegetarian === 'yes' || tags.diet_vegetarian === 'only',
        vegan: tags.diet_vegan === 'yes' || tags.diet_vegan === 'only',
        gluten_free: tags.diet_gluten_free === 'yes',
      },
      accessibility: {
        wheelchair_accessible: tags.wheelchair === 'yes' || tags.wheelchair === 'designated',
        wheelchair_parking: tags.wheelchair_parking === 'yes',
      },
    },
    popularity: undefined,
    chains: tags.brand ? [{ id: tags.brand, name: tags.brand }] : undefined,
    related_places: undefined,
  };
}

function parseOpeningHours(hoursString: string): boolean {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const dayMap: Record<string, number> = {
    su: 0, mo: 1, tu: 2, we: 3, th: 4, fr: 5, sa: 6,
  };

  const parts = hoursString.split(';').map(s => s.trim());
  for (const part of parts) {
    const dayRangeMatch = part.match(/^([a-z]{2})-([a-z]{2})\s+(\d{1,2}:\d{2})-(\d{1,2}:\d{2})$/i);
    if (dayRangeMatch) {
      const [, fromDay, toDay, openTime, closeTime] = dayRangeMatch;
      const from = dayMap[fromDay.toLowerCase()];
      const to = dayMap[toDay.toLowerCase()];
      if (from !== undefined && to !== undefined) {
        if (from <= to) {
          if (dayOfWeek >= from && dayOfWeek <= to) {
            if (currentTime >= openTime && currentTime <= closeTime) return true;
          }
        } else {
          if (dayOfWeek >= from || dayOfWeek <= to) {
            if (currentTime >= openTime || currentTime <= closeTime) return true;
          }
        }
      }
    }

    const singleDayMatch = part.match(/^([a-z]{2})\s+(\d{1,2}:\d{2})-(\d{1,2}:\d{2})$/i);
    if (singleDayMatch) {
      const [, day, openTime, closeTime] = singleDayMatch;
      const d = dayMap[day.toLowerCase()];
      if (d !== undefined && dayOfWeek === d) {
        if (currentTime >= openTime && currentTime <= closeTime) return true;
      }
    }
  }

  return false;
}

class OpenStreetMapService {
  async searchPlaces(params: SearchParams): Promise<SearchResult> {
    const lat = params.ll ? parseFloat(params.ll.split(',')[0]) : 52.52;
    const lng = params.ll ? parseFloat(params.ll.split(',')[1]) : 13.405;
    const radius = params.radius || 5000;
    const limit = params.limit || 20;

    const query = buildOverpassQuery(lat, lng, radius, params.categories, limit);

    const response = await fetch(OVERPASS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `data=${encodeURIComponent(query)}`,
    });

    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.status}`);
    }

    const data: OverpassResponse = await response.json();
    const places = data.elements.map(transformElementToPlace);

    if (params.query) {
      const lowerQuery = params.query.toLowerCase();
      const filtered = places.filter(p =>
        p.name.toLowerCase().includes(lowerQuery) ||
        p.categories.some(c => c.name.toLowerCase().includes(lowerQuery)) ||
        (p.location.formatted_address && p.location.formatted_address.toLowerCase().includes(lowerQuery))
      );
      return { results: filtered };
    }

    return { results: places };
  }

  async getPlaceDetails(placeId: string): Promise<Place> {
    const match = placeId.match(/^osm_(node|way|relation)_(\d+)$/);
    if (!match) {
      throw new Error(`Invalid OSM place ID: ${placeId}`);
    }

    const [, type, id] = match;
    const query = `
      [out:json][timeout:25];
      ${type}(${id});
      out body;
    `;

    const response = await fetch(OVERPASS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `data=${encodeURIComponent(query)}`,
    });

    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.status}`);
    }

    const data: OverpassResponse = await response.json();
    if (data.elements.length === 0) {
      throw new Error(`Place not found: ${placeId}`);
    }

    return transformElementToPlace(data.elements[0]);
  }

  async getNearbyPlaces(
    latitude: number,
    longitude: number,
    radius: number = 5000,
    categories?: string[],
    limit: number = 20
  ): Promise<Place[]> {
    const result = await this.searchPlaces({
      ll: `${latitude},${longitude}`,
      radius,
      categories,
      limit,
    });
    return result.results;
  }

  async searchByQuery(
    query: string,
    latitude: number,
    longitude: number,
    radius: number = 5000,
    limit: number = 20
  ): Promise<Place[]> {
    const result = await this.searchPlaces({
      query,
      ll: `${latitude},${longitude}`,
      radius,
      limit,
    });
    return result.results;
  }

  async reverseGeocode(latitude: number, longitude: number): Promise<string | null> {
    const url = `${NOMINATIM_API_URL}/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Oria/1.0 (oria-app)',
      },
    });

    if (!response.ok) {
      return null;
    }

    const data: NominatimResult = await response.json();
    return data.display_name || null;
  }

  async searchNominatim(query: string, limit: number = 5): Promise<Array<{ name: string; lat: number; lon: number; display_name: string }>> {
    const url = `${NOMINATIM_API_URL}/search?q=${encodeURIComponent(query)}&format=json&limit=${limit}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Oria/1.0 (oria-app)',
      },
    });

    if (!response.ok) {
      return [];
    }

    const data: NominatimResult[] = await response.json();
    return data.map(r => ({
      name: r.display_name.split(',')[0],
      lat: parseFloat(r.lat),
      lon: parseFloat(r.lon),
      display_name: r.display_name,
    }));
  }

  async getCategories(): Promise<PlaceCategory[]> {
    return Object.entries(OSM_TAG_MAP).map(([key, tags]) => ({
      id: key,
      name: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      icon: CATEGORY_ICONS[tags[0]?.split('=')[1]] || '📍',
    }));
  }
}

export const openStreetMapService = new OpenStreetMapService();

export const getOSMPhotoUrl = (url: string) => url;

export { OSM_TAG_MAP, CATEGORY_ICONS };

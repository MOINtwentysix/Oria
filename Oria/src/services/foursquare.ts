import { Place, PlaceCategory, SearchParams, SearchResult, Coordinates } from '@/types';

const FOURSQUARE_API_KEY = process.env.FOURSQUARE_API_KEY || '';
const FOURSQUARE_BASE_URL = 'https://api.foursquare.com/v3';

interface FoursquarePlace {
  fsq_id: string;
  name: string;
  categories: Array<{
    id: string;
    name: string;
    icon: { prefix: string; suffix: string };
  }>;
  location: {
    address?: string;
    cross_street?: string;
    locality?: string;
    region?: string;
    postcode?: string;
    country?: string;
    formatted_address?: string;
    latitude: number;
    longitude: number;
    geocodes?: {
      main: { latitude: number; longitude: number };
      roof?: { latitude: number; longitude: number };
      entrance?: { latitude: number; longitude: number };
    };
  };
  distance?: number;
  rating?: number;
  price?: number;
  hours?: {
    display?: string;
    open_now?: boolean;
    regular?: Array<{ day: number; open: string; close: string }>;
  };
  photos?: Array<{
    id: string;
    prefix: string;
    suffix: string;
    width: number;
    height: number;
    created_at: string;
  }>;
  description?: string;
  tips?: Array<{
    id: string;
    text: string;
    created_at: string;
  }>;
  features?: {
    payment?: { credit_card?: boolean; cash_only?: boolean; nfc?: boolean };
    services?: { delivery?: boolean; takeout?: boolean; dine_in?: boolean; outdoor_seating?: boolean; wifi?: boolean };
    dietary?: { vegetarian?: boolean; vegan?: boolean; gluten_free?: boolean };
    accessibility?: { wheelchair_accessible?: boolean; wheelchair_parking?: boolean };
  };
  popularity?: { peak_hours?: number[]; visit_duration?: number };
  chains?: Array<{ id: string; name: string }>;
  related_places?: string[];
}

interface FoursquareSearchResponse {
  results: FoursquarePlace[];
  context?: {
    geo_bounds?: {
      center: { latitude: number; longitude: number };
      radius: number;
    };
  };
}

interface FoursquareCategoriesResponse {
  categories: Array<{
    id: string;
    name: string;
    icon: { prefix: string; suffix: string };
    categories?: any[];
  }>;
}

class FoursquareService {
  private async request<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = new URL(`${FOURSQUARE_BASE_URL}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': FOURSQUARE_API_KEY,
        'Accept': 'application/json',
        'X-Placer-Api-Version': '2024-06-01',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`Foursquare API error: ${response.status} - ${error.message || 'Unknown error'}`);
    }

    return response.json();
  }

  private transformPlace(place: FoursquarePlace): Place {
    const firstPhoto = place.photos?.[0];
    const photoUrl = firstPhoto
      ? `${firstPhoto.prefix}original${firstPhoto.suffix}`
      : undefined;

    return {
      id: place.fsq_id,
      name: place.name,
      categories: place.categories.map((c) => ({
        id: c.id,
        name: c.name,
        icon: c.icon?.prefix ? `${c.icon.prefix}bg_64${c.icon.suffix}` : undefined,
      })),
      location: {
        address: place.location.address,
        cross_street: place.location.cross_street,
        locality: place.location.locality,
        region: place.location.region,
        postcode: place.location.postcode,
        country: place.location.country,
        formatted_address: place.location.formatted_address,
        latitude: place.location.latitude,
        longitude: place.location.longitude,
        geocodes: place.location.geocodes ? {
          main: place.location.geocodes.main,
          roof: place.location.geocodes.roof,
          entrance: place.location.geocodes.entrance,
        } : undefined,
      },
      distance: place.distance,
      rating: place.rating,
      price: place.price,
      hours: place.hours ? {
        display: place.hours.display,
        is_open: place.hours.open_now,
        open_now: place.hours.open_now,
        regular: place.hours.regular?.map((h) => ({ day: h.day, open: h.open, close: h.close })),
      } : undefined,
      website: undefined,
      phone: undefined,
      photos: place.photos?.map((p) => ({
        id: p.id,
        prefix: p.prefix,
        suffix: p.suffix,
        width: p.width,
        height: p.height,
        created_at: p.created_at,
        url: `${p.prefix}original${p.suffix}`,
      })) || [],
      description: place.description,
      tips: place.tips?.map((t) => ({
        id: t.id,
        text: t.text,
        created_at: t.created_at,
      })),
      features: place.features,
      popularity: place.popularity,
      chains: place.chains,
      related_places: place.related_places,
    };
  }

  async searchPlaces(params: SearchParams): Promise<SearchResult> {
    const searchParams: Record<string, any> = {
      ll: params.ll,
      radius: params.radius || 5000,
      limit: params.limit || 20,
      fields: 'fsq_id,name,categories,location,distance,rating,price,hours,photos,description,tips,features,popularity,chains,related_places',
    };

    if (params.query) {
      searchParams.query = params.query;
    }

    if (params.categories && params.categories.length > 0) {
      searchParams.categories = params.categories.join(',');
    }

    if (params.sort) {
      searchParams.sort = params.sort;
    }

    if (params.price && params.price.length > 0) {
      searchParams.price = params.price.join(',');
    }

    if (params.open_now) {
      searchParams.open_now = 'true';
    }

    const response = await this.request<FoursquareSearchResponse>('/places/search', searchParams);

    return {
      results: response.results.map(this.transformPlace),
      context: response.context,
    };
  }

  async getPlaceDetails(placeId: string): Promise<Place> {
    const response = await this.request<FoursquarePlace>(`/places/${placeId}`, {
      fields: 'fsq_id,name,categories,location,distance,rating,price,hours,photos,description,tips,features,popularity,chains,related_places,website,phone',
    });

    return this.transformPlace(response);
  }

  async getPlacePhotos(placeId: string): Promise<Place['photos']> {
    const response = await this.request<{ photos: FoursquarePlace['photos'] }>(`/places/${placeId}/photos`);
    return response.photos?.map((p) => ({
      id: p.id,
      prefix: p.prefix,
      suffix: p.suffix,
      width: p.width,
      height: p.height,
      created_at: p.created_at,
      url: `${p.prefix}original${p.suffix}`,
    })) || [];
  }

  async getCategories(): Promise<PlaceCategory[]> {
    const response = await this.request<FoursquareCategoriesResponse>('/categories');
    
    const flattenCategories = (categories: FoursquareCategoriesResponse['categories'], parentId?: string): PlaceCategory[] => {
      return categories.flatMap((c) => [
        { id: c.id, name: c.name, icon: c.icon?.prefix ? `${c.icon.prefix}bg_64${c.icon.suffix}` : undefined, parent_id: parentId },
        ...(c.categories ? flattenCategories(c.categories, c.id) : []),
      ]);
    };

    return flattenCategories(response.categories);
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
      sort: 'distance',
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
      sort: 'distance',
    });
    return result.results;
  }
}

export const foursquareService = new FoursquareService();

export const getFoursquarePhotoUrl = (prefix: string, suffix: string, size: 'original' | '300x300' | '500x500' = 'original') => {
  if (size === 'original') {
    return `${prefix}original${suffix}`;
  }
  return `${prefix}${size}${suffix}`;
};
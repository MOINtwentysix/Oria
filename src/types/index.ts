export type CategoryType = 
  | 'all'
  | 'restaurant'
  | 'cafe'
  | 'park'
  | 'attraction'
  | 'museum'
  | 'shopping'
  | 'entertainment'
  | 'nightlife';

export interface PlaceCategoryInfo {
  id: CategoryType;
  label: string;
  iconName: string;
  color: string;
  overpassTags: string[];
}

export interface Place {
  id: string; // e.g. "node/123456"
  osmId: number;
  osmType: 'node' | 'way' | 'relation';
  name: string;
  category: CategoryType;
  subCategory?: string;
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  postcode?: string;
  street?: string;
  housenumber?: string;
  phone?: string;
  website?: string;
  openingHours?: string;
  wheelchair?: string;
  cuisine?: string;
  imageUrl?: string;
  distanceMeters?: number;
  tags?: Record<string, string>;
  isPartner?: boolean;
  partnerPerk?: string;
}

export interface SavedList {
  id: string;
  userId?: string;
  title: string;
  description?: string;
  coverImage?: string;
  isPrivate: boolean;
  shareCode?: string;
  placeCount: number;
  places?: Place[];
  createdAt: string;
  updatedAt: string;
}

export type TravelMode = 'foot' | 'bike' | 'car';

export interface RouteStep {
  instruction: string;
  distanceMeters: number;
  durationSeconds: number;
  name?: string;
}

export interface PlannedRoute {
  id: string;
  title: string;
  mode: TravelMode;
  destinations: Place[];
  distanceMeters: number;
  durationSeconds: number;
  steps: RouteStep[];
  geometry?: [number, number][]; // [lat, lng] array
  createdAt: string;
}

export interface UserSubscription {
  tier: 'free' | 'pro';
  aiRequestsUsed: number;
  aiRequestsLimit: number; // 50 for free, unlimited (-1) for pro
  listsLimit: number; // 10 for free, unlimited (-1) for pro
  resetDate?: string;
}

export interface UserProfile {
  id: string;
  clerkId: string;
  email: string;
  name: string;
  avatarUrl?: string;
  subscription: UserSubscription;
  listsCount: number;
  savedPlacesCount: number;
  privacy: {
    allowAnalytics: boolean;
    sharePublicLists: boolean;
    locationPrecision: 'precise' | 'approximate';
  };
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  recommendedPlaces?: Place[];
  suggestedPrompts?: string[];
  timestamp: string;
}

export interface GeocodingResult {
  placeId: number;
  displayName: string;
  latitude: number;
  longitude: number;
  type: string;
  importance: number;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Place {
  id: string;
  name: string;
  categories: PlaceCategory[];
  location: PlaceLocation;
  distance?: number;
  rating?: number;
  price?: number;
  hours?: PlaceHours;
  website?: string;
  phone?: string;
  photos: PlacePhoto[];
  description?: string;
  tips?: PlaceTip[];
  features?: PlaceFeatures;
  popularity?: PlacePopularity;
  chains?: PlaceChain[];
  related_places?: string[];
}

export interface PlaceCategory {
  id: string;
  name: string;
  icon?: string;
  parent_id?: string;
}

export interface PlaceLocation {
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
    main: Coordinates;
    roof?: Coordinates;
    entrance?: Coordinates;
  };
}

export interface PlaceHours {
  display?: string;
  is_open?: boolean;
  open_now?: boolean;
  regular?: PlaceHoursPeriod[];
  seasonal?: PlaceHoursPeriod[];
}

export interface PlaceHoursPeriod {
  day: number;
  open: string;
  close: string;
}

export interface PlacePhoto {
  id: string;
  prefix: string;
  suffix: string;
  width: number;
  height: number;
  created_at: string;
  url?: string;
}

export interface PlaceTip {
  id: string;
  text: string;
  created_at: string;
  author?: PlaceUser;
  likes?: number;
}

export interface PlaceUser {
  id: string;
  firstName: string;
  lastName?: string;
  photo?: PlacePhoto;
}

export interface PlaceFeatures {
  payment?: PlacePayment;
  services?: PlaceServices;
  dietary?: PlaceDietary;
  accessibility?: PlaceAccessibility;
}

export interface PlacePayment {
  credit_card?: boolean;
  cash_only?: boolean;
  nfc?: boolean;
}

export interface PlaceServices {
  delivery?: boolean;
  takeout?: boolean;
  dine_in?: boolean;
  outdoor_seating?: boolean;
  wifi?: boolean;
}

export interface PlaceDietary {
  vegetarian?: boolean;
  vegan?: boolean;
  gluten_free?: boolean;
}

export interface PlaceAccessibility {
  wheelchair_accessible?: boolean;
  wheelchair_parking?: boolean;
}

export interface PlacePopularity {
  peak_hours?: number[];
  visit_duration?: number;
  best_time_to_visit?: string;
}

export interface PlaceChain {
  id: string;
  name: string;
}

export interface SearchParams {
  query?: string;
  ll?: string;
  radius?: number;
  categories?: string[];
  limit?: number;
  sort?: 'distance' | 'rating' | 'popularity';
  price?: number[];
  open_now?: boolean;
  fields?: string;
}

export interface SearchResult {
  results: Place[];
  context?: SearchContext;
}

export interface SearchContext {
  geo_bounds?: {
    center: Coordinates;
    radius: number;
  };
  search_time?: number;
}

export interface User {
  id: string;
  account_id: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  created_at: string;
  updated_at: string;
  preferences?: UserPreferences;
  onboarding_complete?: boolean;
}

export interface UserPreferences {
  interests: string[];
  preferred_radius: number;
  notifications_enabled: boolean;
  location_sharing: boolean;
  theme: 'light' | 'dark' | 'system';
  language: string;
  units: 'metric' | 'imperial';
}

export interface SavedPlace {
  id: string;
  user_id: string;
  place_id: string;
  place_data: Place;
  list_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface SavedList {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  cover_image?: string;
  is_default: boolean;
  is_shared: boolean;
  share_token?: string;
  member_count: number;
  place_count: number;
  created_at: string;
  updated_at: string;
}

export interface SavedListMember {
  id: string;
  list_id: string;
  user_id: string;
  role: 'owner' | 'editor' | 'viewer';
  joined_at: string;
  invited_by?: string;
}

export interface SavedListItem {
  id: string;
  list_id: string;
  place_id: string;
  place_data: Place;
  added_by: string;
  notes?: string;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface AIConversation {
  id: string;
  user_id: string;
  title?: string;
  model: string;
  created_at: string;
  updated_at: string;
}

export interface AIMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  place_cards?: PlaceCard[];
  metadata?: Record<string, any>;
  created_at: string;
}

export interface PlaceCard {
  place_id: string;
  name: string;
  category: string;
  rating?: number;
  distance?: number;
  photo_url?: string;
  action?: 'show_on_map' | 'save' | 'directions' | 'share';
}

export interface TripPlan {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  start_location: Coordinates;
  end_location?: Coordinates;
  duration_hours: number;
  interests: string[];
  budget?: 'low' | 'medium' | 'high';
  people_count: number;
  transport_mode: 'walking' | 'cycling' | 'driving' | 'transit';
  stops: TripStop[];
  route?: Route;
  created_at: string;
  updated_at: string;
}

export interface TripStop {
  id: string;
  trip_id: string;
  place_id: string;
  place_data: Place;
  order: number;
  start_time?: string;
  end_time?: string;
  duration_minutes: number;
  notes?: string;
  travel_time_from_previous?: number;
  travel_distance_from_previous?: number;
}

export interface Route {
  id: string;
  trip_id?: string;
  list_id?: string;
  coordinates: Coordinates[];
  distance_meters: number;
  duration_seconds: number;
  waypoints: RouteWaypoint[];
  geometry: string;
  created_at: string;
}

export interface RouteWaypoint {
  place_id: string;
  order: number;
  coordinates: Coordinates;
  name: string;
}

export interface SharedListInvite {
  id: string;
  list_id: string;
  email: string;
  role: 'editor' | 'viewer';
  invited_by: string;
  token: string;
  expires_at: string;
  accepted_at?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'list_invite' | 'list_update' | 'place_saved' | 'trip_ready' | 'system';
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  created_at: string;
}

export interface AppError {
  code: string;
  message: string;
  details?: Record<string, any>;
  status?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}
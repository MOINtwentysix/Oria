export const CATEGORIES = [
  { id: 'cafes', name: 'Cafés', icon: '☕', color: 'primary', foursquareCategoryId: '13065' },
  { id: 'restaurants', name: 'Restaurants', icon: '🍽️', color: 'secondary', foursquareCategoryId: '13065' },
  { id: 'sports', name: 'Sport', icon: '🏀', color: 'accent', foursquareCategoryId: '18001' },
  { id: 'photography', name: 'Photography', icon: '📸', color: 'primary', foursquareCategoryId: '10027' },
  { id: 'entertainment', name: 'Entertainment', icon: '🎮', color: 'secondary', foursquareCategoryId: '10001' },
  { id: 'nature', name: 'Nature', icon: '🌳', color: 'secondary', foursquareCategoryId: '16000' },
  { id: 'culture', name: 'Culture', icon: '🎨', color: 'primary', foursquareCategoryId: '10000' },
  { id: 'shopping', name: 'Shopping', icon: '🛍️', color: 'accent', foursquareCategoryId: '17000' },
  { id: 'music', name: 'Music', icon: '🎵', color: 'primary', foursquareCategoryId: '10032' },
  { id: 'sights', name: 'Sights', icon: '🏛️', color: 'secondary', foursquareCategoryId: '16000' },
];

export const CATEGORY_COLORS = {
  primary: '#0066CC',
  secondary: '#00A86B',
  accent: '#FF6B35',
  warning: '#D97706',
  error: '#DC2626',
  success: '#059669',
};

export const DEFAULT_MAP_REGION = {
  latitude: 52.5200,
  longitude: 13.4050,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export const MAP_CONFIG = {
  minZoom: 2,
  maxZoom: 20,
  defaultZoom: 15,
  clusterRadius: 60,
  pinSize: 40,
  selectedPinSize: 56,
  clusterMinSize: 30,
  clusterMaxSize: 50,
};

export const SEARCH_DEBOUNCE_MS = 300;
export const SEARCH_MIN_CHARS = 1;
export const SEARCH_MAX_RESULTS = 50;
export const SEARCH_RADIUS_DEFAULT = 5000;

export const AI_CONFIG = {
  model: 'mistral-large-latest',
  maxTokens: 2048,
  temperature: 0.7,
  topP: 0.9,
  maxContextPlaces: 20,
};

export const ONBOARDING_STEPS = [
  { id: 'welcome', title: 'Welcome to Oria', description: 'Discover what\'s around you' },
  { id: 'interests', title: 'Your Interests', description: 'Select categories you love' },
  { id: 'radius', title: 'Search Radius', description: 'How far should we look?' },
  { id: 'location', title: 'Location Access', description: 'We need your location to show nearby places' },
  { id: 'preferences', title: 'Preferences', description: 'Confirm your settings' },
  { id: 'complete', title: 'Ready to Explore', description: 'Start discovering amazing places' },
];

export const INTERESTS_OPTIONS = CATEGORIES.map(c => c.id);

export const RADIUS_OPTIONS = [
  { id: 'walking', label: 'Walking (500m)', value: 500 },
  { id: 'neighborhood', label: 'Neighborhood (2km)', value: 2000 },
  { id: 'city', label: 'City (5km)', value: 5000 },
  { id: 'wide', label: 'Wide Area (15km)', value: 15000 },
  { id: 'unlimited', label: 'Unlimited', value: 50000 },
];

export const STORAGE_KEYS = {
  userPreferences: '@oria_user_preferences',
  onboardingComplete: '@oria_onboarding_complete',
  lastLocation: '@oria_last_location',
  recentSearches: '@oria_recent_searches',
  savedLists: '@oria_saved_lists',
  theme: '@oria_theme',
};

export const API_ENDPOINTS = {
  foursquare: {
    base: 'https://api.foursquare.com/v3',
    placesSearch: '/places/search',
    placeDetails: '/places/',
    placePhotos: '/places/{place_id}/photos',
    categories: '/categories',
  },
  mistral: {
    base: 'https://api.mistral.ai/v1',
    chat: '/chat/completions',
  },
  routing: {
    base: 'https://router.project-osrm.org',
    route: '/route/v1',
    table: '/table/v1',
    nearest: '/nearest/v1',
  },
  googleMaps: {
    base: 'https://www.google.com/maps/dir/',
    ios: 'comgooglemaps://',
    android: 'google.navigation:q=',
  },
};

export const ERROR_MESSAGES = {
  locationDenied: 'Location access is required to discover places near you.',
  locationUnavailable: 'Unable to get your current location. Please try again.',
  networkError: 'Network error. Please check your connection and try again.',
  foursquareError: 'Unable to load places. Please try again later.',
  aiUnavailable: 'AI assistant is currently unavailable. Please try again.',
  noPlacesFound: 'No places found matching your search.',
  rateLimited: 'Too many requests. Please wait a moment and try again.',
  sessionExpired: 'Your session has expired. Please sign in again.',
  unauthorized: 'You don\'t have permission to access this resource.',
  notFound: 'The requested resource was not found.',
  validationError: 'Please check your input and try again.',
  serverError: 'Something went wrong on our end. Please try again.',
};

export const SUCCESS_MESSAGES = {
  placeSaved: 'Place saved to your list!',
  placeRemoved: 'Place removed from your list.',
  listCreated: 'List created successfully!',
  listUpdated: 'List updated!',
  listDeleted: 'List deleted.',
  listShared: 'List shared with friends!',
  tripPlanned: 'Your trip has been planned!',
  routeCalculated: 'Route calculated!',
  preferencesSaved: 'Preferences saved!',
  profileUpdated: 'Profile updated!',
};
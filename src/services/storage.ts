import AsyncStorage from '@react-native-async-storage/async-storage';
import { Place, PlannedRoute, SavedList, UserProfile } from '../types';

const STORAGE_KEYS = {
  LISTS: '@oria_saved_lists_v1',
  ROUTES: '@oria_saved_routes_v1',
  PROFILE: '@oria_user_profile_v1',
  RECENT_SEARCHES: '@oria_recent_searches_v1',
  SAVED_PLACES_INDEX: '@oria_saved_places_index_v1',
  OFFLINE_CACHE: '@oria_offline_places_cache_v1',
};

const DEFAULT_PROFILE: UserProfile = {
  id: 'user_default',
  clerkId: 'guest',
  email: 'explorer@oria.app',
  name: 'Oria Explorer',
  subscription: {
    tier: 'free',
    aiRequestsUsed: 4,
    aiRequestsLimit: 50,
    listsLimit: 10,
    resetDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
  },
  listsCount: 3,
  savedPlacesCount: 6,
  privacy: {
    allowAnalytics: false,
    sharePublicLists: true,
    locationPrecision: 'precise',
  },
};

const INITIAL_DEFAULT_LISTS: SavedList[] = [
  {
    id: 'list_favorites',
    title: 'Favorites',
    description: 'My absolute favorite hidden gems and essential spots.',
    coverImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800&auto=format&fit=crop',
    isPrivate: false,
    shareCode: 'fav-spots',
    placeCount: 0,
    places: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'list_coffee',
    title: 'Quiet Cafés & Work',
    description: 'Great lighting, quiet corners, and specialty coffee.',
    coverImage: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=800&auto=format&fit=crop',
    isPrivate: false,
    shareCode: 'coffee-work',
    placeCount: 0,
    places: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'list_weekend',
    title: 'Weekend Itinerary',
    description: 'Inspiring architecture, museums, and green open parks.',
    coverImage: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=800&auto=format&fit=crop',
    isPrivate: true,
    shareCode: 'weekend-walk',
    placeCount: 0,
    places: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export async function getSavedLists(): Promise<SavedList[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.LISTS);
    if (!raw) {
      await AsyncStorage.setItem(STORAGE_KEYS.LISTS, JSON.stringify(INITIAL_DEFAULT_LISTS));
      return INITIAL_DEFAULT_LISTS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to get saved lists:', err);
    return INITIAL_DEFAULT_LISTS;
  }
}

export async function saveList(list: SavedList): Promise<SavedList[]> {
  const lists = await getSavedLists();
  const existingIndex = lists.findIndex((l) => l.id === list.id);
  if (existingIndex >= 0) {
    lists[existingIndex] = { ...list, updatedAt: new Date().toISOString() };
  } else {
    lists.unshift({
      ...list,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
  await AsyncStorage.setItem(STORAGE_KEYS.LISTS, JSON.stringify(lists));
  return lists;
}

export async function createNewList(
  title: string,
  description?: string,
  coverImage?: string,
  isPrivate: boolean = true
): Promise<SavedList> {
  const lists = await getSavedLists();
  const profile = await getUserProfile();
  
  if (profile.subscription.tier === 'free' && lists.length >= profile.subscription.listsLimit) {
    throw new Error('LIST_LIMIT_REACHED');
  }

  const shareCode = Math.random().toString(36).substring(2, 9);
  const newList: SavedList = {
    id: `list_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
    title: title.trim(),
    description: description?.trim(),
    coverImage: coverImage || 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?q=80&w=800&auto=format&fit=crop',
    isPrivate,
    shareCode,
    placeCount: 0,
    places: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  lists.unshift(newList);
  await AsyncStorage.setItem(STORAGE_KEYS.LISTS, JSON.stringify(lists));
  return newList;
}

export async function deleteList(listId: string): Promise<SavedList[]> {
  const lists = await getSavedLists();
  const filtered = lists.filter((l) => l.id !== listId);
  await AsyncStorage.setItem(STORAGE_KEYS.LISTS, JSON.stringify(filtered));
  return filtered;
}

export async function addPlaceToList(listId: string, place: Place): Promise<SavedList | null> {
  const lists = await getSavedLists();
  const target = lists.find((l) => l.id === listId);
  if (!target) return null;

  if (!target.places) target.places = [];
  const exists = target.places.some((p) => p.id === place.id);
  if (!exists) {
    target.places.unshift(place);
    target.placeCount = target.places.length;
    target.updatedAt = new Date().toISOString();
    await AsyncStorage.setItem(STORAGE_KEYS.LISTS, JSON.stringify(lists));
  }
  return target;
}

export async function removePlaceFromList(listId: string, placeId: string): Promise<SavedList | null> {
  const lists = await getSavedLists();
  const target = lists.find((l) => l.id === listId);
  if (!target || !target.places) return null;

  target.places = target.places.filter((p) => p.id !== placeId);
  target.placeCount = target.places.length;
  target.updatedAt = new Date().toISOString();
  await AsyncStorage.setItem(STORAGE_KEYS.LISTS, JSON.stringify(lists));
  return target;
}

export async function isPlaceSaved(placeId: string): Promise<boolean> {
  const lists = await getSavedLists();
  return lists.some((l) => l.places && l.places.some((p) => p.id === placeId));
}

export async function getSavedRoutes(): Promise<PlannedRoute[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.ROUTES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveRoute(route: PlannedRoute): Promise<PlannedRoute[]> {
  const routes = await getSavedRoutes();
  const filtered = routes.filter((r) => r.id !== route.id);
  filtered.unshift(route);
  await AsyncStorage.setItem(STORAGE_KEYS.ROUTES, JSON.stringify(filtered));
  return filtered;
}

export async function deleteRoute(routeId: string): Promise<PlannedRoute[]> {
  const routes = await getSavedRoutes();
  const filtered = routes.filter((r) => r.id !== routeId);
  await AsyncStorage.setItem(STORAGE_KEYS.ROUTES, JSON.stringify(filtered));
  return filtered;
}

export async function getUserProfile(): Promise<UserProfile> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!raw) {
      await AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(DEFAULT_PROFILE));
      return DEFAULT_PROFILE;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_PROFILE;
  }
}

export async function updateUserProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
  const current = await getUserProfile();
  const updated = { ...current, ...profile };
  await AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updated));
  return updated;
}

export async function incrementAIRequestCount(): Promise<{ allowed: boolean; remaining: number }> {
  const profile = await getUserProfile();
  const { tier, aiRequestsUsed, aiRequestsLimit } = profile.subscription;

  if (tier === 'free' && aiRequestsUsed >= aiRequestsLimit) {
    return { allowed: false, remaining: 0 };
  }

  profile.subscription.aiRequestsUsed = aiRequestsUsed + 1;
  await AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  
  const remaining =
    tier === 'pro' ? 999999 : Math.max(0, aiRequestsLimit - profile.subscription.aiRequestsUsed);
  return { allowed: true, remaining };
}

export async function upgradeToPro(): Promise<UserProfile> {
  const profile = await getUserProfile();
  profile.subscription.tier = 'pro';
  profile.subscription.aiRequestsLimit = -1;
  profile.subscription.listsLimit = -1;
  await AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  return profile;
}

export async function getRecentSearches(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.RECENT_SEARCHES);
    return raw ? JSON.parse(raw) : ['Munich', 'Eiffel Tower', 'Central Park', 'Quiet Cafés'];
  } catch {
    return [];
  }
}

export async function addRecentSearch(query: string): Promise<string[]> {
  const searches = await getRecentSearches();
  const filtered = searches.filter((s) => s.toLowerCase() !== query.toLowerCase());
  filtered.unshift(query);
  const trimmed = filtered.slice(0, 10);
  await AsyncStorage.setItem(STORAGE_KEYS.RECENT_SEARCHES, JSON.stringify(trimmed));
  return trimmed;
}

export async function clearAllUserData(): Promise<void> {
  await AsyncStorage.multiRemove([
    STORAGE_KEYS.LISTS,
    STORAGE_KEYS.ROUTES,
    STORAGE_KEYS.PROFILE,
    STORAGE_KEYS.RECENT_SEARCHES,
    STORAGE_KEYS.SAVED_PLACES_INDEX,
  ]);
}

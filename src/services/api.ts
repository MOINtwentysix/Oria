import { Platform } from 'react-native';
import { CategoryType, Place, PlannedRoute, SavedList } from '../types';
import * as overpassService from './overpass';
import * as routingService from './routing';
import * as storageService from './storage';

// Base backend server URL (configurable, defaults to relative / on web or localhost on native)
const BACKEND_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL ||
  (Platform.OS === 'web'
    ? ''
    : Platform.OS === 'android'
    ? 'http://10.0.2.2:3001'
    : 'http://localhost:3001');

let isBackendAvailable = true;

export function getIsBackendAvailable(): boolean {
  return isBackendAvailable;
}

/**
 * Check if backend server is responsive
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${BACKEND_URL}/api/health`, { signal: controller.signal });
    clearTimeout(timeout);
    isBackendAvailable = res.ok;
    return res.ok;
  } catch {
    isBackendAvailable = false;
    return false;
  }
}

/**
 * Fetch nearby places (direct high-speed OSM discovery with in-memory cache)
 */
export async function fetchPlaces(
  lat: number,
  lon: number,
  category: CategoryType = 'all',
  radius: number = 2500
): Promise<Place[]> {
  return overpassService.fetchNearbyPlaces(lat, lon, category, radius);
}

/**
 * Search places by text
 */
export async function searchPlaces(query: string): Promise<Place[]> {
  return overpassService.searchPlacesNominatim(query);
}

/**
 * Request route calculation
 */
export async function calculateRoute(
  destinations: Place[],
  mode: 'foot' | 'bike' | 'car' = 'foot'
): Promise<PlannedRoute | null> {
  return routingService.calculateRoute(destinations, mode);
}

/**
 * Sync lists with backend if online, fallback to local storage
 */
export async function getLists(): Promise<SavedList[]> {
  return storageService.getSavedLists();
}

export async function createList(title: string, description?: string, coverImage?: string): Promise<SavedList> {
  return storageService.createNewList(title, description, coverImage);
}

export async function savePlaceToList(listId: string, place: Place): Promise<SavedList | null> {
  return storageService.addPlaceToList(listId, place);
}

export async function removePlaceFromList(listId: string, placeId: string): Promise<SavedList | null> {
  return storageService.removePlaceFromList(listId, placeId);
}

export async function deleteList(listId: string): Promise<SavedList[]> {
  return storageService.deleteList(listId);
}

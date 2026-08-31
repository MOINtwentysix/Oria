import { useCallback, useRef, useState } from 'react';
import { Place, SearchParams } from '@/types';
import { useSearchStore, usePlacesStore } from '@/store';
import { openStreetMapService } from '@/services/openstreetmap';
import { useLocation } from './useLocation';

export const usePlaces = () => {
  const { places, selectedPlace, clusters, loading, error, setPlaces, addPlaces, setSelectedPlace, setClusters, setLoading, setError, clear } = usePlacesStore();
  const { currentLocation } = useLocation();
  const { query, selectedCategories, filters, setLoading: setSearchLoading, setError: setSearchError } = useSearchStore();
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const searchPlaces = useCallback(async (params: SearchParams) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setSearchLoading(true);
    setSearchError(null);

    try {
      const result = await openStreetMapService.searchPlaces(params);
      setPlaces(result.results);
      return result.results;
    } catch (err: any) {
      const message = err.message || 'Failed to search places';
      setError(message);
      setSearchError(message);
      return [];
    } finally {
      setSearchLoading(false);
    }
  }, [setPlaces, setSearchLoading, setSearchError, setError]);

  const searchNearby = useCallback(async (
    latitude: number,
    longitude: number,
    radius: number = 5000,
    categories?: string[],
    limit: number = 50
  ) => {
    if (!currentLocation && (!latitude || !longitude)) {
      setError('Location not available');
      return [];
    }

    const lat = latitude || currentLocation!.latitude;
    const lng = longitude || currentLocation!.longitude;

    return searchPlaces({
      ll: `${lat},${lng}`,
      radius,
      categories,
      limit,
      sort: 'distance',
    });
  }, [currentLocation, searchPlaces, setError]);

  const searchByQuery = useCallback(async (
    query: string,
    latitude: number,
    longitude: number,
    radius: number = 5000,
    limit: number = 50
  ) => {
    if (!query.trim()) {
      clear();
      return [];
    }

    return searchPlaces({
      query: query.trim(),
      ll: `${latitude},${longitude}`,
      radius,
      limit,
      sort: 'distance',
    });
  }, [searchPlaces, clear]);

  const debouncedSearch = useCallback((
    query: string,
    latitude: number,
    longitude: number,
    radius: number = 5000,
    delay: number = 300
  ) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    return new Promise<Place[]>((resolve) => {
      debounceTimerRef.current = setTimeout(() => {
        searchByQuery(query, latitude, longitude, radius).then(resolve);
      }, delay);
    });
  }, [searchByQuery]);

  const loadPlaceDetails = useCallback(async (placeId: string) => {
    setLoading(true);
    try {
      const place = await openStreetMapService.getPlaceDetails(placeId);
      setSelectedPlace(place);
      return place;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [setSelectedPlace, setLoading, setError]);

  const loadCategories = useCallback(async () => {
    try {
      return await openStreetMapService.getCategories();
    } catch (err) {
      console.error('Failed to load categories:', err);
      return [];
    }
  }, []);

  const selectPlace = useCallback((place: Place | null) => {
    setSelectedPlace(place);
  }, [setSelectedPlace]);

  const clusterPlaces = useCallback((placesToCluster: Place[], zoom: number) => {
    if (zoom > 15) {
      setClusters(new Map());
      return;
    }

    const clusters = new Map<string, Place[]>();
    const gridSize = Math.max(0.001, 0.01 / Math.pow(2, zoom - 10));

    for (const place of placesToCluster) {
      const gridLat = Math.floor(place.location.latitude / gridSize) * gridSize;
      const gridLng = Math.floor(place.location.longitude / gridSize) * gridSize;
      const key = `${gridLat},${gridLng}`;

      if (!clusters.has(key)) {
        clusters.set(key, []);
      }
      clusters.get(key)!.push(place);
    }

    setClusters(clusters);
  }, [setClusters]);

  return {
    places,
    selectedPlace,
    clusters,
    loading,
    error,
    searchPlaces,
    searchNearby,
    searchByQuery,
    debouncedSearch,
    loadPlaceDetails,
    loadCategories,
    selectPlace,
    clusterPlaces,
    clear,
  };
};
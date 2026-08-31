import { useCallback } from 'react';
import { routingService } from '@/services/routing';
import { useTripStore } from '@/store';
import { Coordinates, Route, TripPlan, TripStop } from '@/types';

export const useRouting = () => {
  const { trips, currentTrip, route, calculating, loading, error, setTrips, addTrip, updateTrip, removeTrip, setCurrentTrip, setRoute, setCalculating, setLoading, setError } = useTripStore();

  const calculateRoute = useCallback(async (
    waypoints: Coordinates[],
    profile: 'driving' | 'walking' | 'cycling' = 'driving'
  ): Promise<Route | null> => {
    setCalculating(true);
    setError(null);

    try {
      const route = await routingService.getRoute(waypoints, profile);
      setRoute(route);
      return route;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setCalculating(false);
    }
  }, [setRoute, setCalculating, setError]);

  const calculateRouteFromTrip = useCallback(async (trip: TripPlan, profile: 'driving' | 'walking' | 'cycling' = 'driving') => {
    const waypoints = trip.stops
      .sort((a, b) => a.order - b.order)
      .map(stop => ({
        latitude: stop.place_data.location.latitude,
        longitude: stop.place_data.location.longitude,
      }));

    if (waypoints.length < 2) {
      setError('Need at least 2 stops for a route');
      return null;
    }

    return calculateRoute(waypoints, profile);
  }, [calculateRoute, setError]);

  const calculateRouteFromList = useCallback(async (stops: TripStop[], profile: 'driving' | 'walking' | 'cycling' = 'driving') => {
    const waypoints = stops
      .sort((a, b) => a.order - b.order)
      .map(stop => ({
        latitude: stop.place_data.location.latitude,
        longitude: stop.place_data.location.longitude,
      }));

    if (waypoints.length < 2) {
      setError('Need at least 2 stops for a route');
      return null;
    }

    return calculateRoute(waypoints, profile);
  }, [calculateRoute, setError]);

  const optimizeWaypointOrder = useCallback(async (waypoints: Coordinates[], profile: 'driving' | 'walking' | 'cycling' = 'driving') => {
    try {
      return await routingService.optimizeWaypointOrder(waypoints, profile);
    } catch (err: any) {
      setError(err.message);
      return waypoints;
    }
  }, [setError]);

  const getDistanceMatrix = useCallback(async (locations: Coordinates[], profile: 'driving' | 'walking' | 'cycling' = 'driving') => {
    try {
      return await routingService.getDistanceMatrix(locations, profile);
    } catch (err: any) {
      setError(err.message);
      return { distances: [], durations: [] };
    }
  }, [setError]);

  const generateGoogleMapsUrl = useCallback((waypoints: Coordinates[], travelMode: 'driving' | 'walking' | 'bicycling' | 'transit' = 'driving') => {
    return routingService.generateGoogleMapsUrl(waypoints, travelMode);
  }, []);

  const generateGoogleMapsDeepLink = useCallback((waypoints: Coordinates[], travelMode: 'driving' | 'walking' | 'bicycling' | 'transit' = 'driving') => {
    return routingService.generateGoogleMapsDeepLink(waypoints, travelMode);
  }, []);

  const openInGoogleMaps = useCallback(async (waypoints: Coordinates[], travelMode: 'driving' | 'walking' | 'bicycling' | 'transit' = 'driving') => {
    const { ios, android, web } = routingService.generateGoogleMapsDeepLink(waypoints, travelMode);
    const url = Platform.OS === 'ios' ? ios : Platform.OS === 'android' ? android : web;
    
    const { Linking } = require('react-native');
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      await Linking.openURL(web);
    }
  }, []);

  const createTrip = useCallback(async (trip: TripPlan) => {
    addTrip(trip);
    return trip;
  }, [addTrip]);

  const updateTripPlan = useCallback(async (trip: TripPlan) => {
    updateTrip(trip);
  }, [updateTrip]);

  const deleteTrip = useCallback(async (tripId: string) => {
    removeTrip(tripId);
  }, [removeTrip]);

  const loadTrips = useCallback(async (userId: string) => {
    setLoading(true);
    try {
      const response = await api.trips.list();
      setTrips(response.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [setTrips, setLoading, setError]);

  return {
    trips,
    currentTrip,
    route,
    calculating,
    loading,
    error,
    calculateRoute,
    calculateRouteFromTrip,
    calculateRouteFromList,
    optimizeWaypointOrder,
    getDistanceMatrix,
    generateGoogleMapsUrl,
    generateGoogleMapsDeepLink,
    openInGoogleMaps,
    createTrip,
    updateTripPlan,
    deleteTrip,
    loadTrips,
    setCurrentTrip,
  };
};

import { api } from '@/services/api';
import { Platform, Linking } from 'react-native';
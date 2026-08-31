import { useEffect, useCallback, useRef } from 'react';
import * as Location from 'expo-location';
import { Coordinates } from '@/types';
import { useLocationStore } from '@/store';

export const useLocation = () => {
  const {
    currentLocation,
    lastKnownLocation,
    locationPermission,
    watching,
    setCurrentLocation,
    setLastKnownLocation,
    setLocationPermission,
    setWatching,
  } = useLocationStore();

  const watchIdRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);

  const requestPermission = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    const permission = status === 'granted' ? 'granted' : 'denied';
    setLocationPermission(permission);
    return permission === 'granted';
  }, [setLocationPermission]);

  const getCurrentLocation = useCallback(async (): Promise<Coordinates | null> => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        maximumAge: 10000,
        timeout: 15000,
      });

      const coords: Coordinates = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setCurrentLocation(coords);
      setLastKnownLocation(coords);
      return coords;
    } catch (error) {
      console.error('Failed to get current location:', error);
      return null;
    }
  }, [setCurrentLocation, setLastKnownLocation]);

  const startWatching = useCallback(async () => {
    if (watching) return;

    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    try {
      watchIdRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 100,
          timeInterval: 5000,
        },
        (location) => {
          const now = Date.now();
          if (now - lastUpdateRef.current < 3000) return;
          lastUpdateRef.current = now;

          const coords: Coordinates = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };

          setCurrentLocation(coords);
          setLastKnownLocation(coords);
        }
      );

      setWatching(true);
    } catch (error) {
      console.error('Failed to start location watching:', error);
    }
  }, [watching, requestPermission, setCurrentLocation, setLastKnownLocation, setWatching]);

  const stopWatching = useCallback(async () => {
    if (watchIdRef.current !== null) {
      Location.removeWatch(watchIdRef.current);
      watchIdRef.current = null;
      setWatching(false);
    }
  }, [setWatching]);

  useEffect(() => {
    const initLocation = async () => {
      const { status } = await Location.getForegroundPermissionsAsync();
      setLocationPermission(status === 'granted' ? 'granted' : 'undetermined');

      if (status === 'granted') {
        await getCurrentLocation();
      }
    };

    initLocation();

    return () => {
      stopWatching();
    };
  }, [getCurrentLocation, setLocationPermission, stopWatching]);

  return {
    currentLocation,
    lastKnownLocation,
    locationPermission,
    watching,
    requestPermission,
    getCurrentLocation,
    startWatching,
    stopWatching,
  };
};

export const useReverseGeocode = (latitude: number, longitude: number) => {
  const [address, setAddress] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const geocode = async () => {
      setLoading(true);
      try {
        const results = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (results.length > 0) {
          const r = results[0];
          const parts = [
            r.streetNumber ? `${r.streetNumber} ${r.street}` : r.street,
            r.city,
            r.region,
            r.postalCode,
            r.country,
          ].filter(Boolean);
          setAddress(parts.join(', '));
        }
      } catch (error) {
        console.error('Reverse geocode failed:', error);
      } finally {
        setLoading(false);
      }
    };

    geocode();
  }, [latitude, longitude]);

  return { address, loading };
};

import { useState } from 'react';
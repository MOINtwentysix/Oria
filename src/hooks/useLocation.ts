import { useEffect, useCallback, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { Coordinates } from '@/types';
import { useLocationStore } from '@/store';

declare const navigator: { geolocation: { getCurrentPosition: any; watchPosition: any; clearWatch: any } };

let Location: any = null;
if (Platform.OS !== 'web') {
  Location = require('expo-location');
}

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
  const [loading, setLoading] = useState(false);

  const requestPermission = useCallback(async () => {
    if (Platform.OS === 'web') {
      if ('geolocation' in navigator) {
        setLocationPermission('granted');
        return true;
      }
      setLocationPermission('denied');
      return false;
    }
    const { status } = await Location.requestForegroundPermissionsAsync();
    const permission = status === 'granted' ? 'granted' : 'denied';
    setLocationPermission(permission);
    return permission === 'granted';
  }, [setLocationPermission]);

  const getCurrentLocation = useCallback(async (): Promise<Coordinates | null> => {
    try {
      if (Platform.OS === 'web') {
        return await new Promise<Coordinates | null>((resolve, reject) => {
          if (!('geolocation' in navigator)) {
            resolve(null);
            return;
          }
          navigator.geolocation.getCurrentPosition(
            (position: any) => {
              const coords: Coordinates = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              };
              setCurrentLocation(coords);
              setLastKnownLocation(coords);
              resolve(coords);
            },
            () => resolve(null),
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
          );
        });
      }

      const location: any = await Location.getCurrentPositionAsync({
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
      if (Platform.OS === 'web') {
        if ('geolocation' in navigator) {
          watchIdRef.current = navigator.geolocation.watchPosition(
            (position: any) => {
              const now = Date.now();
              if (now - lastUpdateRef.current < 3000) return;
              lastUpdateRef.current = now;

              const coords: Coordinates = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              };

              setCurrentLocation(coords);
              setLastKnownLocation(coords);
            },
            () => {},
            { enableHighAccuracy: true, distanceInterval: 100, timeInterval: 5000 }
          ) as unknown as number;
        }
      } else {
        watchIdRef.current = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            distanceInterval: 100,
            timeInterval: 5000,
          },
          (location: any) => {
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
      }

      setWatching(true);
    } catch (error) {
      console.error('Failed to start location watching:', error);
    }
  }, [watching, requestPermission, setCurrentLocation, setLastKnownLocation, setWatching]);

  const stopWatching = useCallback(async () => {
    if (watchIdRef.current !== null) {
      if (Platform.OS === 'web') {
        navigator.geolocation.clearWatch(watchIdRef.current);
      } else {
        Location.removeWatch(watchIdRef.current);
      }
      watchIdRef.current = null;
      setWatching(false);
    }
  }, [setWatching]);

  useEffect(() => {
    const initLocation = async () => {
      if (Platform.OS === 'web') {
        if ('geolocation' in navigator) {
          setLocationPermission('granted');
          await getCurrentLocation();
        } else {
          setLocationPermission('denied');
        }
        return;
      }

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
    loading,
    requestPermission,
    getCurrentLocation,
    startWatching,
    stopWatching,
  }
};

export const useReverseGeocode = (latitude: number, longitude: number) => {
  const [address, setAddress] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web') return;

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
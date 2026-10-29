import { Linking, Platform } from 'react-native';
import { Place, PlannedRoute, RouteStep, TravelMode } from '../types';

// OSRM Public Routing Server
const OSRM_PROFILES: Record<TravelMode, string> = {
  foot: 'foot',
  bike: 'bike',
  car: 'car',
};

/**
 * Decode an encoded polyline string (OSRM polyline algorithm)
 */
export function decodePolyline(encoded: string): [number, number][] {
  const points: [number, number][] = [];
  let index = 0;
  const len = encoded.length;
  let lat = 0;
  let lng = 0;

  while (index < len) {
    let b: number;
    let shift = 0;
    let result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    points.push([lat / 1e5, lng / 1e5]);
  }

  return points;
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)} sec`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

/**
 * Calculate multi-stop route between places using OpenStreetMap OSRM
 */
export async function calculateRoute(
  places: Place[],
  mode: TravelMode = 'foot',
  title?: string
): Promise<PlannedRoute | null> {
  if (places.length < 2) return null;

  // Format coords as lon,lat;lon,lat;...
  const coords = places.map((p) => `${p.longitude},${p.latitude}`).join(';');
  const profile = OSRM_PROFILES[mode] || 'foot';
  const url = `https://router.project-osrm.org/route/v1/${profile}/${coords}?overview=full&steps=true&geometries=geojson`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`OSRM routing failed: status ${response.status}`);
    }

    const data = await response.json();
    if (!data.routes || data.routes.length === 0) {
      return null;
    }

    const route = data.routes[0];
    const steps: RouteStep[] = [];

    if (route.legs) {
      for (const leg of route.legs) {
        if (leg.steps) {
          for (const s of leg.steps) {
            steps.push({
              instruction: s.maneuver?.type
                ? `${s.maneuver.modifier || ''} ${s.maneuver.type} onto ${s.name || 'unnamed path'}`.trim()
                : s.name || 'Continue',
              distanceMeters: Math.round(s.distance),
              durationSeconds: Math.round(s.duration),
              name: s.name,
            });
          }
        }
      }
    }

    // GeoJSON coordinates come in [lon, lat], convert to [lat, lon] for Leaflet / standard markers
    const geometry: [number, number][] = route.geometry?.coordinates
      ? route.geometry.coordinates.map(([lon, lat]: [number, number]) => [lat, lon])
      : [];

    return {
      id: `route_${Date.now()}`,
      title: title || `${places[0].name} to ${places[places.length - 1].name}`,
      mode,
      destinations: places,
      distanceMeters: Math.round(route.distance),
      durationSeconds: Math.round(route.duration),
      steps,
      geometry,
      createdAt: new Date().toISOString(),
    };
  } catch (err) {
    console.error('OSRM route calculation error:', err);
    return null;
  }
}

/**
 * Export route or single place to external navigation app (Apple Maps / Google Maps)
 */
export async function openExternalNavigation(destination: Place, mode: TravelMode = 'foot') {
  const { latitude, longitude, name } = destination;
  const encodedName = encodeURIComponent(name);

  if (Platform.OS === 'ios') {
    const dirMode = mode === 'car' ? 'd' : mode === 'bike' ? 'b' : 'w';
    const appleMapsUrl = `http://maps.apple.com/?daddr=${latitude},${longitude}&dirflg=${dirMode}&q=${encodedName}`;
    const supported = await Linking.canOpenURL(appleMapsUrl);
    if (supported) {
      await Linking.openURL(appleMapsUrl);
      return;
    }
  }

  // Fallback to Google Maps universal web / app URL
  const travelMode = mode === 'car' ? 'driving' : mode === 'bike' ? 'bicycling' : 'walking';
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=${travelMode}`;
  await Linking.openURL(googleMapsUrl);
}

/**
 * Open multi-stop route in Google Maps
 */
export async function openMultiStopInGoogleMaps(places: Place[]) {
  if (places.length < 2) return;
  const origin = `${places[0].latitude},${places[0].longitude}`;
  const destination = `${places[places.length - 1].latitude},${places[places.length - 1].longitude}`;
  const waypoints = places
    .slice(1, -1)
    .map((p) => `${p.latitude},${p.longitude}`)
    .join('|');

  let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;
  if (waypoints) {
    url += `&waypoints=${waypoints}`;
  }
  await Linking.openURL(url);
}

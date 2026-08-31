import { Coordinates, Route, RouteWaypoint } from '@/types';

const OSRM_BASE_URL = 'https://router.project-osrm.org';

interface OSRMRouteResponse {
  code: string;
  routes: Array<{
    geometry: string;
    distance: number;
    duration: number;
    weight: number;
    weight_name: string;
    legs: Array<{
      distance: number;
      duration: number;
      summary: string;
      steps: any[];
    }>;
  }>;
  waypoints: Array<{
    location: [number, number];
    name: string;
    distance: number;
  }>;
}

interface OSRMTableResponse {
  code: string;
  distances: number[][];
  durations: number[][];
  sources: Array<{ location: [number, number]; name: string; hint: string }>;
  destinations: Array<{ location: [number, number]; name: string; hint: string }>;
}

interface OSRMNearestResponse {
  code: string;
  waypoints: Array<{
    location: [number, number];
    name: string;
    distance: number;
  }>;
}

class RoutingService {
  private async request<T>(endpoint: string, body?: any): Promise<T> {
    const url = `${OSRM_BASE_URL}${endpoint}`;
    const options: RequestInit = {
      method: body ? 'POST' : 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`OSRM API error: ${response.status} - ${error.message || 'Unknown error'}`);
    }

    return response.json();
  }

  private decodePolyline(encoded: string): Coordinates[] {
    const points: Coordinates[] = [];
    let index = 0;
    let lat = 0;
    let lng = 0;

    while (index < encoded.length) {
      let shift = 0;
      let result = 0;
      let byte: number;

      do {
        byte = encoded.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);

      const deltaLat = (result & 1) ? ~(result >> 1) : (result >> 1);
      lat += deltaLat;

      shift = 0;
      result = 0;

      do {
        byte = encoded.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);

      const deltaLng = (result & 1) ? ~(result >> 1) : (result >> 1);
      lng += deltaLng;

      points.push({
        latitude: lat / 1e5,
        longitude: lng / 1e5,
      });
    }

    return points;
  }

  async getRoute(
    waypoints: Coordinates[],
    profile: 'driving' | 'walking' | 'cycling' = 'driving',
    options: {
      alternatives?: boolean;
      steps?: boolean;
      geometries?: 'polyline' | 'geojson';
      overview?: 'full' | 'simplified' | 'false';
    } = {}
  ): Promise<Route> {
    const coordinates = waypoints.map(w => `${w.longitude},${w.latitude}`).join(';');
    
    const params = new URLSearchParams({
      coordinates,
      overview: options.overview || 'full',
      geometries: options.geometries || 'polyline',
      steps: String(options.steps || false),
      alternatives: String(options.alternatives || false),
      annotations: 'distance,duration',
    });

    const response = await this.request<OSRMRouteResponse>(
      `/route/v1/${profile}/${coordinates}?${params.toString()}`
    );

    if (response.code !== 'Ok' || !response.routes.length) {
      throw new Error('No route found');
    }

    const route = response.routes[0];
    const coordinates_decoded = this.decodePolyline(route.geometry);

    const routeWaypoints: RouteWaypoint[] = response.waypoints.map((wp, i) => ({
      place_id: `waypoint-${i}`,
      order: i,
      coordinates: { latitude: wp.location[1], longitude: wp.location[0] },
      name: wp.name || `Waypoint ${i + 1}`,
    }));

    return {
      id: `route-${Date.now()}`,
      coordinates: coordinates_decoded,
      distance_meters: route.distance,
      duration_seconds: route.duration,
      waypoints: routeWaypoints,
      geometry: route.geometry,
      created_at: new Date().toISOString(),
    };
  }

  async getDistanceMatrix(
    locations: Coordinates[],
    profile: 'driving' | 'walking' | 'cycling' = 'driving'
  ): Promise<{ distances: number[][]; durations: number[][] }> {
    const coordinates = locations.map(l => `${l.longitude},${l.latitude}`).join(';');
    
    const response = await this.request<OSRMTableResponse>(
      `/table/v1/${profile}/${coordinates}?annotations=distance,duration`
    );

    if (response.code !== 'Ok') {
      throw new Error('Failed to calculate distance matrix');
    }

    return {
      distances: response.distances,
      durations: response.durations,
    };
  }

  async snapToRoad(coordinate: Coordinates): Promise<Coordinates> {
    const response = await this.request<OSRMNearestResponse>(
      `/nearest/v1/driving/${coordinate.longitude},${coordinate.latitude}`
    );

    if (response.code !== 'Ok' || !response.waypoints.length) {
      return coordinate;
    }

    const nearest = response.waypoints[0];
    return {
      latitude: nearest.location[1],
      longitude: nearest.location[0],
    };
  }

  async optimizeWaypointOrder(
    waypoints: Coordinates[],
    profile: 'driving' | 'walking' | 'cycling' = 'driving'
  ): Promise<Coordinates[]> {
    if (waypoints.length <= 2) return waypoints;

    const matrix = await this.getDistanceMatrix(waypoints, profile);
    const distances = matrix.distances;

    const visited = new Set<number>();
    const order = [0];
    visited.add(0);

    while (order.length < waypoints.length) {
      const current = order[order.length - 1];
      let nearest = -1;
      let minDist = Infinity;

      for (let i = 0; i < waypoints.length; i++) {
        if (!visited.has(i) && distances[current][i] < minDist) {
          minDist = distances[current][i];
          nearest = i;
        }
      }

      if (nearest !== -1) {
        order.push(nearest);
        visited.add(nearest);
      } else {
        break;
      }
    }

    return order.map(i => waypoints[i]);
  }

  generateGoogleMapsUrl(
    waypoints: Coordinates[],
    travelMode: 'driving' | 'walking' | 'bicycling' | 'transit' = 'driving'
  ): string {
    const encodedWaypoints = waypoints
      .map((wp, i) => `${i === 0 ? 'origin' : i === waypoints.length - 1 ? 'destination' : 'waypoint'}=${wp.latitude},${wp.longitude}`)
      .join('&');

  const baseUrl = 'https://www.google.com/maps/dir/?api=1';
  const params = new URLSearchParams({
    origin: `${waypoints[0].latitude},${waypoints[0].longitude}`,
    destination: `${waypoints[waypoints.length - 1].latitude},${waypoints[waypoints.length - 1].longitude}`,
    travelmode: travelMode,
    waypoints: waypoints.slice(1, -1).map(wp => `${wp.latitude},${wp.longitude}`).join('|'),
  });

  return `${baseUrl}&${params.toString()}`;
  }

  generateGoogleMapsDeepLink(
    waypoints: Coordinates[],
    travelMode: 'driving' | 'walking' | 'bicycling' | 'transit' = 'driving'
  ): { ios: string; android: string; web: string } {
    const origin = `${waypoints[0].latitude},${waypoints[0].longitude}`;
    const destination = `${waypoints[waypoints.length - 1].latitude},${waypoints[waypoints.length - 1].longitude}`;
    const waypointsStr = waypoints.slice(1, -1).map(wp => `${wp.latitude},${wp.longitude}`).join('|');

    const web = this.generateGoogleMapsUrl(waypoints, travelMode);
    
    const iosParams = new URLSearchParams({
      saddr: origin,
      daddr: destination,
      directionsmode: travelMode === 'bicycling' ? 'bicycling' : travelMode,
    });
    if (waypoints.length > 2) {
      iosParams.append('waypoints', waypointsStr);
    }
    const ios = `comgooglemaps://?${iosParams.toString()}`;

    const androidParams = new URLSearchParams({
      q: destination,
      mode: travelMode === 'bicycling' ? 'b' : travelMode[0],
    });
    if (waypoints.length > 2) {
      androidParams.append('waypoints', waypointsStr);
    }
    const android = `google.navigation:${androidParams.toString()}`;

    return { ios, android, web };
  }
}

export const routingService = new RoutingService();
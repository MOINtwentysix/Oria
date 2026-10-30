import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, useColorScheme, Platform, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { Place } from '../types';

interface MapViewComponentProps {
  places: Place[];
  userLocation?: { latitude: number; longitude: number };
  selectedPlace?: Place | null;
  onSelectPlace?: (place: Place) => void;
  routeGeometry?: [number, number][]; // [lat, lng] array
  height?: number | string;
}

export function MapViewComponent({
  places,
  userLocation = { latitude: 48.137154, longitude: 11.576124 },
  selectedPlace,
  onSelectPlace,
  routeGeometry,
}: MapViewComponentProps) {
  const scheme = useColorScheme() ?? 'light';
  const webViewRef = useRef<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Send update messages to WebView when props change
  useEffect(() => {
    if (webViewRef.current && Platform.OS !== 'web') {
      const payload = JSON.stringify({
        type: 'UPDATE_DATA',
        places,
        userLocation,
        selectedPlaceId: selectedPlace?.id,
        routeGeometry,
        theme: scheme,
      });
      webViewRef.current.postMessage(payload);
    }
  }, [places, userLocation, selectedPlace, routeGeometry, scheme]);

  // Leaflet HTML template with OpenStreetMap tiles
  const leafletHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    body, html, #map { margin: 0; padding: 0; height: 100%; width: 100%; background: ${scheme === 'dark' ? '#121212' : '#E5E5EA'}; }
    .custom-pin {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 2px solid #ffffff;
      box-shadow: 0 4px 10px rgba(0,0,0,0.3);
      cursor: pointer;
      transition: transform 0.2s ease;
    }
    .custom-pin:hover, .custom-pin.selected {
      transform: scale(1.25);
      border: 3px solid #000000;
      z-index: 1000 !important;
    }
    .user-dot {
      width: 16px;
      height: 16px;
      background: #007AFF;
      border: 3px solid #ffffff;
      border-radius: 50%;
      box-shadow: 0 0 12px rgba(0,122,255,0.6);
    }
    .leaflet-bar { border: none !important; border-radius: 12px !important; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important; }
    .leaflet-bar a { background: ${scheme === 'dark' ? '#1C1C1E' : '#FFFFFF'} !important; color: ${scheme === 'dark' ? '#FFFFFF' : '#000000'} !important; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    const map = L.map('map', { zoomControl: false }).setView([${userLocation.latitude}, ${userLocation.longitude}], 14);
    L.control.zoom({ position: 'topright' }).addTo(map);

    // OpenStreetMap standard tile layer
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    let markers = [];
    let userMarker = null;
    let routePolyline = null;

    function renderUser(loc) {
      if (!loc) return;
      if (userMarker) map.removeLayer(userMarker);
      const icon = L.divIcon({ className: '', html: '<div class="user-dot"></div>', iconSize: [16, 16], iconAnchor: [8, 8] });
      userMarker = L.marker([loc.latitude, loc.longitude], { icon }).addTo(map);
    }

    function renderPlaces(placeList, selectedId) {
      markers.forEach(m => map.removeLayer(m));
      markers = [];

      placeList.forEach(p => {
        const isSel = selectedId === p.id;
        const color = getCategoryColor(p.category);
        const icon = L.divIcon({
          className: '',
          html: '<div class="custom-pin ' + (isSel ? 'selected' : '') + '" style="background: ' + color + '"><span style="color:#fff;font-size:12px;font-weight:bold;">' + (p.category === 'cafe' ? '☕' : p.category === 'restaurant' ? '🍴' : p.category === 'park' ? '🌳' : '📍') + '</span></div>',
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        const m = L.marker([p.latitude, p.longitude], { icon }).addTo(map);
        m.on('click', () => {
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'PLACE_CLICK', placeId: p.id }));
          } else {
            window.parent.postMessage(JSON.stringify({ type: 'PLACE_CLICK', placeId: p.id }), '*');
          }
        });
        markers.push(m);
      });
    }

    function renderRoute(geom) {
      if (routePolyline) map.removeLayer(routePolyline);
      if (geom && geom.length > 0) {
        routePolyline = L.polyline(geom, {
          color: '#007AFF',
          weight: 5,
          opacity: 0.85,
          dashArray: null
        }).addTo(map);
        map.fitBounds(routePolyline.getBounds(), { padding: [50, 50] });
      }
    }

    function getCategoryColor(cat) {
      switch(cat) {
        case 'cafe': return '#A2845E';
        case 'restaurant': return '#FF9500';
        case 'park': return '#34C759';
        case 'attraction': return '#AF52DE';
        case 'museum': return '#5856D6';
        case 'shopping': return '#FF2D55';
        case 'nightlife': return '#BF5AF2';
        default: return '#007AFF';
      }
    }

    // Initial render
    renderUser(${JSON.stringify(userLocation)});
    renderPlaces(${JSON.stringify(places)}, ${JSON.stringify(selectedPlace?.id || null)});
    ${routeGeometry ? `renderRoute(${JSON.stringify(routeGeometry)});` : ''}

    // Listen for updates from React Native
    window.addEventListener('message', (event) => {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data.type === 'UPDATE_DATA') {
          renderUser(data.userLocation);
          renderPlaces(data.places, data.selectedPlaceId);
          renderRoute(data.routeGeometry);
        }
      } catch(e) {}
    });
  </script>
</body>
</html>
  `;

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'PLACE_CLICK' && onSelectPlace) {
        const found = places.find((p) => p.id === data.placeId);
        if (found) {
          onSelectPlace(found);
        }
      }
    } catch (e) {
      console.warn('Map message parse error:', e);
    }
  };

  if (Platform.OS === 'web') {
    if (!mounted) {
      return (
        <View style={[styles.container, styles.loadingCenter]}>
          <ActivityIndicator size="small" />
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <iframe
          srcDoc={leafletHtml}
          style={{ width: '100%', height: '100%', border: 'none' }}
          title="OpenStreetMap View"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html: leafletHtml }}
        style={styles.map}
        onMessage={handleMessage}
        scrollEnabled={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    overflow: 'hidden',
  },
  map: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

import React from 'react';
import L from 'leaflet';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import './leaflet-map.css';
import { Coordinates, Place } from '@/core/types';

type MapCanvasProps = {
  center?: Coordinates;
  places: Place[];
  selectedPlace?: Place | null;
  userLocation?: Coordinates | null;
  onSelect: (place: Place) => void;
  onCenterChange?: (center: Coordinates) => void;
};

const markerIcon = (icon: string, selected: boolean) => L.divIcon({
  className: 'oria-marker-shell',
  html: `<span class="oria-marker ${selected ? 'oria-marker-selected' : ''}"><span class="oria-marker-symbol">${icon}</span></span>`,
  iconSize: [44, 44],
  iconAnchor: [22, 22],
});

const userIcon = L.divIcon({
  className: 'oria-user-shell',
  html: '<span class="oria-user-dot"><span></span></span>',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

function MapMover({ center }: { center: Coordinates }) {
  const map = useMap();
  React.useEffect(() => { map.flyTo([center.latitude, center.longitude], Math.max(map.getZoom(), 13), { animate: true, duration: 0.55 }); }, [center.latitude, center.longitude, map]);
  return null;
}

function CenterReporter({ onCenterChange }: Pick<MapCanvasProps, 'onCenterChange'>) {
  useMapEvents({ moveend(event) { const point = event.target.getCenter(); onCenterChange?.({ latitude: point.lat, longitude: point.lng }); } });
  return null;
}

export default function LeafletMap({ center = { latitude: 52.52, longitude: 13.405 }, places, selectedPlace, userLocation, onSelect, onCenterChange }: MapCanvasProps) {
  return <MapContainer className="oria-leaflet" center={[center.latitude, center.longitude]} zoom={14} minZoom={3} scrollWheelZoom zoomControl={false} attributionControl={false}>
    <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" maxZoom={19} />
    <MapMover center={center} />
    <CenterReporter onCenterChange={onCenterChange} />
    {userLocation && <Marker position={[userLocation.latitude, userLocation.longitude]} icon={userIcon} interactive={false} />}
    {places.map((place) => <Marker key={place.id} position={[place.latitude, place.longitude]} icon={markerIcon(place.icon, selectedPlace?.id === place.id)} zIndexOffset={selectedPlace?.id === place.id ? 1000 : 0} eventHandlers={{ click: () => onSelect(place) }} />)}
    <span className="oria-map-credit">© OpenStreetMap</span>
  </MapContainer>;
}

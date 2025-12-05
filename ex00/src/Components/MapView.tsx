import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, MapContainerProps } from 'react-leaflet';
import L from 'leaflet';
import type { Location } from '../types';
import 'leaflet/dist/leaflet.css';

// icon urls for bundlers
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconShadowUrl from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl,
  shadowUrl: iconShadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

(L.Marker.prototype as any).options.icon = DefaultIcon;

interface MapViewProps {
  locations?: Array<Location | null>;
  mapProps?: Partial<MapContainerProps>;
  // control whether popups show the numeric coords (default false)
  showCoordsInPopup?: boolean;
}

function FitBounds({ locations }: { locations: Location[] }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    const valid = locations.filter(l => l && typeof l.lat === 'number' && typeof l.lng === 'number') as Location[];
    if (valid.length === 0) return;

    const latlngs = valid.map(l => L.latLng(l.lat as number, l.lng as number));
    const bounds = L.latLngBounds(latlngs);
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [map, locations]);

  return null;
}

const MapView: React.FC<MapViewProps> = ({ locations = [], mapProps = {}, showCoordsInPopup = false }) => {
  // filter and ensure numeric coords
  const safeLocations = locations.filter((l): l is Location => !!l && typeof l.lat === 'number' && typeof l.lng === 'number');

  const defaultCenter: [number, number] = [0, 0];
  const center: [number, number] =
    safeLocations.length > 0
      ? [
          safeLocations.reduce((s, l) => s + (l.lat ?? 0), 0) / safeLocations.length,
          safeLocations.reduce((s, l) => s + (l.lng ?? 0), 0) / safeLocations.length,
        ]
      : defaultCenter;

  const mapRef = useRef<any>(null);
  useEffect(() => {
    const m = mapRef.current;
    if (m && typeof m.invalidateSize === 'function') {
      setTimeout(() => m.invalidateSize(), 200);
    }
  }, [safeLocations.length]);

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <MapContainer
        whenCreated={(mapInstance) => {
          mapRef.current = mapInstance;
        }}
        center={center}
        zoom={safeLocations.length > 0 ? 6 : 2}
        style={{ height: '100%', width: '100%' }}
        {...(mapProps as any)}
      >
        <TileLayer
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {safeLocations.length > 0 && <FitBounds locations={safeLocations} />}

        {safeLocations.map((loc, idx) => (
          <Marker key={idx} position={[loc.lat as number, loc.lng as number]}>
            <Popup>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 700 }}>{loc.displayName ?? loc.name}</div>
                {/* Only show numeric coords in the popup when explicitly enabled */}
                {showCoordsInPopup && typeof loc.lat === 'number' && typeof loc.lng === 'number' && (
                  <div style={{ fontSize: 12, color: '#666' }}>{loc.lat.toFixed(5)}, {loc.lng.toFixed(5)}</div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapView;
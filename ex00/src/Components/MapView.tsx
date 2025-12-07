import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, MapContainerProps, Circle } from 'react-leaflet';
import L from 'leaflet';
import type { Location } from '../types';
import 'leaflet/dist/leaflet.css';

import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconShadowUrl from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl,
  shadowUrl: iconShadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [0, -41],
});

(L.Marker.prototype as any).options.icon = DefaultIcon;

// Crear icono personalizado con color
const createCustomIcon = (color: string) => {
  const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="30" height="45">
      <defs>
        <linearGradient id="grad${color}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${color};stop-opacity:0.7" />
        </linearGradient>
        <filter id="shadow">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.3"/>
        </filter>
      </defs>
      <path d="M12 0C7.03 0 3 4.03 3 9c0 6.75 9 18 9 18s9-11.25 9-18c0-4.97-4.03-9-9-9z" 
            fill="url(#grad${color})" 
            filter="url(#shadow)"/>
      <circle cx="12" cy="9" r="4" fill="white"/>
    </svg>
  `;
  
  return L.divIcon({
    html: svgIcon,
    className: 'custom-marker-icon',
    iconSize: [30, 45],
    iconAnchor: [15, 45],
    popupAnchor: [0, -45],
  });
};

const colors = ['#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#EF4444'];

interface MapViewProps {
  locations?: Array<Location | null>;
  mapProps?: Partial<MapContainerProps>;
  showCoordsInPopup?: boolean;
  darkMode?: boolean;
}

function FitBounds({ locations }: { locations: Location[] }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    const valid = locations.filter(l => l && typeof l.lat === 'number' && typeof l.lng === 'number') as Location[];
    if (valid.length === 0) return;

    const latlngs = valid.map(l => L.latLng(l.lat as number, l.lng as number));
    const bounds = L.latLngBounds(latlngs);
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 });
  }, [map, locations]);

  return null;
}

const MapView: React.FC<MapViewProps> = ({ 
  locations = [], 
  mapProps = {}, 
  showCoordsInPopup = false,
  darkMode = false 
}) => {
  const safeLocations = locations.filter((l): l is Location => !!l && typeof l.lat === 'number' && typeof l.lng === 'number');

  const defaultCenter: [number, number] = [20, 0];
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

  // Tiles para modo oscuro y claro
  const tileUrl = darkMode
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  const attribution = darkMode
    ? '&copy; <a href="https://carto.com/">CARTO</a>'
    : '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>';

  return (
    <div style={{ height: '100%', width: '100%', borderRadius: '1rem' }} className="overflow-hidden">
      <style>{`
        .custom-marker-icon {
          background: none !important;
          border: none !important;
          animation: markerBounce 0.5s ease-out;
        }
        
        @keyframes markerBounce {
          0% {
            transform: translateY(-100px) scale(0);
            opacity: 0;
          }
          50% {
            transform: translateY(10px) scale(1.1);
          }
          100% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }

        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        }

        .leaflet-popup-content {
          margin: 12px;
        }

        .custom-popup-content {
          min-width: 200px;
        }

        .custom-popup-content h3 {
          font-size: 16px;
          font-weight: 700;
          color: #4F46E5;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .custom-popup-content p {
          font-size: 13px;
          color: #666;
          margin: 4px 0;
        }

        .custom-popup-content .badge {
          display: inline-block;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          margin-top: 8px;
        }
      `}</style>

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
          attribution={attribution}
          url={tileUrl}
        />

        {safeLocations.length > 0 && <FitBounds locations={safeLocations} />}

        {safeLocations.map((loc, idx) => {
          const color = colors[idx % colors.length];
          const icon = createCustomIcon(color);

          return (
            <React.Fragment key={idx}>
              <Marker 
                position={[loc.lat as number, loc.lng as number]}
                icon={icon}
              >
                <Popup>
                  <div className="custom-popup-content">
                    <h3>
                      <span>📍</span>
                      {loc.displayName ?? loc.name}
                    </h3>
                    
                    {showCoordsInPopup && typeof loc.lat === 'number' && typeof loc.lng === 'number' && (
                      <p>
                        🧭 {loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}
                      </p>
                    )}
                    
                    <div className="badge">
                      Destino #{idx + 1}
                    </div>
                  </div>
                </Popup>
              </Marker>

              {/* Círculo de radio alrededor del marcador */}
              <Circle
                center={[loc.lat as number, loc.lng as number]}
                radius={50000}
                pathOptions={{
                  color: color,
                  fillColor: color,
                  fillOpacity: 0.1,
                  weight: 2,
                  opacity: 0.5,
                }}
              />
            </React.Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MapView;
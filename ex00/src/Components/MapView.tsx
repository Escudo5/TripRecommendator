import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Location } from '../types';
import { geocodingService, GeocodingResult } from '../services/geocodingService';

// Fix para iconos de Leaflet en Webpack
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';  // ← SIN ESPACIO

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L. Marker.prototype.options.icon = DefaultIcon;

interface MapViewProps {
  locations: Location[];
}

function FitBounds({ locations }: { locations: GeocodingResult[] }) {
  const map = useMap();

  useEffect(() => {
    if (locations.length > 0) {
      const bounds = L.latLngBounds(
        locations.map(loc => [loc.coordinates.lat, loc.coordinates.lng])
      );
      map. fitBounds(bounds, { padding: [50, 50] });
    }
  }, [locations, map]);

  return null;
}

export const MapView: React.FC<MapViewProps> = ({ locations }) => {
  const [geocodedLocations, setGeocodedLocations] = useState<GeocodingResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const geocodeLocations = async () => {
      setIsLoading(true);
      const placeNames = locations.map(loc => loc.name);
      const results = await geocodingService. geocodeMultiple(placeNames);
      setGeocodedLocations(results);
      setIsLoading(false);
    };

    if (locations.length > 0) {
      geocodeLocations();
    } else {
      setIsLoading(false);
    }
  }, [locations]);

  if (isLoading) {
    return (
      <div className="w-full h-96 bg-white rounded-lg shadow-lg flex items-center justify-center">
        <div className="text-center">
          <div className="flex gap-1 justify-center mb-3">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
          <p className="text-gray-600">Cargando mapa...</p>
        </div>
      </div>
    );
  }

  if (geocodedLocations.length === 0) {
    return (
      <div className="w-full h-96 bg-white rounded-lg shadow-lg flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl mb-4 block">🗺️</span>
          <p className="text-gray-600">No hay ubicaciones para mostrar</p>
          <p className="text-sm text-gray-500 mt-2">
            Pregunta por destinos en el chat para verlos aquí
          </p>
        </div>
      </div>
    );
  }

  const centerLat = geocodedLocations. reduce((sum, loc) => sum + loc.coordinates.lat, 0) / geocodedLocations.length;
  const centerLng = geocodedLocations.reduce((sum, loc) => sum + loc.coordinates.lng, 0) / geocodedLocations.length;

  return (
    <div className="w-full h-96 bg-white rounded-lg shadow-lg overflow-hidden">
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={6}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <FitBounds locations={geocodedLocations} />

        {geocodedLocations.map((loc, index) => (
          <Marker
            key={index}
            position={[loc.coordinates.lat, loc.coordinates.lng]}
          >
            <Popup>
              <div className="text-center">
                <p className="font-bold text-lg">{loc.name}</p>
                {loc.displayName && (
                  <p className="text-xs text-gray-600 mt-1">{loc.displayName}</p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
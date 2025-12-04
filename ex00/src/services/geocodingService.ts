export interface Coordinates {
  lat: number;
  lng: number;
}

export interface GeocodingResult {
  name: string;
  coordinates: Coordinates;
  displayName?: string;
}

class GeocodingService {
  private cache: Map<string, Coordinates> = new Map();

  // Geocodificar usando Nominatim (OpenStreetMap - gratis)
  async geocode(placeName: string): Promise<GeocodingResult | null> {
    // Verificar caché
    if (this.cache.has(placeName)) {
      return {
        name: placeName,
        coordinates: this.cache.get(placeName)! 
      };
    }

    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(placeName)}&limit=1`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'TripRecommendator/1.0'
        }
      });

      const data = await response.json();

      if (data.length > 0) {
        const result = data[0];
        const coordinates: Coordinates = {
          lat: parseFloat(result.lat),
          lng: parseFloat(result. lon)
        };

        // Guardar en caché
        this.cache.set(placeName, coordinates);

        return {
          name: placeName,
          coordinates,
          displayName: result.display_name
        };
      }

      return null;
    } catch (error) {
      console.error('Error geocoding:', placeName, error);
      return null;
    }
  }

  // Geocodificar múltiples lugares
  async geocodeMultiple(placeNames: string[]): Promise<GeocodingResult[]> {
    const promises = placeNames.map(name => this.geocode(name));
    const results = await Promise.all(promises);
    return results. filter(r => r !== null) as GeocodingResult[];
  }
}

export const geocodingService = new GeocodingService();
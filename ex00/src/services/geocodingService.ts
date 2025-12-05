// src/services/geocodingService.ts
// Cliente-only geocoding (Nominatim). Minimal/no console output to keep console clean.

export interface Location {
  name: string;
  lat?: number;
  lng?: number;
  displayName?: string | null;
}
export type GeocodingResult = Location | null;

async function timeout(ms: number) {
  return new Promise(res => setTimeout(res, ms));
}

async function fetchWithTimeout(url: string, options: RequestInit = {}, t = 8000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), t);
  const res = await fetch(url, { ...options, signal: controller.signal });
  clearTimeout(id);
  return res;
}

async function geocodeOne(name: string, attempts = 2): Promise<GeocodingResult> {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(name)}`;
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetchWithTimeout(url, {}, 8000);
      if (!res.ok) {
        await timeout(500 * (i + 1));
        continue;
      }
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) return null;
      const item = data[0];
      return {
        name,
        lat: item.lat ? parseFloat(item.lat) : undefined,
        lng: item.lon ? parseFloat(item.lon) : undefined,
        displayName: item.display_name || null
      };
    } catch {
      await timeout(400 * (i + 1));
    }
  }
  return null;
}

export async function geocodeName(name: string): Promise<GeocodingResult> {
  return geocodeOne(name, 2);
}

export async function geocodeMultiple(names: string[]): Promise<GeocodingResult[]> {
  const promises = names.map(n => geocodeOne(n).catch(() => null));
  return Promise.all(promises);
}

export const geocodingService = { geocodeName, geocodeMultiple };
export default geocodingService;
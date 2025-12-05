import { Message } from '../types';
import { geocodeMultiple, GeocodingResult } from './geocodingService';

export interface AIServiceConfig {
  apiKey?: string;
  model?: string;
}

class AIService {
  private apiKey: string | null = null;
  private modelName: string = 'models/gemini-2.5-flash';
  private useMock = false;

  constructor() {
    const envApiKey = process.env.REACT_APP_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (envApiKey) {
      this.apiKey = envApiKey;
      this.useMock = false;
    } else {
      this.useMock = true;
    }
  }

  configure(config: AIServiceConfig) {
    if (config.apiKey) {
      this.apiKey = config.apiKey;
      this.useMock = false;
    }
    if (config.model) this.modelName = config.model;
  }

  async getResponse(userMessage: string): Promise<Message> {
    if (this.useMock) return this.getMockResponse(userMessage);
    return this.getGeminiResponse(userMessage);
  }

  private getMockResponse(userMessage: string): Promise<Message> {
    const lower = userMessage.toLowerCase();
    if (lower.includes('playa')) {
      const locations = [
        { name: 'Cancún, México', displayName: 'Cancún, México', lat: 21.1619, lng: -86.8515 },
        { name: 'Tulum, México', displayName: 'Tulum, México', lat: 20.2110, lng: -87.4654 },
        { name: 'Playa del Carmen, México', displayName: 'Playa del Carmen, México', lat: 20.6296, lng: -87.0739 }
      ];
      const text = `¡Perfecto! Te propongo estas playas: ${locations.map(l => l.displayName).join(', ')}.`;
      return Promise.resolve({ sender: 'ai', text, locations } as Message);
    }
    return Promise.resolve({ sender: 'ai', text: 'No tengo sugerencias para eso por ahora.', locations: [] } as Message);
  }

  private async getGeminiResponse(userMessage: string): Promise<Message> {
    try {
      if (!this.apiKey) throw new Error('API key not found');

      const prompt = `Eres un asistente de viajes. El usuario pregunta: "${userMessage}"

RESPONDE EXCLUSIVAMENTE CON UN JSON VÁLIDO (SIN TEXTO EXTRA) en uno de estos formatos (PRIMERO PREFERIBLE):

1) Objeto con text y locations (cada location puede incluir lat/lng):
{
  "text": "Texto para mostrar en el chat",
  "locations": [
    {"name":"Cancún, México", "lat": 21.1619, "lng": -86.8515},
    {"name":"Tulum, México", "lat": 20.2110, "lng": -87.4654}
  ]
}

2) O un ARRAY simple de objetos (si no puedes incluir 'text'):
[
  {"name":"Phuket, Tailandia", "lat": 7.8804, "lng": 98.3923},
  {"name":"Bali, Indonesia", "lat": -8.3405, "lng": 115.0920}
]

Si no puedes dar coordenadas exactas, devuelve al menos los nombres en el campo 'name'.  
IMPORTANTE: Si devuelves 'text' debe ser el texto que se muestre en el chat.`;

      const url = `https://generativelanguage.googleapis.com/v1/${this.modelName}:generateContent?key=${this.apiKey}`;
      const body = { contents: [{ parts: [{ text: prompt }] }] };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        let errBody;
        try { errBody = await res.json(); } catch { errBody = await res.text(); }
        throw new Error(`API Error: ${res.status}: ${JSON.stringify(errBody)}`);
      }

      const data = await res.json();
      const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
      const text = String(candidateText || '').trim();

      // Extract JSON (object or array) if present
      const jsonMatch = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/m);
      let names: string[] = [];
      let parsedTextField: string | null = null;
      let parsedLocationsFromModel: Array<{ name?: string; lat?: number | string; lng?: number | string }> = [];

      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          if (Array.isArray(parsed)) {
            parsedLocationsFromModel = parsed.map((el: any) => ({
              name: el?.name,
              lat: el?.lat,
              lng: el?.lng
            }));
            names = parsedLocationsFromModel.map(p => p.name).filter(Boolean as any);
          } else if (parsed && Array.isArray(parsed.locations)) {
            parsedTextField = typeof parsed.text === 'string' ? parsed.text : null;
            parsedLocationsFromModel = parsed.locations.map((el: any) => ({
              name: el?.name,
              lat: el?.lat,
              lng: el?.lng
            }));
            names = parsedLocationsFromModel.map(p => p.name).filter(Boolean as any);
          } else if (parsed && parsed.name) {
            parsedLocationsFromModel = [{ name: parsed.name, lat: parsed.lat, lng: parsed.lng }];
            names = [parsed.name];
            parsedTextField = typeof parsed.text === 'string' ? parsed.text : null;
          }
        } catch {
          // ignore parse errors, we fallback to heuristics
        }
      }

      // Heuristic: find "City, Country" occurrences
      if (names.length === 0) {
        const placeRegex = /([A-ZÁÉÍÓÚÑ][\wáéíóúñü\-\.\s']+,\s*[A-ZÁÉÍÓÚÑ\wáéíóúñü\.\-]+)/g;
        const matches = Array.from(String(text).matchAll(placeRegex)).map(m => m[0]).slice(0, 8);
        if (matches.length > 0) {
          names = Array.from(new Set(matches.map(s => s.trim())));
        }
      }

      // Build normalized locations with numeric lat/lng when possible
      let normalizedLocations: Array<{ name: string; lat?: number; lng?: number; displayName?: string | null }> = [];

      if (parsedLocationsFromModel.length > 0 && parsedLocationsFromModel.some(p => p?.lat != null && p?.lng != null)) {
        normalizedLocations = parsedLocationsFromModel.map(p => {
          const latNum = p.lat != null ? Number(p.lat) : undefined;
          const lngNum = p.lng != null ? Number(p.lng) : undefined;
          return {
            name: p.name ?? '',
            lat: Number.isFinite(latNum) ? latNum : undefined,
            lng: Number.isFinite(lngNum) ? lngNum : undefined,
            displayName: p.name ?? null
          };
        });
      } else if (names.length > 0) {
        // fallback: geocode names in client (may fail due to CORS/rate limits)
        try {
          const geocoded = await geocodeMultiple(names);
          normalizedLocations = geocoded.map((g, i) => {
            const name = names[i] ?? `loc${i}`;
            if (g && g.lat != null && g.lng != null) {
              const latNum = Number(g.lat);
              const lngNum = Number(g.lng);
              return {
                name,
                lat: Number.isFinite(latNum) ? latNum : undefined,
                lng: Number.isFinite(lngNum) ? lngNum : undefined,
                displayName: g.displayName ?? name
              };
            }
            // no coords found
            return { name, displayName: name };
          });
        } catch {
          normalizedLocations = names.map(n => ({ name: n, displayName: n }));
        }
      }

      // Build final display text: prefer parsedTextField, else use text before JSON; always add "Lugares sugeridos" if needed
      let displayText = parsedTextField ?? text;
      if (jsonMatch) {
        displayText = displayText.replace(jsonMatch[0], '').trim() || displayText;
      }
      if (!displayText) displayText = 'Aquí tienes algunas opciones:';

      const cleanNames = normalizedLocations
        .map(l => (l ? (l.displayName ?? l.name) : undefined))
        .filter((x): x is string => typeof x === 'string' && x.length > 0);

      if (cleanNames.length > 0) {
        const lower = displayText.toLowerCase();
        const includeAll = cleanNames.every((nm) => lower.includes(nm.toLowerCase()));
        if (!includeAll) displayText = `${displayText}\n\nLugares sugeridos: ${cleanNames.join(', ')}`;
      }

      return {
        sender: 'ai',
        text: displayText,
        locations: normalizedLocations as any
      } as Message;
    } catch {
      return { sender: 'ai', text: 'Lo siento, hubo un error procesando tu petición.', locations: [] } as Message;
    }
  }
}

export const aiService = new AIService();
export default aiService;
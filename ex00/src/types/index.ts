export interface Location {
  name: string;
  // Coordenadas opcionales (se rellenan tras geocodificar)
  lat?: number;
  lng?: number;
  // Nombre legible devuelto por el geocoding (opcional)
  displayName?: string;
}

export interface Message {
  sender: 'user' | 'ai' | string;
  text: string;
  // Opcional: lista de ubicaciones asociadas (puede estar vacía)
  locations?: Location[];
}
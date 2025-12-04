// Tipo para los mensajes del chat
export type Message = {
  sender: 'user' | 'ai';  // Solo puede ser 'user' o 'ai'
  text: string;
  locations?: Location[];  // Opcional: ubicaciones mencionadas
};

// Tipo para las ubicaciones
export type Location = {
  name: string;           // Ej: "Costa Brava"
  coordinates?: {         // Opcional: se llena cuando se geocodifica
    lat: number;
    lng: number;
  };
  description?: string;   // Opcional: descripción de la IA
};
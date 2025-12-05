import { Message } from '../types';

export interface AIServiceConfig {
  apiKey?: string;
  model?: string;
}

class AIService {
  private apiKey: string | null = null;
  private useMock: boolean = true;

  constructor() {
    const envApiKey = process.env. REACT_APP_GEMINI_API_KEY;
    if (envApiKey) {
      this.configure({ apiKey: envApiKey });
    } else {
      console.log('⚠️ No API key found, using MOCK mode');
    }
  }

  configure(config: AIServiceConfig) {
    this.apiKey = config.apiKey || null;
    this.useMock = ! this.apiKey;

    console.log('🤖 AI Service configured:', this.useMock ? '🔧 MOCK MODE' : '✨ GEMINI API MODE');
  }

  async getResponse(userMessage: string): Promise<Message> {
    if (this.useMock) {
      return this.getMockResponse(userMessage);
    } else {
      return this.getGeminiResponse(userMessage);
    }
  }

  private getMockResponse(userMessage: string): Promise<Message> {
    const lowerMessage = userMessage.toLowerCase();
    
    let response: Message;

    if (lowerMessage.includes('playa')) {
      response = {
        sender: 'ai',
        text: 'Te recomiendo Costa Brava (España), Algarve (Portugal) y las playas de Albania.',
        locations: [
          { name: 'Costa Brava, España' },
          { name: 'Algarve, Portugal' },
          { name: 'Albania' }
        ]
      };
    } else if (lowerMessage.includes('montaña') || lowerMessage.includes('montana')) {
      response = {
        sender: 'ai',
        text: 'Te sugiero los Alpes Suizos, los Pirineos y los Dolomitas en Italia.',
        locations: [
          { name: 'Alpes Suizos' },
          { name: 'Pirineos' },
          { name: 'Dolomitas, Italia' }
        ]
      };
    } else if (lowerMessage.includes('ciudad')) {
      response = {
        sender: 'ai',
        text: 'Para ciudades te recomiendo Barcelona, Lisboa y Ámsterdam.',
        locations: [
          { name: 'Barcelona, España' },
          { name: 'Lisboa, Portugal' },
          { name: 'Ámsterdam, Países Bajos' }
        ]
      };
    } else {
      response = {
        sender: 'ai',
        text: '¿Qué tipo de destino buscas?  Puedo ayudarte con playa, montaña o ciudad.'
      };
    }

    return new Promise(resolve => setTimeout(() => resolve(response), 500));
  }

  private async getGeminiResponse(userMessage: string): Promise<Message> {
    try {
      if (! this.apiKey) {
        throw new Error('API key not found');
      }

      const prompt = `Eres un asistente de viajes experto.  El usuario te pregunta: "${userMessage}"

Responde de forma amigable y recomienda 2-3 destinos específicos.  
IMPORTANTE: Tu respuesta debe seguir EXACTAMENTE este formato JSON:

{
  "text": "Tu respuesta amigable aquí",
  "locations": [
    {"name": "Ciudad, País"},
    {"name": "Ciudad, País"}
  ]
}

Ejemplo:
{
  "text": "¡Excelente elección! Para playas te recomiendo estas opciones increíbles:",
  "locations": [
    {"name": "Cancún, México"},
    {"name": "Maldivas"},
    {"name": "Bali, Indonesia"}
  ]
}

Responde SOLO con el JSON, sin texto adicional.`;

      console.log('📡 Llamando a Gemini API...');

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }]
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Error de API:', errorData);
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Respuesta de Gemini:', data);

      const text = data.candidates[0].content.parts[0].text;

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedResponse = JSON.parse(jsonMatch[0]);
        
        return {
          sender: 'ai',
          text: parsedResponse.text,
          locations: parsedResponse.locations || []
        };
      } else {
        console.warn('⚠️ Gemini no devolvió JSON válido');
        return {
          sender: 'ai',
          text: text,
          locations: []
        };
      }

    } catch (error: any) {
      console.error('❌ Error calling Gemini API:', error);
      
      return {
        sender: 'ai',
        text: 'Lo siento, hubo un error al procesar tu petición. Por favor intenta de nuevo.'
      };
    }
  }
}

export const aiService = new AIService();
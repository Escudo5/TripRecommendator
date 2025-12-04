import React, { useState } from 'react';
import { Message } from './types';
import { aiService } from './services/aiService';
import {MapView} from './Components/MapView';

function App() 
{

  // creamos array con 2 posiciones, en la primera guardamos el valor actual del estado(Messages con sus atributos). 
  // Posicion 2 guarda la funcion para cambiar el valor de mensajes
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'user', text: 'Quiero ir a la playa' },
    { sender: 'ai', text: 'Te recomiendo Costa Brava, España' },
  ]);

  const [inputText, setInputText] = useState<string>('');
  const [showMap, setShowMap] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);


  // Funcion asincrona, puede usar wait
  const handleSend = async () => 
    {
      if (inputText.trim() === '') return;
      if (isLoading) return;

      // Mensaje del usuario
      const userMessage: Message = 
      {
        sender: 'user',
        text: inputText
      };

      // Añadir mensaje del usuario inmediatamente
      setMessages(prev => [...prev, userMessage]);
      const currentInput = inputText;
      setInputText('');
      setIsLoading(true);

      try 
      {
        // Obtener respuesta de la IA (async)
        const aiResponse = await aiService.getResponse(currentInput);
        
        // Añadir respuesta de la IA
        setMessages(prev => [...prev, aiResponse]);
      } 
      catch (error) 
      {
        console.error('Error getting AI response:', error);
        const errorMessage: Message = 
        {
          sender: 'ai',
          text: 'Lo siento, hubo un error.  Intenta de nuevo.'
        };
        setMessages(prev => [...prev, errorMessage]);
      } 
      finally 
      {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-4">🌍 Trip Recommendator</h1>
      
      {/* Chat */}
      {! showMap && (
        <div className="space-y-2 mb-4">
          {messages.map((msg, index) => (
            <div 
              key={index}
              className={`
                p-3 rounded-lg max-w-md
                ${msg.sender === 'user' 
                  ? 'bg-blue-500 text-white ml-auto' 
                  : 'bg-white text-gray-800'
                }
              `}
            >
              {msg.text}
            </div>
          ))}
        </div>
      )}

      {/* Indicador de carga */}
      {! showMap && isLoading && (
        <div className="flex items-center gap-2 p-3 bg-white rounded-lg max-w-md mb-4">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
          <span className="text-gray-500 text-sm">La IA está pensando...</span>
        </div>
      )}

      {/* Mapa (placeholder) */}
{/* Mapa */}
        {showMap && (
          <div className="mt-4">
            {(() => {
              const allLocations = messages
                .filter(msg => msg. sender === 'ai' && msg.locations)
                .flatMap(msg => msg.locations! );
              
              return (
                <>
                  <div className="mb-4 p-4 bg-white rounded-lg shadow">
                    <h2 className="text-xl font-bold mb-2">🗺️ Ubicaciones sugeridas</h2>
                    <p className="text-sm text-gray-600">
                      {allLocations.length} ubicación{allLocations.length !== 1 ? 'es' : ''} encontrada{allLocations.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <MapView locations={allLocations} />
                </>
              );
            })()}
          </div>
        )}

      {/* Input */}
      <div className="mt-4 flex gap-2">
        <input 
          type="text"
          placeholder="Escribe tu destino..."
          className="flex-1 p-3 rounded-lg border border-gray-300 disabled:opacity-50"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !isLoading) {
              handleSend();
            }
          }}
          disabled={isLoading}
        />
        <button 
          onClick={handleSend}
          disabled={isLoading}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Enviando.. .' : 'Enviar'}
        </button>
        <button 
          onClick={() => setShowMap(! showMap)}
          className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600"
        >
          {showMap ? '💬 Chat' : '🗺️ Mapa'}
        </button>
      </div>
    </div>
  );
}

export default App;
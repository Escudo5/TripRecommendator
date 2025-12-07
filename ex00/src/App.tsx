import React, { useState, useEffect } from 'react';
import { Message } from './types';
import { aiService } from './services/aiService';
import MapView from './Components/MapView';

type ChatMessage = Message & { typing?: boolean };

function TypingDots() {
  return (
    <>
      <style>{`
        .typing {
          display: inline-block;
          padding: 8px 12px;
          border-radius: 18px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #fff;
        }
        .dots {
          display: inline-block;
          vertical-align: middle;
        }
        .dot {
          display: inline-block;
          width: 6px;
          height: 6px;
          margin: 0 2px;
          background: #fff;
          border-radius: 50%;
          opacity: 0.3;
          transform: translateY(0);
          animation: blink 1s infinite;
        }
        .dot:nth-child(1) { animation-delay: 0s; }
        .dot:nth-child(2) { animation-delay: 0.15s; }
        .dot:nth-child(3) { animation-delay: 0.3s; }

        @keyframes blink {
          0% { opacity: 0.3; transform: translateY(0); }
          30% { opacity: 1; transform: translateY(-4px); }
          60% { opacity: 0.3; transform: translateY(0); }
          100% { opacity: 0.3; transform: translateY(0); }
        }
      `}</style>

      <div className="typing">
        <div className="dots" aria-hidden>
          <span className="dot" />
          <span className="dot" />
          <span className="dot" />
        </div>
      </div>
    </>
  );
}

function App(): JSX.Element {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('tripRecommendator_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [{ sender: 'ai', text: '¡Hola! 👋 Soy tu asistente de viajes. ¿A dónde te gustaría ir?' }];
      }
    }
    return [{ sender: 'ai', text: '¡Hola! 👋 Soy tu asistente de viajes. ¿A dónde te gustaría ir?' }];
  });
  
  const [inputText, setInputText] = useState<string>('');
  const [showMap, setShowMap] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('tripRecommendator_darkMode');
    return saved === 'true';
  });

  // Guardar historial en localStorage
  useEffect(() => {
    const nonTyping = messages.filter(m => !m.typing);
    localStorage.setItem('tripRecommendator_history', JSON.stringify(nonTyping));
  }, [messages]);

  // Guardar preferencia de tema
  useEffect(() => {
    localStorage.setItem('tripRecommendator_darkMode', String(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleSend = async (text?: string) => {
    const messageText = (text || inputText).trim();
    if (!messageText || isLoading) return;

    const userMessage: ChatMessage = { sender: 'user', text: messageText };
    const typingPlaceholder: ChatMessage = { sender: 'ai', text: '', typing: true };

    setMessages(prev => [...prev, userMessage, typingPlaceholder]);
    setInputText('');
    setIsLoading(true);

    try {
      const aiResponse = await aiService.getResponse(messageText);
      setMessages(prev => {
        const idx = prev.map(m => m.typing ? 1 : 0).lastIndexOf(1);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = aiResponse as ChatMessage;
          return copy;
        }
        return [...prev, aiResponse as ChatMessage];
      });
    } catch {
      setMessages(prev => {
        const idx = prev.map(m => m.typing ? 1 : 0).lastIndexOf(1);
        const errMsg: ChatMessage = { sender: 'ai', text: 'Lo siento, hubo un error interno.', locations: [] };
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = errMsg;
          return copy;
        }
        return [...prev, errMsg];
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = () => {
    setMessages([{ sender: 'ai', text: '¡Hola! 👋 Soy tu asistente de viajes. ¿A dónde te gustaría ir?' }]);
    localStorage.removeItem('tripRecommendator_history');
  };

  const getLastAIMessage = (): Message | undefined => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].sender === 'ai' && !messages[i].typing) return messages[i];
    }
    return undefined;
  };

  const aiMessage = getLastAIMessage();
  const chatRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  // Sugerencias rápidas
  const quickSuggestions = [
    { icon: '🏖️', text: 'Playas paradisíacas', query: 'Quiero ir a playas tropicales' },
    { icon: '🏔️', text: 'Montañas', query: 'Destinos de montaña para senderismo' },
    { icon: '🏛️', text: 'Ciudades históricas', query: 'Ciudades con historia y cultura' },
    { icon: '🌃', text: 'Metrópolis', query: 'Grandes ciudades modernas' },
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    }`}>
      {/* Header */}
      <header className={`shadow-md sticky top-0 z-10 backdrop-blur-md transition-colors duration-300 ${
        darkMode ? 'bg-gray-800/80' : 'bg-white/80'
      }`}>
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center animate-pulse-slow">
                <span className="text-2xl">🌍</span>
              </div>
              <h1 className={`text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent ${
                darkMode ? 'opacity-90' : ''
              }`}>
                Trip Recommendator
              </h1>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Dark Mode Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${
                  darkMode ? 'bg-yellow-400 text-gray-900' : 'bg-gray-800 text-yellow-400'
                }`}
                title={darkMode ? 'Modo claro' : 'Modo oscuro'}
              >
                {darkMode ? '☀️' : '🌙'}
              </button>

              {/* Clear History */}
              <button
                onClick={clearHistory}
                className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 ${
                  darkMode 
                    ? 'bg-red-600 text-white hover:bg-red-700' 
                    : 'bg-red-500 text-white hover:bg-red-600'
                }`}
                title="Limpiar historial"
              >
                🗑️
              </button>

              {/* Map Toggle */}
              <button
                onClick={() => setShowMap(s => !s)}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
              >
                {showMap ? '🗺️ Ocultar Mapa' : '🗺️ Mostrar Mapa'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className={`grid ${showMap ? 'lg:grid-cols-2' : 'lg:grid-cols-1'} gap-6`}>
          
          {/* Chat Section */}
          <div className={`rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-colors duration-300 ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`} style={{ height: showMap ? '600px' : '70vh' }}>
            
            {/* Quick Suggestions - Solo si no hay mensajes del usuario */}
            {messages.length === 1 && (
              <div className={`p-4 border-b transition-colors duration-300 ${
                darkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'
              }`}>
                <p className={`text-xs font-semibold mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  💡 Sugerencias rápidas:
                </p>
                <div className="flex flex-wrap gap-2">
                  {quickSuggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(suggestion.query)}
                      disabled={isLoading}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                        darkMode
                          ? 'bg-purple-600 text-white hover:bg-purple-700'
                          : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                      }`}
                    >
                      {suggestion.icon} {suggestion.text}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chat Messages */}
            <div 
              ref={chatRef}
              className={`flex-1 overflow-y-auto p-6 space-y-4 transition-colors duration-300 ${
                darkMode ? 'bg-gradient-to-b from-gray-900 to-gray-800' : 'bg-gradient-to-b from-gray-50 to-white'
              }`}
            >
              {messages.map((m, idx) => (
                <div 
                  key={idx} 
                  className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'} animate-slideIn`}
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  {m.typing ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-sm shadow-lg">
                        AI
                      </div>
                      <TypingDots />
                    </div>
                  ) : (
                    <div className={`flex items-end space-x-2 max-w-[80%] ${m.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0 shadow-lg ${
                        m.sender === 'user' 
                          ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
                          : 'bg-gradient-to-br from-purple-500 to-indigo-600'
                      }`}>
                        {m.sender === 'user' ? '👤' : 'AI'}
                      </div>
                      <div className={`rounded-2xl px-4 py-3 shadow-lg transition-transform hover:scale-[1.02] ${
                        m.sender === 'user'
                          ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-sm'
                          : darkMode
                            ? 'bg-gray-700 text-gray-100 border border-gray-600 rounded-bl-sm'
                            : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{m.text}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Input Section */}
            <div className={`p-4 border-t transition-colors duration-300 ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="flex gap-2">
                <input
                  className={`flex-1 px-4 py-3 rounded-xl border-2 focus:outline-none transition-all duration-200 ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500'
                      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                  }`}
                  placeholder="Escribe tu destino ideal..."
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
                  disabled={isLoading}
                />
                <button 
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  onClick={() => handleSend()}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="animate-spin inline-block">⏳</span>
                  ) : (
                    '✈️'
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Map Section */}
          {showMap && (
            <div className={`rounded-2xl shadow-2xl overflow-hidden transition-colors duration-300 ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`} style={{ height: '600px' }}>
              <div className="h-full relative">
                {/* Map Stats Badge */}
                <div className={`absolute top-4 left-4 z-[1000] px-4 py-2 rounded-lg shadow-xl backdrop-blur-md transition-colors duration-300 ${
                  darkMode ? 'bg-gray-800/90 text-white' : 'bg-white/90 text-gray-700'
                }`}>
                  <p className="text-sm font-semibold flex items-center gap-2">
                    <span className="text-lg">📍</span>
                    <span>{aiMessage?.locations?.length || 0} destino(s)</span>
                  </p>
                </div>

                {/* Legend */}
                {aiMessage && aiMessage.locations && aiMessage.locations.length > 0 && (
                  <div className={`absolute bottom-4 left-4 z-[1000] px-4 py-3 rounded-lg shadow-xl backdrop-blur-md max-w-xs transition-colors duration-300 ${
                    darkMode ? 'bg-gray-800/90 text-white' : 'bg-white/90 text-gray-700'
                  }`}>
                    <p className="text-xs font-bold mb-2">🗺️ Destinos:</p>
                    <ul className="text-xs space-y-1">
                      {aiMessage.locations.slice(0, 5).map((loc, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          <span className="truncate">{loc?.displayName || loc?.name}</span>
                        </li>
                      ))}
                      {aiMessage.locations.length > 5 && (
                        <li className="text-gray-500">+ {aiMessage.locations.length - 5} más</li>
                      )}
                    </ul>
                  </div>
                )}

                <MapView locations={aiMessage?.locations ?? []} showCoordsInPopup={false} darkMode={darkMode} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
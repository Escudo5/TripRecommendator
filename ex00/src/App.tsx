import React, { useState } from 'react';
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
          background: #ffffff;
          color: #333;
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
          background: #666;
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
  const [messages, setMessages] = useState<ChatMessage[]>([
    { sender: 'user', text: 'Quiero ir a la playa' },
    { sender: 'ai', text: 'Te recomiendo Costa Brava, España' },
  ]);
  const [inputText, setInputText] = useState<string>('');
  const [showMap, setShowMap] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = { sender: 'user', text };
    const typingPlaceholder: ChatMessage = { sender: 'ai', text: '', typing: true };

    setMessages(prev => [...prev, userMessage, typingPlaceholder]);
    setInputText('');
    setIsLoading(true);

    try {
      const aiResponse = await aiService.getResponse(userMessage.text);

      // No modificamos ni quitamos locations: las mantendremos para el mapa,
      // pero sustituimos el placeholder por el texto final (ya saneado en aiService).
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

  // helper: get last AI message for map (ignore typing placeholders)
  const getLastAIMessage = (): Message | undefined => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].sender === 'ai' && !messages[i].typing) return messages[i];
    }
    return undefined;
  };

  const aiMessage = getLastAIMessage();

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-4">Trip Recommendator 🌍</h1>

      <div className="space-y-2 mb-4">
        {messages.map((m, idx) => (
          <div key={idx} className={m.sender === 'user' ? 'text-right' : 'text-left'}>
            {m.typing ? (
              <div style={{ display: 'inline-block', padding: 8 }}>
                <TypingDots />
              </div>
            ) : (
              <>
                <div className={`inline-block rounded-lg px-4 py-2 ${m.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-white text-gray-800'}`}>
                  {m.text}
                </div>

                {/* NOTA: removida la lista de locations para evitar duplicados en el chat.
                    Las locations siguen disponibles en el objeto Message para el mapa. */}
              </>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-2 items-center mb-4">
        <input
          className="flex-1 p-2 rounded border"
          placeholder="Escribe tu destino..."
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
        />
        <button className="px-4 py-2 bg-blue-500 text-white rounded" onClick={handleSend} disabled={isLoading}>Enviar</button>
        <button className="px-4 py-2 bg-green-500 text-white rounded" onClick={() => setShowMap(s => !s)}>{showMap ? 'Ocultar mapa' : 'Mostrar mapa'}</button>
      </div>

      <div style={{ marginTop: 16, height: 480 }}>
        { showMap && <MapView locations={aiMessage?.locations ?? []} showCoordsInPopup={false} /> }
      </div>
    </div>
  );
}

export default App;
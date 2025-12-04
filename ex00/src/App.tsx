import React, { useState } from 'react';

function App() {
  const [messages, setMessages] = useState([
    { sender: 'user', text: 'Quiero ir a la playa' },
    { sender: 'ai', text: 'Te recomiendo Costa Brava, España' },
  ]);

  const [inputText, setInputText] = useState('');

  const handleSend = () => {
    if (inputText.trim() === '') return;

    const newMessage = {
      sender: 'user',
      text: inputText
    };

    setMessages([... messages, newMessage]);
    setInputText('');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-4">🌍 Trip Recommendator</h1>
      
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

      <div className="mt-4 flex gap-2">
        <input 
          type="text"
          placeholder="Escribe tu destino..."
          className="flex-1 p-3 rounded-lg border border-gray-300"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        <button 
          onClick={handleSend}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg"
        >
          Enviar
        </button>
      </div>
    </div>
  );
}

export default App;
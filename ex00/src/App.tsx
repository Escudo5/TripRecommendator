import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          🌍 Trip Recommendator
        </h1>
        <p className="text-gray-600 mb-6">
          ¡TailwindCSS está funcionando correctamente!
        </p>
        <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-300">
          Empezar a planear mi viaje
        </button>
      </div>
    </div>
  );
}

export default App;
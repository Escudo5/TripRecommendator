<div align="center">

# 🌍 Trip Recommendator

### *Tu asistente inteligente de viajes con IA*

[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Google Gemini](https://img.shields.io/badge/Gemini-2.5-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

![Demo](https://via.placeholder.com/800x400/667eea/ffffff?text=🌍+Trip+Recommendator)

**Chat con IA + Mapas Interactivos + Diseño Moderno**

</div>

---

## ✨ ¿Qué es esto?

**Trip Recommendator** es una aplicación web que combina **Google Gemini AI** con **mapas interactivos** para ayudarte a descubrir destinos de viaje. Pregunta en lenguaje natural y obtén recomendaciones visualizadas en tiempo real.

```
💬 "Quiero ir a playas tropicales"
    ↓
🤖 IA analiza y sugiere destinos
    ↓
🗺️ Mapa muestra ubicaciones con marcadores interactivos
```

### 🎯 Características

<table>
<tr>
<td width="50%">

**🤖 Inteligencia Artificial**
- Powered by Google Gemini 2.5
- Respuestas en lenguaje natural
- Modo fallback sin API key

</td>
<td width="50%">

**🗺️ Mapas Interactivos**
- Marcadores con colores únicos
- Geocodificación automática
- Zoom y navegación fluida

</td>
</tr>
<tr>
<td width="50%">

**🎨 Interfaz Moderna**
- Modo claro/oscuro
- Animaciones suaves
- Responsive design

</td>
<td width="50%">

**💾 Persistencia**
- Historial guardado
- Preferencias de tema
- Sugerencias rápidas

</td>
</tr>
</table>

---

## 🛠️ Stack Tecnológico

| Categoría | Tecnología | Uso |
|-----------|------------|-----|
| **Frontend** | React 18 + TypeScript | UI reactiva con tipado |
| **Estilos** | Tailwind CSS | Diseño moderno y responsive |
| **Mapas** | Leaflet + React Leaflet | Visualización geográfica |
| **IA** | Google Gemini 2.5 Flash | Generación de recomendaciones |
| **Geocoding** | Nominatim (OSM) | Conversión nombre → coordenadas |
| **DevOps** | Docker + Makefile | Containerización y automatización |

---

## 🚀 Inicio Rápido

### Prerrequisitos
```bash
node >= 18.x
docker >= 24.x (recomendado)
```

### 1. Clonar
```bash
git clone https://github.com/Escudo5/TripRecommendator.git
cd TripRecommendator/ex00
```

### 2. Configurar API Key
Crea `.env` en `ex00/`:
```bash
REACT_APP_GEMINI_API_KEY=tu_api_key_aquí
```

> 🔑 **Obtener API Key**: [Google AI Studio](https://makersuite.google.com/app/apikey) (gratis, 60 req/min)

### 3. Ejecutar

**Con Docker (recomendado):**
```bash
make rebuild && make dev
```

**Sin Docker:**
```bash
npm install
npm start
```

Abre **http://localhost:3000** 🎉

---

## 📚 Comandos Útiles

```bash
make dev         # Iniciar con logs
make restart     # Reiniciar contenedor
make clean       # Reset completo
make shell       # Entrar al contenedor
```

---

## 🎓 Aprendizajes y Retos

### 🧠 Desafíos Técnicos Superados

<details>
<summary><b>1. Integración con API de Google Gemini</b></summary>

**Reto**: Parsear respuestas de IA en formato JSON inconsistente.

**Solución**: 
- Sistema de regex robusto para extraer JSON
- Fallback a detección heurística de lugares
- Modo mock para desarrollo sin API key

```typescript
// Extracto de aiService.ts
const jsonMatch = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/m);
const parsed = JSON.parse(jsonMatch[0]);
```

</details>

<details>
<summary><b>2. Geocodificación Asíncrona</b></summary>

**Reto**: Convertir nombres de ciudades a coordenadas GPS sin bloquear la UI.

**Solución**:
- Requests paralelos con `Promise.all()`
- Timeout de 8s con `AbortController`
- Manejo de rate limits de Nominatim

```typescript
async function geocodeMultiple(names: string[]): Promise<Location[]> {
  const promises = names.map(n => geocodeOne(n));
  return Promise.all(promises);
}
```

</details>

<details>
<summary><b>3. Estado Reactivo y Persistencia</b></summary>

**Reto**: Mantener historial de chat entre sesiones.

**Solución**:
- `useState` con inicialización desde `localStorage`
- `useEffect` para auto-guardar cambios
- Gestión de estado "typing..." placeholder

```typescript
const [messages, setMessages] = useState(() => {
  const saved = localStorage.getItem('tripRecommendator_history');
  return saved ? JSON.parse(saved) : [initialMessage];
});
```

</details>

<details>
<summary><b>4. Mapas Interactivos con Leaflet</b></summary>

**Reto**: Integrar Leaflet (biblioteca imperativa) con React (declarativo).

**Solución**:
- `react-leaflet` para componentes declarativos
- Iconos SVG personalizados con gradientes
- Hook `useMap()` para control del zoom/bounds

```typescript
function FitBounds({ locations }: Props) {
  const map = useMap();
  useEffect(() => {
    const bounds = L.latLngBounds(locations.map(l => [l.lat, l.lng]));
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [map, locations]);
  return null;
}
```

</details>

### 💡 Conceptos Clave Aplicados

- ✅ **Composición de Componentes** (App → MapView → Marker)
- ✅ **Hooks Avanzados** (useState, useEffect, useRef)
- ✅ **Async/Await** para APIs externas
- ✅ **TypeScript Interfaces** para tipado estricto
- ✅ **CSS Moderno** (Tailwind utility-first, animations)
- ✅ **Docker Multi-Stage** para optimización
- ✅ **Error Handling** con try/catch y fallbacks

---

## 📁 Estructura del Proyecto

```
ex00/
├── src/
│   ├── Components/
│   │   └── MapView.tsx          # 🗺️ Componente de mapa
│   ├── services/
│   │   ├── aiService.ts         # 🤖 Cliente Gemini
│   │   └── geocodingService.ts  # 🌍 Cliente Nominatim
│   ├── types/
│   │   └── index.ts             # 📝 Interfaces TS
│   ├── App.tsx                  # 🏠 Componente principal
│   ├── index.tsx                # 🚀 Entry point
│   └── index.css                # 🎨 Estilos globales
├── Dockerfile                   # 🐳 Configuración Docker
├── docker-compose.yml           # 🎼 Orquestación
├── Makefile                     # ⚙️ Comandos automatizados
└── package.json                 # 📦 Dependencias
```

---

## 🎨 Capturas de Pantalla

<table>
<tr>
<td width="50%">
<img src="https://via.placeholder.com/400x300/ffffff/667eea?text=☀️+Modo+Claro" alt="Modo Claro">
<p align="center"><b>Modo Claro</b></p>
</td>
<td width="50%">
<img src="https://via.placeholder.com/400x300/1a1a2e/764ba2?text=🌙+Modo+Oscuro" alt="Modo Oscuro">
<p align="center"><b>Modo Oscuro</b></p>
</td>
</tr>
</table>

<img width="1263" height="902" alt="image" src="https://github.com/user-attachments/assets/c9c20de4-734e-4bf3-b304-05acebdcf3af" />


---

## 🤝 Contribuir

¿Encontraste un bug o tienes una idea? ¡Abre un [issue](https://github.com/Escudo5/TripRecommendator/issues) o pull request!

```bash
git checkout -b feature/nueva-funcionalidad
git commit -m "✨ feat: agrega X funcionalidad"
git push origin feature/nueva-funcionalidad
```

---

## 📄 Licencia

MIT License - **Libre** para usar, modificar y distribuir.

---

<div align="center">

### 🌟 Roadmap

Chat IA ✅ | Mapas ✅ | Modo Oscuro ✅ | Persistencia ✅  
**Próximamente:** Auth 🔜 | Favoritos 🔜 | Compartir 🔜 | Fotos 🔜

---

**⭐ Si te gusta este proyecto, dale una estrella en GitHub! ⭐**

Hecho con ❤️ por [Sergio](https://github.com/Escudo5)

[🐛 Reportar Bug](https://github.com/Escudo5/TripRecommendator/issues) • [✨ Sugerir Feature](https://github.com/Escudo5/TripRecommendator/issues)

</div>

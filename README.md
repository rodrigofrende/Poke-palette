[![Netlify Status](https://img.shields.io/badge/🟢%20Ver%20Demo%20Online-pokepalette.netlify.app-blue?style=for-the-badge)](https://pokepalette.netlify.app/)

# 🎨 Poké Palette

Una herramienta web para extraer paletas de colores de Pokémon y exportarlas a diferentes formatos para diseño UI/UX.

## ✨ Características

- **Búsqueda de Pokémon**: Busca y selecciona Pokémon directamente desde la PokeAPI
- **Extracción Inteligente**: Algoritmo que identifica los colores más representativos de cada Pokémon
- **Exportación Múltiple**: Exporta paletas a CSS, Tailwind, Figma y JSON
- **Interfaz Moderna**: Diseño responsive y fácil de usar

## 🚀 Cómo Usar

### 1. Buscar y Seleccionar Pokémon
1. La aplicación se abre directamente en la búsqueda de Pokémon
2. Busca el Pokémon que quieres analizar
3. Selecciónalo de la lista
4. Haz clic en "Generar Paleta de Colores"

### 2. Exportar la Paleta
Una vez extraída la paleta, puedes exportarla a:
- **CSS**: Variables CSS personalizadas
- **Tailwind**: Configuración para Tailwind CSS
- **Figma**: Lista de colores para Figma
- **JSON**: Formato estructurado para desarrollo

## 🛠️ Tecnologías

- **Vue 3**: Framework de frontend
- **Vite**: Build tool
- **Canvas API**: Análisis de imágenes
- **PokeAPI**: Datos de Pokémon
- **Tailwind CSS**: Estilos

## 📦 Instalación

```bash
# Clonar el repositorio
git clone <repository-url>
cd poke-palette

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Construir para producción
npm run build
```

## 🎯 Funcionalidades Principales

### Análisis de Colores
- Extracción automática de los 8 colores más representativos de Pokémon
- Cálculo de porcentaje de uso de cada color
- Filtrado de píxeles transparentes
- Cuantización de colores para reducir ruido

### Exportación de Paletas
- **CSS Variables**: `--pokemon-color-1: #FF0000;`
- **Tailwind Config**: Integración directa con Tailwind CSS
- **Figma Format**: Lista organizada para importar en Figma
- **JSON Export**: Formato estructurado para APIs

### Interfaz de Usuario
- Búsqueda en tiempo real de Pokémon
- Vista previa de imágenes
- Paleta de colores interactiva
- Copia de códigos de color con un clic
- Diseño responsive para móviles

## 🔧 API de Servicios

El proyecto incluye un servicio completo para interactuar con la PokeAPI:

```javascript
import { 
  getPokemonList, 
  getPokemonDetails, 
  getPokemonImageUrl 
} from './services/pokeApi.js'

// Obtener lista de Pokémon
const pokemon = await getPokemonList(20, 0)

// Obtener detalles de un Pokémon
const pikachu = await getPokemonDetails('pikachu')

// Obtener URL de imagen
const imageUrl = getPokemonImageUrl(25) // Para Pikachu
```

## 🎨 Algoritmo de Extracción de Colores

1. **Carga de Imagen**: La imagen del Pokémon se carga desde la PokeAPI
2. **Muestreo de Píxeles**: Se analiza cada 10º píxel para rendimiento
3. **Filtrado**: Se eliminan píxeles transparentes
4. **Cuantización**: Los colores se agrupan en rangos de 25 unidades
5. **Conteo**: Se cuenta la frecuencia de cada color
6. **Ordenamiento**: Se ordenan por porcentaje de uso
7. **Selección**: Se toman los 8 colores más frecuentes

## 📱 Responsive Design

La aplicación está optimizada para:
- **Desktop**: Vista completa con todas las funcionalidades
- **Tablet**: Layout adaptado para pantallas medianas
- **Mobile**: Interfaz simplificada para dispositivos móviles

## 🚀 Despliegue

```bash
# Construir para producción
npm run build

# Los archivos se generan en /dist
# Puedes desplegar en cualquier servidor estático
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🙏 Agradecimientos

- [PokeAPI](https://pokeapi.co/) por proporcionar los datos de Pokémon
- [Vue.js](https://vuejs.org/) por el framework de frontend
- [Vite](https://vitejs.dev/) por las herramientas de build

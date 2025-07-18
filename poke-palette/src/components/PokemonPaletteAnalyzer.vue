<template>
  <div class="pokemon-palette-analyzer">
    <div class="analyzer-header">
      <h2>🎨 Poké Palette Analyzer</h2>
      <p>Selecciona un Pokémon o sube tu propia imagen para extraer su paleta de colores</p>
    </div>
    
    <!-- Mode selector -->
    <div class="mode-selector">
      <button 
        @click="mode = 'api'"
        :class="{ active: mode === 'api' }"
        class="mode-btn"
      >
        🎯 Seleccionar Pokémon
      </button>
      <button 
        @click="mode = 'upload'"
        :class="{ active: mode === 'upload' }"
        class="mode-btn"
      >
        📷 Subir Imagen
      </button>
    </div>
    
    <!-- API Mode -->
    <div v-if="mode === 'api'" class="api-mode">
      <PokemonSearch 
        :is-shiny="isShiny"
        @select-pokemon="selectPokemonFromAPI"
        @update-shiny="updateShiny"
      />
      
      <PokemonCard 
        v-if="selectedPokemon"
        :pokemon="selectedPokemon"
        :is-shiny="isShiny"
        @analyze="analyzeSelectedPokemon"
      />
    </div>
    
    <!-- Upload Mode -->
    <div v-else class="upload-mode">
      <ColorPaletteExtractor />
    </div>
    
    <!-- Results -->
    <ColorPalette 
      v-if="palette.length > 0"
      :palette="palette"
      :pokemon-name="selectedPokemon ? formatPokemonName(selectedPokemon.name) : 'la imagen'"
      @apply-theme="applyPaletteAsTheme"
      @restore-theme="restoreDefaultTheme"
    />
    
    <ExportSection 
      v-if="palette.length > 0"
      :palette="palette"
      :pokemon="selectedPokemon"
      :is-shiny="isShiny"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { getPokemonDetails, getPokemonSpecies } from '../services/pokeApi.js'
import ColorPaletteExtractor from './ColorPaletteExtractor.vue'
import PokemonSearch from './PokemonSearch.vue'
import PokemonCard from './PokemonCard.vue'
import ColorPalette from './ColorPalette.vue'
import ExportSection from './ExportSection.vue'
import { formatPokemonName } from '../utils/formatters.js'

// Reactive data
const mode = ref('api')
const selectedPokemon = ref(null)
const palette = ref([])
const isShiny = ref(false)

// Methods
const selectPokemonFromAPI = async (pokemon) => {
  try {
    const [details, species] = await Promise.all([
      getPokemonDetails(pokemon.name),
      getPokemonSpecies(pokemon.name)
    ])
    
    selectedPokemon.value = {
      ...details,
      species,
      imageUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${details.id}.png`
    }
  } catch (error) {
    console.error('Error fetching Pokémon details:', error)
  }
}

const updateShiny = (value) => {
  isShiny.value = value
}

// Watcher para actualizar imagen cuando cambia shiny
watch(isShiny, (newValue) => {
  if (selectedPokemon.value) {
    selectedPokemon.value.imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${selectedPokemon.value.id}.png`
  }
})

const analyzeSelectedPokemon = async () => {
  if (!selectedPokemon.value) return
  
  // Create a canvas to analyze the Pokémon image
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  const img = new Image()
  
  img.onload = () => {
    canvas.width = img.width
    canvas.height = img.height
    ctx.drawImage(img, 0, 0)
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const colors = extractColorsFromImageData(imageData)
    palette.value = colors
  }
  
  img.crossOrigin = 'anonymous'
  img.src = selectedPokemon.value.imageUrl
}

const extractColorsFromImageData = (imageData) => {
  const data = imageData.data
  const colorMap = new Map()
  const totalPixels = data.length / 4
  
  // Sample pixels (every 10th pixel for performance)
  for (let i = 0; i < data.length; i += 40) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const a = data[i + 3]
    
    // Skip transparent pixels
    if (a < 128) continue
    
    // Quantize colors to reduce noise
    const quantizedR = Math.round(r / 25) * 25
    const quantizedG = Math.round(g / 25) * 25
    const quantizedB = Math.round(b / 25) * 25
    
    const colorKey = `${quantizedR},${quantizedG},${quantizedB}`
    colorMap.set(colorKey, (colorMap.get(colorKey) || 0) + 1)
  }
  
  // Convert to array and sort by frequency
  const colors = Array.from(colorMap.entries())
    .map(([colorKey, count]) => {
      const [r, g, b] = colorKey.split(',').map(Number)
      const hex = rgbToHex(r, g, b)
      const percentage = (count / totalPixels) * 100
      
      return {
        rgb: [r, g, b],
        hex,
        percentage
      }
    })
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 8) // Top 8 colors
  
  return colors
}

const rgbToHex = (r, g, b) => {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')
}



// Función para calcular el contraste de un color
function getContrastColor(hexColor) {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance > 0.5 ? '#2d3748' : '#ffffff';
}

// Función para generar color de borde basado en el color principal
function getBorderColor(hexColor) {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  const darkerR = Math.max(0, r - 40);
  const darkerG = Math.max(0, g - 40);
  const darkerB = Math.max(0, b - 40);
  
  return `#${darkerR.toString(16).padStart(2, '0')}${darkerG.toString(16).padStart(2, '0')}${darkerB.toString(16).padStart(2, '0')}`;
}

// Guardar los valores por defecto al cargar
const defaultTheme = [
  '#667eea', // primary
  '#764ba2', // secondary  
  '#ffffff', // tertiary
  '#2d3748', // quaternary
  '#f7fafc', // quinary
  '#e2e8f0'  // border
]

// Inicializar las variables CSS al cargar el componente
onMounted(() => {
  const root = document.documentElement;
  if (!root.style.getPropertyValue('--theme-primary')) {
    root.style.setProperty('--theme-primary', defaultTheme[0]);
    root.style.setProperty('--theme-secondary', defaultTheme[1]);
    root.style.setProperty('--theme-tertiary', defaultTheme[2]);
    root.style.setProperty('--theme-quaternary', defaultTheme[3]);
    root.style.setProperty('--theme-quinary', defaultTheme[4]);
    root.style.setProperty('--theme-border', defaultTheme[5]);
  }
})

function applyPaletteAsTheme() {
  const root = document.documentElement;
  
  palette.value.forEach((color, idx) => {
    if (idx === 0) {
      root.style.setProperty('--theme-primary', color.hex);
      root.style.setProperty('--theme-border', getBorderColor(color.hex));
    }
    if (idx === 1) root.style.setProperty('--theme-secondary', color.hex);
    if (idx === 2) root.style.setProperty('--theme-tertiary', color.hex);
    if (idx === 3) root.style.setProperty('--theme-quaternary', color.hex);
    if (idx === 4) root.style.setProperty('--theme-quinary', color.hex);
  });
  
  // Aplicar contraste automático a elementos específicos
  applyContrastToElements();
}

function restoreDefaultTheme() {
  const root = document.documentElement;
  root.style.setProperty('--theme-primary', defaultTheme[0]);
  root.style.setProperty('--theme-secondary', defaultTheme[1]);
  root.style.setProperty('--theme-tertiary', defaultTheme[2]);
  root.style.setProperty('--theme-quaternary', defaultTheme[3]);
  root.style.setProperty('--theme-quinary', defaultTheme[4]);
  root.style.setProperty('--theme-border', defaultTheme[5]);
  
  // Restaurar contraste por defecto
  restoreDefaultContrast();
}

// Función para aplicar contraste automático a elementos problemáticos
function applyContrastToElements() {
  const elements = document.querySelectorAll('.physical-item, .evolution-item, .description-text');
  elements.forEach(element => {
    const backgroundColor = getComputedStyle(element).backgroundColor;
    const contrastColor = getContrastColor(backgroundColor);
    element.style.color = contrastColor;
  });
}

// Función para restaurar contraste por defecto
function restoreDefaultContrast() {
  const elements = document.querySelectorAll('.physical-item, .evolution-item, .description-text');
  elements.forEach(element => {
    element.style.color = '';
  });
}
</script>

<style scoped>
.pokemon-palette-analyzer {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.analyzer-header {
  text-align: center;
  margin-bottom: 30px;
  padding: 20px;
}

.analyzer-header h2 {
  color: var(--theme-quaternary);
  margin-bottom: 10px;
  font-size: 2rem;
  font-weight: bold;
}

.analyzer-header p {
  color: var(--theme-quaternary);
  font-size: 1rem;
  opacity: 0.8;
}

.mode-selector {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 30px;
}

.mode-btn {
  padding: 12px 24px;
  border: 2px solid var(--theme-border);
  background: var(--theme-tertiary);
  color: var(--theme-primary);
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s ease;
}

.mode-btn.active {
  background: var(--theme-primary);
  color: var(--theme-tertiary);
  border-color: var(--theme-primary);
}

.mode-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  border-color: var(--theme-border-hover);
}

.api-mode {
  margin-bottom: 30px;
}

.upload-mode {
  margin-bottom: 30px;
}
</style> 
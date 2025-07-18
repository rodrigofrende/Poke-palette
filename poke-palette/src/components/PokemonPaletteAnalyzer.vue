<template>
  <div class="pokemon-palette-analyzer">
    <div class="analyzer-header">
      <h1>Analizador de Paletas Pokémon <InfoTooltip text="Extrae y analiza las paletas de colores de imágenes de Pokémon. Esta herramienta identifica los colores dominantes y crea paletas profesionales para uso en diseño gráfico y desarrollo web." size="large" /></h1>
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
        @image-selected="handleImageSelected"
        @close="closePokemonCard"
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
    
    <!-- Contrast Analysis Results -->
    <div v-if="contrastAnalysis.length > 0" class="contrast-analysis-section">
      <h3>
        📊 Análisis de Contraste
        <InfoTooltip text="Evalúa la legibilidad del texto sobre cada color de la paleta. Los resultados indican si el contraste cumple con los estándares de accesibilidad web. Los colores que aprueban son adecuados para uso en interfaces, mientras que los que fallan requieren ajustes para garantizar la legibilidad." size="medium" />
      </h3>
      
      <!-- Global Contrast Analysis -->
      <div class="global-contrast-analysis">
        <h4>🎯 Análisis General de la Aplicación</h4>
        <div class="contrast-metrics">
          <div class="metric-card">
            <div class="metric-header">
              <span class="metric-icon">📊</span>
              <span class="metric-title">Contraste Promedio</span>
            </div>
            <div class="metric-value">{{ globalContrastScore.toFixed(1) }}</div>
            <div class="metric-bar">
              <div 
                class="metric-fill" 
                :style="{ width: `${Math.min(globalContrastScore * 10, 100)}%` }"
                :class="{ 'excellent': globalContrastScore >= 7, 'good': globalContrastScore >= 5 && globalContrastScore < 7, 'poor': globalContrastScore < 5 }"
              ></div>
            </div>
            <div class="metric-label">{{ getContrastLabel(globalContrastScore) }}</div>
          </div>
          
          <div class="metric-card">
            <div class="metric-header">
              <span class="metric-icon">✅</span>
              <span class="metric-title">Elementos Aprobados</span>
            </div>
            <div class="metric-value">{{ passedElements }}/{{ totalElements }}</div>
            <div class="metric-bar">
              <div 
                class="metric-fill" 
                :style="{ width: `${(passedElements / totalElements) * 100}%` }"
                :class="{ 'excellent': (passedElements / totalElements) >= 0.8, 'good': (passedElements / totalElements) >= 0.6 && (passedElements / totalElements) < 0.8, 'poor': (passedElements / totalElements) < 0.6 }"
              ></div>
            </div>
            <div class="metric-label">{{ Math.round((passedElements / totalElements) * 100) }}% de aprobación</div>
          </div>
          
          <div class="metric-card">
            <div class="metric-header">
              <span class="metric-icon">🎨</span>
              <span class="metric-title">Paleta Actual</span>
            </div>
            <div class="metric-value">{{ currentThemeName }}</div>
            <div class="palette-preview">
              <div 
                v-for="(color, index) in currentThemeColors" 
                :key="index"
                class="theme-color-swatch"
                :style="{ backgroundColor: color }"
                :title="color"
              ></div>
            </div>
            <div class="metric-label">{{ palette.length }} colores extraídos</div>
          </div>
        </div>
      </div>
      
      <div class="contrast-results">
        <div 
          v-for="(result, index) in contrastAnalysis" 
          :key="index"
          class="contrast-item"
        >
          <div class="contrast-pair">
            <div class="contrast-info">
              <div class="color-labels">
                <span class="contrast-label">
                  <span class="label-icon">🎨</span>
                  Fondo: 
                  <span class="color-code">
                    {{ result.background }}
                    <div 
                      class="color-sample background-sample" 
                      :style="{ backgroundColor: result.background }"
                      :title="`Fondo: ${result.background}`"
                    ></div>
                  </span>
                </span>
                <span class="contrast-label">
                  <span class="label-icon">✏️</span>
                  Texto: 
                  <span class="color-code">
                    {{ result.text }}
                    <div 
                      class="color-sample text-sample" 
                      :style="{ backgroundColor: result.text }"
                      :title="`Texto: ${result.text}`"
                    ></div>
                  </span>
                </span>
              </div>
              <div class="contrast-metrics">
                <span class="contrast-ratio">
                  <span class="ratio-icon">📊</span>
                  Ratio: {{ result.ratio.toFixed(2) }}
                </span>
                <span 
                  class="contrast-status"
                  :class="{ 'pass': result.passes, 'fail': !result.passes }"
                >
                  <span class="status-icon">{{ result.passes ? '✅' : '❌' }}</span>
                  {{ result.passes ? 'Pasa' : 'Falla' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="contrast-actions">
        <div class="button-container">
          <button @click="applyContrastImprovements" class="contrast-btn improve">
            <span class="btn-icon">🔧</span>
            Mejorar Contraste Global
          </button>
          <InfoTooltip text="Optimiza automáticamente los colores del texto para mejorar la legibilidad sobre los fondos de colores. Aplica ajustes de contraste basados en estándares de accesibilidad web." size="small" />
        </div>
        <div class="button-container">
          <button @click="restoreDefaultContrast" class="contrast-btn restore">
            <span class="btn-icon">🔄</span>
            Restaurar Contraste Original
          </button>
          <InfoTooltip text="Restaura todos los colores del texto a su configuración original. Revierte los cambios de contraste aplicados automáticamente." size="small" />
        </div>
      </div>
    </div>
    
    <ExportSection 
      v-if="palette.length > 0"
      :palette="palette"
      :pokemon="selectedPokemon"
      :is-shiny="isShiny"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { getPokemonDetails, getPokemonSpecies } from '../services/pokeApi.js'
import ColorPaletteExtractor from './ColorPaletteExtractor.vue'
import PokemonSearch from './PokemonSearch.vue'
import PokemonCard from './PokemonCard.vue'
import ColorPalette from './ColorPalette.vue'
import ExportSection from './ExportSection.vue'
import { formatPokemonName } from '../utils/formatters.js'
import { 
  getOptimalTextColor, 
  applyContrastToElement, 
  applyContrastToElements,
  checkWCAGCompliance,
  calculateContrastRatio,
  rgbToHex
} from '../utils/contrastUtils.js'
import InfoTooltip from './InfoTooltip.vue'

// Reactive data
const mode = ref('api')
const selectedPokemon = ref(null)
const palette = ref([])
const isShiny = ref(false)
const contrastAnalysis = ref([])
const originalThemeColors = ref([])
const isContrastApplied = ref(false)

// Computed properties for global analysis
const globalContrastScore = computed(() => {
  if (contrastAnalysis.value.length === 0) return 0
  
  const totalRatio = contrastAnalysis.value.reduce((sum, result) => sum + result.ratio, 0)
  const averageRatio = totalRatio / contrastAnalysis.value.length
  
  // Convert ratio to a 0-10 scale
  return Math.min(averageRatio / 2, 10)
})

const passedElements = computed(() => {
  return contrastAnalysis.value.filter(result => result.passes).length
})

const totalElements = computed(() => {
  return contrastAnalysis.value.length
})

const currentThemeName = computed(() => {
  if (isContrastApplied.value) {
    return 'Tema Optimizado'
  } else if (palette.value.length > 0) {
    return 'Tema Pokémon'
  } else {
    return 'Tema Original'
  }
})

const currentThemeColors = computed(() => {
  if (palette.value.length > 0) {
    return palette.value.map(color => color.hex)
  }
  return defaultTheme
})

// Methods
const getContrastLabel = (score) => {
  if (score >= 7) return 'Excelente'
  if (score >= 5) return 'Bueno'
  if (score >= 3) return 'Regular'
  return 'Necesita Mejora'
}

const selectPokemonFromAPI = async (pokemon) => {
  try {
    const [details, species] = await Promise.all([
      getPokemonDetails(pokemon.name),
      getPokemonSpecies(pokemon.name)
    ])
    
    const baseUrl = isShiny.value 
      ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${details.id}.png`
      : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${details.id}.png`
    
    selectedPokemon.value = {
      ...details,
      species,
      imageUrl: baseUrl
    }
  } catch (error) {
    console.error('Error fetching Pokémon details:', error)
  }
}

const updateShiny = (value) => {
  isShiny.value = value
}

const handleImageSelected = (image) => {
  if (selectedPokemon.value) {
    selectedPokemon.value.imageUrl = image.url
  }
}

const closePokemonCard = () => {
  selectedPokemon.value = null
  palette.value = []
  contrastAnalysis.value = []
  isContrastApplied.value = false
  
  // Restaurar tema por defecto al cerrar
  restoreDefaultTheme()
}

// Watcher para actualizar imagen cuando cambia shiny
watch(isShiny, (newValue) => {
  if (selectedPokemon.value) {
    const baseUrl = newValue 
      ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${selectedPokemon.value.id}.png`
      : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${selectedPokemon.value.id}.png`
    selectedPokemon.value.imageUrl = baseUrl
  }
})

// Función utilitaria para verificar si el contraste es suficiente
function hasGoodContrast(element, backgroundColor) {
  if (!element || !backgroundColor) return true;
  
  const currentColor = getComputedStyle(element).color;
  const contrastRatio = calculateContrastRatio(currentColor, backgroundColor);
  
  // Si el ratio es mayor a 4.5, consideramos que tiene buen contraste
  return contrastRatio >= 4.5;
}

// Función utilitaria para aplicar contraste solo si es necesario
function ensureContrast(element, backgroundColor) {
  if (!element || !backgroundColor) return;
  
  // Solo cambiar si el contraste actual no es suficiente
  if (!hasGoodContrast(element, backgroundColor)) {
    const contrastColor = getContrastColor(backgroundColor);
    element.style.color = contrastColor;
  }
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
  '#e2e8f0', // border
  '#a0aec0', // senary
  '#718096'  // septenary
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
    root.style.setProperty('--theme-senary', defaultTheme[6]);
    root.style.setProperty('--theme-septenary', defaultTheme[7]);
    root.style.setProperty('--theme-octonary', '#4a5568'); // octonary
  }
})

// Función para analizar contraste de la paleta
function analyzePaletteContrast() {
  const analysis = [];
  
  // Analizar cada color de la paleta contra texto blanco y negro
  palette.value.forEach((color, index) => {
    const background = color.hex;
    
    // Validar que el color tenga el formato correcto
    if (!background || typeof background !== 'string' || !background.startsWith('#')) {
      console.warn('Invalid color format in palette:', background);
      return; // Saltar este color
    }
    
    // Test con texto blanco
    const whiteText = '#ffffff';
    const whiteRatio = calculateContrastRatio(whiteText, background);
    const whiteCompliance = checkWCAGCompliance(whiteText, background);
    
    analysis.push({
      background,
      text: whiteText,
      ratio: whiteRatio,
      passes: whiteCompliance.passes,
      type: 'white-text'
    });
    
    // Test con texto negro
    const blackText = '#000000';
    const blackRatio = calculateContrastRatio(blackText, background);
    const blackCompliance = checkWCAGCompliance(blackText, background);
    
    analysis.push({
      background,
      text: blackText,
      ratio: blackRatio,
      passes: blackCompliance.passes,
      type: 'black-text'
    });
  });
  
  contrastAnalysis.value = analysis;
}

// Función para aplicar mejoras de contraste global
function applyContrastImprovements() {
  console.log('Aplicando mejoras de contraste global...');
  
  // Guardar estado original si es la primera vez
  if (!isContrastApplied.value) {
    saveOriginalTheme();
  }
  
  // Aplicar contraste a toda la aplicación
  applyContrastToEntireApp();
  
  isContrastApplied.value = true;
  
  // Re-analizar contraste después de aplicar mejoras
  setTimeout(() => {
    analyzePaletteContrast();
    updateContrastMetrics(); // Actualizar métricas en tiempo real
  }, 200);
}

// Función para restaurar contraste por defecto
function restoreDefaultContrast() {
  console.log('Restaurando contraste por defecto...');
  
  // Restaurar tema original
  restoreOriginalTheme();
  
  isContrastApplied.value = false;
  
  // Re-analizar contraste después de restaurar
  setTimeout(() => {
    analyzePaletteContrast();
    updateContrastMetrics(); // Actualizar métricas en tiempo real
  }, 200);
  
  console.log('Contraste restaurado por defecto');
}

// Función para actualizar métricas de contraste en tiempo real
function updateContrastMetrics() {
  // Forzar re-renderizado de las métricas
  const currentAnalysis = [...contrastAnalysis.value];
  contrastAnalysis.value = [];
  setTimeout(() => {
    contrastAnalysis.value = currentAnalysis;
  }, 100);
}

// Función para guardar tema original
function saveOriginalTheme() {
  const root = document.documentElement;
  originalThemeColors.value = [
    getComputedStyle(root).getPropertyValue('--theme-primary'),
    getComputedStyle(root).getPropertyValue('--theme-secondary'),
    getComputedStyle(root).getPropertyValue('--theme-tertiary'),
    getComputedStyle(root).getPropertyValue('--theme-quaternary'),
    getComputedStyle(root).getPropertyValue('--theme-quinary'),
    getComputedStyle(root).getPropertyValue('--theme-border'),
    getComputedStyle(root).getPropertyValue('--theme-senary'),
    getComputedStyle(root).getPropertyValue('--theme-septenary')
  ];
  console.log('Tema original guardado');
}

// Función para restaurar tema original
function restoreOriginalTheme() {
  if (originalThemeColors.value.length > 0) {
    const root = document.documentElement;
    root.style.setProperty('--theme-primary', originalThemeColors.value[0]);
    root.style.setProperty('--theme-secondary', originalThemeColors.value[1]);
    root.style.setProperty('--theme-tertiary', originalThemeColors.value[2]);
    root.style.setProperty('--theme-quaternary', originalThemeColors.value[3]);
    root.style.setProperty('--theme-quinary', originalThemeColors.value[4]);
    root.style.setProperty('--theme-border', originalThemeColors.value[5]);
    root.style.setProperty('--theme-senary', originalThemeColors.value[6]);
    root.style.setProperty('--theme-septenary', originalThemeColors.value[7]);
    console.log('Tema original restaurado');
  }
}

// Función para aplicar contraste a toda la aplicación
function applyContrastToEntireApp() {
  console.log('Aplicando contraste a toda la aplicación...');
  
  // Solo aplicar a elementos que no tienen tema aplicado
  applyContrastToElementType('.color-hex, .color-rgb, .color-percentage', 'color-info');
  applyContrastToElementType('.contrast-label, .contrast-ratio, .contrast-status', 'contrast-info');
  applyContrastToElementType('.metric-value, .metric-label', 'metrics');
  applyContrastToElementType('.theme-btn, .contrast-btn', 'action-buttons');
  
  console.log('Contraste aplicado a toda la aplicación');
}

// Función para aplicar contraste a un tipo de elemento
function applyContrastToElementType(selector, type) {
  const elements = document.querySelectorAll(selector);
  elements.forEach(element => {
    const backgroundColor = rgbToHex(getComputedStyle(element).backgroundColor);
    if (backgroundColor && backgroundColor !== '#000000') {
      const contrastColor = getOptimalTextColor(backgroundColor);
      element.style.color = contrastColor;
      console.log(`Aplicado contraste a ${type}:`, element.textContent?.substring(0, 20), 'Color:', contrastColor);
    }
  });
}

// Función mejorada para calcular el contraste de un color
function getContrastColor(hexColor) {
  return getOptimalTextColor(hexColor);
}

// Función para aplicar contraste a elementos visibles
function applyContrastToVisibleElements() {
  // 1. Botones de modo (siempre visibles)
  const modeButtons = document.querySelectorAll('.mode-btn');
  modeButtons.forEach(button => {
    const backgroundColor = rgbToHex(getComputedStyle(button).backgroundColor);
    const contrastColor = getContrastColor(backgroundColor);
    button.style.color = contrastColor;
    console.log('Aplicado contraste a botón:', button.textContent, 'Color:', contrastColor);
  });
  
  // 2. Header principal
  const header = document.querySelector('.analyzer-header');
  if (header) {
    const headerBg = rgbToHex(getComputedStyle(header).backgroundColor);
    const headerText = header.querySelector('h2');
    const headerDesc = header.querySelector('p');
    
    if (headerText) {
      const contrastColor = getContrastColor(headerBg);
      headerText.style.color = contrastColor;
      console.log('Aplicado contraste a header h2:', contrastColor);
    }
    
    if (headerDesc) {
      const contrastColor = getContrastColor(headerBg);
      headerDesc.style.color = contrastColor;
      console.log('Aplicado contraste a header p:', contrastColor);
    }
  }
  
  // 3. Botones de contraste (si están visibles)
  const contrastButtons = document.querySelectorAll('.contrast-btn');
  contrastButtons.forEach(button => {
    const backgroundColor = rgbToHex(getComputedStyle(button).backgroundColor);
    const contrastColor = getContrastColor(backgroundColor);
    button.style.color = contrastColor;
    console.log('Aplicado contraste a botón de contraste:', button.textContent, 'Color:', contrastColor);
  });
  
  // 4. Elementos de la paleta de colores (si están visibles)
  const colorItems = document.querySelectorAll('.color-item');
  colorItems.forEach(item => {
    const backgroundColor = rgbToHex(getComputedStyle(item).backgroundColor);
    const contrastColor = getContrastColor(backgroundColor);
    
    // Aplicar a elementos de texto dentro del color-item
    const textElements = item.querySelectorAll('.color-hex, .color-rgb, .color-percentage');
    textElements.forEach(textEl => {
      textEl.style.color = contrastColor;
    });
    console.log('Aplicado contraste a elementos de color');
  });
  
  // 5. Botones de tema (si están visibles)
  const themeButtons = document.querySelectorAll('.theme-btn');
  themeButtons.forEach(button => {
    const backgroundColor = rgbToHex(getComputedStyle(button).backgroundColor);
    const contrastColor = getContrastColor(backgroundColor);
    button.style.color = contrastColor;
    console.log('Aplicado contraste a botón de tema:', button.textContent, 'Color:', contrastColor);
  });
  
  // 6. Elementos de análisis de contraste (si están visibles)
  const contrastItems = document.querySelectorAll('.contrast-item');
  contrastItems.forEach(item => {
    const backgroundColor = rgbToHex(getComputedStyle(item).backgroundColor);
    const contrastColor = getContrastColor(backgroundColor);
    
    // Aplicar a elementos de texto dentro del contrast-item
    const textElements = item.querySelectorAll('.contrast-label, .contrast-ratio, .contrast-status');
    textElements.forEach(textEl => {
      textEl.style.color = contrastColor;
    });
    console.log('Aplicado contraste a elementos de análisis');
  });
  
  console.log('Mejoras de contraste aplicadas');
}

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
    
    // Analizar contraste después de generar la paleta
    analyzePaletteContrast();
  }
  
  img.crossOrigin = 'anonymous'
  img.src = selectedPokemon.value.imageUrl
}

const extractColorsFromImageData = (imageData) => {
  const data = imageData.data
  const colorMap = new Map()
  let totalSampledPixels = 0
  
  // Sample pixels (every 5th pixel for better accuracy)
  for (let i = 0; i < data.length; i += 20) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const a = data[i + 3]
    
    // Skip transparent pixels
    if (a < 128) continue
    
    totalSampledPixels++
    
    // Quantize colors less aggressively to preserve more variation
    const quantizedR = Math.round(r / 10) * 10
    const quantizedG = Math.round(g / 10) * 10
    const quantizedB = Math.round(b / 10) * 10
    
    const colorKey = `${quantizedR},${quantizedG},${quantizedB}`
    colorMap.set(colorKey, (colorMap.get(colorKey) || 0) + 1)
  }
  
  // Convert to array and sort by frequency
  const allColors = Array.from(colorMap.entries())
    .map(([colorKey, count]) => {
      const [r, g, b] = colorKey.split(',').map(Number)
      const hex = rgbToHexValues(r, g, b)
      const percentage = (count / totalSampledPixels) * 100
      
      // Calculate HSL values for better color analysis
      const hsl = rgbToHsl(r, g, b)
      
      return {
        rgb: [r, g, b],
        hex,
        percentage,
        hsl,
        saturation: hsl.s,
        lightness: hsl.l
      }
    })
    .filter(color => color.percentage > 0.5) // Filtrar colores con porcentaje muy bajo
    .sort((a, b) => b.percentage - a.percentage)
  
  // Improved color selection algorithm - solo devolver colores que realmente existen
  const selectedColors = selectDiverseColors(allColors, 8)
  
  return selectedColors
}

// Convert RGB to HSL for better color analysis
const rgbToHsl = (r, g, b) => {
  r /= 255
  g /= 255
  b /= 255
  
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h, s, l = (max + min) / 2
  
  if (max === min) {
    h = s = 0 // achromatic
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    h /= 6
  }
  
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  }
}

// Improved color selection algorithm
const selectDiverseColors = (allColors, maxColors) => {
  // Si hay menos colores que el máximo, devolver todos los disponibles
  if (allColors.length <= maxColors) {
    return allColors
  }
  
  const selected = []
  const used = new Set()
  
  // First, add the most frequent color
  selected.push(allColors[0])
  used.add(allColors[0].hex)
  
  // Then add colors that are most different from already selected ones
  for (let i = 1; i < maxColors && i < allColors.length; i++) {
    let bestColor = null
    let maxDifference = -1
    
    for (const color of allColors) {
      if (used.has(color.hex)) continue
      
      // Calculate minimum difference from all selected colors
      let minDifference = Infinity
      for (const selectedColor of selected) {
        const difference = calculateColorDifference(color, selectedColor)
        minDifference = Math.min(minDifference, difference)
      }
      
      // Prefer colors with higher saturation and good frequency
      const score = minDifference * (1 + color.saturation / 100) * (color.percentage / 100)
      
      if (score > maxDifference) {
        maxDifference = score
        bestColor = color
      }
    }
    
    if (bestColor) {
      selected.push(bestColor)
      used.add(bestColor.hex)
    } else {
      // Si no encontramos un color diferente, parar aquí
      break
    }
  }
  
  return selected.sort((a, b) => b.percentage - a.percentage)
}

// Calculate color difference using multiple metrics
const calculateColorDifference = (color1, color2) => {
  const [r1, g1, b1] = color1.rgb
  const [r2, g2, b2] = color2.rgb
  
  // Euclidean distance in RGB space
  const rgbDiff = Math.sqrt(
    Math.pow(r1 - r2, 2) + 
    Math.pow(g1 - g2, 2) + 
    Math.pow(b1 - b2, 2)
  )
  
  // HSL difference
  const hDiff = Math.abs(color1.hsl.h - color2.hsl.h)
  const sDiff = Math.abs(color1.hsl.s - color2.hsl.s)
  const lDiff = Math.abs(color1.hsl.l - color2.hsl.l)
  
  // Weighted combination
  return rgbDiff * 0.6 + hDiff * 0.3 + sDiff * 0.1 + lDiff * 0.1
}

const rgbToHexValues = (r, g, b) => {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')
}

// Llamar a la función después de aplicar la paleta
function applyPaletteAsTheme() {
  const root = document.documentElement;
  // NO cambiar --theme-primary ni --theme-secondary aquí
  palette.value.forEach((color, idx) => {
    if (idx === 0) {
      root.style.setProperty('--theme-border', getBorderColor(color.hex));
    }
    if (idx === 1) {
      root.style.setProperty('--theme-tertiary', color.hex);
    }
    if (idx === 2) root.style.setProperty('--theme-quaternary', color.hex);
    if (idx === 3) root.style.setProperty('--theme-quinary', color.hex);
    if (idx === 4) root.style.setProperty('--theme-senary', color.hex);
    if (idx === 5) root.style.setProperty('--theme-septenary', color.hex);
    if (idx === 6) root.style.setProperty('--theme-octonary', color.hex);
    if (idx === 7) root.style.setProperty('--theme-nonary', color.hex);
  });
  console.log('Tema aplicado (sin cambiar fondo):', palette.value.map(c => c.hex));
}

function restoreDefaultTheme() {
  const root = document.documentElement;
  // Restaurar colores por defecto SOLO si el usuario lo pide explícitamente
  root.style.setProperty('--theme-primary', defaultTheme[0]);
  root.style.setProperty('--theme-secondary', defaultTheme[1]);
  root.style.setProperty('--theme-tertiary', defaultTheme[2]);
  root.style.setProperty('--theme-quaternary', defaultTheme[3]);
  root.style.setProperty('--theme-quinary', defaultTheme[4]);
  root.style.setProperty('--theme-border', defaultTheme[5]);
  root.style.setProperty('--theme-senary', defaultTheme[6]);
  root.style.setProperty('--theme-septenary', defaultTheme[7]);
  root.style.setProperty('--theme-octonary', '#4a5568');
  // Restaurar contraste por defecto
  restoreDefaultContrast();
}

// Solo restoreDefaultTheme puede cambiar --theme-primary y --theme-secondary
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
  color: #2d3748;
  margin-bottom: 10px;
  font-size: 2rem;
  font-weight: bold;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.header-info {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

.info-icon {
  font-size: 1.2rem;
  color: #667eea;
  cursor: help;
  opacity: 0.8;
  transition: all 0.3s ease;
  display: inline-block;
  margin-left: 8px;
}

.info-icon:hover {
  opacity: 1;
  transform: scale(1.1);
  color: #4c51bf;
}

.analyzer-header p {
  color: #4a5568;
  font-size: 1rem;
  opacity: 0.9;
  font-weight: 500;
}

.mode-selector {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 30px;
}

.mode-btn {
  padding: 12px 24px;
  border: 2px solid #e2e8f0;
  background: #ffffff;
  color: #667eea;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.mode-btn.active {
  background: #667eea;
  color: #ffffff;
  border-color: #667eea;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
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

/* Contrast Analysis Styles */
.contrast-analysis-section {
  background: var(--theme-tertiary);
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--theme-border);
  margin-top: 20px;
}

.contrast-analysis-section h3 {
  color: var(--theme-quaternary);
  margin-bottom: 25px;
  text-align: center;
  font-size: 1.5rem;
  font-weight: 700;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.global-contrast-analysis {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
  justify-items: center;
  align-items: start;
  max-width: 1000px;
  margin-left: auto;
  margin-right: auto;
}

.metric-card {
  background: var(--theme-quinary);
  border-radius: 12px;
  padding: 24px;
  border: 1px solid var(--theme-border);
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  min-height: 180px;
  width: 100%;
  max-width: 320px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.metric-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.metric-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 20px;
  color: var(--theme-quaternary);
  font-size: 1.1rem;
  font-weight: 600;
}

.metric-icon {
  font-size: 1.3em;
}

.metric-title {
  text-transform: uppercase;
  letter-spacing: 0.8px;
  font-size: 0.9rem;
}

.metric-value {
  font-size: 3rem;
  font-weight: bold;
  color: var(--theme-quaternary);
  margin-bottom: 15px;
  font-family: monospace;
  line-height: 1;
}

.metric-bar {
  height: 10px;
  background: var(--theme-border);
  border-radius: 6px;
  margin-bottom: 12px;
  overflow: hidden;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
}

.metric-fill {
  height: 100%;
  border-radius: 6px;
  transition: width 0.5s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.metric-fill.excellent {
  background: linear-gradient(90deg, #38a169 0%, #48bb78 100%);
}

.metric-fill.good {
  background: linear-gradient(90deg, #f6e05e 0%, #f7fafc 100%);
}

.metric-fill.poor {
  background: linear-gradient(90deg, #e53e3e 0%, #fc8181 100%);
}

.metric-label {
  font-size: 0.9rem;
  color: var(--theme-senary);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.palette-preview {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
  flex-wrap: wrap;
}

.theme-color-swatch {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  border: 3px solid var(--theme-border);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.theme-color-swatch:hover {
  transform: scale(1.3);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
}

.contrast-results {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 240px));
  gap: 16px;
  margin-bottom: 25px;
  justify-content: center;
}

.contrast-item {
  background: var(--theme-quinary);
  border-radius: 10px;
  padding: 16px;
  border: 1px solid var(--theme-border);
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.contrast-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.contrast-pair {
  display: flex;
  align-items: center;
  gap: 16px;
}

.color-code {
  display: flex;
  align-items: center;
  gap: 5px;
  font-family: monospace;
  font-weight: bold;
}

.color-sample {
  width: 18px;
  height: 18px;
  border-radius: 3px;
  border: 1px solid var(--theme-border);
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.color-sample:hover {
  transform: scale(1.3);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.contrast-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.color-labels {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.contrast-label {
  font-size: 0.9rem;
  color: var(--theme-quaternary);
  font-family: monospace;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  background: rgba(0, 0, 0, 0.03);
  border-radius: 4px;
  transition: all 0.3s ease;
}

.contrast-label:hover {
  background: rgba(0, 0, 0, 0.06);
}

.label-icon {
  font-size: 1em;
  opacity: 0.8;
}

.contrast-metrics {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.contrast-ratio {
  font-weight: bold;
  color: var(--theme-quaternary);
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: var(--theme-tertiary);
  border-radius: 5px;
  border: 1px solid var(--theme-border);
  font-size: 0.9rem;
}

.ratio-icon {
  font-size: 1em;
  opacity: 0.8;
}

.contrast-status {
  font-weight: bold;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 5px;
  transition: all 0.3s ease;
}

.contrast-status.pass {
  color: #38a169;
  background: rgba(56, 161, 105, 0.1);
  border: 1px solid rgba(56, 161, 105, 0.3);
}

.contrast-status.fail {
  color: #e53e3e;
  background: rgba(229, 62, 62, 0.1);
  border: 1px solid rgba(229, 62, 62, 0.3);
}

.contrast-status .status-icon {
  font-size: 1em;
}

.contrast-actions {
  display: flex;
  gap: 24px;
  justify-content: center;
  margin-top: 30px;
  flex-wrap: wrap;
}

.button-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.contrast-btn {
  padding: 14px 28px;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  border: 2px solid var(--theme-border);
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  min-width: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.contrast-btn .btn-icon {
  font-size: 1.2em;
  opacity: 0.9;
  transition: all 0.3s ease;
}

.contrast-btn:hover .btn-icon {
  opacity: 1;
  transform: scale(1.1);
}

.contrast-btn.improve {
  background: linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-secondary) 100%);
  color: var(--theme-tertiary);
  border-color: var(--theme-primary);
}

.contrast-btn.restore {
  background: var(--theme-quinary);
  color: var(--theme-quaternary);
  border-color: var(--theme-border);
}

.contrast-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.contrast-btn.improve:hover {
  background: linear-gradient(135deg, var(--theme-secondary) 0%, var(--theme-primary) 100%);
  border-color: var(--theme-secondary);
}

.contrast-btn.restore:hover {
  background: var(--theme-quaternary);
  color: var(--theme-tertiary);
  border-color: var(--theme-quaternary);
}

@media (max-width: 768px) {
  .pokemon-palette-analyzer {
    padding: 10px;
  }
  
  .analyzer-header h2 {
    font-size: 1.5rem;
  }
  
  .analyzer-header p {
    font-size: 0.9rem;
  }
  
  .mode-selector {
    flex-direction: column;
    gap: 10px;
  }
  
  .mode-btn {
    padding: 10px 16px;
    font-size: 14px;
  }
  
  .contrast-actions {
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }
  
  .contrast-btn {
    min-width: 180px;
    padding: 12px 24px;
    font-size: 14px;
  }
  
  .contrast-results {
    grid-template-columns: 1fr;
  }
  
  .global-contrast-analysis {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .metric-card {
    padding: 20px;
    min-height: 150px;
  }
  
  .metric-value {
    font-size: 2.5rem;
  }
  
  .palette-display {
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 10px;
  }
  
  .color-item {
    padding: 8px;
  }
  
  .color-info {
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .pokemon-palette-analyzer {
    padding: 5px;
  }
  
  .analyzer-header h2 {
    font-size: 1.3rem;
  }
  
  .mode-btn {
    padding: 8px 12px;
    font-size: 13px;
  }
  
  .contrast-btn {
    min-width: 160px;
    padding: 10px 20px;
    font-size: 13px;
  }
  
  .metric-card {
    padding: 15px;
    min-height: 120px;
  }
  
  .metric-value {
    font-size: 2rem;
  }
  
  .palette-display {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 8px;
  }
  
  .color-item {
    padding: 6px;
  }
  
  .color-info {
    font-size: 0.7rem;
  }
}
</style> 
<template>
  <div class="pokemon-palette-analyzer" :class="{ 'welcome-mode': showWelcome }">
    <!-- Componente de notificación de errores -->
    <ErrorNotification
      :show="errorNotification.show"
      :title="errorNotification.title"
      :message="errorNotification.message"
      :type="errorNotification.type"
      @close="closeErrorNotification"
    />
    
    <!-- Pantalla de bienvenida -->
    <WelcomeScreen v-if="showWelcome" @start-app="startApp" />
    
    <!-- Contenido principal (oculto durante la bienvenida) -->
    <div v-if="!showWelcome" class="main-content">
      <!-- Breadcrumb de progreso con controles -->
      <div class="progress-breadcrumb">
        <!-- Botón Anterior (izquierda) -->
        <button 
          v-if="currentStep > 1" 
          @click="prevStep" 
          :disabled="!canGoBack"
          class="nav-btn-compact back"
        >
          ← Anterior
        </button>
        
        <!-- Contenido central -->
        <div class="breadcrumb-center">
          <!-- Imagen fija del Pokémon seleccionado -->
          <div v-if="selectedPokemon" class="selected-pokemon-display">
            <div class="pokemon-display-card">
              <img 
                :src="selectedPokemon.imageUrl" 
                :alt="selectedPokemon.name"
                class="pokemon-display-image"
              />
              <div class="pokemon-display-info">
                <h4>{{ formatPokemonName(selectedPokemon.name) }}</h4>
                <p>#{{ selectedPokemon.id }}</p>
              </div>
              
              <!-- Botón de limpiar -->
              <button 
                @click="clearSelection" 
                class="clear-btn-display"
                title="Limpiar selección"
              >
                <span class="clear-icon-display">✖️</span>
              </button>
            </div>
          </div>
          
          <div class="breadcrumb-steps">
            <div 
              class="breadcrumb-step" 
              :class="{ 
                active: currentStep >= 1, 
                completed: currentStep > 1, 
                clickable: canNavigateToStep(1),
                disabled: !canNavigateToStep(1) && currentStep !== 1
              }"
              @click="goToStep(1)"
              :title="getStepTooltip(1)"
            >
              <span class="step-number">1</span>
              <span class="step-label">Buscar Pokémon</span>
            </div>
            <div class="breadcrumb-arrow" v-if="currentStep >= 2">→</div>
            <div 
              class="breadcrumb-step" 
              :class="{ 
                active: currentStep >= 2, 
                completed: currentStep > 2, 
                clickable: canNavigateToStep(2),
                disabled: !canNavigateToStep(2) && currentStep !== 2
              }"
              @click="goToStep(2)"
              :title="getStepTooltip(2)"
            >
              <span class="step-number">2</span>
              <span class="step-label">Generar Paleta</span>
            </div>
            <div class="breadcrumb-arrow" v-if="currentStep >= 3">→</div>
            <div 
              class="breadcrumb-step" 
              :class="{ 
                active: currentStep >= 3, 
                completed: currentStep > 3, 
                clickable: canNavigateToStep(3),
                disabled: !canNavigateToStep(3) && currentStep !== 3
              }"
              @click="goToStep(3)"
              :title="getStepTooltip(3)"
            >
              <span class="step-number">3</span>
              <span class="step-label">Analizar Contraste</span>
            </div>
          </div>
          
          <!-- Botón de Mejorar/Restaurar Contraste (solo en paso 3) -->
          <button 
            v-if="currentStep === 3 && contrastAnalysis.length > 0" 
            @click="isContrastImproved ? handleRestoreTheme() : improveGlobalContrast()" 
            class="improve-btn-compact"
            :class="{ 'restore': isContrastImproved }"
          >
            {{ isContrastImproved ? '🔄 Restaurar Contraste' : '🎯 Mejorar Contraste' }}
          </button>
        </div>
        
        <!-- Botón Siguiente (derecha) -->
        <button 
          v-if="currentStep < 3" 
          @click="nextStep" 
          :disabled="!canGoNext"
          class="nav-btn-compact next"
        >
          Siguiente →
        </button>
      </div>
      
      <!-- Contenido principal -->
      <!-- Paso 1: Búsqueda de Pokémon -->
      <div v-if="currentStep === 1" class="step-content selection-step animate-in">
        <PokemonSearchStep 
          :is-shiny="isShiny"
          :selected-pokemon="selectedPokemon"
          @pokemon-selected="handlePokemonSelected"
          @search-error="handleSearchError"
          @update-shiny="updateShiny"
          @analyze-pokemon="analyzeSelectedPokemon"
        />
      </div>
      
      <!-- Paso 2: Generar Paleta -->
      <div v-if="currentStep === 2" class="step-content palette-step animate-in">
        <PaletteGenerationStep 
          :palette="palette"
          :selected-pokemon="selectedPokemon"
          @apply-theme="handleApplyTheme"
          @restore-theme="handleRestoreTheme"
          @update-palette="handleUpdatePalette"
        />
      </div>
      
      <!-- Paso 3: Análisis de Contraste -->
      <div v-if="currentStep === 3" class="step-content analysis-step animate-in">
        <ContrastAnalysisStep 
          :contrast-analysis="contrastAnalysis"
          :palette="palette"
          :current-theme="currentTheme"
          :is-contrast-improved="isContrastImproved"
          @improve-contrast="improveGlobalContrast"
          @restore-contrast="handleRestoreTheme"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import PokemonSearchStep from './PokemonSearchStep.vue'
import PaletteGenerationStep from './PaletteGenerationStep.vue'
import ContrastAnalysisStep from './ContrastAnalysisStep.vue'
import WelcomeScreen from './WelcomeScreen.vue'
import ErrorNotification from './ErrorNotification.vue'
import { formatPokemonName } from '../utils/formatters.js'
import { 
  getOptimalTextColor, 
  applyContrastToElement, 
  applyContrastToElements,
  checkWCAGCompliance,
  calculateContrastRatio,
  rgbToHex
} from '../utils/contrastUtils.js'
import { 
  applyTheme, 
  restoreDefaultTheme, 
  generateThemeFromPalette, 
  improveThemeContrast,
  getCurrentTheme 
} from '../utils/themeManager.js'
import { shouldShowWelcome, markWelcomeAsSeen } from '../utils/welcomeManager.js'

// Props
const props = defineProps({
  pokemon: {
    type: Object,
    required: true
  },
  isShiny: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['analyze', 'image-selected', 'close', 'update-shiny'])

// Reactive data
const showWelcome = ref(shouldShowWelcome())
const selectedPokemon = ref(null)
const palette = ref([])
const isShiny = ref(false)
const contrastAnalysis = ref([])
const originalThemeColors = ref([])
const isContrastApplied = ref(false)
const currentStep = ref(1) // 1, 2, 3
const selectedImage = ref(null)
const openCategories = ref([])
const activeSection = ref('physical') // Sección por defecto
const currentTheme = ref(getCurrentTheme())
const isContrastImproved = ref(false)
const originalTheme = ref(null) // Guardar el tema original cuando se aplica la paleta

// Variables para manejo de errores y loading
const loadingPokemon = ref(false)
const selectingPokemon = ref(false)
const errorNotification = ref({
  show: false,
  title: '',
  message: '',
  type: 'error'
})

// Watch for palette changes to enable next step
watch(palette, (newPalette) => {
  if (newPalette.length > 0 && currentStep.value === 1) {
    // Enable step 2 when palette is generated
    // Don't auto-navigate, let user control
  }
})

// Watch for contrast analysis to enable next step
watch(contrastAnalysis, (newAnalysis) => {
  if (newAnalysis.length > 0 && currentStep.value === 2) {
    // Enable step 3 when analysis is generated
    // Don't auto-navigate, let user control
  }
})

// Computed properties para validación de navegación
const canGoBack = computed(() => {
  return currentStep.value > 1
})

const canGoNext = computed(() => {
  switch (currentStep.value) {
    case 1:
      return selectedPokemon.value !== null
    case 2:
      return palette.value.length > 0
    case 3:
      return false // No hay siguiente paso después del 3
    default:
      return false
  }
})

// Methods
const handlePokemonSelected = (pokemon) => {
  // Si se pasa null, limpiar la selección
  if (pokemon === null) {
    selectedPokemon.value = null
    // Resetear estados de contraste al limpiar selección
    isContrastImproved.value = false
    originalTheme.value = null
    contrastAnalysis.value = []
    return
  }
  
  selectedPokemon.value = pokemon
  // Resetear estados de contraste al seleccionar nuevo Pokémon
  isContrastImproved.value = false
  originalTheme.value = null
  contrastAnalysis.value = []
}

const updateShiny = (value) => {
  console.log('🎨 Actualizando shiny en componente principal:', value)
  isShiny.value = value
}

// Funciones para manejo de errores
const showErrorNotification = (title, message, type = 'error') => {
  errorNotification.value = {
    show: true,
    title,
    message,
    type
  }
}

const closeErrorNotification = () => {
  errorNotification.value.show = false
}

const handleSearchError = (errorData) => {
  showErrorNotification(errorData.title, errorData.message, errorData.type)
}

const clearSelection = () => {
  // Limpiar completamente la selección y volver al inicio
  selectedPokemon.value = null
  palette.value = []
  contrastAnalysis.value = []
  currentStep.value = 1
  isContrastApplied.value = false
  restoreDefaultTheme()
  
  console.log('🏠 Volviendo al inicio - selección limpiada')
}

// Función para iniciar la app después de la pantalla de bienvenida
const startApp = () => {
  showWelcome.value = false
  markWelcomeAsSeen()
}

// Función para analizar contraste de la paleta
function analyzePaletteContrast() {
  console.log('🔍 Iniciando análisis de contraste...');
  console.log('Paleta actual:', palette.value);
  
  const analysis = [];
  
  // Analizar cada color de la paleta con ambos tipos de texto
  palette.value.forEach((color, index) => {
    const background = color.hex;
    
    console.log(`📊 Analizando color ${index + 1}:`, background);
    
    // Validar que el color tenga el formato correcto
    if (!background || typeof background !== 'string' || !background.startsWith('#')) {
      console.warn('❌ Invalid color format in palette:', background);
      return; // Saltar este color
    }
    
    // Test con texto blanco
    const whiteText = '#ffffff';
    const whiteRatio = calculateContrastRatio(whiteText, background);
    const whiteCompliance = checkWCAGCompliance(whiteText, background);
    
    console.log(`  📝 Texto blanco: ratio=${whiteRatio}, passes=${whiteCompliance.passes}`);
    
    // Test con texto negro
    const blackText = '#000000';
    const blackRatio = calculateContrastRatio(blackText, background);
    const blackCompliance = checkWCAGCompliance(blackText, background);
    
    console.log(`  📝 Texto negro: ratio=${blackRatio}, passes=${blackCompliance.passes}`);
    
    // Crear un solo objeto que contenga ambos casos
    analysis.push({
      background,
      whiteText,
      blackText,
      whiteRatio,
      blackRatio,
      whitePasses: whiteCompliance.passes,
      blackPasses: blackCompliance.passes,
      colorIndex: index
    });
  });
  
  console.log('✅ Análisis completado:', analysis);
  contrastAnalysis.value = analysis;
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
    
    // Auto-navigate to palette tab
    currentStep.value = 2
  }
  
  img.crossOrigin = 'anonymous'
  img.src = selectedPokemon.value.imageUrl
}

const extractColorsFromImageData = (imageData) => {
  const data = imageData.data
  const colorMap = new Map()
  let totalSampledPixels = 0
  
  console.log('🔍 Iniciando extracción de colores...')
  
  // Sample pixels (every 10th pixel for better performance)
  for (let i = 0; i < data.length; i += 40) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const a = data[i + 3]
    
    // Skip transparent pixels
    if (a < 128) continue
    
    totalSampledPixels++
    
    // Quantize colors more aggressively to reduce noise
    const quantizedR = Math.round(r / 25) * 25
    const quantizedG = Math.round(g / 25) * 25
    const quantizedB = Math.round(b / 25) * 25
    
    const colorKey = `${quantizedR},${quantizedG},${quantizedB}`
    colorMap.set(colorKey, (colorMap.get(colorKey) || 0) + 1)
  }
  
  console.log(`📊 Píxeles muestreados: ${totalSampledPixels}`)
  
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
    .filter(color => color.percentage > 1.0) // Filtrar colores con porcentaje muy bajo
    .sort((a, b) => b.percentage - a.percentage)
  
  console.log(`🎨 Colores encontrados: ${allColors.length}`)
  
  // Improved color selection algorithm - seleccionar colores más diversos
  const selectedColors = selectDiverseColors(allColors, 8)
  
  console.log('✅ Paleta final:', selectedColors.map(c => `${c.hex} (${c.percentage.toFixed(1)}%)`))
  
  return selectedColors
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
  
  console.log(`🎯 Color principal: ${allColors[0].hex} (${allColors[0].percentage.toFixed(1)}%)`)
  
  // Then add colors that are most different from already selected ones
  for (let i = 1; i < maxColors && i < allColors.length; i++) {
    let bestColor = null
    let maxScore = -1
    
    for (const color of allColors) {
      if (used.has(color.hex)) continue
      
      // Calculate minimum difference from all selected colors
      let minDifference = Infinity
      for (const selectedColor of selected) {
        const difference = calculateColorDifference(color, selectedColor)
        minDifference = Math.min(minDifference, difference)
      }
      
      // Score based on difference, saturation, and frequency
      // Prefer colors that are different, saturated, and frequent
      const differenceScore = minDifference / 255 // Normalize to 0-1
      const saturationScore = color.saturation / 100 // Normalize to 0-1
      const frequencyScore = color.percentage / 100 // Normalize to 0-1
      
      // Weighted combination: difference is most important, then saturation, then frequency
      const score = differenceScore * 0.6 + saturationScore * 0.3 + frequencyScore * 0.1
      
      if (score > maxScore) {
        maxScore = score
        bestColor = color
      }
    }
    
    if (bestColor) {
      selected.push(bestColor)
      used.add(bestColor.hex)
      console.log(`🎨 Color ${i + 1}: ${bestColor.hex} (${bestColor.percentage.toFixed(1)}%) - Score: ${maxScore.toFixed(3)}`)
    } else {
      // Si no encontramos un color diferente, parar aquí
      console.log(`⚠️ No se encontraron más colores diferentes después de ${i} selecciones`)
      break
    }
  }
  
  // Si no tenemos suficientes colores, agregar algunos más frecuentes
  while (selected.length < maxColors && allColors.length > selected.length) {
    for (const color of allColors) {
      if (!used.has(color.hex)) {
        selected.push(color)
        used.add(color.hex)
        console.log(`➕ Color adicional: ${color.hex} (${color.percentage.toFixed(1)}%)`)
        break
      }
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
  
  // HSL difference with better weighting
  const hDiff = Math.abs(color1.hsl.h - color2.hsl.h)
  const sDiff = Math.abs(color1.hsl.s - color2.hsl.s)
  const lDiff = Math.abs(color1.hsl.l - color2.hsl.l)
  
  // Weighted combination: RGB difference is most important
  return rgbDiff * 0.7 + hDiff * 0.2 + sDiff * 0.05 + lDiff * 0.05
}

const rgbToHexValues = (r, g, b) => {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')
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

// Funciones de gestión de temas
function handleApplyTheme(colorHexes) {
  // Guardar el tema actual como original antes de aplicar el nuevo
  originalTheme.value = { ...currentTheme.value }
  
  const newTheme = generateThemeFromPalette(colorHexes)
  applyTheme(newTheme)
  currentTheme.value = getCurrentTheme()
  isContrastImproved.value = false
}

function handleRestoreTheme() {
  // Restaurar al tema original si existe, sino al tema por defecto
  if (originalTheme.value) {
    applyTheme(originalTheme.value)
    currentTheme.value = getCurrentTheme()
  } else {
    restoreDefaultTheme()
    currentTheme.value = getCurrentTheme()
  }
  isContrastImproved.value = false
}

function handleUpdatePalette(updatedPalette) {
  // Actualizar la paleta con los colores editados
  palette.value = updatedPalette
  
  // Re-analizar el contraste si estamos en el paso 3
  if (currentStep.value === 3 && updatedPalette.length > 0) {
    analyzePaletteContrast()
  }
  
  console.log('🎨 Paleta actualizada:', updatedPalette)
}

function improveGlobalContrast() {
  // Guardar el tema actual antes de mejorarlo
  if (!isContrastImproved.value) {
    originalTheme.value = { ...currentTheme.value }
  }
  
  const improvedTheme = improveThemeContrast(currentTheme.value)
  applyTheme(improvedTheme)
  currentTheme.value = getCurrentTheme()
  isContrastImproved.value = true
  
  // Re-analizar contraste después de mejorar el tema
  setTimeout(() => {
    analyzePaletteContrast()
  }, 100)
}

const nextStep = () => {
  if (canGoNext) {
    currentStep.value++
    
    // Si vamos al paso 3, asegurar que el análisis de contraste esté listo
    if (currentStep.value === 3 && palette.value.length > 0 && contrastAnalysis.value.length === 0) {
      console.log('🔄 Ejecutando análisis de contraste automáticamente...')
      analyzePaletteContrast()
    }
  }
}

const prevStep = () => {
  if (canGoBack) {
    currentStep.value--
  }
}

const goToStep = (step) => {
  // Solo permitir navegación a steps que ya han sido completados o al step actual
  if (canNavigateToStep(step)) {
    currentStep.value = step
    
    // Si vamos al paso 3, asegurar que el análisis de contraste esté listo
    if (step === 3 && palette.value.length > 0 && contrastAnalysis.value.length === 0) {
      console.log('🔄 Ejecutando análisis de contraste automáticamente...')
      analyzePaletteContrast()
    }
  }
}

const canNavigateToStep = (step) => {
  // No permitir navegación al step actual
  if (step === currentStep.value) return false
  
  switch (step) {
    case 1:
      return true // Siempre se puede volver al paso 1
    case 2:
      return selectedPokemon.value !== null // Solo si hay un Pokémon seleccionado
    case 3:
      // Solo permitir navegación al paso 3 si hay Pokémon seleccionado Y paleta generada
      return selectedPokemon.value !== null && palette.value.length > 0
    default:
      return false
  }
}

const getStepTooltip = (step) => {
  if (step === currentStep.value) {
    return `Paso actual: ${getStepName(step)}`
  }
  
  if (canNavigateToStep(step)) {
    return `Ir a: ${getStepName(step)}`
  }
  
  // Mensajes específicos según el paso
  switch (step) {
    case 2:
      return 'Selecciona un Pokémon primero para acceder a: Generar Paleta'
    case 3:
      if (!selectedPokemon.value) {
        return 'Selecciona un Pokémon primero para acceder a: Analizar Contraste'
      } else if (palette.value.length === 0) {
        return 'Genera una paleta primero para acceder a: Analizar Contraste'
      }
      return 'Completa los pasos anteriores para acceder a: Analizar Contraste'
    default:
      return `Completa los pasos anteriores para acceder a: ${getStepName(step)}`
  }
}

const getStepName = (step) => {
  switch (step) {
    case 1: return 'Buscar Pokémon'
    case 2: return 'Generar Paleta'
    case 3: return 'Analizar Contraste'
    default: return 'Paso desconocido'
  }
}

// Inicializar tema al cargar
onMounted(() => {
  console.log('🔄 Restaurando tema por defecto al cargar la página...')
  restoreDefaultTheme()
  currentTheme.value = getCurrentTheme()
  isContrastImproved.value = false
})
</script>

<style scoped>
@import '../styles/shared.css';

.pokemon-palette-analyzer {
  border-radius: 20px;
  max-width: 1400px;
  margin: 0 auto;
  padding: 10px;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 40px);
  overflow: hidden;
  background: linear-gradient(135deg, var(--theme-quinary) 0%, var(--theme-tertiary) 100%);
}

.pokemon-palette-analyzer.welcome-mode {
  height: 100vh;
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
}

.main-content {
  animation: fadeIn 0.5s ease-out;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.progress-breadcrumb {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, var(--theme-quinary) 0%, var(--theme-tertiary) 100%);
  border-radius: 15px;
  padding: 8px 16px;
  border: 2px solid var(--theme-border);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  flex-shrink: 0;
  backdrop-filter: blur(15px);
  width: 100%;
  max-width: none;
  margin: 0;
  gap: 20px;
  flex-wrap: wrap;
}

.breadcrumb-center {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 20px;
  flex: 1;
  justify-content: center;
}

.breadcrumb-steps {
  display: flex;
  align-items: center;
  gap: 15px;
  justify-content: center;
}

.breadcrumb-step {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--theme-quaternary);
  padding: 6px 12px;
  border-radius: 8px;
  transition: all 0.3s ease;
  position: relative;
}

.breadcrumb-step.clickable {
  cursor: pointer;
  border: 2px solid transparent;
}

.breadcrumb-step.clickable:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  border-color: var(--theme-primary);
  background: var(--theme-quinary);
}

.breadcrumb-step.clickable:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.breadcrumb-step.active {
  background: linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-secondary) 100%);
  color: var(--theme-tertiary);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.breadcrumb-step.completed {
  background: var(--theme-quinary);
  color: var(--theme-quaternary);
  border: 2px solid var(--theme-primary);
}

.breadcrumb-step.completed.clickable {
  cursor: pointer;
}

.breadcrumb-step.completed.clickable:hover {
  background: linear-gradient(135deg, var(--theme-quinary) 0%, var(--theme-tertiary) 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border-color: var(--theme-secondary);
}

.breadcrumb-step.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  filter: grayscale(0.3);
}

.breadcrumb-step.disabled:hover {
  transform: none;
  box-shadow: none;
  border-color: transparent;
}

.breadcrumb-step.completed .step-number {
  background: var(--theme-primary);
  color: var(--theme-tertiary);
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
}

.step-number {
  font-size: 1.1em;
  font-weight: bold;
  color: var(--theme-primary);
}

.step-label {
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 0.7rem;
}

.breadcrumb-arrow {
  font-size: 1.3em;
  color: var(--theme-border);
  margin: 0 8px;
}

/* Botones de navegación en extremos */
.nav-btn-compact {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.nav-btn-compact:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.nav-btn-compact:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.nav-btn-compact.back {
  background: linear-gradient(135deg, var(--theme-quinary) 0%, var(--theme-tertiary) 100%);
  color: var(--theme-quaternary);
  border: 2px solid var(--theme-border);
}

.nav-btn-compact.back:not(:disabled):hover {
  background: linear-gradient(135deg, var(--theme-tertiary) 0%, var(--theme-quinary) 100%);
  border-color: var(--theme-primary);
}

.nav-btn-compact.next {
  background: linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-secondary) 100%);
  color: var(--theme-tertiary);
  border: 2px solid var(--theme-primary);
}

.nav-btn-compact.next:not(:disabled):hover {
  background: linear-gradient(135deg, var(--theme-secondary) 0%, var(--theme-primary) 100%);
  transform: translateY(-2px) scale(1.05);
}

.improve-btn-compact {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #38a169 0%, #48bb78 100%);
  color: white;
  border: 2px solid #38a169;
  display: flex;
  align-items: center;
  gap: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  min-width: 140px;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(56, 161, 105, 0.3);
}

.improve-btn-compact:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(56, 161, 105, 0.4);
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
  border-color: #48bb78;
}

.improve-btn-compact.restore {
  background: linear-gradient(135deg, #e53e3e 0%, #f56565 100%);
  border-color: #e53e3e;
  box-shadow: 0 4px 12px rgba(229, 62, 62, 0.3);
}

.improve-btn-compact.restore:hover {
  background: linear-gradient(135deg, #f56565 0%, #e53e3e 100%);
  border-color: #f56565;
  box-shadow: 0 6px 16px rgba(229, 62, 62, 0.4);
}

.step-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 15px;
  background: var(--theme-quinary);
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--theme-border);
  flex: 1;
  overflow: auto;
  min-height: 0;
  height: 100%;
}

/* Estilos para la imagen fija del Pokémon seleccionado */
.selected-pokemon-display {
  display: flex;
  justify-content: center;
}

.pokemon-display-card {
  background: linear-gradient(135deg, var(--theme-quinary) 0%, var(--theme-tertiary) 100%);
  border-radius: 12px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border: 2px solid var(--theme-border);
  backdrop-filter: blur(10px);
  max-width: 280px;
  min-width: 260px;
  position: relative;
}

.pokemon-display-image {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  object-fit: contain;
  background: rgba(255, 255, 255, 0.1);
  padding: 4px;
}

.pokemon-display-info {
  flex: 1;
  text-align: left;
}

.pokemon-display-info h4 {
  margin: 0 0 3px 0;
  color: var(--theme-quaternary);
  font-size: 1rem;
  font-weight: bold;
}

.pokemon-display-info p {
  margin: 0;
  color: var(--theme-senary);
  font-size: 0.85rem;
  opacity: 0.8;
}

/* Botón de limpiar en el display card */
.clear-btn-display {
  position: absolute;
  top: -4px;
  right: -4px;
  background: var(--theme-quinary);
  border: 1px solid var(--theme-border);
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.clear-btn-display:hover {
  background: var(--theme-quaternary);
  border-color: var(--theme-primary);
  transform: scale(1.1);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
}

.clear-btn-display:active {
  transform: scale(0.95);
}

.clear-icon-display {
  font-size: 10px;
  color: var(--theme-quaternary);
  line-height: 1;
}

/* Animaciones para el paso 2: Generar Paleta */
.palette-step.animate-in {
  animation: stepSlideIn 0.8s ease-out 0.2s both;
}

@keyframes stepSlideIn {
  0% {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Animación para el contenedor step-content */
.step-content.animate-in {
  animation: stepContentSlideIn 0.7s ease-out 0.1s both;
}

@keyframes stepContentSlideIn {
  0% {
    opacity: 0;
    transform: translateY(25px) scale(0.98);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Animaciones específicas para cada tipo de paso */
.selection-step.animate-in {
  animation: selectionStepSlideIn 0.8s ease-out 0.1s both;
}

@keyframes selectionStepSlideIn {
  0% {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.analysis-step.animate-in {
  animation: analysisStepSlideIn 0.8s ease-out 0.1s both;
}

@keyframes analysisStepSlideIn {
  0% {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (max-width: 768px) {
  .pokemon-palette-analyzer {
    padding: 10px;
    height: calc(100vh - 40px);
  }
  
  .main-content {
    height: 100%;
    overflow: hidden;
  }
  
  .progress-breadcrumb {
    flex-direction: column;
    gap: 12px;
    padding: 12px;
    margin-bottom: 15px;
  }
  
  .breadcrumb-center {
    width: 100%;
    flex-direction: column;
    gap: 12px;
  }
  
  .breadcrumb-steps {
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .nav-btn-compact {
    padding: 8px 12px;
    font-size: 0.8rem;
    min-width: 80px;
  }
  
  .improve-btn-compact {
    padding: 6px 12px;
    font-size: 0.8rem;
    min-width: 120px;
  }
  
  .breadcrumb-step {
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
  }
  
  .step-number {
    font-size: 1em;
  }
  
  .step-label {
    font-size: 0.7rem;
  }
  
  .breadcrumb-arrow {
    display: none;
  }
  
  .main-content {
    gap: 15px;
    height: 100%;
    overflow: hidden;
  }
  
  .main-content-area {
    padding: 12px;
  }
  
  .step-content {
    padding: 12px;
  }
  
  /* Estilos responsive para la imagen fija del Pokémon */
  .pokemon-display-card {
    max-width: 200px;
    padding: 6px 8px;
  }
  
  .pokemon-display-image {
    width: 35px;
    height: 35px;
  }
  
  .pokemon-display-info h4 {
    font-size: 0.8rem;
  }
  
  .pokemon-display-info p {
    font-size: 0.7rem;
  }
}

@media (max-width: 480px) {
  .pokemon-palette-analyzer {
    padding: 5px;
  }
  
  .progress-breadcrumb {
    padding: 12px;
    gap: 12px;
  }
  
  .nav-btn-compact {
    padding: 8px 12px;
    font-size: 0.75rem;
    min-width: 100px;
  }
  
  .improve-btn-compact {
    padding: 8px 12px;
    font-size: 0.75rem;
    min-width: 140px;
  }
  
  .main-content-area {
    padding: 10px;
  }
  
  .step-content {
    padding: 10px;
  }
  
  .pokemon-display-card {
    max-width: 180px;
    padding: 4px 6px;
  }
  
  .pokemon-display-image {
    width: 30px;
    height: 30px;
  }
  
  .pokemon-display-info h4 {
    font-size: 0.75rem;
  }
  
  .pokemon-display-info p {
    font-size: 0.65rem;
  }
}
</style>
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
              <span class="clear-icon-display">🗑️</span>
            </button>
          </div>
        </div>
        
        <div class="breadcrumb-steps">
          <div class="breadcrumb-step" :class="{ active: currentStep >= 1, completed: currentStep > 1 }">
            <span class="step-number">1</span>
            <span class="step-label">Buscar Pokémon</span>
          </div>
          <div class="breadcrumb-arrow" v-if="currentStep >= 2">→</div>
          <div class="breadcrumb-step" :class="{ active: currentStep >= 2, completed: currentStep > 2 }">
            <span class="step-number">2</span>
            <span class="step-label">Generar Paleta</span>
          </div>
          <div class="breadcrumb-arrow" v-if="currentStep >= 3">→</div>
          <div class="breadcrumb-step" :class="{ active: currentStep >= 3, completed: currentStep > 3 }">
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
    
    <!-- Layout principal -->
    <div class="main-layout">
      <!-- Contenido principal -->
      <div class="main-content-area">
        <!-- Paso 1: Búsqueda de Pokémon -->
        <div v-if="currentStep === 1" class="step-content selection-step">
          <!-- Estado de búsqueda: Mostrar buscador directamente -->
          <div v-if="!selectedPokemon" class="search-state">
            <div class="search-header">
              <h2>🔍 Buscar Pokémon</h2>
              <p>Encuentra cualquier Pokémon en la base de datos</p>
            </div>
            
            <div class="search-container">
              <PokemonSearch 
                :is-shiny="isShiny"
                :disabled="loadingPokemon || selectingPokemon"
                @select-pokemon="selectPokemonFromAPI"
                @update-shiny="updateShiny"
                @search-error="handleSearchError"
              />
            </div>
          </div>
          
          <!-- Estado con Pokémon seleccionado -->
          <div v-if="selectedPokemon || selectingPokemon" class="selected-state">
            <!-- Loader mientras se carga el Pokémon -->
            <div v-if="loadingPokemon || selectingPokemon" class="loading-overlay">
              <PokeballLoader 
                size="large" 
                variant="primary"
                message="¡Atrapando Pokémon!"
              />
            </div>
            
            <!-- Tarjeta del Pokémon seleccionado -->
            <PokemonCard 
              v-if="selectedPokemon && !loadingPokemon && !selectingPokemon"
              :pokemon="selectedPokemon"
              :is-shiny="isShiny"
              @analyze="analyzeSelectedPokemon"
              @image-selected="handleImageSelected"
              @close="closePokemonCard"
              @update-shiny="updateShiny"
            />
          </div>
        </div>
        
        <!-- Paso 2: Generar Paleta -->
        <div v-if="currentStep === 2" class="step-content palette-step">
          <div class="step-header">
            <h2>🎨 Generar Paleta</h2>
            <p>Analiza la imagen y extrae los colores dominantes</p>
          </div>
          
          <div v-if="palette.length > 0" class="palette-section">
            <ColorPalette 
              :palette="palette"
              :pokemon-name="selectedPokemon ? formatPokemonName(selectedPokemon.name) : 'la imagen'"
              @apply-theme="handleApplyTheme"
              @restore-theme="handleRestoreTheme"
              @update-palette="handleUpdatePalette"
            />
            

          </div>
          
          <div v-else class="empty-state">
            <div class="empty-icon">🎨</div>
            <h3>No hay paleta disponible</h3>
            <p>Primero debes generar una paleta en el paso anterior</p>
          </div>
        </div>
        
        <!-- Paso 3: Análisis de Contraste -->
        <div v-if="currentStep === 3" class="step-content analysis-step">
          <div class="step-header">
            <h2>📊 Análisis de Contraste</h2>
            <p>Evalúa la legibilidad y accesibilidad de los colores</p>
          </div>
          
          <div v-if="contrastAnalysis.length > 0" class="analysis-section">
            <!-- Navegación de tabs -->
            <div class="contrast-tabs-navigation">
              <button 
                v-for="tab in contrastTabs" 
                :key="tab.id"
                @click="setContrastActiveTab(tab.id)"
                :class="['contrast-tab-btn', { active: contrastActiveTab === tab.id }]"
              >
                <span class="tab-icon">{{ tab.icon }}</span>
                <span class="tab-text">{{ tab.title }}</span>
              </button>
            </div>
            
                        <!-- Contenido de tabs -->
            <div class="contrast-tabs-content">
              <!-- Tab: Resumen -->
              <div v-if="contrastActiveTab === 'overview'" class="contrast-tab-panel">
                <h3>
                  📊 Análisis de Contraste
                  <InfoTooltip text="Evalúa la legibilidad del texto sobre cada color de la paleta. Los resultados indican si el contraste cumple con los estándares de accesibilidad web. Los colores que aprueban son adecuados para uso en interfaces, mientras que los que fallan requieren ajustes para garantizar la legibilidad." size="medium" />
                </h3>
                
                <!-- Hint intuitivo para el usuario -->
                <div class="contrast-hint-inline">
                  <div class="hint-inline-content">
                    <span class="hint-inline-icon">💡</span>
                    <span class="hint-inline-text">¿Algunos textos se ven difíciles de leer? Usa el botón "Mejorar Contraste Global" para optimizar automáticamente la legibilidad</span>
                  </div>
                </div>
                
                <!-- Global Contrast Analysis -->
                <div class="global-contrast-analysis">
                  <div class="analysis-header">
                    <div class="analysis-title">
                      <span class="analysis-icon">⚙️</span>
                      <span class="analysis-text">Análisis General de la Aplicación</span>
                    </div>
                  </div>
                  <div class="contrast-metrics">
                    <div class="metric-card">
                      <div class="metric-header">
                        <span class="metric-icon">📊</span>
                        <span class="metric-title">CONTRASTE PROMEDIO</span>
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
                        <span class="metric-title">ELEMENTOS APROBADOS</span>
                      </div>
                      <div class="metric-value">{{ passedElements }}/{{ totalElements }}</div>
                      <div class="metric-bar">
                        <div 
                          class="metric-fill" 
                          :style="{ width: `${(passedElements / totalElements) * 100}%` }"
                          :class="{ 'excellent': (passedElements / totalElements) >= 0.8, 'good': (passedElements / totalElements) >= 0.6 && (passedElements / totalElements) < 0.8, 'poor': (passedElements / totalElements) < 0.6 }"
                        ></div>
                      </div>
                      <div class="metric-label">{{ Math.round((passedElements / totalElements) * 100) }}% DE APROBACIÓN</div>
                    </div>
                    
                    <div class="metric-card">
                      <div class="metric-header">
                        <span class="metric-icon">🎨</span>
                        <span class="metric-title">PALETA ACTUAL</span>
                      </div>
                      <div class="metric-subtitle">{{ currentThemeName }}</div>
                      <div class="palette-preview">
                        <div 
                          v-for="(color, index) in currentThemeColors" 
                          :key="index"
                          class="theme-color-swatch"
                          :style="{ backgroundColor: color }"
                          :title="color"
                        ></div>
                      </div>
                      <div class="metric-label">{{ palette.length }} COLORES EXTRAÍDOS</div>
                    </div>
                  </div>
                </div>
                
                <!-- Análisis de Contraste Compacto -->
                <div class="contrast-analysis-compact">
                  <div class="analysis-summary">
                    <div class="summary-stats">
                      <div class="stat-item">
                        <span class="stat-icon">📊</span>
                        <span class="stat-label">Colores Analizados</span>
                        <span class="stat-value">{{ contrastAnalysis.length }}</span>
                      </div>
                      <div class="stat-item">
                        <span class="stat-icon">✅</span>
                        <span class="stat-label">Aprobados</span>
                        <span class="stat-value">{{ passedElements }}/{{ totalElements }}</span>
                      </div>
                      <div class="stat-item">
                        <span class="stat-icon">🎯</span>
                        <span class="stat-label">Promedio</span>
                        <span class="stat-value">{{ globalContrastScore.toFixed(1) }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Tab: Detalles -->
              <div v-if="contrastActiveTab === 'details'" class="contrast-tab-panel">
                <h3>
                  🔍 Análisis Detallado de Contraste
                  <InfoTooltip text="Análisis individual de cada color de la paleta con texto blanco y negro. Los resultados muestran el ratio de contraste y si cumple con los estándares WCAG AA." size="medium" />
                </h3>
                
                <div class="contrast-grid">
                  <div 
                    v-for="(result, index) in contrastAnalysis" 
                    :key="index"
                    class="contrast-card"
                  >
                    <div class="card-header">
                      <div class="color-preview" :style="{ backgroundColor: result.background }"></div>
                      <div class="color-info">
                        <span class="color-hex">{{ result.background }}</span>
                        <span class="color-name">Color {{ index + 1 }}</span>
                      </div>
                    </div>
                    
                    <div class="text-comparison">
                      <button 
                        class="preview-btn white"
                        :style="{ 
                          backgroundColor: result.background || '#ccc', 
                          color: result.whiteText || '#fff' 
                        }"
                      >
                        Blanco
                      </button>
                      <button 
                        class="preview-btn black"
                        :style="{ 
                          backgroundColor: result.background || '#ccc', 
                          color: result.blackText || '#000' 
                        }"
                      >
                        Negro
                      </button>
                    </div>
                    
                    <div class="card-status">
                      <span class="status-icon" :class="{ 'pass': result.whitePasses || result.blackPasses, 'fail': !result.whitePasses && !result.blackPasses }">
                        {{ (result.whitePasses || result.blackPasses) ? '✅' : '❌' }}
                      </span>
                      <span class="status-text">
                        {{ (result.whitePasses || result.blackPasses) ? 'WCAG AA' : 'Falla' }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div v-else class="empty-state">
            <div class="empty-icon">📊</div>
            <h3>No hay análisis disponible</h3>
            <p>Genera una paleta primero para poder analizar el contraste</p>
          </div>
        </div>
      </div>
      

    </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { getPokemonDetails, getPokemonSpecies } from '../services/pokeApi.js'
import PokemonSearch from './PokemonSearch.vue'
import PokemonCard from './PokemonCard.vue'
import ColorPalette from './ColorPalette.vue'
import ExportSection from './ExportSection.vue'
import WelcomeScreen from './WelcomeScreen.vue'
import ErrorNotification from './ErrorNotification.vue'
import LoadingSpinner from './LoadingSpinner.vue'
import PokeballLoader from './PokeballLoader.vue'
import { formatPokemonName, formatColorName, formatShapeName, formatEggGroupName, getSpanishDescription } from '../utils/formatters.js'
import { 
  getOptimalTextColor, 
  applyContrastToElement, 
  applyContrastToElements,
  checkWCAGCompliance,
  calculateContrastRatio,
  rgbToHex
} from '../utils/contrastUtils.js'
import InfoTooltip from './InfoTooltip.vue'
import TypeBadge from './TypeBadge.vue'
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

// Variables para tabs del análisis de contraste
const contrastActiveTab = ref('overview') // Tab activo por defecto

// Definición de tabs para análisis de contraste
const contrastTabs = [
  { id: 'overview', title: 'Resumen', icon: '📊' },
  { id: 'details', title: 'Detalles', icon: '🔍' }
]

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

// Computed properties for global analysis
const globalContrastScore = computed(() => {
  if (contrastAnalysis.value.length === 0) return 0
  
  // Calcular el promedio de todos los ratios (blanco y negro)
  let totalRatio = 0
  let totalCount = 0
  
  contrastAnalysis.value.forEach(result => {
    if (typeof result.whiteRatio === 'number' && !isNaN(result.whiteRatio)) {
      totalRatio += result.whiteRatio
      totalCount++
    }
    if (typeof result.blackRatio === 'number' && !isNaN(result.blackRatio)) {
      totalRatio += result.blackRatio
      totalCount++
    }
  })
  
  if (totalCount === 0) return 0
  
  const averageRatio = totalRatio / totalCount
  
  // Convert ratio to a 0-10 scale
  return Math.min(averageRatio / 2, 10)
})

const passedElements = computed(() => {
  let passedCount = 0
  let totalCount = 0
  
  contrastAnalysis.value.forEach(result => {
    if (typeof result.whitePasses === 'boolean') {
      totalCount++
      if (result.whitePasses) passedCount++
    }
    if (typeof result.blackPasses === 'boolean') {
      totalCount++
      if (result.blackPasses) passedCount++
    }
  })
  
  return passedCount
})

const totalElements = computed(() => {
  let totalCount = 0
  
  contrastAnalysis.value.forEach(result => {
    if (typeof result.whitePasses === 'boolean') totalCount++
    if (typeof result.blackPasses === 'boolean') totalCount++
  })
  
  return totalCount
})

const currentThemeName = computed(() => {
  return isContrastImproved.value ? 'Tema Mejorado' : 'Tema Original'
})

const currentThemeColors = computed(() => {
  const theme = currentTheme.value
  return [
    theme.primary,
    theme.secondary,
    theme.tertiary,
    theme.quaternary,
    theme.quinary
  ].filter(Boolean)
})

// Lógica de navegación
const canGoBack = computed(() => {
  return currentStep.value > 1
})

const canGoNext = computed(() => {
  switch (currentStep.value) {
    case 1:
      return selectedPokemon.value !== null || palette.value.length > 0
    case 2:
      return palette.value.length > 0
    case 3:
      return contrastAnalysis.value.length > 0
    default:
      return false
  }
})

// Función para cambiar tab de análisis de contraste
const setContrastActiveTab = (tabId) => {
  contrastActiveTab.value = tabId
}

// Methods
const getContrastLabel = (score) => {
  if (score >= 7) return 'EXCELENTE'
  if (score >= 5) return 'BUENO'
  if (score >= 3) return 'REGULAR'
  return 'NECESITA MEJORA'
}

const selectPokemonFromAPI = async (pokemon) => {
  selectingPokemon.value = true
  loadingPokemon.value = true
  
  // Resetear estados de contraste al seleccionar nuevo Pokémon
  isContrastImproved.value = false
  originalTheme.value = null
  contrastAnalysis.value = []
  
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
    
    // Mostrar notificación de error al usuario
    showErrorNotification(
      'Pokémon no disponible',
      `Lo sentimos, "${formatPokemonName(pokemon.name)}" no está disponible en este momento. Intenta con otro Pokémon.`,
      'warning'
    )
  } finally {
    loadingPokemon.value = false
    selectingPokemon.value = false
  }
}

const updateShiny = (value) => {
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

const handleImageSelected = (image) => {
  if (selectedPokemon.value) {
    selectedPokemon.value.imageUrl = image.url
  }
}

const closePokemonCard = () => {
  selectedPokemon.value = null
  selectingPokemon.value = false
  loadingPokemon.value = false
  palette.value = []
  contrastAnalysis.value = []
  isContrastApplied.value = false
  isContrastImproved.value = false
  originalTheme.value = null
  
  // Restaurar tema por defecto al cerrar
  restoreDefaultTheme()
  
  // Volver al tab de búsqueda
  currentStep.value = 1
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

// Inicializar tema al cargar
onMounted(() => {
  console.log('🔄 Restaurando tema por defecto al cargar la página...')
  restoreDefaultTheme()
  currentTheme.value = getCurrentTheme()
  isContrastImproved.value = false
})

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
  
  // Don't auto-navigate, let user control the flow
}

// Función para aplicar mejoras de contraste global
const applyContrastImprovements = () => {
  console.log('Aplicando mejoras de contraste global...');
  
  try {
    // Guardar estado original si es la primera vez
    if (!isContrastApplied.value) {
      saveOriginalTheme();
    }
    
    // Analizar y mejorar contraste de elementos de texto
    improveTextContrast();
    
    isContrastApplied.value = true;
    
    // Re-analizar contraste después de aplicar mejoras
    setTimeout(() => {
      analyzePaletteContrast();
      updateContrastMetrics();
    }, 200);
    
    console.log('✅ Mejoras de contraste aplicadas exitosamente');
  } catch (error) {
    console.error('❌ Error al aplicar mejoras de contraste:', error);
  }
}

// Función para mejorar el contraste de textos analizando sus fondos
const improveTextContrast = () => {
  console.log('Analizando y mejorando contraste de textos...');
  
  // Selector más específico y completo para todos los elementos de texto
  const textSelectors = [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 
    'p', 'span', 'div', 'button', 
    '.color-hex', '.color-rgb', '.color-percentage', 
    '.contrast-label', '.contrast-ratio', '.contrast-status', 
    '.metric-value', '.metric-label', '.metric-title',
    '.step-label', '.step-number',
    '.preview-label', '.preview-stats',
    '.status-text', '.sample-text',
    '.btn-icon', '.label-icon', '.ratio-icon', '.status-icon',
    '.metric-icon', '.empty-icon',
    '.preview-color-hex',
    '.analyzer-header h1', '.analyzer-header p',
    '.step-header h2', '.step-header p',
    '.preview-header h3', '.preview-header p',
    '.preview-info h5', '.preview-info p',
    '.empty-state h3', '.empty-state p',
    '.preview-empty p'
  ];
  
  // Combinar todos los selectores
  const combinedSelector = textSelectors.join(', ');
  const textElements = document.querySelectorAll(combinedSelector);
  
  console.log(`🔍 Encontrados ${textElements.length} elementos de texto para analizar`);
  
  textElements.forEach((element, index) => {
    // Obtener el color de fondo del elemento o de su contenedor
    let backgroundColor = getComputedStyle(element).backgroundColor;
    
    // Si el elemento es transparente, buscar el color de fondo del padre
    if (backgroundColor === 'rgba(0, 0, 0, 0)' || backgroundColor === 'transparent') {
      let parent = element.parentElement;
      let depth = 0;
      while (parent && (backgroundColor === 'rgba(0, 0, 0, 0)' || backgroundColor === 'transparent') && depth < 5) {
        backgroundColor = getComputedStyle(parent).backgroundColor;
        parent = parent.parentElement;
        depth++;
      }
    }
    
    // Convertir a hexadecimal
    const hexBackground = rgbToHex(backgroundColor);
    
    // Si tenemos un color de fondo válido, analizar el contraste actual
    if (hexBackground && hexBackground !== '#000000' && hexBackground !== '#ffffff') {
      const currentColor = getComputedStyle(element).color;
      const currentRatio = calculateContrastRatio(currentColor, hexBackground);
      
      // Si el contraste actual es insuficiente (< 4.5), buscar un mejor color
      if (currentRatio < 4.5) {
        // Buscar el mejor color de la paleta para este fondo
        const bestColor = findBestContrastColor(hexBackground);
        if (bestColor) {
          element.style.color = bestColor;
          console.log(`✅ Mejorado contraste [${index}]: ${element.textContent?.substring(0, 30)} - Fondo: ${hexBackground}, Texto: ${bestColor}, Ratio: ${currentRatio.toFixed(2)}`);
        }
      } else {
        console.log(`✅ Contraste adecuado [${index}]: ${element.textContent?.substring(0, 30)} - Ratio: ${currentRatio.toFixed(2)}`);
      }
    } else {
      console.log(`⚠️ Sin fondo válido [${index}]: ${element.textContent?.substring(0, 30)}`);
    }
  });
  
  console.log('✅ Análisis de contraste completado');
}

// Función para encontrar el mejor color de contraste dentro de la paleta
const findBestContrastColor = (backgroundColor) => {
  if (!palette.value || palette.value.length === 0) {
    // Si no hay paleta, usar blanco o negro según la luminancia
    return getOptimalTextColor(backgroundColor);
  }
  
  let bestColor = null;
  let bestRatio = 0;
  
  // Probar con blanco y negro primero
  const whiteRatio = calculateContrastRatio('#ffffff', backgroundColor);
  const blackRatio = calculateContrastRatio('#000000', backgroundColor);
  
  if (whiteRatio > bestRatio) {
    bestRatio = whiteRatio;
    bestColor = '#ffffff';
  }
  
  if (blackRatio > bestRatio) {
    bestRatio = blackRatio;
    bestColor = '#000000';
  }
  
  // Probar con colores de la paleta que sean suficientemente diferentes del fondo
  palette.value.forEach(color => {
    if (color.hex && color.hex !== backgroundColor) {
      const ratio = calculateContrastRatio(color.hex, backgroundColor);
      if (ratio > bestRatio && ratio >= 4.5) {
        bestRatio = ratio;
        bestColor = color.hex;
      }
    }
  });
  
  return bestColor || getOptimalTextColor(backgroundColor);
}

// Función para restaurar contraste por defecto
const restoreDefaultContrast = () => {
  console.log('Restaurando contraste por defecto...');
  
  try {
    // Solo restaurar colores de texto a su estado original
    restoreOriginalTextColors();
    
    isContrastApplied.value = false;
    
    // Re-analizar contraste sin limpiar el análisis actual
    setTimeout(() => {
      analyzePaletteContrast();
      updateContrastMetrics();
    }, 200);
    
    console.log('✅ Contraste restaurado por defecto');
  } catch (error) {
    console.error('❌ Error al restaurar contraste:', error);
  }
}

// Función para restaurar colores de texto originales
const restoreOriginalTextColors = () => {
  console.log('Restaurando colores de texto originales...');
  
  // Usar el mismo selector que en improveTextContrast
  const textSelectors = [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 
    'p', 'span', 'div', 'button', 
    '.color-hex', '.color-rgb', '.color-percentage', 
    '.contrast-label', '.contrast-ratio', '.contrast-status', 
    '.metric-value', '.metric-label', '.metric-title',
    '.step-label', '.step-number',
    '.preview-label', '.preview-stats',
    '.status-text', '.sample-text',
    '.btn-icon', '.label-icon', '.ratio-icon', '.status-icon',
    '.metric-icon', '.empty-icon',
    '.preview-color-hex',
    '.analyzer-header h1', '.analyzer-header p',
    '.step-header h2', '.step-header p',
    '.preview-header h3', '.preview-header p',
    '.preview-info h5', '.preview-info p',
    '.empty-state h3', '.empty-state p',
    '.preview-empty p'
  ];
  
  const combinedSelector = textSelectors.join(', ');
  const textElements = document.querySelectorAll(combinedSelector);
  
  let restoredCount = 0;
  textElements.forEach(element => {
    // Remover estilos inline de color para restaurar los estilos CSS originales
    if (element.style.color) {
      element.style.removeProperty('color');
      restoredCount++;
    }
  });
  
  console.log(`✅ Restaurados ${restoredCount} colores de texto originales`);
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
const applyContrastToEntireApp = () => {
  console.log('Aplicando contraste a toda la aplicación...');
  
  try {
    // Usar los mismos selectores mejorados que en improveTextContrast
    const textSelectors = [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 
      'p', 'span', 'div', 'button', 
      '.color-hex', '.color-rgb', '.color-percentage', 
      '.contrast-label', '.contrast-ratio', '.contrast-status', 
      '.metric-value', '.metric-label', '.metric-title',
      '.step-label', '.step-number',
      '.preview-label', '.preview-stats',
      '.status-text', '.sample-text',
      '.btn-icon', '.label-icon', '.ratio-icon', '.status-icon',
      '.metric-icon', '.empty-icon',
      '.preview-color-hex',
      '.analyzer-header h1', '.analyzer-header p',
      '.step-header h2', '.step-header p',
      '.preview-header h3', '.preview-header p',
      '.preview-info h5', '.preview-info p',
      '.empty-state h3', '.empty-state p',
      '.preview-empty p'
    ];
    
    const combinedSelector = textSelectors.join(', ');
    const textElements = document.querySelectorAll(combinedSelector);
    
    console.log(`🔍 Aplicando contraste a ${textElements.length} elementos de texto`);
    
    textElements.forEach((element, index) => {
      // Obtener el color de fondo del elemento o de su contenedor
      let backgroundColor = getComputedStyle(element).backgroundColor;
      
      // Si el elemento es transparente, buscar el color de fondo del padre
      if (backgroundColor === 'rgba(0, 0, 0, 0)' || backgroundColor === 'transparent') {
        let parent = element.parentElement;
        let depth = 0;
        while (parent && (backgroundColor === 'rgba(0, 0, 0, 0)' || backgroundColor === 'transparent') && depth < 5) {
          backgroundColor = getComputedStyle(parent).backgroundColor;
          parent = parent.parentElement;
          depth++;
        }
      }
      
      const hexBackground = rgbToHex(backgroundColor);
      
      if (hexBackground && hexBackground !== '#000000' && hexBackground !== '#ffffff') {
        const contrastColor = getOptimalTextColor(hexBackground);
        element.style.color = contrastColor;
        console.log(`✅ Aplicado contraste [${index}]: ${element.textContent?.substring(0, 30)} - Fondo: ${hexBackground}, Texto: ${contrastColor}`);
      }
    });
    
    console.log('✅ Contraste aplicado a toda la aplicación');
  } catch (error) {
    console.error('❌ Error al aplicar contraste:', error);
  }
}

// Función para aplicar contraste a un tipo de elemento


// Función mejorada para calcular el contraste de un color
const getContrastColor = (hexColor) => {
  return getOptimalTextColor(hexColor);
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

// Llamar a la función después de aplicar la paleta
function applyPaletteAsTheme(palette) {
  const newTheme = generateThemeFromPalette(palette)
  applyTheme(newTheme)
  currentTheme.value = getCurrentTheme()
}

function restoreDefaultThemeHandler() {
  restoreDefaultTheme()
  currentTheme.value = getCurrentTheme()
  isContrastImproved.value = false
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
  if (currentStep.value < 3) {
    currentStep.value++
    
    // Si vamos al paso 3, asegurar que el análisis de contraste esté listo
    if (currentStep.value === 3 && palette.value.length > 0 && contrastAnalysis.value.length === 0) {
      console.log('🔄 Ejecutando análisis de contraste automáticamente...')
      analyzePaletteContrast()
    }
  }
}

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const restartFlow = () => {
  // Solo restaurar al estado anterior, no reiniciar toda la aplicación
  isContrastApplied.value = false
  
  // Restaurar colores de texto originales
  restoreOriginalTextColors();
  
  // Mantener el Pokémon seleccionado y la paleta
  // selectedPokemon.value = null
  // palette.value = []
  // contrastAnalysis.value = []
  // currentStep.value = 1
  // restoreDefaultTheme()
  
  console.log('✅ Estado anterior restaurado (tema aplicado, contrastes originales)');
}

const clearSelection = () => {
  // Limpiar completamente la selección y volver al inicio
  selectedPokemon.value = null
  palette.value = []
  contrastAnalysis.value = []
  currentStep.value = 1
  isContrastApplied.value = false
  restoreDefaultTheme()
  restoreOriginalTextColors()
  
  console.log('🏠 Volviendo al inicio - selección limpiada');
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

// Función para mostrar hint de contraste
const showContrastHint = () => {
  // Crear notificación mejorada
  const hint = document.createElement('div');
  hint.className = 'contrast-hint';
  hint.innerHTML = `
    <div class="hint-content">
      <span class="hint-icon">💡</span>
      <span class="hint-text">¿No ves algún texto? Puedes mejorar el contraste en el paso de análisis</span>
      <button class="hint-close" onclick="this.parentElement.parentElement.remove()">×</button>
    </div>
  `;
  
  // Agregar estilos mejorados
  hint.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 20px 25px;
    border-radius: 15px;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
    z-index: 1000;
    max-width: 350px;
    animation: slideIn 0.6s ease-out;
    border: 2px solid rgba(255, 255, 255, 0.2);
    cursor: pointer;
    transition: all 0.3s ease;
  `;
  
  // Agregar estilos para el contenido mejorado
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%) scale(0.9); opacity: 0; }
      to { transform: translateX(0) scale(1); opacity: 1; }
    }
    
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
    
    .contrast-hint {
      animation: slideIn 0.6s ease-out, pulse 2s ease-in-out infinite 1s;
    }
    
    .contrast-hint:hover {
      transform: translateY(-3px) scale(1.02);
      box-shadow: 0 15px 50px rgba(0, 0, 0, 0.4);
      border-color: rgba(255, 255, 255, 0.4);
    }
    
    .hint-content {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .hint-icon {
      font-size: 1.4em;
      animation: sparkle 1.5s ease-in-out infinite;
    }
    
    @keyframes sparkle {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.8; transform: scale(1.1); }
    }
    
    .hint-text {
      flex: 1;
      font-size: 1rem;
      font-weight: 600;
      line-height: 1.4;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    }
    
    .hint-close {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: white;
      font-size: 1.3em;
      cursor: pointer;
      padding: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: all 0.3s ease;
      font-weight: bold;
    }
    
    .hint-close:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: scale(1.1);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }
  `;
  
  document.head.appendChild(style);
  document.body.appendChild(hint);
  
  // Hacer la notificación clickeable para ir al paso de análisis
  hint.addEventListener('click', (e) => {
    // No navegar si se hace clic en el botón de cerrar
    if (e.target.classList.contains('hint-close')) {
      return;
    }
    
    // Navegar al paso de análisis
    currentStep.value = 3;
    
    // Remover la notificación después de hacer clic
    setTimeout(() => {
      if (hint.parentElement) {
        hint.remove();
      }
    }, 300);
  });
  
  // NO auto-remover - la notificación permanece hasta que el usuario la cierre o haga clic
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
</script>

<style scoped>
/* Estilos para tabs de análisis de contraste */
.contrast-tabs-navigation {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 25px;
  padding: 0 20px;
}

.contrast-tab-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: 2px solid var(--theme-border);
  border-radius: 10px;
  background: var(--theme-quinary);
  color: var(--theme-quaternary);
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.contrast-tab-btn:hover {
  background: var(--theme-tertiary);
  border-color: var(--theme-primary);
  transform: translateY(-2px);
}

.contrast-tab-btn.active {
  background: linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-secondary) 100%);
  color: var(--theme-tertiary);
  border-color: var(--theme-primary);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.tab-icon {
  font-size: 1.1em;
}

.tab-text {
  font-size: 0.85rem;
}

.contrast-tabs-content {
  width: 100%;
}

.contrast-tab-panel {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Estilos específicos para el tab de detalles */
.contrast-tab-panel .contrast-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-top: 25px;
}

.contrast-tab-panel .contrast-card {
  background: var(--theme-quinary);
  border-radius: 12px;
  padding: 20px;
  border: 2px solid var(--theme-border);
  transition: all 0.3s ease;
}

.contrast-tab-panel .contrast-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border-color: var(--theme-primary);
}

.contrast-tab-panel .card-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.contrast-tab-panel .color-preview {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  border: 3px solid var(--theme-border);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
}

.contrast-tab-panel .color-info {
  flex: 1;
}

.contrast-tab-panel .color-hex {
  display: block;
  font-family: monospace;
  font-weight: bold;
  color: var(--theme-quaternary);
  font-size: 1rem;
  margin-bottom: 4px;
}

.contrast-tab-panel .color-name {
  color: var(--theme-senary);
  font-size: 0.9rem;
  opacity: 0.8;
}

.contrast-tab-panel .text-comparison {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.contrast-tab-panel .preview-btn {
  flex: 1;
  padding: 12px;
  border: 2px solid var(--theme-border);
  border-radius: 8px;
  font-weight: bold;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.contrast-tab-panel .preview-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.contrast-tab-panel .card-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px;
  border-radius: 8px;
  background: var(--theme-tertiary);
}

.contrast-tab-panel .status-icon {
  font-size: 1.2em;
}

.contrast-tab-panel .status-icon.pass {
  color: #10b981;
}

.contrast-tab-panel .status-icon.fail {
  color: #ef4444;
}

.contrast-tab-panel .status-text {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--theme-quaternary);
}
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

.analyzer-header {
  text-align: center;
  margin-bottom: 10px; /* Reducido aún más */
  padding: 10px; /* Reducido de 15px */
  background: var(--theme-quinary);
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--theme-border);
  flex-shrink: 0; /* Prevent shrinking */
}

.analyzer-header h2 {
  color: var(--theme-quaternary);
  margin-bottom: 5px; /* Reducido de 8px */
  font-size: 1.4rem; /* Reducido de 1.6rem */
  font-weight: bold;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.header-info {
  display: flex;
  justify-content: center;
  margin-top: 8px; /* Reducido de 10px */
}

.info-icon {
  font-size: 1.1rem; /* Reducido de 1.2rem */
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
  color: var(--theme-senary);
  font-size: 0.8rem; /* Reducido de 0.9rem */
  opacity: 0.9;
  font-weight: 500;
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

.main-layout {
  display: flex;
  flex-direction: column;
  gap: 15px;
  flex-grow: 1;
  overflow: hidden;
  padding: 0 5px;
  height: 100%;
}



.search-container {
  margin-top: 15px;
}

/* Estados de la interfaz */
.search-state,
.selected-state {
  animation: fadeIn 0.3s ease-in-out;
  height: 100%;
  display: flex;
  flex-direction: column;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Headers de estado */
.search-header,
.selected-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
  justify-content: center;
  text-align: center;
  flex-shrink: 0;
}

.back-btn {
  background: var(--theme-quinary);
  color: var(--theme-quaternary);
  border: 2px solid var(--theme-border);
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.back-btn:hover {
  background: var(--theme-tertiary);
  border-color: var(--theme-primary);
  transform: translateY(-2px);
}

.search-header h2,
.selected-header h2 {
  margin: 0;
  color: var(--theme-quaternary);
  font-size: 1.5rem;
  font-weight: 700;
  text-align: center;
}

.selected-header h2 {
  color: var(--theme-primary);
}

.selected-header p {
  margin: 0;
  color: var(--theme-senary);
  font-size: 1rem;
}



.main-content-area {
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 15px;
  background: linear-gradient(135deg, var(--theme-quinary) 0%, var(--theme-tertiary) 100%);
  border-radius: 20px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
  border: 2px solid var(--theme-border);
  backdrop-filter: blur(10px);
  flex-grow: 1;
  overflow: hidden;
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
  flex-grow: 1;
  overflow: hidden;
}

.step-header {
  text-align: center;
  margin-bottom: 15px; /* Reducido de 20px */
}

.step-header h2 {
  color: var(--theme-quaternary);
  margin-bottom: 8px; /* Reducido de 10px */
  font-size: 1.5rem; /* Reducido de 1.8rem */
  font-weight: bold;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.step-header p {
  color: var(--theme-senary);
  font-size: 0.9rem; /* Reducido de 1rem */
  opacity: 0.9;
  font-weight: 500;
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
}

.search-container {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  transition: all 0.3s ease;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 15px;
}



.palette-section {
  margin-bottom: 20px; /* Reducido de 30px */
}

.palette-preview {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin: 15px 0;
  flex-wrap: wrap;
}

.theme-color-swatch {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 2px solid var(--theme-border);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.theme-color-swatch:hover {
  transform: scale(1.3);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
}

.contrast-analysis-section {
  background: var(--theme-tertiary);
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--theme-border);
  margin-top: 20px;
}

.contrast-hint-inline {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border: 2px solid var(--theme-primary);
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 25px;
  animation: pulse 2s ease-in-out infinite;
}

.hint-inline-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.hint-inline-icon {
  font-size: 1.3em;
  color: var(--theme-primary);
}

.hint-inline-text {
  color: var(--theme-quaternary);
  font-size: 0.95rem;
  font-weight: 500;
  line-height: 1.4;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
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
  background: var(--theme-quinary);
  border-radius: 15px;
  padding: 25px;
  margin-bottom: 30px;
  border: 1px solid var(--theme-border);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  max-width: 1000px;
  margin-left: auto;
  margin-right: auto;
}

.analysis-header {
  margin-bottom: 25px;
  text-align: center;
}

.analysis-title {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  background: linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-secondary) 100%);
  color: white;
  padding: 12px 20px;
  border-radius: 25px;
  font-weight: 600;
  font-size: 1.1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.analysis-icon {
  font-size: 1.2em;
}

.analysis-text {
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.metric-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid var(--theme-border);
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  min-height: 160px;
  width: 100%;
  max-width: 300px;
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
  gap: 10px;
  margin-bottom: 15px;
  color: var(--theme-primary);
  font-size: 0.9rem;
  font-weight: 600;
}

.metric-icon {
  font-size: 1.3em;
}

.metric-title {
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 0.8rem;
  font-weight: 700;
}

.metric-value {
  font-size: 2.5rem;
  font-weight: bold;
  color: var(--theme-primary);
  margin-bottom: 12px;
  font-family: monospace;
  line-height: 1;
}

.metric-bar {
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  margin-bottom: 10px;
  overflow: hidden;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
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
  font-size: 0.8rem;
  color: var(--theme-senary);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.metric-subtitle {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--theme-primary);
  margin-bottom: 15px;
  text-align: center;
}

.contrast-results {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 25px;
  justify-content: center;
}

.contrast-item {
  background: var(--theme-quinary);
  border-radius: 12px;
  padding: 20px;
  border: 2px solid var(--theme-border);
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.contrast-pair {
  display: flex;
  align-items: center;
  gap: 16px;
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
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  justify-items: center;
  align-items: start;
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

.contrast-preview {
  display: flex;
  gap: 20px;
  justify-content: center;
  margin: 20px 0;
  padding: 15px;
  background: var(--theme-quinary);
  border-radius: 10px;
  border: 1px solid var(--theme-border);
}

.preview-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.preview-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--theme-quaternary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.preview-sample {
  padding: 10px 15px;
  border-radius: 8px;
  border: 2px solid var(--theme-border);
  min-width: 120px;
  text-align: center;
  transition: all 0.3s ease;
}

.preview-sample.original {
  background: var(--theme-quinary);
  color: var(--theme-quaternary);
}

.preview-sample.improved {
  background: var(--theme-quaternary);
  color: var(--theme-tertiary);
}

.preview-sample.improved.active {
  background: #2d3748;
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(45, 55, 72, 0.3);
}

.sample-text {
  font-weight: 600;
  font-size: 0.9rem;
}

.button-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.contrast-btn {
  padding: 16px 32px;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  border: 3px solid var(--theme-border);
  transition: all 0.3s ease;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  min-width: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  border-color: #667eea;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.contrast-btn.restore {
  background: linear-gradient(135deg, #f7fafc 0%, #e2e8f0 100%);
  color: #2d3748;
  border-color: #cbd5e0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
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
}

/* Nuevo diseño compacto para análisis de contraste */
.contrast-analysis-compact {
  margin: 20px 0;
}

.analysis-summary {
  background: var(--theme-quinary);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  border: 2px solid var(--theme-border);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 15px;
  background: var(--theme-tertiary);
  border-radius: 8px;
  border: 1px solid var(--theme-border);
  transition: all 0.3s ease;
}

.stat-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  font-size: 1.5em;
  opacity: 0.8;
}

.stat-label {
  font-size: 0.8rem;
  color: var(--theme-septenary);
  text-align: center;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--theme-quaternary);
}

.contrast-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-top: 20px;
}

.contrast-card {
  background: var(--theme-quinary);
  border-radius: 10px;
  padding: 15px;
  border: 2px solid var(--theme-border);
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.contrast-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.color-swatch {
  width: 30px;
  height: 30px;
  border-radius: 6px;
  border: 2px solid var(--theme-border);
  flex-shrink: 0;
}

.color-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.color-hex {
  font-family: monospace;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--theme-quaternary);
}

.color-index {
  font-size: 0.7rem;
  color: var(--theme-septenary);
  font-weight: 500;
}

.card-metrics {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.metric-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 8px;
  background: var(--theme-tertiary);
  border-radius: 4px;
  border: 1px solid var(--theme-border);
}

.metric-label {
  font-size: 0.8rem;
  color: var(--theme-septenary);
  font-weight: 600;
}

.metric-value {
  font-size: 0.9rem;
  font-weight: 700;
  font-family: monospace;
}

.metric-value.pass {
  color: #38a169;
}

.metric-value.fail {
  color: #e53e3e;
}

.card-preview {
  margin: 8px 0;
}

.preview-buttons {
  display: flex;
  gap: 8px;
}

.preview-btn {
  flex: 1;
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid var(--theme-border);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.preview-btn:hover {
  transform: scale(1.02);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.card-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 6px 12px;
  background: var(--theme-tertiary);
  border-radius: 6px;
  border: 1px solid var(--theme-border);
}

.status-icon {
  font-size: 1rem;
}

.status-icon.pass {
  color: #38a169;
}

.status-icon.fail {
  color: #e53e3e;
}

.status-text {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--theme-quaternary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.contrast-btn.applied {
  background: linear-gradient(135deg, #38a169 0%, #48bb78 100%);
  color: var(--theme-tertiary);
  border-color: #38a169;
  cursor: not-allowed;
  opacity: 0.8;
}

.contrast-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.contrast-btn:disabled:hover {
  transform: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  background: var(--theme-quinary);
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--theme-border);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.empty-icon {
  font-size: 5rem;
  color: var(--theme-senary);
  margin-bottom: 30px;
  opacity: 0.7;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.empty-state h3 {
  color: var(--theme-quaternary);
  margin-bottom: 10px;
  font-size: 1.8rem;
}

.empty-state p {
  color: var(--theme-senary);
  font-size: 1rem;
  margin-bottom: 30px;
}

.back-btn {
  padding: 12px 24px;
  border: 2px solid var(--theme-border);
  background: var(--theme-quinary);
  color: var(--theme-quaternary);
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 160px;
  justify-content: center;
}

.back-btn:hover {
  background: var(--theme-border);
  color: var(--theme-quaternary);
  border-color: var(--theme-border);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.back-btn .btn-icon {
  font-size: 1.2em;
  opacity: 0.9;
}



.restart-btn {
  padding: 14px 28px;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  border: 2px solid var(--theme-border);
  background: var(--theme-quinary);
  color: var(--theme-quaternary);
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  min-width: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.restart-btn:hover {
  background: var(--theme-quaternary);
  color: var(--theme-tertiary);
  border-color: var(--theme-quaternary);
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.preview-panel {
  display: flex;
  flex-direction: column;
  gap: 30px;
  padding: 20px;
  background: var(--theme-quinary);
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--theme-border);
}

.preview-header {
  text-align: center;
  margin-bottom: 20px;
}

.preview-header h3 {
  color: var(--theme-quaternary);
  margin-bottom: 10px;
  font-size: 1.5rem;
  font-weight: bold;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.preview-header p {
  color: var(--theme-senary);
  font-size: 1rem;
  opacity: 0.9;
  font-weight: 500;
}

.pokemon-preview {
  margin-bottom: 30px;
}

.preview-card {
  display: flex;
  align-items: center;
  gap: 20px;
  background: var(--theme-quinary);
  border-radius: 12px;
  padding: 15px;
  border: 1px solid var(--theme-border);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.preview-image {
  width: 100px;
  height: 100px;
  object-fit: contain;
  border-radius: 8px;
  border: 1px solid var(--theme-border);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.preview-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.preview-info h5 {
  color: var(--theme-quaternary);
  font-size: 1.2rem;
  font-weight: bold;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.preview-info p {
  color: var(--theme-senary);
  font-size: 0.9rem;
  opacity: 0.9;
}

.preview-types {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.preview-palette-section {
  margin-bottom: 30px;
}

.preview-palette {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 15px;
}

.preview-color {
  position: relative;
  padding: 8px;
  border-radius: 6px;
  border: 1px solid var(--theme-border);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  text-align: center;
  color: var(--theme-quaternary);
  font-family: monospace;
  font-weight: bold;
  font-size: 0.8rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  min-height: 60px;
}

.preview-color-hex {
  font-size: 0.7rem;
  opacity: 0.8;
}

.preview-stats {
  color: var(--theme-senary);
  font-size: 0.9rem;
  text-align: center;
  margin-top: 10px;
}

.export-preview {
  margin-top: 30px;
}

.preview-empty {
  text-align: center;
  padding: 80px 20px;
  background: var(--theme-quinary);
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--theme-border);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.preview-empty-icon {
  font-size: 5rem;
  color: var(--theme-senary);
  margin-bottom: 30px;
  opacity: 0.7;
  animation: float 3s ease-in-out infinite;
}

@media (max-width: 768px) {
  .pokemon-palette-analyzer {
    padding: 10px;
    height: calc(100vh - 40px);
  }
  
  .main-layout {
    height: 100%;
    overflow: hidden;
  }
  
  .analyzer-header h1 {
    font-size: 1.5rem;
  }
  
  .analyzer-header p {
    font-size: 0.9rem;
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
  
  .main-layout {
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
  
  .step-header h2 {
    font-size: 1.3rem;
  }
  
  .step-header p {
    font-size: 0.9rem;
  }
  
  .mode-btn {
    padding: 10px 16px;
    font-size: 14px;
  }
  
  .contrast-btn {
    min-width: 180px;
    padding: 12px 24px;
    font-size: 14px;
  }
  
  /* Estilos responsive para el análisis global */
  .global-contrast-analysis {
    padding: 20px;
    margin-bottom: 20px;
  }
  
  .analysis-title {
    padding: 10px 16px;
    font-size: 1rem;
  }
  
  .contrast-metrics {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .metric-card {
    max-width: 100%;
    padding: 18px;
    min-height: 140px;
  }
  
  .metric-value {
    font-size: 2rem;
  }
  
  .metric-subtitle {
    font-size: 1rem;
  }
  
  .palette-preview {
    gap: 6px;
  }
  
  .theme-color-swatch {
    width: 25px;
    height: 25px;
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
  
  /* Responsive para tabs de contraste */
  .contrast-tabs-navigation {
    flex-direction: column;
    gap: 8px;
    padding: 0 10px;
  }
  
  .contrast-tab-btn {
    padding: 10px 16px;
    font-size: 0.8rem;
  }
  
  .contrast-tab-panel .contrast-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .contrast-tab-panel .contrast-card {
    padding: 15px;
  }
  
  .contrast-tab-panel .color-preview {
    width: 40px;
    height: 40px;
  }
  
  .contrast-tab-panel .text-comparison {
    flex-direction: column;
    gap: 8px;
  }
  
  .contrast-tab-panel .preview-btn {
    padding: 10px;
    font-size: 0.8rem;
  }
  

  

  
  /* Estilos responsive para los nuevos estados */
  .search-header,
  .selected-header {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }
  
  .back-btn {
    padding: 6px 12px;
    font-size: 0.8rem;
  }
  
  .search-header h2,
  .selected-header h2 {
    font-size: 1.3rem;
  }
  
  .selected-header p {
    font-size: 0.9rem;
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
  
  .breadcrumb-controls {
    flex-direction: column;
    gap: 8px;
  }
  
  .nav-controls {
    flex-direction: column;
    gap: 6px;
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
  
  .analyzer-header h2 {
    font-size: 1.3rem;
  }
  
  .analyzer-header p {
    font-size: 0.9rem;
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
  
  .metric-subtitle {
    font-size: 0.9rem;
  }
  
  .palette-preview {
    gap: 4px;
  }
  
  .theme-color-swatch {
    width: 22px;
    height: 22px;
  }
  
  .global-contrast-analysis {
    padding: 15px;
  }
  
  .analysis-title {
    padding: 8px 12px;
    font-size: 0.9rem;
  }
  
  .contrast-metrics {
    gap: 12px;
  }
  
  .color-item {
    padding: 6px;
  }
  
  .color-info {
    font-size: 0.7rem;
  }
  
  .preview-card {
    padding: 10px;
  }
  
  .preview-image {
    width: 70px;
    height: 70px;
  }
  
  .preview-info h5 {
    font-size: 1rem;
  }
  
  .preview-info p {
    font-size: 0.8rem;
  }
  
  .preview-types {
    justify-content: center;
  }
  
  .preview-palette {
    grid-template-columns: repeat(2, 1fr);
    gap: 6px;
  }
  
  .preview-color {
    padding: 6px;
    font-size: 0.7rem;
  }
  
  .preview-color-hex {
    font-size: 0.6rem;
  }
  
  .preview-stats {
    font-size: 0.7rem;
  }
  
  .preview-empty {
    padding: 40px 15px;
  }
  
  .preview-empty-icon {
    font-size: 3rem;
  }
  
  .restart-btn {
    min-width: 160px;
    padding: 10px 20px;
    font-size: 13px;
  }
  

  

  

  
  /* Estilos responsive para pantallas pequeñas */
  .search-header,
  .selected-header {
    gap: 8px;
  }
  
  .back-btn {
    padding: 5px 10px;
    font-size: 0.75rem;
  }
  
  .search-header h2,
  .selected-header h2 {
    font-size: 1.2rem;
  }
  
  .selected-header p {
    font-size: 0.85rem;
  }
  

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

/* Hacer el contenedor del display card relativo para el posicionamiento */
.pokemon-display-card {
  position: relative;
}

/* Estilos para el loader overlay */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  animation: fadeIn 0.3s ease-in-out;
}

.selected-state {
  position: relative;
  min-height: 400px;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style> 
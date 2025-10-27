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
    
    <!-- Progreso de análisis -->
    <AnalysisProgress
      :show="isAnalyzing"
      :progress="analysisProgress || 0"
      :message="analysisMessage || ''"
      @cancel="handleCancelAnalysis"
    />
    
    <!-- Pantalla de bienvenida -->
    <WelcomeScreen v-if="showWelcome" @start-app="startApp" />
    
    <!-- Contenido principal (oculto durante la bienvenida) -->
    <div v-if="!showWelcome" class="main-content" id="main-content" role="main" aria-label="Analizador de paletas de Pokémon">
      <!-- Nuevo Header con Progress Stepper -->
      <ProgressHeader
        :current-step="currentStep"
        :selected-pokemon="selectedPokemon"
        :palette="palette"
        @go-to-step="handleGoToStep"
        @clear-selection="clearSelection"
      />
      
      <!-- Barra de indicador de tema aplicado -->
      <ThemePaletteBar
        :show-bar="showThemePaletteBar"
        :pokemon-name="selectedPokemon?.name || 'Pokémon'"
        :palette-colors="appliedPaletteColors"
        :color-count="appliedPaletteColors.length"
        @restore="handleRestoreThemeFromBar"
        @close="hideThemePaletteBar"
      />
      
      <!-- Contenido principal simplificado -->
      <div class="content-wrapper">
        <!-- Paso 1: Búsqueda de Pokémon -->
        <div v-if="currentStep === 1" class="step-content selection-step animate-in">
          <PokemonSearchStep 
            :is-shiny="isShiny"
            :selected-pokemon="selectedPokemon"
            @pokemon-selected="handlePokemonSelected"
            @search-error="handleSearchError"
            @update-shiny="updateShiny"
            @analyze-pokemon="handleAnalyzeSelectedPokemon"
          />
        </div>
        
        <!-- Paso 2: Generar Paleta -->
        <div v-if="currentStep === 2" class="step-content palette-step animate-in">
          <PaletteGenerationStep 
            :palette="palette"
            :selected-pokemon="selectedPokemon"
            @apply-theme="handleApplyThemeWrapped"
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
          />
        </div>
      </div>
      
      <!-- Botones de navegación flotantes (Mobile) -->
      <div class="floating-navigation">
        <button 
          v-if="currentStep > 1" 
          @click="handlePrevStep" 
          :disabled="!canGoBack"
          class="nav-btn nav-prev"
        >
          <span class="nav-icon">←</span>
          <span class="nav-text">Anterior</span>
        </button>
        
        <button 
          v-if="currentStep < 3" 
          @click="handleNextStep" 
          :disabled="!canGoNext"
          class="nav-btn nav-next"
        >
          <span class="nav-text">Siguiente</span>
          <span class="nav-icon">→</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed, defineAsyncComponent } from 'vue'

// Lazy loading para componentes grandes
const PokemonSearchStep = defineAsyncComponent(() => 
  import('./PokemonSearchStep.vue')
)
const PaletteGenerationStep = defineAsyncComponent(() => 
  import('./PaletteGenerationStep.vue')
)
const ContrastAnalysisStep = defineAsyncComponent(() => 
  import('./ContrastAnalysisStep.vue')
)
const WelcomeScreen = defineAsyncComponent(() => 
  import('./WelcomeScreen.vue')
)
const ErrorNotification = defineAsyncComponent(() => 
  import('./ErrorNotification.vue')
)
const ThemePaletteBar = defineAsyncComponent(() => 
  import('./ThemePaletteBar.vue')
)
const AnalysisProgress = defineAsyncComponent(() => 
  import('./shared/AnalysisProgress.vue')
)
const ProgressHeader = defineAsyncComponent(() => 
  import('./ProgressHeader.vue')
)

// Composables
import { useThemeManager } from '../composables/useThemeManager.js'
import { useStepNavigation } from '../composables/useStepNavigation.js'
import { useErrorHandler } from '../composables/useErrorHandler.js'
import { useGlobalErrorHandler } from '../composables/useGlobalErrorHandler.js'
import { useAccessibility } from '../composables/useAccessibility.js'
import { useColorExtraction } from '../composables/useColorExtraction.js'
import { useWebWorkerColorExtraction } from '../composables/useWebWorkerColorExtraction.js'
import { useContrastAnalysis } from '../composables/useContrastAnalysis.js'

// Utils
import { shouldShowWelcome, markWelcomeAsSeen } from '../utils/welcomeManager.js'
import { preloadComponent } from '../utils/lazyLoader.js'

// Inicializar composables
const {
  currentStep,
  canGoBack,
  nextStep,
  prevStep,
  goToStep,
  canNavigateToStep,
  getStepTooltip,
  getStepName,
  getStepIcon,
  getStepTitle,
  getStepSubtitle
} = useStepNavigation()

// Usar Web Worker si está disponible, sino fallback a procesamiento síncrono
const webWorkerExtraction = useWebWorkerColorExtraction()
const fallbackExtraction = useColorExtraction()

const useWebWorker = webWorkerExtraction.isWorkerSupported()

const {
  palette,
  isAnalyzing,
  analyzeSelectedPokemon,
  updatePalette,
  clearPalette,
  analysisProgress,
  analysisMessage
} = useWebWorker ? webWorkerExtraction : fallbackExtraction

const {
  contrastAnalysis,
  isAnalyzingContrast,
  analyzePaletteContrast,
  clearContrastAnalysis
} = useContrastAnalysis()

const {
  currentTheme,
  originalTheme,
  handleApplyTheme,
  handleRestoreTheme,
  resetThemeState
} = useThemeManager()

const {
  errorNotification,
  showErrorNotification,
  closeErrorNotification,
  handleSearchError,
  handleAnalysisError,
  handleNetworkError
} = useErrorHandler()

const {
  initializeA11y,
  announce,
  enhanceElement,
  cleanupA11y
} = useAccessibility()

// Estado local específico del componente
const showWelcome = ref(shouldShowWelcome())
const selectedPokemon = ref(null)
const isShiny = ref(false)
const loadingPokemon = ref(false)
const selectingPokemon = ref(false)

// Estado para la barra de tema aplicado
const showThemePaletteBar = ref(false)
const appliedPaletteColors = ref([])

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
    clearPalette()
    clearContrastAnalysis()
    resetThemeState()
    return
  }
  
  // Si es el mismo Pokémon pero con imagen diferente, actualizar solo la imagen
  if (selectedPokemon.value && selectedPokemon.value.id === pokemon.id) {
    selectedPokemon.value.imageUrl = pokemon.imageUrl
  } else {
    // Es un Pokémon diferente, reemplazar completamente
    selectedPokemon.value = pokemon
    clearPalette()
    clearContrastAnalysis()
    resetThemeState()
  }
}

const updateShiny = (value) => {
  isShiny.value = value
}

// Manejadores de eventos para la navegación
const handleNextStep = () => {
  // Usar la lógica local de canGoNext en lugar de la del composable
  if (canGoNext.value) {
    currentStep.value++
    
    // Si vamos al paso 3, asegurar que el análisis de contraste esté listo
    if (currentStep.value === 3 && palette.value.length > 0 && contrastAnalysis.value.length === 0) {
      analyzePaletteContrast(palette.value)
    }
  }
}

const handlePrevStep = () => {
  prevStep()
}

const handleGoToStep = (step) => {
  const canNavigate = (step) => {
    if (step === currentStep.value) return false
    
    switch (step) {
      case 1: return true
      case 2: return selectedPokemon.value !== null
      case 3: return selectedPokemon.value !== null && palette.value.length > 0
      default: return false
    }
  }
  
  if (canNavigate(step)) {
    goToStep(step)
    
    // Si vamos al paso 3, asegurar que el análisis de contraste esté listo
    if (step === 3 && palette.value.length > 0 && contrastAnalysis.value.length === 0) {
      analyzePaletteContrast(palette.value)
    }
  }
}

const clearSelection = () => {
  // Limpiar completamente la selección y volver al inicio
  selectedPokemon.value = null
  clearPalette()
  clearContrastAnalysis()
  currentStep.value = 1
  
  // Restaurar tema por defecto
  handleRestoreTheme()
}

// Función para iniciar la app después de la pantalla de bienvenida
const startApp = () => {
  showWelcome.value = false
  markWelcomeAsSeen()
}

// Los métodos de análisis ahora están en los composables

const handleAnalyzeSelectedPokemon = async () => {
  if (!selectedPokemon.value) return
  
  try {
    announce(`Analizando colores de ${selectedPokemon.value.name}...`)
    
    const colors = await analyzeSelectedPokemon(selectedPokemon.value)
    
    // Analizar contraste después de generar la paleta
    analyzePaletteContrast(colors)
    
    // Auto-navigate to palette tab
    currentStep.value = 2
    
    announce(`Paleta de ${colors.length} colores generada para ${selectedPokemon.value.name}. Navegando al paso de paleta.`)
  } catch (error) {
    announce('Error al analizar el Pokémon. Por favor, intenta de nuevo.', 'assertive')
    handleAnalysisError(error)
  }
}

// Manejo de actualización de paleta
function handleUpdatePalette(updatedPalette) {
  // Actualizar la paleta con los colores editados
  updatePalette(updatedPalette)
  
  // Re-analizar el contraste si estamos en el paso 3
  if (currentStep.value === 3 && updatedPalette.length > 0) {
    analyzePaletteContrast(updatedPalette)
  }
}

// Métodos para la barra de tema aplicado
const hideThemePaletteBar = () => {
  showThemePaletteBar.value = false
}

const handleRestoreThemeFromBar = () => {
  handleRestoreTheme()
  showThemePaletteBar.value = false
  appliedPaletteColors.value = []
}

// Envolver handleApplyTheme para mostrar la barra
const handleApplyThemeWrapped = (colorHexes) => {
  handleApplyTheme(colorHexes)
  appliedPaletteColors.value = colorHexes
  showThemePaletteBar.value = true
  
  // Auto-ocultar después de 10 segundos
  setTimeout(() => {
    if (showThemePaletteBar.value) {
      showThemePaletteBar.value = false
    }
  }, 10000)
}

// Manejar cancelación de análisis
const handleCancelAnalysis = () => {
  // Forzar el cierre del modal de análisis
  if (useWebWorker) {
    webWorkerExtraction.isAnalyzing.value = false
  } else {
    fallbackExtraction.isAnalyzing.value = false
  }
  
  // Mostrar notificación informativa más corta y clara
  showErrorNotification(
    'Análisis cancelado',
    'GitHub está limitando las solicitudes (Error 429). Espera unos minutos e intenta de nuevo.',
    'warning'
  )
  
  announce('Análisis cancelado por problemas de red', 'polite')
}

// Inicializar tema y accesibilidad al cargar
onMounted(() => {
  // Restaurar tema por defecto
  handleRestoreTheme()
  
  // Inicializar accesibilidad
  initializeA11y()
  
  // Anunciar carga de la aplicación
  announce('Pokémon Palette Analyzer cargado. Usa Tab para navegar.')
  
  // Preload componentes que probablemente se usarán
  preloadComponent(() => import('./ContrastAnalysisStep.vue'), 'ContrastAnalysisStep')
  preloadComponent(() => import('./PaletteGenerationStep.vue'), 'PaletteGenerationStep')
})

// Limpiar al desmontar
onUnmounted(() => {
  cleanupA11y()
})
</script>

<style scoped>
@import '../styles/shared.css';

.pokemon-palette-analyzer {
  min-height: 100vh;
  background: var(--bg-secondary);
  display: flex;
  flex-direction: column;
}

.pokemon-palette-analyzer.welcome-mode {
  height: 100vh;
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: var(--z-modal);
}

.main-content {
  animation: fadeIn 0.5s ease-out;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  width: 100%;
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
  border-radius: 12px;
  padding: 8px 16px;
  border: 2px solid var(--theme-border);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
  flex-shrink: 0;
  backdrop-filter: blur(15px);
  width: 100%;
  max-width: none;
  margin: 0;
  gap: 15px;
  flex-wrap: wrap;
}

.breadcrumb-center {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 20px;
  flex: 1;
  justify-content: center;
  flex-wrap: wrap;
}

.breadcrumb-steps {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: center;
}

.breadcrumb-step {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--theme-quaternary);
  padding: 5px 10px;
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
  font-size: 0.65rem;
}

.breadcrumb-arrow {
  font-size: 1.3em;
  color: var(--theme-border);
  margin: 0 8px;
}

/* Botones de navegación en extremos */
.nav-btn-compact {
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
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
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #38a169 0%, #48bb78 100%);
  color: white;
  border: 2px solid #38a169;
  display: flex;
  align-items: center;
  gap: 5px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  min-width: 130px;
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

.content-wrapper {
  flex: 1;
  overflow: auto;
  padding: var(--spacing-lg);
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

.step-content {
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-light);
  flex: 1;
  overflow: auto;
  min-height: 0;
  width: 100%;
  padding: var(--spacing-xl);
  box-sizing: border-box;
  animation: slideUp 0.4s ease-out;
}

/* Floating Navigation Buttons */
.floating-navigation {
  position: fixed;
  bottom: 80px; /* Espacio para no tapar el footer */
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: var(--spacing-md);
  z-index: var(--z-fixed);
  padding: var(--spacing-sm);
  background: var(--bg-primary);
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-xl);
  border: 1px solid var(--border-light);
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--radius-full);
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition-base);
  border: none;
  font-size: var(--text-sm);
}

.nav-btn.nav-prev {
  background: var(--bg-secondary);
  color: var(--theme-gray-900);
}

.nav-btn.nav-prev:hover:not(:disabled) {
  background: var(--theme-gray-100);
  transform: translateX(-2px);
}

.nav-btn.nav-next {
  background: var(--gradient-primary);
  color: white;
  box-shadow: var(--shadow-primary);
}

.nav-btn.nav-next:hover:not(:disabled) {
  transform: translateX(2px);
  box-shadow: 0 6px 24px rgba(255, 107, 107, 0.4);
}

.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

.nav-icon {
  font-size: var(--text-lg);
  line-height: 1;
}

.nav-text {
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: var(--text-xs);
}

/* Animaciones */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive Design - Mobile First */
@media (max-width: 768px) {
  .content-wrapper {
    padding: var(--spacing-md);
  }
  
  .step-content {
    padding: var(--spacing-lg);
    border-radius: var(--radius-md);
  }
  
  .floating-navigation {
    bottom: 70px; /* Espacio para footer en mobile */
    left: var(--spacing-md);
    right: var(--spacing-md);
    transform: none;
    justify-content: space-between;
    border-radius: var(--radius-lg);
  }
  
  .nav-btn {
    flex: 1;
    justify-content: center;
    padding: var(--spacing-sm) var(--spacing-md);
  }
}

@media (max-width: 480px) {
  .content-wrapper {
    padding: var(--spacing-sm);
  }
  
  .step-content {
    padding: var(--spacing-md);
  }
  
  .nav-text {
    display: none;
  }
  
  .nav-btn {
    width: 48px;
    height: 48px;
    padding: var(--spacing-sm);
    justify-content: center;
  }
  
  .nav-icon {
    font-size: var(--text-xl);
  }
}

/* Estilos para la información del step actual en el header */
.step-header-info {
  display: flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-secondary) 100%);
  border-radius: 10px;
  padding: 8px 12px;
  border: 2px solid var(--theme-primary);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
  color: var(--theme-tertiary);
  min-width: 200px;
}

.step-header-icon {
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  backdrop-filter: blur(5px);
}

.step-header-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.step-header-title {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 700;
  line-height: 1.2;
  color: var(--theme-tertiary);
}

.step-header-subtitle {
  margin: 0;
  font-size: 0.7rem;
  opacity: 0.9;
  line-height: 1.2;
  color: var(--theme-tertiary);
}

/* Estilos para la información del Pokémon en el header */
.pokemon-header-info {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, var(--theme-quinary) 0%, var(--theme-tertiary) 100%);
  border-radius: 8px;
  padding: 4px 8px;
  border: 1px solid var(--theme-border);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  position: relative;
}

.pokemon-header-image {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  object-fit: contain;
  background: rgba(255, 255, 255, 0.1);
  padding: 2px;
}

.pokemon-header-text {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.pokemon-header-name {
  color: var(--theme-quaternary);
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1;
}

.pokemon-header-id {
  color: var(--theme-senary);
  font-size: 0.65rem;
  opacity: 0.8;
  line-height: 1;
}

.clear-btn-header {
  background: var(--theme-quinary);
  border: 1px solid var(--theme-border);
  border-radius: 50%;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 8px;
  color: var(--theme-quaternary);
  line-height: 1;
  padding: 0;
}

.clear-btn-header:hover {
  background: var(--theme-quaternary);
  border-color: var(--theme-primary);
  transform: scale(1.1);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.clear-btn-header:active {
  transform: scale(0.95);
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
    padding: 10px;
    margin-bottom: 12px;
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
    gap: 10px;
    height: 100%;
    overflow: hidden;
  }
  
  .main-content-area {
    padding: 12px;
  }
  
  .step-content {
    padding: 8px;
  }
  
  /* Estilos responsive para la información del step actual */
  .step-header-info {
    padding: 6px 10px;
    gap: 8px;
    min-width: 180px;
  }
  
  .step-header-icon {
    width: 28px;
    height: 28px;
    font-size: 1rem;
  }
  
  .step-header-title {
    font-size: 0.8rem;
  }
  
  .step-header-subtitle {
    font-size: 0.65rem;
  }
  
  /* Estilos responsive para la información del Pokémon en el header */
  .pokemon-header-info {
    padding: 3px 6px;
    gap: 6px;
  }
  
  .pokemon-header-image {
    width: 28px;
    height: 28px;
  }
  
  .pokemon-header-name {
    font-size: 0.7rem;
  }
  
  .pokemon-header-id {
    font-size: 0.6rem;
  }
  
  .clear-btn-header {
    width: 14px;
    height: 14px;
    font-size: 7px;
  }
}

@media (max-width: 480px) {
  .pokemon-palette-analyzer {
    padding: 5px;
  }
  
  .progress-breadcrumb {
    padding: 10px;
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
    padding: 8px;
  }
  
  .step-header-info {
    padding: 4px 8px;
    gap: 6px;
    min-width: 160px;
  }
  
  .step-header-icon {
    width: 24px;
    height: 24px;
    font-size: 0.9rem;
  }
  
  .step-header-title {
    font-size: 0.75rem;
  }
  
  .step-header-subtitle {
    font-size: 0.6rem;
  }
  
  .pokemon-header-info {
    padding: 2px 4px;
    gap: 4px;
  }
  
  .pokemon-header-image {
    width: 24px;
    height: 24px;
  }
  
  .pokemon-header-name {
    font-size: 0.65rem;
  }
  
  .pokemon-header-id {
    font-size: 0.55rem;
  }
  
  .clear-btn-header {
    width: 12px;
    height: 12px;
    font-size: 6px;
  }
}

/* Step-specific styles for better layout */
.selection-step {
  width: 100%;
  min-height: 500px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.palette-step {
  width: 100%;
  min-height: 600px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.analysis-step {
  width: 100%;
  min-height: 550px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

/* Improve content distribution */
.step-content > * {
  width: 100%;
  flex: 1;
}

/* Better spacing for content sections */
.step-content > div {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

/* Mobile específico - Pantallas muy pequeñas */
@media (max-width: 480px) {
  .content-wrapper {
    padding: 8px;
    padding-top: 75px; /* Reducido de 90px para aprovechar más el espacio */
  }
  
  .step-content {
    padding: 8px;
    gap: 8px;
    border-radius: 12px;
  }
  
  .selection-step,
  .palette-step,
  .analysis-step {
    min-height: 400px;
  }
}

/* Landscape mobile */
@media (max-width: 767px) and (orientation: landscape) {
  .content-wrapper {
    padding-top: 70px; /* Reducido para landscape */
  }
  
  .step-content {
    height: calc(100vh - 90px); /* Ajustado */
  }
}

/* Pantallas muy altas */
@media (min-height: 1200px) {
  .step-content {
    max-height: 1000px;
  }
}

/* Pantallas muy anchas */
@media (min-width: 1920px) {
  .content-wrapper {
    max-width: 1600px;
    margin: 0 auto;
    margin-left: 320px;
  }
  
  .step-content {
    max-width: 1200px;
  }
}

/* Asegurar que el contenido no se desborde */
.step-content {
  overflow-x: hidden;
  overflow-y: auto;
}

/* Mejorar el scroll en mobile */
@media (max-width: 767px) {
  .step-content {
    -webkit-overflow-scrolling: touch;
  }
}
</style>
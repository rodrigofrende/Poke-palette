<template>
  <div class="step-sidebar" :class="{ 'sidebar-open': isMobileOpen }">
    <!-- Mobile Toggle Button -->
    <button 
      class="mobile-toggle"
      @click="toggleMobileSidebar"
      :aria-label="isMobileOpen ? 'Cerrar navegación' : 'Abrir navegación'"
    >
      <span class="toggle-icon">{{ isMobileOpen ? '✕' : '☰' }}</span>
    </button>

    <!-- Sidebar Content -->
    <div class="sidebar-content">
      <!-- Header del Sidebar -->
      <div class="sidebar-header">
        <div class="app-title">
          <span class="app-icon">🎨</span>
          <h2 class="app-name">Pokémon Palette</h2>
        </div>
      </div>

      <!-- Información del Paso Actual -->
      <div class="current-step-section">
        <div class="step-badge">
          <span class="step-icon">{{ getStepIcon(currentStep) }}</span>
          <span class="step-number">{{ currentStep }}</span>
        </div>
        <div class="step-details">
          <h3 class="step-title">{{ getStepTitle(currentStep) }}</h3>
          <p class="step-subtitle">{{ getStepSubtitle(currentStep) }}</p>
        </div>
      </div>

      <!-- Pokémon Seleccionado -->
      <div v-if="selectedPokemon" class="selected-pokemon-section">
        <h4 class="section-title">Pokémon Seleccionado</h4>
        <div class="pokemon-card">
          <div class="pokemon-avatar">
            <img 
              :src="selectedPokemon.imageUrl" 
              :alt="selectedPokemon.name"
              class="pokemon-image"
            />
            <div class="pokemon-status"></div>
          </div>
          <div class="pokemon-info">
            <span class="pokemon-name">{{ formatPokemonName(selectedPokemon.name) }}</span>
            <span class="pokemon-id">#{{ selectedPokemon.id }}</span>
          </div>
                      <button 
              @click="emit('clear-selection')" 
              class="clear-btn"
              title="Limpiar selección"
            >
              <span class="clear-icon">×</span>
            </button>
        </div>
      </div>

      <!-- Progress Steps -->
      <div class="progress-section">
        <h4 class="section-title">Progreso</h4>
        <div class="progress-steps">
          <div 
            v-for="step in 3"
            :key="step"
            class="progress-step" 
            :class="{ 
              active: currentStep === step,
              completed: currentStep > step, 
              clickable: canNavigateToStep(step),
              disabled: !canNavigateToStep(step) && currentStep !== step
            }"
            @click="handleStepClick(step)"
            :title="getStepTooltip(step)"
          >
            <div class="step-circle">
              <span v-if="currentStep > step" class="step-check">✓</span>
              <span v-else class="step-number">{{ step }}</span>
            </div>
            <span class="step-name">{{ getStepName(step) }}</span>
          </div>
        </div>
      </div>

      <!-- Navegación -->
      <div class="navigation-section">
        <div class="nav-buttons">
          <button 
            v-if="currentStep > 1" 
            @click="emit('prev-step')" 
            :disabled="!canGoBack"
            class="nav-btn back"
          >
            <span class="nav-icon">←</span>
            <span class="nav-text">Anterior</span>
          </button>
          
          <button 
            v-if="currentStep < 3" 
            @click="emit('next-step')" 
            :disabled="!canGoNext"
            class="nav-btn next"
          >
            <span class="nav-text">Siguiente</span>
            <span class="nav-icon">→</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Overlay -->
    <div 
      v-if="isMobileOpen" 
      class="mobile-overlay"
      @click="closeMobileSidebar"
    ></div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// Props
const props = defineProps({
  currentStep: {
    type: Number,
    required: true
  },
  canGoBack: {
    type: Boolean,
    required: true
  },
  canGoNext: {
    type: Boolean,
    required: true
  },
  selectedPokemon: {
    type: Object,
    default: null
  },
  palette: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits([
  'next-step',
  'prev-step',
  'go-to-step',
  'clear-selection'
])

// Mobile sidebar state
const isMobileOpen = ref(false)

// Methods
const toggleMobileSidebar = () => {
  isMobileOpen.value = !isMobileOpen.value
}

const closeMobileSidebar = () => {
  isMobileOpen.value = false
}

const handleStepClick = (step) => {
  if (canNavigateToStep(step)) {
    emit('go-to-step', step)
    // Close mobile sidebar after navigation
    if (window.innerWidth < 768) {
      closeMobileSidebar()
    }
  }
}

const canNavigateToStep = (step) => {
  if (step === props.currentStep) return false
  
  switch (step) {
    case 1: return true
    case 2: return props.selectedPokemon !== null
    case 3: return props.selectedPokemon !== null && props.palette.length > 0
    default: return false
  }
}

const getStepTooltip = (step) => {
  if (step === props.currentStep) {
    return `Paso actual: ${getStepName(step)}`
  }
  
  if (canNavigateToStep(step)) {
    return `Ir a: ${getStepName(step)}`
  }
  
  switch (step) {
    case 2:
      return 'Selecciona un Pokémon primero para acceder a: Generar Paleta'
    case 3:
      if (!props.selectedPokemon) {
        return 'Selecciona un Pokémon primero para acceder a: Analizar Contraste'
      } else if (props.palette.length === 0) {
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

const getStepIcon = (step) => {
  switch (step) {
    case 1: return '🔍'
    case 2: return '🎨'
    case 3: return '📊'
    default: return '❓'
  }
}

const getStepTitle = (step) => {
  switch (step) {
    case 1: return 'Buscar Pokémon'
    case 2: return 'Generar Paleta'
    case 3: return 'Análisis de Contraste'
    default: return 'Paso desconocido'
  }
}

const getStepSubtitle = (step) => {
  switch (step) {
    case 1: return 'Encuentra cualquier Pokémon en la base de datos'
    case 2: return 'Analiza la imagen y extrae los colores dominantes'
    case 3: return 'Evalúa la legibilidad y accesibilidad de los colores'
    default: return ''
  }
}

const formatPokemonName = (name) => {
  return name.charAt(0).toUpperCase() + name.slice(1)
}
</script>

<style scoped>
/* Sidebar Container */
.step-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: 1000;
  transition: transform 0.3s ease;
}

/* Mobile Toggle Button */
.mobile-toggle {
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 9999;
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: linear-gradient(135deg, var(--theme-primary), var(--theme-secondary));
  color: white;
  border: 2px solid white;
  cursor: pointer;
  display: none; /* Hidden by default, shown in mobile */
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;
}

.mobile-toggle:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.5);
}

.mobile-toggle:active {
  transform: translateY(0);
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
}

.toggle-icon {
  transition: transform 0.3s ease;
}

/* Mobile specific improvements */
@media (max-width: 767px) {
  .mobile-toggle {
    position: fixed;
    top: 16px;
    left: 16px;
    z-index: 9999;
    width: 52px;
    height: 52px;
    border-radius: 14px;
    background: linear-gradient(135deg, var(--theme-primary), var(--theme-secondary));
    color: white;
    border: 2px solid white;
    cursor: pointer;
    display: flex !important;
    align-items: center;
    justify-content: center;
    font-size: 1.3rem;
    font-weight: bold;
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
    transition: all 0.3s ease;
  }
}

/* Sidebar Content */
.sidebar-content {
  width: 320px;
  height: 100vh;
  background: linear-gradient(180deg, var(--theme-quinary) 0%, var(--theme-senary) 100%);
  border-right: 1px solid var(--theme-border);
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: 20px;
  gap: 24px;
}

/* Sidebar Header */
.sidebar-header {
  padding-bottom: 16px;
  border-bottom: 1px solid var(--theme-border);
}

.app-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.app-icon {
  font-size: 2rem;
}

.app-name {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--theme-primary);
  margin: 0;
}

/* Current Step Section */
.current-step-section {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: var(--theme-quinary);
  border-radius: 12px;
  border: 1px solid var(--theme-border);
}

.step-badge {
  position: relative;
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, var(--theme-primary), var(--theme-secondary));
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.step-icon {
  font-size: 1.5rem;
}

.step-number {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 24px;
  height: 24px;
  background: var(--theme-quaternary);
  border: 2px solid var(--theme-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: bold;
  color: var(--theme-primary);
}

.step-details {
  flex: 1;
}

.step-title {
  font-size: 1.1rem;
  font-weight: bold;
  color: var(--theme-primary);
  margin: 0 0 4px 0;
}

.step-subtitle {
  font-size: 0.9rem;
  color: var(--theme-quaternary);
  margin: 0;
  line-height: 1.4;
}

/* Selected Pokemon Section */
.selected-pokemon-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-title {
  font-size: 1rem;
  font-weight: bold;
  color: var(--theme-primary);
  margin: 0;
}

.pokemon-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--theme-quaternary);
  border-radius: 10px;
  border: 1px solid var(--theme-border);
  position: relative;
}

.pokemon-avatar {
  position: relative;
  flex-shrink: 0;
}

.pokemon-image {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: var(--theme-quinary);
  padding: 4px;
}

.pokemon-status {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 12px;
  height: 12px;
  background: #10b981;
  border-radius: 50%;
  border: 2px solid var(--theme-quaternary);
}

.pokemon-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.pokemon-name {
  font-size: 1rem;
  font-weight: bold;
  color: var(--theme-primary);
}

.pokemon-id {
  font-size: 0.8rem;
  color: var(--theme-quaternary);
  opacity: 0.8;
}

.clear-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: var(--theme-quinary);
  border: 1px solid var(--theme-border);
  color: var(--theme-quaternary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.clear-btn .clear-icon {
  font-size: 20px;
  font-weight: bold;
  color: var(--theme-quaternary);
  line-height: 1;
  display: block;
  transition: all 0.3s ease;
}

.clear-btn:hover {
  background: var(--theme-primary);
  color: white;
  transform: scale(1.1);
}

.clear-btn:hover .clear-icon {
  color: white;
}

/* Progress Section */
.progress-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.progress-steps {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.progress-step {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.progress-step:hover {
  background: var(--theme-quaternary);
  border-color: var(--theme-border);
}

.progress-step.active {
  background: linear-gradient(135deg, var(--theme-primary), var(--theme-secondary));
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.progress-step.completed {
  background: var(--theme-quaternary);
  border-color: var(--theme-primary);
}

.progress-step.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.step-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--theme-quinary);
  border: 2px solid var(--theme-border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: bold;
  flex-shrink: 0;
}

.progress-step.active .step-circle {
  background: white;
  border-color: white;
  color: var(--theme-primary);
}

.progress-step.completed .step-circle {
  background: var(--theme-primary);
  border-color: var(--theme-primary);
  color: white;
}

.step-check {
  font-size: 1rem;
  font-weight: bold;
}

.step-name {
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Navigation Section */
.navigation-section {
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid var(--theme-border);
}

.nav-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.nav-btn.back {
  background: linear-gradient(135deg, var(--theme-quinary), var(--theme-senary));
  color: var(--theme-primary);
  border-color: var(--theme-border);
}

.nav-btn.back:hover:not(:disabled) {
  background: linear-gradient(135deg, var(--theme-quaternary), var(--theme-quinary));
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.nav-btn.next {
  background: linear-gradient(135deg, var(--theme-primary), var(--theme-secondary));
  color: white;
  border-color: var(--theme-primary);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.nav-btn.next:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

.nav-icon {
  font-size: 1rem;
  font-weight: bold;
}

.nav-text {
  font-weight: 600;
}

/* Mobile Overlay */
.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

/* Responsive Design */
@media (max-width: 767px) {
  .step-sidebar {
    transform: translateX(-100%);
  }
  
  .step-sidebar.sidebar-open {
    transform: translateX(0);
  }
  
  .sidebar-content {
    width: 280px;
  }
  
  .mobile-toggle {
    display: flex !important;
  }
}

@media (min-width: 768px) {
  .mobile-toggle {
    display: none !important;
  }
  
  .step-sidebar {
    transform: translateX(0);
  }
  
  .mobile-overlay {
    display: none;
  }
}

/* Scrollbar Styling */
.sidebar-content::-webkit-scrollbar {
  width: 6px;
}

.sidebar-content::-webkit-scrollbar-track {
  background: var(--theme-quinary);
  border-radius: 3px;
}

.sidebar-content::-webkit-scrollbar-thumb {
  background: var(--theme-border);
  border-radius: 3px;
}

.sidebar-content::-webkit-scrollbar-thumb:hover {
  background: var(--theme-primary);
}
</style>
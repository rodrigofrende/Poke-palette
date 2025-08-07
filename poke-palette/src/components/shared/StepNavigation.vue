<template>
  <div class="progress-breadcrumb">
    <!-- Desktop Layout -->
    <div class="desktop-layout">
      <!-- Botón Anterior -->
      <button 
        v-if="currentStep > 1" 
        @click="emit('prev-step')" 
        :disabled="!canGoBack"
        class="nav-btn back"
      >
        <span class="nav-icon">←</span>
        <span class="nav-text">Anterior</span>
      </button>
      
      <!-- Contenido central -->
      <div class="breadcrumb-center">
        <!-- Header principal -->
        <div class="main-header">
          <div class="step-info">
            <div class="step-badge">
              <span class="step-icon">{{ getStepIcon(currentStep) }}</span>
              <span class="step-number">{{ currentStep }}</span>
            </div>
            <div class="step-details">
              <h3 class="step-title">{{ getStepTitle(currentStep) }}</h3>
              <p class="step-subtitle">{{ getStepSubtitle(currentStep) }}</p>
            </div>
          </div>
          
          <!-- Información del Pokémon -->
          <div v-if="selectedPokemon" class="pokemon-card">
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
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
        
        <!-- Progress Steps -->
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
      
      <!-- Botón Siguiente -->
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
    
    <!-- Mobile Layout -->
    <div class="mobile-layout">
      <!-- Mobile Header -->
      <div class="mobile-header">
        <div class="mobile-step-info">
          <div class="mobile-step-badge">
            <span class="mobile-step-icon">{{ getStepIcon(currentStep) }}</span>
            <span class="mobile-step-number">{{ currentStep }}/3</span>
          </div>
          <div class="mobile-step-text">
            <h3 class="mobile-step-title">{{ getStepTitle(currentStep) }}</h3>
          </div>
        </div>
        
        <!-- Mobile Pokémon Info -->
        <div v-if="selectedPokemon" class="mobile-pokemon">
          <img 
            :src="selectedPokemon.imageUrl" 
            :alt="selectedPokemon.name"
            class="mobile-pokemon-image"
          />
          <span class="mobile-pokemon-name">{{ formatPokemonName(selectedPokemon.name) }}</span>
          <button 
            @click="emit('clear-selection')" 
            class="mobile-clear-btn"
            title="Limpiar"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
      
      <!-- Mobile Progress Bar -->
      <div class="mobile-progress">
        <div class="mobile-progress-bar">
          <div 
            class="mobile-progress-fill" 
            :style="{ width: `${(currentStep / 3) * 100}%` }"
          ></div>
        </div>
        <div class="mobile-progress-steps">
          <div 
            v-for="step in 3"
            :key="step"
            class="mobile-step-dot"
            :class="{ 
              active: currentStep >= step,
              completed: currentStep > step
            }"
          ></div>
        </div>
      </div>
      
      <!-- Mobile Navigation -->
      <div class="mobile-navigation">
        <button 
          v-if="currentStep > 1" 
          @click="emit('prev-step')" 
          :disabled="!canGoBack"
          class="mobile-nav-btn back"
        >
          ←
        </button>
        <button 
          v-if="currentStep < 3" 
          @click="emit('next-step')" 
          :disabled="!canGoNext"
          class="mobile-nav-btn next"
        >
          →
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { formatPokemonName } from '../../utils/formatters.js'

const props = defineProps({
  currentStep: {
    type: Number,
    required: true
  },
  canGoBack: {
    type: Boolean,
    default: false
  },
  canGoNext: {
    type: Boolean,
    default: false
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

const emit = defineEmits([
  'next-step',
  'prev-step', 
  'go-to-step',
  'clear-selection'
])

const handleStepClick = (step) => {
  if (canNavigateToStep(step)) {
    emit('go-to-step', step)
  }
}

const canNavigateToStep = (step) => {
  if (step === props.currentStep) return false
  
  switch (step) {
    case 1:
      return true
    case 2:
      return props.selectedPokemon !== null
    case 3:
      return props.selectedPokemon !== null && props.palette.length > 0
    default:
      return false
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
</script>

<style scoped>
.progress-breadcrumb {
  margin-bottom: 16px;
}

/* Desktop Layout */
.desktop-layout {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  background: linear-gradient(135deg, var(--theme-quinary), var(--theme-tertiary));
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--theme-border);
  gap: 24px;
  position: relative;
}

.breadcrumb-center {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  max-width: 700px;
  margin: 0 auto;
}

.main-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 24px;
  padding: 0 12px;
}

.step-info {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
  justify-content: flex-start;
}

.step-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, var(--theme-primary), var(--theme-secondary));
  border-radius: 14px;
  position: relative;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  flex-shrink: 0;
}

.step-icon {
  font-size: 1.8rem;
  margin-right: 6px;
}

.step-number {
  position: absolute;
  top: -6px;
  right: -6px;
  background: var(--theme-quaternary);
  color: var(--theme-tertiary);
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: bold;
  border: 2px solid var(--theme-tertiary);
}

.step-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.step-title {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--theme-quaternary);
  line-height: 1.2;
}

.step-subtitle {
  margin: 0;
  font-size: 0.95rem;
  color: var(--theme-senary);
  opacity: 0.85;
  line-height: 1.4;
}

.pokemon-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 18px;
  background: var(--theme-tertiary);
  border-radius: 14px;
  border: 1px solid var(--theme-border);
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.08);
  flex-shrink: 0;
}

.pokemon-avatar {
  position: relative;
}

.pokemon-image {
  width: 48px;
  height: 48px;
  object-fit: contain;
  border-radius: 10px;
  background: var(--theme-quinary);
  padding: 4px;
}

.pokemon-status {
  position: absolute;
  bottom: -3px;
  right: -3px;
  width: 14px;
  height: 14px;
  background: #10b981;
  border-radius: 50%;
  border: 2px solid var(--theme-tertiary);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.pokemon-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.pokemon-name {
  font-weight: 600;
  color: var(--theme-quaternary);
  font-size: 1rem;
  line-height: 1.2;
}

.pokemon-id {
  color: var(--theme-senary);
  font-size: 0.8rem;
  opacity: 0.8;
}

.clear-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  color: var(--theme-senary);
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 4px;
}

.clear-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  color: var(--theme-quaternary);
  transform: scale(1.05);
}

.progress-steps {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: center;
  width: 100%;
  padding: 0 20px;
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 100px;
  position: relative;
}

.progress-step.active {
  background: linear-gradient(135deg, var(--theme-primary), var(--theme-secondary));
  color: white;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
  transform: translateY(-2px);
}

.progress-step.completed {
  background: var(--theme-primary);
  color: white;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.progress-step.clickable:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.progress-step.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.step-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.step-check {
  color: white;
  font-size: 1.1rem;
  font-weight: bold;
}

.step-name {
  font-size: 0.8rem;
  font-weight: 600;
  text-align: center;
  line-height: 1.2;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--theme-primary), var(--theme-secondary));
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.95rem;
  z-index: 10;
  position: relative;
  min-width: 120px;
  justify-content: center;
}

.nav-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
}

.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.nav-icon {
  font-size: 1.1rem;
  font-weight: bold;
}

.nav-text {
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Mobile Layout */
.mobile-layout {
  display: none;
}

.mobile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: linear-gradient(135deg, var(--theme-quinary), var(--theme-tertiary));
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--theme-border);
  margin-bottom: 12px;
  position: relative;
}

.mobile-step-info {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  justify-content: center;
}

.mobile-step-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, var(--theme-primary), var(--theme-secondary));
  border-radius: 8px;
  position: relative;
}

.mobile-step-icon {
  font-size: 1.2rem;
}

.mobile-step-number {
  position: absolute;
  top: -4px;
  right: -4px;
  background: var(--theme-quaternary);
  color: var(--theme-tertiary);
  border-radius: 50%;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.65rem;
  font-weight: bold;
}

.mobile-step-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--theme-quaternary);
}

.mobile-pokemon {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  background: var(--theme-tertiary);
  border-radius: 8px;
  border: 1px solid var(--theme-border);
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
}

.mobile-pokemon-image {
  width: 28px;
  height: 28px;
  object-fit: contain;
  border-radius: 6px;
}

.mobile-pokemon-name {
  font-weight: 500;
  color: var(--theme-quaternary);
  font-size: 0.8rem;
}

.mobile-clear-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  color: var(--theme-senary);
  transition: all 0.2s;
}

.mobile-clear-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  color: var(--theme-quaternary);
}

.mobile-progress {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 16px;
}

.mobile-progress-bar {
  width: 100%;
  height: 4px;
  background: var(--theme-border);
  border-radius: 2px;
  overflow: hidden;
}

.mobile-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--theme-primary), var(--theme-secondary));
  border-radius: 2px;
  transition: width 0.3s ease;
}

.mobile-progress-steps {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mobile-step-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--theme-border);
  transition: all 0.3s ease;
}

.mobile-step-dot.active,
.mobile-step-dot.completed {
  background: var(--theme-primary);
  transform: scale(1.2);
}

.mobile-navigation {
  display: flex;
  justify-content: space-between;
  padding: 12px 16px;
  gap: 12px;
}

.mobile-nav-btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, var(--theme-primary), var(--theme-secondary));
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1rem;
}

.mobile-nav-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
}

.mobile-nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* Responsive Desktop */
@media (max-width: 1200px) {
  .breadcrumb-center {
    max-width: 600px;
  }
  
  .main-header {
    gap: 20px;
  }
  
  .step-title {
    font-size: 1.3rem;
  }
  
  .step-subtitle {
    font-size: 0.9rem;
  }
}

@media (max-width: 1024px) {
  .desktop-layout {
    padding: 18px 20px;
    gap: 20px;
  }
  
  .breadcrumb-center {
    max-width: 550px;
  }
  
  .step-badge {
    width: 52px;
    height: 52px;
  }
  
  .step-icon {
    font-size: 1.6rem;
  }
  
  .pokemon-card {
    padding: 10px 16px;
  }
  
  .pokemon-image {
    width: 44px;
    height: 44px;
  }
}

@media (max-width: 900px) {
  .desktop-layout {
    padding: 16px 18px;
    gap: 16px;
  }
  
  .breadcrumb-center {
    max-width: 500px;
  }
  
  .main-header {
    gap: 16px;
  }
  
  .step-info {
    gap: 12px;
  }
  
  .step-badge {
    width: 48px;
    height: 48px;
  }
  
  .step-icon {
    font-size: 1.4rem;
  }
  
  .step-title {
    font-size: 1.2rem;
  }
  
  .step-subtitle {
    font-size: 0.85rem;
  }
  
  .pokemon-card {
    padding: 8px 14px;
    gap: 10px;
  }
  
  .pokemon-image {
    width: 40px;
    height: 40px;
  }
  
  .pokemon-name {
    font-size: 0.9rem;
  }
  
  .pokemon-id {
    font-size: 0.75rem;
  }
  
  .progress-steps {
    gap: 8px;
    padding: 0 16px;
  }
  
  .progress-step {
    min-width: 90px;
    padding: 10px 14px;
  }
  
  .step-circle {
    width: 32px;
    height: 32px;
    font-size: 0.9rem;
  }
  
  .step-name {
    font-size: 0.75rem;
  }
  
  .nav-btn {
    padding: 10px 16px;
    font-size: 0.9rem;
    min-width: 100px;
  }
}

@media (max-width: 768px) {
  .desktop-layout {
    display: none;
  }
  
  .mobile-layout {
    display: block;
  }
}

@media (max-width: 480px) {
  .mobile-header {
    padding: 10px 12px;
  }
  
  .mobile-step-badge {
    width: 32px;
    height: 32px;
  }
  
  .mobile-step-icon {
    font-size: 1rem;
  }
  
  .mobile-step-title {
    font-size: 0.9rem;
  }
  
  .mobile-pokemon {
    padding: 4px 8px;
  }
  
  .mobile-pokemon-image {
    width: 24px;
    height: 24px;
  }
  
  .mobile-pokemon-name {
    font-size: 0.75rem;
  }
}
</style>
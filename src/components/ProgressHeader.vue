<template>
  <header class="progress-header">
    <div class="header-container">
      <!-- Logo y Título -->
      <div class="header-brand">
        <div class="brand-logo">🎨</div>
        <h1 class="brand-title">Poké<span class="brand-accent">Palette</span></h1>
      </div>

      <!-- Progress Stepper -->
      <div class="progress-stepper">
        <div class="stepper-track">
          <div 
            class="stepper-progress" 
            :style="{ width: `${progressPercentage}%` }"
          ></div>
        </div>
        
        <div class="stepper-steps">
          <button
            v-for="step in steps"
            :key="step.number"
            @click="handleStepClick(step.number)"
            :class="[
              'stepper-step',
              {
                'active': currentStep === step.number,
                'completed': currentStep > step.number,
                'disabled': !canNavigateToStep(step.number)
              }
            ]"
            :disabled="!canNavigateToStep(step.number) && currentStep !== step.number"
            :aria-label="`${step.label} - Paso ${step.number}`"
          >
            <div class="step-circle">
              <span v-if="currentStep > step.number" class="step-check">✓</span>
              <span v-else class="step-icon">{{ step.icon }}</span>
            </div>
            <span class="step-label">{{ step.label }}</span>
          </button>
        </div>
      </div>

      <!-- Selected Pokemon Info (Compact) -->
      <div v-if="selectedPokemon" class="header-pokemon-info">
        <div class="pokemon-avatar-wrapper">
          <img 
            :src="selectedPokemon.imageUrl" 
            :alt="selectedPokemon.name"
            class="pokemon-avatar"
            width="40"
            height="40"
            loading="eager"
            @error="handleImageError"
          />
        </div>
        <div class="pokemon-details">
          <span class="pokemon-name">{{ formatPokemonName(selectedPokemon.name) }}</span>
          <span class="pokemon-number">#{{ String(selectedPokemon.id).padStart(3, '0') }}</span>
        </div>
        <button 
          @click="$emit('clear-selection')" 
          class="clear-button"
          aria-label="Limpiar selección"
        >
          <span class="clear-icon">×</span>
        </button>
      </div>

      <!-- Mobile Menu Button (solo visible si hay Pokémon) -->
      <button 
        v-if="selectedPokemon"
        class="mobile-menu-btn"
        @click="toggleMobileMenu"
        aria-label="Toggle menu"
      >
        <span class="menu-icon">☰</span>
      </button>
    </div>
  </header>
</template>

<script setup>
import { computed, ref } from 'vue'
import { handlePokemonImageError } from '../utils/imageLoader.js'

// Props
const props = defineProps({
  currentStep: {
    type: Number,
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
const emit = defineEmits(['go-to-step', 'clear-selection'])

// Data
const mobileMenuOpen = ref(false)

const steps = [
  { number: 1, label: 'Buscar', icon: '🔍' },
  { number: 2, label: 'Paleta', icon: '🎨' },
  { number: 3, label: 'Análisis', icon: '📊' }
]

// Computed
const progressPercentage = computed(() => {
  return ((props.currentStep - 1) / (steps.length - 1)) * 100
})

// Methods
const canNavigateToStep = (step) => {
  if (step === props.currentStep) return false
  
  switch (step) {
    case 1: return true
    case 2: return props.selectedPokemon !== null
    case 3: return props.selectedPokemon !== null && props.palette.length > 0
    default: return false
  }
}

const handleStepClick = (step) => {
  if (canNavigateToStep(step)) {
    emit('go-to-step', step)
  }
}

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

const formatPokemonName = (name) => {
  return name.charAt(0).toUpperCase() + name.slice(1)
}

const handleImageError = (event) => {
  if (props.selectedPokemon) {
    handlePokemonImageError(
      event,
      props.selectedPokemon.id,
      props.selectedPokemon.name,
      false // En el header no mostramos shiny
    )
  }
}
</script>

<style scoped>
.progress-header {
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  z-index: var(--z-sticky);
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-light);
  box-shadow: var(--shadow-sm);
  backdrop-filter: blur(10px);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* TEMA APLICADO AL HEADER - ¡SUPER VISIBLE! */
[data-custom-theme="true"] .progress-header {
  background: var(--theme-gradient-1);
  border-bottom: 2px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 20px var(--theme-primary-alpha);
}

[data-custom-theme="true"] .progress-header::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(255, 255, 255, 0.1) 50%, 
    transparent 100%);
  pointer-events: none;
  animation: shimmerHeader 3s ease-in-out infinite;
}

@keyframes shimmerHeader {
  0%, 100% { opacity: 0; }
  50% { opacity: 1; }
}

.header-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: var(--spacing-md) var(--spacing-lg);
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  flex-wrap: wrap;
}

/* Brand */
.header-brand {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-shrink: 0;
}

.brand-logo {
  font-size: var(--text-2xl);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: var(--gradient-primary);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-primary);
  transition: var(--transition-base);
}

[data-custom-theme="true"] .brand-logo {
  background: white;
  box-shadow: 0 4px 20px rgba(255, 255, 255, 0.4);
  transform: scale(1.05);
}

.brand-title {
  font-family: var(--font-pokemon);
  font-size: var(--text-lg);
  font-weight: bold;
  color: var(--theme-gray-900);
  margin: 0;
  line-height: 1;
  white-space: nowrap;
  transition: var(--transition-base);
}

.brand-accent {
  color: var(--theme-primary);
  transition: var(--transition-base);
}

/* Textos en blanco con tema aplicado */
[data-custom-theme="true"] .brand-title {
  color: white;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

[data-custom-theme="true"] .brand-accent {
  color: rgba(255, 255, 255, 0.9);
}

/* Progress Stepper */
.progress-stepper {
  flex: 1;
  min-width: 300px;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.stepper-track {
  width: 100%;
  height: 4px;
  background: var(--theme-gray-100);
  border-radius: var(--radius-full);
  overflow: hidden;
  position: relative;
  transition: var(--transition-base);
}

[data-custom-theme="true"] .stepper-track {
  background: rgba(255, 255, 255, 0.3);
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.2);
}

.stepper-progress {
  height: 100%;
  background: var(--gradient-primary);
  transition: width var(--transition-slow);
  border-radius: var(--radius-full);
  box-shadow: 0 0 10px rgba(255, 107, 107, 0.5);
}

[data-custom-theme="true"] .stepper-progress {
  background: white;
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.8);
}

.stepper-steps {
  display: flex;
  justify-content: space-between;
  gap: var(--spacing-sm);
}

.stepper-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
  transition: var(--transition-base);
  flex: 1;
  min-width: 0;
}

.stepper-step:hover:not(.disabled) {
  background: var(--bg-secondary);
  transform: translateY(-2px);
}

[data-custom-theme="true"] .stepper-step:hover:not(.disabled) {
  background: rgba(255, 255, 255, 0.15);
}

.stepper-step.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

[data-custom-theme="true"] .stepper-step.disabled {
  opacity: 0.4;
}

.stepper-step.active .step-circle {
  background: var(--gradient-primary);
  color: white;
  box-shadow: var(--shadow-primary);
  transform: scale(1.1);
}

.stepper-step.completed .step-circle {
  background: var(--theme-success);
  color: white;
}

.step-circle {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  background: var(--theme-gray-100);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-lg);
  transition: var(--transition-base);
  border: 2px solid var(--border-light);
}

[data-custom-theme="true"] .step-circle {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(8px);
}

[data-custom-theme="true"] .stepper-step.active .step-circle {
  background: white;
  color: var(--theme-badge-1);
  box-shadow: 0 4px 20px rgba(255, 255, 255, 0.4);
}

[data-custom-theme="true"] .stepper-step.completed .step-circle {
  background: rgba(255, 255, 255, 0.9);
  color: var(--theme-badge-2);
}

.step-check {
  font-weight: bold;
}

.step-label {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--theme-gray-700);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  transition: var(--transition-base);
}

[data-custom-theme="true"] .step-label {
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.stepper-step.active .step-label {
  color: var(--theme-primary);
}

[data-custom-theme="true"] .stepper-step.active .step-label {
  color: white;
  font-weight: 700;
}

.stepper-step.completed .step-label {
  color: var(--theme-success);
}

[data-custom-theme="true"] .stepper-step.completed .step-label {
  color: rgba(255, 255, 255, 0.95);
}

/* Pokemon Info */
.header-pokemon-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-light);
  flex-shrink: 0;
  transition: var(--transition-base);
}

[data-custom-theme="true"] .header-pokemon-info {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(10px);
}

.header-pokemon-info:hover {
  border-color: var(--theme-primary);
  box-shadow: var(--shadow-md);
}

[data-custom-theme="true"] .header-pokemon-info:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.6);
  box-shadow: 0 4px 20px rgba(255, 255, 255, 0.3);
}

.pokemon-avatar-wrapper {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-light);
  padding: 2px;
  transition: var(--transition-base);
}

[data-custom-theme="true"] .pokemon-avatar-wrapper {
  background: white;
  border-color: rgba(255, 255, 255, 0.6);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.pokemon-avatar {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  transition: var(--transition-fast);
}

.pokemon-avatar:hover {
  transform: scale(1.1);
}

.pokemon-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.pokemon-name {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--theme-gray-900);
  line-height: 1;
  transition: var(--transition-base);
}

[data-custom-theme="true"] .pokemon-name {
  color: white;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.pokemon-number {
  font-size: var(--text-xs);
  color: var(--theme-gray-500);
  font-family: var(--font-mono);
  line-height: 1;
  transition: var(--transition-base);
}

[data-custom-theme="true"] .pokemon-number {
  color: rgba(255, 255, 255, 0.8);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.clear-button {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  background: transparent;
  border: 1px solid var(--border-light);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--transition-base);
  margin-left: var(--spacing-xs);
  padding: 0;
}

[data-custom-theme="true"] .clear-button {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
}

.clear-button:hover {
  background: var(--theme-primary);
  border-color: var(--theme-primary);
  transform: scale(1.1);
}

[data-custom-theme="true"] .clear-button:hover {
  background: white;
  border-color: white;
}

.clear-icon {
  font-size: var(--text-xl);
  font-weight: bold;
  color: var(--theme-gray-700);
  line-height: 1;
  transition: var(--transition-base);
}

[data-custom-theme="true"] .clear-icon {
  color: white;
}

.clear-button:hover .clear-icon {
  color: white;
}

[data-custom-theme="true"] .clear-button:hover .clear-icon {
  color: var(--theme-badge-1);
}

/* Mobile Menu Button */
.mobile-menu-btn {
  display: none;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  background: var(--gradient-primary);
  border: none;
  cursor: pointer;
  box-shadow: var(--shadow-primary);
  transition: var(--transition-base);
}

.mobile-menu-btn:hover {
  transform: scale(1.05);
}

.menu-icon {
  font-size: var(--text-xl);
  color: white;
}

/* Responsive Design */
@media (max-width: 768px) {
  .header-container {
    padding: var(--spacing-sm) var(--spacing-md);
    gap: var(--spacing-md);
  }

  .brand-logo {
    width: 40px;
    height: 40px;
    font-size: var(--text-xl);
  }

  .brand-title {
    font-size: var(--text-base);
  }

  .progress-stepper {
    min-width: 100%;
    order: 3;
  }

  .step-circle {
    width: 36px;
    height: 36px;
  }

  .step-label {
    font-size: 0.65rem;
  }

  .header-pokemon-info {
    order: 2;
    margin-left: auto;
  }
}

@media (max-width: 480px) {
  .header-container {
    padding: 8px 10px; /* Más compacto - mobile-first */
    gap: 8px;
  }

  .brand-logo {
    width: 32px; /* Reducido de 36px */
    height: 32px;
    font-size: var(--text-base); /* Reducido */
  }

  .brand-title {
    font-size: 0.75rem; /* Más pequeño */
  }

  .progress-stepper {
    gap: 4px; /* Reducido espacio */
  }

  .stepper-step {
    padding: 4px 2px; /* Más compacto */
  }

  .step-circle {
    width: 28px; /* Reducido de 32px */
    height: 28px;
    font-size: 0.85rem; /* Más pequeño */
  }

  .step-label {
    font-size: 0.55rem; /* Más pequeño */
  }

  .header-pokemon-info {
    padding: 6px 8px; /* Más compacto */
  }

  .pokemon-avatar-wrapper {
    width: 28px; /* Reducido de 32px */
    height: 28px;
  }

  .pokemon-details {
    gap: 1px;
  }

  .pokemon-name {
    font-size: 0.7rem; /* Más pequeño */
  }

  .pokemon-number {
    font-size: 0.6rem;
  }

  .clear-button {
    width: 26px; /* Reducido de 28px */
    height: 26px;
    margin-left: 4px;
  }

  .clear-icon {
    font-size: var(--text-base); /* Más pequeño */
  }
}

/* Extra small screens */
@media (max-width: 375px) {
  .brand-title {
    display: none;
  }

  .stepper-steps {
    gap: var(--spacing-xs);
  }
}
</style>


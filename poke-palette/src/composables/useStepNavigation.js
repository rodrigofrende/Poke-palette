import { ref, computed } from 'vue'

/**
 * Composable para manejar la navegación entre pasos del analizador
 */
export function useStepNavigation() {
  const currentStep = ref(1)
  
  const canGoBack = computed(() => {
    return currentStep.value > 1
  })

  const canGoNext = computed(() => {
    // Esta lógica será inyectada desde el componente padre
    return false
  })

  const nextStep = () => {
    if (canGoNext.value) {
      currentStep.value++
    }
  }

  const prevStep = () => {
    if (canGoBack.value) {
      currentStep.value--
    }
  }

  const goToStep = (step, validationFn = null) => {
    if (validationFn && validationFn(step)) {
      currentStep.value = step
    } else if (!validationFn) {
      currentStep.value = step
    }
  }

  const canNavigateToStep = (step, selectedPokemon, palette) => {
    // No permitir navegación al step actual
    if (step === currentStep.value) return false
    
    switch (step) {
      case 1:
        return true // Siempre se puede volver al paso 1
      case 2:
        return selectedPokemon !== null // Solo si hay un Pokémon seleccionado
      case 3:
        // Solo permitir navegación al paso 3 si hay Pokémon seleccionado Y paleta generada
        return selectedPokemon !== null && palette.length > 0
      default:
        return false
    }
  }

  const getStepTooltip = (step, selectedPokemon, palette) => {
    if (step === currentStep.value) {
      return `Paso actual: ${getStepName(step)}`
    }
    
    if (canNavigateToStep(step, selectedPokemon, palette)) {
      return `Ir a: ${getStepName(step)}`
    }
    
    // Mensajes específicos según el paso
    switch (step) {
      case 2:
        return 'Selecciona un Pokémon primero para acceder a: Generar Paleta'
      case 3:
        if (!selectedPokemon) {
          return 'Selecciona un Pokémon primero para acceder a: Analizar Contraste'
        } else if (palette.length === 0) {
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

  return {
    // Estado
    currentStep,
    
    // Computed
    canGoBack,
    canGoNext,
    
    // Métodos
    nextStep,
    prevStep,
    goToStep,
    canNavigateToStep,
    
    // Helpers
    getStepTooltip,
    getStepName,
    getStepIcon,
    getStepTitle,
    getStepSubtitle
  }
}
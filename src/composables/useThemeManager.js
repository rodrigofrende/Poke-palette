import { ref } from 'vue'
import { 
  applyTheme, 
  restoreDefaultTheme, 
  generateThemeFromPalette,
  getCurrentTheme 
} from '../utils/themeManager.js'

/**
 * Composable para manejar temas dinámicos basados en paletas de Pokémon
 */
export function useThemeManager() {
  const currentTheme = ref(getCurrentTheme())
  const originalTheme = ref(null)

  /**
   * Aplica un tema basado en una paleta de colores con el mejor contraste posible
   * @param {Array} colorHexes - Array de colores hex
   */
  const handleApplyTheme = (colorHexes) => {
    // Guardar el tema actual como original antes de aplicar el nuevo
    if (!originalTheme.value) {
      originalTheme.value = { ...currentTheme.value }
    }
    
    const newTheme = generateThemeFromPalette(colorHexes)
    applyTheme(newTheme)
    currentTheme.value = getCurrentTheme()
  }

  /**
   * Restaura el tema original o por defecto
   */
  const handleRestoreTheme = () => {
    // Restaurar al tema original si existe, sino al tema por defecto
    if (originalTheme.value) {
      applyTheme(originalTheme.value)
      currentTheme.value = getCurrentTheme()
    } else {
      restoreDefaultTheme()
      currentTheme.value = getCurrentTheme()
    }
    originalTheme.value = null
  }

  /**
   * Resetea todos los estados del tema
   */
  const resetThemeState = () => {
    originalTheme.value = null
    currentTheme.value = getCurrentTheme()
  }

  /**
   * Verifica si hay un tema aplicado (diferente al por defecto)
   * @returns {boolean}
   */
  const hasCustomTheme = () => {
    return originalTheme.value !== null
  }

  /**
   * Obtiene información del estado actual del tema
   * @returns {Object}
   */
  const getThemeInfo = () => {
    return {
      current: currentTheme.value,
      original: originalTheme.value,
      hasCustom: hasCustomTheme()
    }
  }

  return {
    // Estado
    currentTheme,
    originalTheme,
    
    // Métodos
    handleApplyTheme,
    handleRestoreTheme,
    resetThemeState,
    
    // Helpers
    hasCustomTheme,
    getThemeInfo
  }
}
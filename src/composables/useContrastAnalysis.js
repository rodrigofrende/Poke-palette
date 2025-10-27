import { ref } from 'vue'
import { 
  checkWCAGCompliance,
  calculateContrastRatio
} from '../utils/contrastUtils.js'

/**
 * Composable para manejar el análisis de contraste de paletas de colores
 */
export function useContrastAnalysis() {
  const contrastAnalysis = ref([])
  const isAnalyzingContrast = ref(false)

  /**
   * Analiza el contraste de una paleta de colores
   * @param {Array} palette - Paleta de colores a analizar
   */
  const analyzePaletteContrast = (palette) => {
    if (!palette || palette.length === 0) {
      contrastAnalysis.value = []
      return
    }

    isAnalyzingContrast.value = true
    const analysis = []

    palette.forEach((color, index) => {
      const background = color.hex
      
      if (!background || !background.startsWith('#')) {
        return // Skip invalid colors
      }
      
      // Test con texto blanco
      const whiteText = '#ffffff'
      const whiteRatio = calculateContrastRatio(whiteText, background)
      const whiteCompliance = checkWCAGCompliance(whiteText, background)
      
      // Test con texto negro
      const blackText = '#000000'
      const blackRatio = calculateContrastRatio(blackText, background)
      const blackCompliance = checkWCAGCompliance(blackText, background)
      
      // Crear un solo objeto que contenga ambos casos
      analysis.push({
        background,
        whiteText,
        blackText,
        whiteRatio,
        blackRatio,
        whitePasses: whiteCompliance.passes,
        blackPasses: blackCompliance.passes,
        colorIndex: index,
        // Información adicional del color
        colorInfo: {
          rgb: color.rgb,
          hsl: color.hsl,
          percentage: color.percentage
        }
      })
    })
    
    contrastAnalysis.value = analysis
    isAnalyzingContrast.value = false
  }

  /**
   * Obtiene recomendaciones de mejora para un color específico
   * @param {Object} colorAnalysis - Análisis de un color específico
   * @returns {Object} - Recomendaciones de mejora
   */
  const getContrastRecommendations = (colorAnalysis) => {
    const recommendations = {
      whiteText: {
        suitable: colorAnalysis.whitePasses,
        ratio: colorAnalysis.whiteRatio,
        level: getComplianceLevel(colorAnalysis.whiteRatio)
      },
      blackText: {
        suitable: colorAnalysis.blackPasses,
        ratio: colorAnalysis.blackRatio,
        level: getComplianceLevel(colorAnalysis.blackRatio)
      },
      bestChoice: null
    }

    // Determinar la mejor opción de texto
    if (colorAnalysis.whiteRatio > colorAnalysis.blackRatio) {
      recommendations.bestChoice = 'white'
    } else {
      recommendations.bestChoice = 'black'
    }

    return recommendations
  }

  /**
   * Obtiene el nivel de cumplimiento WCAG basado en el ratio de contraste
   * @param {number} ratio - Ratio de contraste
   * @returns {string} - Nivel de cumplimiento
   */
  const getComplianceLevel = (ratio) => {
    if (ratio >= 7.0) return 'AAA'
    if (ratio >= 4.5) return 'AA'
    if (ratio >= 3.0) return 'AA Large'
    return 'Fail'
  }

  /**
   * Obtiene estadísticas generales del análisis de contraste
   * @returns {Object} - Estadísticas del análisis
   */
  const getContrastStats = () => {
    if (contrastAnalysis.value.length === 0) {
      return {
        total: 0,
        passing: 0,
        failing: 0,
        passRate: 0
      }
    }

    const total = contrastAnalysis.value.length
    const passing = contrastAnalysis.value.filter(
      analysis => analysis.whitePasses || analysis.blackPasses
    ).length
    const failing = total - passing
    const passRate = (passing / total) * 100

    return {
      total,
      passing,
      failing,
      passRate: Math.round(passRate)
    }
  }

  /**
   * Limpia el análisis de contraste actual
   */
  const clearContrastAnalysis = () => {
    contrastAnalysis.value = []
  }

  return {
    // Estado
    contrastAnalysis,
    isAnalyzingContrast,
    
    // Métodos
    analyzePaletteContrast,
    getContrastRecommendations,
    getComplianceLevel,
    getContrastStats,
    clearContrastAnalysis
  }
}
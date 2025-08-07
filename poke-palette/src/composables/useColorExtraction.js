import { ref } from 'vue'
import { 
  rgbToHex,
  rgbToHsl,
  selectDiverseColors
} from '../utils/colorUtils.js'
import { PALETTE_CONFIG } from '../config/constants.js'
import { logger } from '../utils/logger.js'

/**
 * Composable para manejar la extracción de colores de imágenes
 */
export function useColorExtraction() {
  const palette = ref([])
  const isAnalyzing = ref(false)

  /**
   * Analiza un Pokémon seleccionado y extrae su paleta de colores
   * @param {Object} selectedPokemon - Pokémon seleccionado
   * @returns {Promise<Array>} - Paleta de colores extraída
   */
  const analyzeSelectedPokemon = async (selectedPokemon) => {
    if (!selectedPokemon) return []
    
    isAnalyzing.value = true
    
    try {
      // Create a canvas to analyze the Pokémon image
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      return new Promise((resolve, reject) => {
        img.onload = () => {
          try {
            canvas.width = img.width
            canvas.height = img.height
            ctx.drawImage(img, 0, 0)
            
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
            const colors = extractColorsFromImageData(imageData)
            palette.value = colors
            
            // Cleanup canvas
            canvas.remove()
            
            resolve(colors)
          } catch (error) {
            reject(error)
          } finally {
            isAnalyzing.value = false
          }
        }
        
        img.onerror = () => {
          isAnalyzing.value = false
          logger.error('Error loading Pokemon image:', selectedPokemon.imageUrl)
          reject(new Error('Error loading Pokemon image'))
        }
        
        img.crossOrigin = 'anonymous'
        img.src = selectedPokemon.imageUrl
      })
    } catch (error) {
      isAnalyzing.value = false
      throw error
    }
  }

  /**
   * Extrae colores de los datos de imagen del canvas
   * @param {ImageData} imageData - Datos de imagen del canvas
   * @returns {Array} - Array de colores con información detallada
   */
  const extractColorsFromImageData = (imageData) => {
    const data = imageData.data
    const colorMap = new Map()
    let totalSampledPixels = 0
    
    // Sample pixels (every N pixels for better performance)
    for (let i = 0; i < data.length; i += PALETTE_CONFIG.SAMPLE_RATE) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const a = data[i + 3]
      
      // Skip transparent pixels
      if (a < 128) continue
      
      totalSampledPixels++
      
      // Quantize colors to reduce noise
      const quantizedR = Math.round(r / PALETTE_CONFIG.QUANTIZATION_FACTOR) * PALETTE_CONFIG.QUANTIZATION_FACTOR
      const quantizedG = Math.round(g / PALETTE_CONFIG.QUANTIZATION_FACTOR) * PALETTE_CONFIG.QUANTIZATION_FACTOR
      const quantizedB = Math.round(b / PALETTE_CONFIG.QUANTIZATION_FACTOR) * PALETTE_CONFIG.QUANTIZATION_FACTOR
      
      const colorKey = `${quantizedR},${quantizedG},${quantizedB}`
      colorMap.set(colorKey, (colorMap.get(colorKey) || 0) + 1)
    }
    
    // Convert to array and sort by frequency
    const allColors = Array.from(colorMap.entries())
      .map(([colorKey, count]) => {
        const [r, g, b] = colorKey.split(',').map(Number)
        const hex = rgbToHex(r, g, b)
        const percentage = (count / totalSampledPixels) * 100
        
        // Calculate HSL values for better color analysis
        const hsl = rgbToHsl(r, g, b)
        
        return {
          rgb: [r, g, b],
          hex,
          percentage,
          hsl,
          saturation: hsl.s,
          lightness: hsl.l,
          originalHex: hex // Para restaurar colores editados
        }
      })
      .filter(color => color.percentage > PALETTE_CONFIG.MIN_PERCENTAGE) // Filtrar colores con porcentaje muy bajo
      .sort((a, b) => b.percentage - a.percentage)
    
    // Improved color selection algorithm - seleccionar colores más diversos
    const selectedColors = selectDiverseColors(allColors, PALETTE_CONFIG.MAX_COLORS)
    
    return selectedColors
  }

  /**
   * Actualiza la paleta con nuevos colores
   * @param {Array} updatedPalette - Nueva paleta de colores
   */
  const updatePalette = (updatedPalette) => {
    palette.value = updatedPalette
  }

  /**
   * Limpia la paleta actual
   */
  const clearPalette = () => {
    palette.value = []
  }

  return {
    // Estado
    palette,
    isAnalyzing,
    
    // Métodos
    analyzeSelectedPokemon,
    extractColorsFromImageData,
    updatePalette,
    clearPalette
  }
}
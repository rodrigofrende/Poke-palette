import { ref } from 'vue'
import { 
  rgbToHex,
  rgbToHsl,
  selectDiverseColors
} from '../utils/colorUtils.js'
import { PALETTE_CONFIG } from '../config/constants.js'
import { logger } from '../utils/logger.js'
import { getCachedImageUrl, cacheImageUrl } from '../utils/imageCache.js'
import { githubImageThrottler } from '../utils/requestThrottler.js'

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
      
      // Timeout para evitar que se quede trabado
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Tiempo de espera agotado. GitHub puede estar limitando las solicitudes. Intenta en unos minutos.'))
        }, 10000) // 10 segundos timeout
      })
      
      const loadPromise = new Promise((resolve, reject) => {
        let attempts = 0
        const maxAttempts = 4
        
        const tryLoad = async (url) => {
          attempts++
          logger.info(`[ColorExtraction] Attempt ${attempts}/${maxAttempts} to load image`)
          
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
              
              // Cachear la URL exitosa para futuros análisis
              cacheImageUrl(selectedPokemon.id, url, false)
              logger.success(`[ColorExtraction] Successfully extracted ${colors.length} colors and cached URL`)
              
              resolve(colors)
            } catch (error) {
              logger.error('[ColorExtraction] Error processing image:', error)
              reject(error)
            } finally {
              isAnalyzing.value = false
            }
          }
          
          img.onerror = () => {
            logger.warn(`[ColorExtraction] Failed to load image (attempt ${attempts}/${maxAttempts})`)
            
            // Intentar URLs de fallback
            if (attempts < maxAttempts) {
              const fallbackUrls = [
                `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${selectedPokemon.id}.png`,
                `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${selectedPokemon.id}.png`,
                `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${selectedPokemon.id}.png`,
                `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${selectedPokemon.id}.png`
              ]
              
              if (attempts < fallbackUrls.length) {
                setTimeout(() => tryLoad(fallbackUrls[attempts]), 500) // Esperar 500ms entre intentos
                return
              }
            }
            
            // Si todos los intentos fallan
            isAnalyzing.value = false
            logger.error('[ColorExtraction] All image loading attempts failed')
            reject(new Error('Error al cargar la imagen del Pokémon. GitHub está limitando las solicitudes (Error 429). Por favor, intenta nuevamente en unos minutos.'))
          }
          
          img.crossOrigin = 'anonymous'
          
          // Usar throttler para limitar las solicitudes
          try {
            await githubImageThrottler.throttle(async () => {
              img.src = url
            })
          } catch (error) {
            logger.error('[ColorExtraction] Throttler error:', error)
            img.src = url // Fallback si el throttler falla
          }
        }
        
        // Verificar si tenemos una URL cacheada para usar
        const cachedUrl = getCachedImageUrl(selectedPokemon.id, false)
        const initialUrl = cachedUrl || selectedPokemon.imageUrl
        
        if (cachedUrl) {
          logger.info(`[ColorExtraction] Using cached URL for ${selectedPokemon.name}`)
        }
        
        // Iniciar con la URL principal (o cacheada)
        tryLoad(initialUrl)
      })
      
      // Race entre carga y timeout
      return await Promise.race([loadPromise, timeoutPromise])
      
    } catch (error) {
      isAnalyzing.value = false
      logger.error('[ColorExtraction] Error in analyzeSelectedPokemon:', error.message)
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
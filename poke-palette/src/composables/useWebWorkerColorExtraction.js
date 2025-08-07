import { ref } from 'vue'
import { PALETTE_CONFIG } from '../config/constants.js'
import { logger } from '../utils/logger.js'

/**
 * Composable para extracción de colores usando Web Workers
 * Mejora significativamente el rendimiento al no bloquear el hilo principal
 */
export function useWebWorkerColorExtraction() {
  const palette = ref([])
  const isAnalyzing = ref(false)
  const analysisProgress = ref(0)
  const analysisMessage = ref('')
  
  // Referencia al worker
  let worker = null

  /**
   * Inicializa el Web Worker
   */
  const initWorker = () => {
    if (!worker) {
      try {
        worker = new Worker('/workers/color-analysis-worker.js')
        
        worker.onmessage = (e) => {
          const { type, data, progress, message, error, success } = e.data
          
          switch (type) {
            case 'progress':
              analysisProgress.value = progress
              analysisMessage.value = message
              logger.debug('ColorWorker', `Progress: ${progress}% - ${message}`)
              break
              
            case 'result':
              if (success) {
                palette.value = data
                isAnalyzing.value = false
                analysisProgress.value = 100
                analysisMessage.value = 'Análisis completado!'
                logger.debug('ColorWorker', 'Analysis completed successfully', data)
              }
              break
              
            case 'error':
              logger.error('Worker error:', error)
              isAnalyzing.value = false
              analysisProgress.value = 0
              analysisMessage.value = 'Error en el análisis'
              throw new Error(`Worker error: ${error}`)
              
            case 'pong':
              logger.debug('ColorWorker', 'Worker is alive')
              break
          }
        }
        
        worker.onerror = (error) => {
          logger.error('Worker initialization error:', error)
          isAnalyzing.value = false
        }
        
        logger.debug('ColorWorker', 'Worker initialized successfully')
      } catch (error) {
        logger.error('Failed to initialize worker:', error)
        throw error
      }
    }
    return worker
  }

  /**
   * Analiza un Pokémon seleccionado usando Web Worker
   * @param {Object} selectedPokemon - Pokémon seleccionado
   * @returns {Promise<Array>} - Paleta de colores extraída
   */
  const analyzeSelectedPokemon = async (selectedPokemon) => {
    if (!selectedPokemon) return []
    
    isAnalyzing.value = true
    analysisProgress.value = 0
    analysisMessage.value = 'Cargando imagen...'
    
    try {
      // Inicializar worker si es necesario
      const workerInstance = initWorker()
      
      // Crear canvas para obtener ImageData
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
            
            // Cleanup canvas inmediatamente
            canvas.remove()
            
            // Configurar listener para este análisis específico
            const handleWorkerMessage = (e) => {
              const { type, data, success } = e.data
              
              if (type === 'result') {
                workerInstance.removeEventListener('message', handleWorkerMessage)
                if (success) {
                  resolve(data)
                } else {
                  reject(new Error('Analysis failed'))
                }
              }
            }
            
            workerInstance.addEventListener('message', handleWorkerMessage)
            
            // Enviar datos al worker
            workerInstance.postMessage({
              type: 'analyze',
              data: imageData,
              config: PALETTE_CONFIG
            })
            
          } catch (error) {
            canvas.remove()
            reject(error)
          }
        }
        
        img.onerror = () => {
          logger.error('Error loading Pokemon image:', selectedPokemon.imageUrl)
          reject(new Error('Error loading Pokemon image'))
        }
        
        img.crossOrigin = 'anonymous'
        img.src = selectedPokemon.imageUrl
      })
      
    } catch (error) {
      isAnalyzing.value = false
      analysisProgress.value = 0
      analysisMessage.value = 'Error en el análisis'
      throw error
    }
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
    analysisProgress.value = 0
    analysisMessage.value = ''
  }

  /**
   * Verifica si el Web Worker está disponible
   * @returns {boolean}
   */
  const isWorkerSupported = () => {
    return typeof Worker !== 'undefined'
  }

  /**
   * Termina el Web Worker
   */
  const terminateWorker = () => {
    if (worker) {
      worker.terminate()
      worker = null
      logger.debug('ColorWorker', 'Worker terminated')
    }
  }

  /**
   * Ping al worker para verificar que está funcionando
   */
  const pingWorker = () => {
    if (worker) {
      worker.postMessage({ type: 'ping' })
    }
  }

  return {
    // Estado
    palette,
    isAnalyzing,
    analysisProgress,
    analysisMessage,
    
    // Métodos
    analyzeSelectedPokemon,
    updatePalette,
    clearPalette,
    
    // Utilidades del worker
    isWorkerSupported,
    initWorker,
    terminateWorker,
    pingWorker
  }
}
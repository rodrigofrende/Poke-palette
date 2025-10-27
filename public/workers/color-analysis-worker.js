/**
 * Web Worker para análisis de colores de imágenes
 * Evita bloquear el hilo principal durante el procesamiento intensivo
 */

// Configuración por defecto (se puede sobrescribir desde el mensaje)
let config = {
  MAX_COLORS: 8,
  MIN_PERCENTAGE: 1.0,
  SAMPLE_RATE: 40,
  QUANTIZATION_FACTOR: 25
}

/**
 * Convierte valores RGB a hexadecimal
 */
function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')
}

/**
 * Convierte RGB a HSL
 */
function rgbToHsl(r, g, b) {
  r /= 255
  g /= 255
  b /= 255
  
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h, s, l = (max + min) / 2
  
  if (max === min) {
    h = s = 0 // achromatic
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    h /= 6
  }
  
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  }
}

/**
 * Calcula la diferencia entre dos colores
 */
function calculateColorDifference(color1, color2) {
  const [r1, g1, b1] = color1.rgb
  const [r2, g2, b2] = color2.rgb
  
  // Diferencia euclidiana en RGB
  const rgbDiff = Math.sqrt(
    Math.pow(r2 - r1, 2) + 
    Math.pow(g2 - g1, 2) + 
    Math.pow(b2 - b1, 2)
  )
  
  // Diferencia en HSL
  const hslDiff = Math.abs(color1.hsl.h - color2.hsl.h) / 360 +
                  Math.abs(color1.hsl.s - color2.hsl.s) / 100 +
                  Math.abs(color1.hsl.l - color2.hsl.l) / 100
  
  // Combinar ambas métricas
  return (rgbDiff / 441.67) * 0.7 + hslDiff * 0.3 // Normalizar RGB a 0-1
}

/**
 * Selecciona colores diversos usando clustering simple
 */
function selectDiverseColors(allColors, maxColors) {
  if (allColors.length <= maxColors) {
    return allColors
  }
  
  const selected = [allColors[0]] // Empezar con el más frecuente
  
  for (let i = 1; i < allColors.length && selected.length < maxColors; i++) {
    const candidate = allColors[i]
    let minDistance = Infinity
    
    // Calcular distancia mínima a colores ya seleccionados
    for (const selectedColor of selected) {
      const distance = calculateColorDifference(candidate, selectedColor)
      minDistance = Math.min(minDistance, distance)
    }
    
    // Solo agregar si está suficientemente lejos de los existentes
    if (minDistance > 0.15) { // Umbral de diversidad
      selected.push(candidate)
    }
  }
  
  // Si no tenemos suficientes colores diversos, llenar con los más frecuentes
  while (selected.length < maxColors && selected.length < allColors.length) {
    for (const color of allColors) {
      if (!selected.includes(color)) {
        selected.push(color)
        break
      }
    }
  }
  
  return selected
}

/**
 * Extrae colores de los datos de imagen
 */
function extractColorsFromImageData(imageData, analysisConfig = {}) {
  // Usar configuración personalizada si se proporciona
  const finalConfig = { ...config, ...analysisConfig }
  
  const data = imageData.data
  const colorMap = new Map()
  let totalSampledPixels = 0
  
  // Enviar progreso inicial
  self.postMessage({ 
    type: 'progress', 
    progress: 0, 
    message: 'Iniciando análisis de colores...' 
  })
  
  // Sample pixels (every N pixels for better performance)
  const totalPixels = data.length / 4
  let processedPixels = 0
  
  for (let i = 0; i < data.length; i += finalConfig.SAMPLE_RATE) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const a = data[i + 3]
    
    // Skip transparent pixels
    if (a < 128) continue
    
    totalSampledPixels++
    
    // Quantize colors to reduce noise
    const quantizedR = Math.round(r / finalConfig.QUANTIZATION_FACTOR) * finalConfig.QUANTIZATION_FACTOR
    const quantizedG = Math.round(g / finalConfig.QUANTIZATION_FACTOR) * finalConfig.QUANTIZATION_FACTOR
    const quantizedB = Math.round(b / finalConfig.QUANTIZATION_FACTOR) * finalConfig.QUANTIZATION_FACTOR
    
    const colorKey = `${quantizedR},${quantizedG},${quantizedB}`
    colorMap.set(colorKey, (colorMap.get(colorKey) || 0) + 1)
    
    // Enviar progreso cada 10%
    processedPixels++
    if (processedPixels % Math.floor(totalPixels / 10) === 0) {
      const progress = Math.min((processedPixels / totalPixels) * 50, 50) // Primera mitad del progreso
      self.postMessage({ 
        type: 'progress', 
        progress, 
        message: `Analizando píxeles... ${Math.round(progress)}%` 
      })
    }
  }
  
  self.postMessage({ 
    type: 'progress', 
    progress: 50, 
    message: `Procesando ${totalSampledPixels} píxeles muestreados...` 
  })
  
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
    .filter(color => color.percentage > finalConfig.MIN_PERCENTAGE)
    .sort((a, b) => b.percentage - a.percentage)
  
  self.postMessage({ 
    type: 'progress', 
    progress: 75, 
    message: `Encontrados ${allColors.length} colores únicos...` 
  })
  
  // Improved color selection algorithm - seleccionar colores más diversos
  const selectedColors = selectDiverseColors(allColors, finalConfig.MAX_COLORS)
  
  self.postMessage({ 
    type: 'progress', 
    progress: 100, 
    message: 'Análisis completado!' 
  })
  
  return selectedColors
}

// Escuchar mensajes del hilo principal
self.onmessage = function(e) {
  const { type, data, config: messageConfig } = e.data
  
  try {
    switch (type) {
      case 'analyze':
        // Actualizar configuración si se proporciona
        if (messageConfig) {
          config = { ...config, ...messageConfig }
        }
        
        const result = extractColorsFromImageData(data, messageConfig)
        
        self.postMessage({
          type: 'result',
          data: result,
          success: true
        })
        break
        
      case 'ping':
        self.postMessage({ type: 'pong' })
        break
        
      default:
        throw new Error(`Unknown message type: ${type}`)
    }
  } catch (error) {
    self.postMessage({
      type: 'error',
      error: error.message,
      success: false
    })
  }
}
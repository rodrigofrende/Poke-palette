/**
 * Utilidades para manejo de colores
 * Centraliza todas las funciones de conversión y análisis de colores
 */

/**
 * Convierte valores RGB a hexadecimal
 * @param {number} r - Componente rojo (0-255)
 * @param {number} g - Componente verde (0-255)
 * @param {number} b - Componente azul (0-255)
 * @returns {string} Color en formato hexadecimal
 */
export function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')
}

/**
 * Convierte un color hexadecimal a RGB
 * @param {string} hex - Color en formato hexadecimal
 * @returns {object} Objeto con componentes RGB
 */
export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

/**
 * Convierte RGB a HSL para mejor análisis de colores
 * @param {number} r - Componente rojo (0-255)
 * @param {number} g - Componente verde (0-255)
 * @param {number} b - Componente azul (0-255)
 * @returns {object} Objeto con componentes HSL
 */
export function rgbToHsl(r, g, b) {
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
 * Calcula la diferencia entre dos colores usando múltiples métricas
 * @param {object} color1 - Primer color con propiedades rgb, hsl
 * @param {object} color2 - Segundo color con propiedades rgb, hsl
 * @returns {number} Diferencia de color normalizada
 */
export function calculateColorDifference(color1, color2) {
  const [r1, g1, b1] = color1.rgb
  const [r2, g2, b2] = color2.rgb
  
  // Distancia euclidiana en espacio RGB
  const rgbDiff = Math.sqrt(
    Math.pow(r1 - r2, 2) + 
    Math.pow(g1 - g2, 2) + 
    Math.pow(b1 - b2, 2)
  )
  
  // Diferencia HSL con mejor ponderación
  const hDiff = Math.abs(color1.hsl.h - color2.hsl.h)
  const sDiff = Math.abs(color1.hsl.s - color2.hsl.s)
  const lDiff = Math.abs(color1.hsl.l - color2.hsl.l)
  
  // Combinación ponderada: diferencia RGB es más importante
  return rgbDiff * 0.7 + hDiff * 0.2 + sDiff * 0.05 + lDiff * 0.05
}

/**
 * Selecciona colores diversos de una paleta
 * @param {array} allColors - Array de colores con propiedades
 * @param {number} maxColors - Número máximo de colores a seleccionar
 * @returns {array} Array de colores seleccionados
 */
export function selectDiverseColors(allColors, maxColors) {
  if (allColors.length <= maxColors) {
    return allColors
  }
  
  const selected = []
  const used = new Set()
  
  // Primero, agregar el color más frecuente
  selected.push(allColors[0])
  used.add(allColors[0].hex)
  
  // Luego agregar colores que sean más diferentes de los ya seleccionados
  for (let i = 1; i < maxColors && i < allColors.length; i++) {
    let bestColor = null
    let maxScore = -1
    
    for (const color of allColors) {
      if (used.has(color.hex)) continue
      
      // Calcular diferencia mínima de todos los colores seleccionados
      let minDifference = Infinity
      for (const selectedColor of selected) {
        const difference = calculateColorDifference(color, selectedColor)
        minDifference = Math.min(minDifference, difference)
      }
      
      // Puntuación basada en diferencia, saturación y frecuencia
      const differenceScore = minDifference / 255
      const saturationScore = color.saturation / 100
      const frequencyScore = color.percentage / 100
      
      const score = differenceScore * 0.6 + saturationScore * 0.3 + frequencyScore * 0.1
      
      if (score > maxScore) {
        maxScore = score
        bestColor = color
      }
    }
    
    if (bestColor) {
      selected.push(bestColor)
      used.add(bestColor.hex)
    } else {
      break
    }
  }
  
  // Si no tenemos suficientes colores, agregar algunos más frecuentes
  while (selected.length < maxColors && allColors.length > selected.length) {
    for (const color of allColors) {
      if (!used.has(color.hex)) {
        selected.push(color)
        used.add(color.hex)
        break
      }
    }
  }
  
  return selected.sort((a, b) => b.percentage - a.percentage)
} 
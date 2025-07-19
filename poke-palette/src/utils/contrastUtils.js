/**
 * Utilidades para el manejo de contraste de colores
 * Basado en las guías WCAG 2.1 para accesibilidad
 */

/**
 * Convierte un color RGB o RGBA a hexadecimal
 * @param {string} color - Color en formato rgb(r,g,b) o rgba(r,g,b,a)
 * @returns {string} Color en formato hexadecimal (#RRGGBB)
 */
export function rgbToHex(color) {
  if (!color || typeof color !== 'string') {
    console.warn('Invalid color format:', color);
    return '#000000';
  }
  
  // Si ya es hexadecimal, devolverlo
  if (color.startsWith('#')) {
    return color;
  }
  
  // Extraer valores RGB de formatos como "rgb(255, 255, 255)" o "rgba(255, 255, 255, 0.5)"
  const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1]);
    const g = parseInt(rgbMatch[2]);
    const b = parseInt(rgbMatch[3]);
    const a = rgbMatch[4] ? parseFloat(rgbMatch[4]) : 1;
    
    // Si es transparente, usar un color por defecto
    if (a < 0.1) {
      return '#ffffff';
    }
    
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  }
  
  console.warn('Unsupported color format:', color);
  return '#000000';
}

/**
 * Calcula la luminancia relativa de un color (WCAG 2.1)
 * @param {string} color - Color en formato hexadecimal (#RRGGBB) o RGB
 * @returns {number} Luminancia relativa (0-1)
 */
export function calculateLuminance(color) {
  // Validar que el color sea un string válido
  if (typeof color !== 'string' || !color) {
    console.warn('Invalid color format:', color);
    return 0.5; // Valor por defecto
  }
  
  try {
    // Convertir a hexadecimal si es necesario
    const hexColor = color.startsWith('#') ? color : rgbToHex(color);
    
    // Validar que hexColor sea un string y tenga el formato correcto
    if (typeof hexColor !== 'string' || !hexColor.startsWith('#')) {
      console.warn('Invalid hex color format:', hexColor);
      return 0.5; // Valor por defecto
    }
    
    // Validar que el color hexadecimal tenga el formato correcto (#RRGGBB)
    if (!/^#[0-9A-Fa-f]{6}$/.test(hexColor)) {
      console.warn('Invalid hex color format (should be #RRGGBB):', hexColor);
      return 0.5; // Valor por defecto
    }
    
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    
    // Validar que los valores RGB sean números válidos
    if (isNaN(r) || isNaN(g) || isNaN(b)) {
      console.warn('Invalid RGB values:', { r, g, b, hexColor });
      return 0.5; // Valor por defecto
    }
    
    const rsRGB = r / 255;
    const gsRGB = g / 255;
    const bsRGB = b / 255;
    
    const rsRGB_linear = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
    const gsRGB_linear = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
    const bsRGB_linear = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);
    
    const luminance = 0.2126 * rsRGB_linear + 0.7152 * gsRGB_linear + 0.0722 * bsRGB_linear;
    
    // Validar que la luminancia sea un número válido
    if (isNaN(luminance) || !isFinite(luminance)) {
      console.warn('Invalid luminance calculated:', luminance);
      return 0.5; // Valor por defecto
    }
    
    return luminance;
  } catch (error) {
    console.error('Error calculating luminance:', error);
    return 0.5; // Valor por defecto
  }
}

/**
 * Calcula el ratio de contraste entre dos colores
 * @param {string} color1 - Primer color en formato hexadecimal o RGB
 * @param {string} color2 - Segundo color en formato hexadecimal o RGB
 * @returns {number} Ratio de contraste
 */
export function calculateContrastRatio(color1, color2) {
  // Validar que ambos colores sean strings válidos
  if (typeof color1 !== 'string' || typeof color2 !== 'string') {
    console.warn('Invalid color format:', { color1, color2 });
    return 1; // Valor por defecto
  }
  
  // Validar que los colores no estén vacíos
  if (!color1 || !color2) {
    console.warn('Empty color values:', { color1, color2 });
    return 1; // Valor por defecto
  }
  
  try {
    const lum1 = calculateLuminance(color1);
    const lum2 = calculateLuminance(color2);
    
    // Validar que las luminancias sean números válidos
    if (isNaN(lum1) || isNaN(lum2)) {
      console.warn('Invalid luminance values:', { lum1, lum2, color1, color2 });
      return 1; // Valor por defecto
    }
    
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    
    // Evitar división por cero
    if (darker + 0.05 === 0) {
      console.warn('Division by zero in contrast calculation');
      return 1; // Valor por defecto
    }
    
    const ratio = (lighter + 0.05) / (darker + 0.05);
    
    // Validar que el ratio sea un número válido
    if (isNaN(ratio) || !isFinite(ratio)) {
      console.warn('Invalid contrast ratio calculated:', ratio);
      return 1; // Valor por defecto
    }
    
    return ratio;
  } catch (error) {
    console.error('Error calculating contrast ratio:', error);
    return 1; // Valor por defecto
  }
}

/**
 * Determina el color de texto óptimo para un fondo dado
 * @param {string} backgroundColor - Color de fondo en formato hexadecimal o RGB
 * @returns {string} Color de texto óptimo (#000000 o #ffffff)
 */
export function getOptimalTextColor(backgroundColor) {
  const luminance = calculateLuminance(backgroundColor);
  return luminance > 0.5 ? '#1a202c' : '#ffffff';
}

/**
 * Obtiene el color de contraste óptimo para un fondo dado
 * @param {string} backgroundColor - Color de fondo
 * @returns {string} Color de texto óptimo
 */
export function getContrastColor(backgroundColor) {
  return getOptimalTextColor(backgroundColor);
}

/**
 * Verifica si el contraste cumple con los estándares WCAG
 * @param {string} textColor - Color del texto
 * @param {string} backgroundColor - Color de fondo
 * @param {string} level - Nivel de contraste requerido ('AA' o 'AAA')
 * @param {string} size - Tamaño del texto ('normal' o 'large')
 * @returns {object} Objeto con información sobre el contraste
 */
export function checkWCAGCompliance(textColor, backgroundColor, level = 'AA', size = 'normal') {
  const ratio = calculateContrastRatio(textColor, backgroundColor);
  
  let requiredRatio;
  if (level === 'AA') {
    requiredRatio = size === 'large' ? 3.0 : 4.5;
  } else if (level === 'AAA') {
    requiredRatio = size === 'large' ? 4.5 : 7.0;
  }
  
  const passes = ratio >= requiredRatio;
  
  return {
    ratio: Math.round(ratio * 100) / 100,
    requiredRatio,
    passes,
    level,
    size,
    grade: ratio >= 7.0 ? 'AAA' : ratio >= 4.5 ? 'AA' : 'Fail'
  };
}

/**
 * Aplica contraste automáticamente a un elemento
 * @param {HTMLElement} element - Elemento DOM
 * @param {string} backgroundColor - Color de fondo (opcional, se detecta automáticamente si no se proporciona)
 */
export function applyContrastToElement(element, backgroundColor = null) {
  if (!element) return;
  
  const bgColor = backgroundColor || getComputedStyle(element).backgroundColor;
  const optimalColor = getOptimalTextColor(bgColor);
  
  const currentColor = getComputedStyle(element).color;
  if (currentColor !== optimalColor) {
    element.style.color = optimalColor;
  }
}

/**
 * Aplica contraste a múltiples elementos
 * @param {string} selector - Selector CSS para los elementos
 * @param {string} backgroundColor - Color de fondo (opcional)
 */
export function applyContrastToElements(selector, backgroundColor = null) {
  const elements = document.querySelectorAll(selector);
  elements.forEach(element => {
    applyContrastToElement(element, backgroundColor);
  });
}

/**
 * Aplica contraste a toda la aplicación
 */
export function applyContrastToEntireApp() {
  // Aplicar contraste a elementos de texto principales
  applyContrastToElements('.color-hex, .color-rgb, .color-percentage', null);
  applyContrastToElements('.contrast-label, .contrast-ratio, .contrast-status', null);
  applyContrastToElements('.metric-value, .metric-label', null);
  applyContrastToElements('.theme-btn, .contrast-btn', null);
  
  // Aplicar contraste a botones de modo
  applyContrastToElements('.mode-btn', null);
  
  // Aplicar contraste a elementos del header
  applyContrastToElements('.analyzer-header h2, .analyzer-header p', null);
  
  console.log('Contraste aplicado a toda la aplicación');
}

/**
 * Convierte un color RGB a hexadecimal
 * @param {number} r - Componente rojo (0-255)
 * @param {number} g - Componente verde (0-255)
 * @param {number} b - Componente azul (0-255)
 * @returns {string} Color en formato hexadecimal
 */
export function rgbToHexFromValues(r, g, b) {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

/**
 * Convierte un color hexadecimal a RGB
 * @param {string} hex - Color en formato hexadecimal
 * @returns {object} Objeto con componentes RGB
 */
export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
} 
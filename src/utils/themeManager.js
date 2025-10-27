// Sistema de gestión de temas dinámicos para Pokémon Palette Analyzer
import { calculateLuminance } from './contrastUtils.js'
import { DEFAULT_COLORS, THEME_CONFIG } from '../config/constants.js'

// Tema por defecto
const defaultTheme = {
  primary: DEFAULT_COLORS.PRIMARY,
  secondary: DEFAULT_COLORS.SECONDARY,
  tertiary: DEFAULT_COLORS.TERTIARY,
  quaternary: DEFAULT_COLORS.QUATERNARY,
  quinary: DEFAULT_COLORS.QUINARY,
  border: DEFAULT_COLORS.BORDER,
  borderHover: DEFAULT_COLORS.BORDER_HOVER,
  senary: DEFAULT_COLORS.SENARY,
  septenary: DEFAULT_COLORS.SEPTENARY,
  octonary: DEFAULT_COLORS.OCTONARY
}

// Tema actual
let currentTheme = { ...defaultTheme }

// Función mejorada para aplicar un tema completo a la aplicación
export function applyTheme(theme) {
  currentTheme = { ...defaultTheme, ...theme }
  
  console.log('🎨 Aplicando tema completo con', Object.keys(currentTheme).length, 'propiedades')
  
  const root = document.documentElement
  
  // Colores base
  root.style.setProperty('--theme-primary', currentTheme.primary)
  root.style.setProperty('--theme-secondary', currentTheme.secondary)
  root.style.setProperty('--theme-tertiary', currentTheme.tertiary)
  root.style.setProperty('--theme-quaternary', currentTheme.quaternary)
  root.style.setProperty('--theme-quinary', currentTheme.quinary)
  root.style.setProperty('--theme-senary', currentTheme.senary)
  root.style.setProperty('--theme-septenary', currentTheme.septenary)
  root.style.setProperty('--theme-octonary', currentTheme.octonary)
  
  // Colores de borde
  if (currentTheme.border) {
    root.style.setProperty('--theme-border', currentTheme.border)
  }
  if (currentTheme.borderHover) {
    root.style.setProperty('--theme-border-hover', currentTheme.borderHover)
  }
  
  // Colores de acento
  if (currentTheme.accent1) {
    root.style.setProperty('--theme-accent-1', currentTheme.accent1)
  }
  if (currentTheme.accent2) {
    root.style.setProperty('--theme-accent-2', currentTheme.accent2)
  }
  if (currentTheme.accent3) {
    root.style.setProperty('--theme-accent-3', currentTheme.accent3)
  }
  if (currentTheme.accent4) {
    root.style.setProperty('--theme-accent-4', currentTheme.accent4)
  }
  
  // Colores para badges
  if (currentTheme.badge1) {
    root.style.setProperty('--theme-badge-1', currentTheme.badge1)
  }
  if (currentTheme.badge2) {
    root.style.setProperty('--theme-badge-2', currentTheme.badge2)
  }
  if (currentTheme.badge3) {
    root.style.setProperty('--theme-badge-3', currentTheme.badge3)
  }
  if (currentTheme.badge4) {
    root.style.setProperty('--theme-badge-4', currentTheme.badge4)
  }
  if (currentTheme.badge5) {
    root.style.setProperty('--theme-badge-5', currentTheme.badge5)
  }
  
  // Gradientes
  if (currentTheme.gradient1) {
    root.style.setProperty('--theme-gradient-1', currentTheme.gradient1)
  }
  if (currentTheme.gradient2) {
    root.style.setProperty('--theme-gradient-2', currentTheme.gradient2)
  }
  if (currentTheme.gradient3) {
    root.style.setProperty('--theme-gradient-3', currentTheme.gradient3)
  }
  
  // Colores con alpha
  if (currentTheme.primaryAlpha) {
    root.style.setProperty('--theme-primary-alpha', currentTheme.primaryAlpha)
  }
  if (currentTheme.secondaryAlpha) {
    root.style.setProperty('--theme-secondary-alpha', currentTheme.secondaryAlpha)
  }
  if (currentTheme.tertiaryAlpha) {
    root.style.setProperty('--theme-tertiary-alpha', currentTheme.tertiaryAlpha)
  }
  
  // Aplicar colores de la paleta completa si está disponible
  if (currentTheme.palette && currentTheme.palette.length > 0) {
    currentTheme.palette.forEach((color, index) => {
      root.style.setProperty(`--palette-color-${index + 1}`, color)
    })
    root.style.setProperty('--palette-count', currentTheme.paletteCount || currentTheme.palette.length)
    
    // Marcar que hay un tema personalizado activo
    root.setAttribute('data-custom-theme', 'true')
    root.setAttribute('data-palette-colors', currentTheme.palette.length)
  } else {
    root.removeAttribute('data-custom-theme')
    root.removeAttribute('data-palette-colors')
  }
  
  // Guardar en localStorage
  localStorage.setItem(THEME_CONFIG.STORAGE_KEY, JSON.stringify(currentTheme))
  
  console.log('✅ Tema aplicado exitosamente')
}

// Función para restaurar el tema por defecto
export function restoreDefaultTheme() {
  applyTheme(defaultTheme)
}

// Función para calcular contraste entre dos colores
function getContrastRatio(color1, color2) {
  const l1 = calculateLuminance(color1)
  const l2 = calculateLuminance(color2)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  
  return (lighter + 0.05) / (darker + 0.05)
}

// Función para encontrar el mejor color de texto para un fondo dado
function findBestTextColor(backgroundColor, options = ['#000000', '#ffffff']) {
  let bestColor = options[0]
  let bestContrast = 0
  
  for (const textColor of options) {
    const contrast = getContrastRatio(backgroundColor, textColor)
    if (contrast > bestContrast) {
      bestContrast = contrast
      bestColor = textColor
    }
  }
  
  return bestColor
}

// Función mejorada para generar un tema que use TODOS los colores de la paleta
export function generateThemeFromPalette(palette) {
  if (!palette || palette.length === 0) {
    return defaultTheme
  }
  
  console.log('🎨 Generando tema desde paleta con', palette.length, 'colores')
  
  // Analizar TODOS los colores de la paleta
  const colors = palette.map((color, index) => {
    const hex = color.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)
    
    // Cálculos de color mejorados
    const brightness = (r * 299 + g * 587 + b * 114) / 1000
    const saturation = Math.max(r, g, b) - Math.min(r, g, b)
    const luminance = calculateLuminance(color)
    
    // Calcular temperatura del color (cálido vs frío)
    const warmth = (r - b) / 255
    
    return {
      hex: color,
      rgb: { r, g, b },
      brightness,
      saturation,
      luminance,
      warmth,
      index
    }
  })
  
  // Clasificar colores por su rol potencial
  const vividColors = colors.filter(c => c.saturation > 80).sort((a, b) => b.saturation - a.saturation)
  const lightColors = colors.filter(c => c.brightness > 180).sort((a, b) => b.brightness - a.brightness)
  const mediumColors = colors.filter(c => c.brightness > 100 && c.brightness <= 180)
  const darkColors = colors.filter(c => c.brightness <= 100).sort((a, b) => a.brightness - b.brightness)
  const warmColors = colors.filter(c => c.warmth > 0.1)
  const coolColors = colors.filter(c => c.warmth < -0.1)
  
  console.log('📊 Análisis de colores:', {
    total: colors.length,
    vivid: vividColors.length,
    light: lightColors.length,
    medium: mediumColors.length,
    dark: darkColors.length,
    warm: warmColors.length,
    cool: coolColors.length
  })
  
  // Asignar roles a TODOS los colores disponibles de forma inteligente
  const theme = {
    // Color primario - el más saturado/vibrante
    primary: vividColors[0]?.hex || colors[0]?.hex || defaultTheme.primary,
    
    // Color secundario - siguiente más vibrante pero diferente
    secondary: vividColors[1]?.hex || colors[1]?.hex || defaultTheme.secondary,
    
    // Color terciario - para acentos suaves
    tertiary: vividColors[2]?.hex || mediumColors[0]?.hex || colors[2]?.hex || defaultTheme.tertiary,
    
    // Color cuaternario - complementario
    quaternary: colors[3]?.hex || defaultTheme.quaternary,
    
    // Color quinario - acento adicional
    quinary: colors[4]?.hex || defaultTheme.quinary,
    
    // Color senario - para fondos/borders
    senary: lightColors[0]?.hex || colors[5]?.hex || defaultTheme.senary,
    
    // Color septenario - para sombras/oscuros
    septenary: darkColors[0]?.hex || colors[6]?.hex || defaultTheme.septenary,
    
    // Color octonario - acento oscuro
    octonary: darkColors[1]?.hex || colors[7]?.hex || defaultTheme.octonary,
    
    // Colores adicionales para uso extensivo en la UI
    accent1: warmColors[0]?.hex || colors[0]?.hex,
    accent2: coolColors[0]?.hex || colors[1]?.hex,
    accent3: mediumColors[0]?.hex || colors[2]?.hex,
    accent4: mediumColors[1]?.hex || colors[3]?.hex,
    
    // Colores para badges y categorías
    badge1: vividColors[0]?.hex || colors[0]?.hex,
    badge2: vividColors[1]?.hex || colors[1]?.hex,
    badge3: vividColors[2]?.hex || colors[2]?.hex,
    badge4: colors[3]?.hex || defaultTheme.quaternary,
    badge5: colors[4]?.hex || defaultTheme.quinary,
    
    // Gradientes usando múltiples colores
    gradient1: `linear-gradient(135deg, ${colors[0]?.hex || defaultTheme.primary}, ${colors[1]?.hex || defaultTheme.secondary})`,
    gradient2: `linear-gradient(135deg, ${colors[1]?.hex || defaultTheme.secondary}, ${colors[2]?.hex || defaultTheme.tertiary})`,
    gradient3: `linear-gradient(135deg, ${colors[2]?.hex || defaultTheme.tertiary}, ${colors[3]?.hex || defaultTheme.quaternary})`,
    
    // Colores con opacidad para overlays
    primaryAlpha: `${colors[0]?.hex || defaultTheme.primary}20`,
    secondaryAlpha: `${colors[1]?.hex || defaultTheme.secondary}20`,
    tertiaryAlpha: `${colors[2]?.hex || defaultTheme.tertiary}20`,
    
    // Guardar todos los colores de la paleta para uso dinámico
    palette: colors.map(c => c.hex),
    paletteCount: colors.length
  }
  
  console.log('✨ Tema generado con', Object.keys(theme).length, 'propiedades')
  
  return theme
}

// Función para optimizar el contraste de un tema completo
function optimizeThemeContrast(theme) {
  const optimized = { ...theme }
  
  // Optimizar contraste de texto principal
  const mainTextContrast = getContrastRatio(optimized.quaternary, optimized.tertiary)
  if (mainTextContrast < 4.5) {
    optimized.quaternary = findBestTextColor(optimized.tertiary)
  }
  
  // Optimizar contraste de bordes
  const borderContrast = getContrastRatio(optimized.border, optimized.tertiary)
  if (borderContrast < 3) {
    optimized.border = findBestTextColor(optimized.tertiary, ['#000000', '#ffffff', '#cccccc'])
    optimized.borderHover = findBestTextColor(optimized.tertiary, ['#000000', '#ffffff', '#999999'])
  }
  
  // Optimizar contraste de elementos secundarios
  const secondaryTextContrast = getContrastRatio(optimized.senary, optimized.tertiary)
  if (secondaryTextContrast < 3) {
    optimized.senary = findBestTextColor(optimized.tertiary, ['#000000', '#ffffff', '#666666'])
  }
  
  return optimized
}

// Función para cargar el tema guardado
export function loadSavedTheme() {
  try {
    const savedTheme = localStorage.getItem(THEME_CONFIG.STORAGE_KEY)
    if (savedTheme) {
      const theme = JSON.parse(savedTheme)
      applyTheme(theme)
      return theme
    }
  } catch (error) {
    console.warn('Error loading saved theme:', error)
  }
  
  return defaultTheme
}

// Función para obtener el tema actual
export function getCurrentTheme() {
  return { ...currentTheme }
}

// Función para obtener el tema por defecto
export function getDefaultTheme() {
  return { ...defaultTheme }
}

// Inicializar el tema al cargar
export function initializeTheme() {
  loadSavedTheme()
}

// Exportar funciones principales
export default {
  applyTheme,
  restoreDefaultTheme,
  generateThemeFromPalette,
  loadSavedTheme,
  getCurrentTheme,
  getDefaultTheme,
  initializeTheme
} 
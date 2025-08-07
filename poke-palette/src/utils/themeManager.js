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

// Función para aplicar un tema a la aplicación
export function applyTheme(theme) {
  currentTheme = { ...defaultTheme, ...theme }
  
  // Aplicar variables CSS
  const root = document.documentElement
  root.style.setProperty('--theme-primary', currentTheme.primary)
  root.style.setProperty('--theme-secondary', currentTheme.secondary)
  root.style.setProperty('--theme-tertiary', currentTheme.tertiary)
  root.style.setProperty('--theme-quaternary', currentTheme.quaternary)
  root.style.setProperty('--theme-quinary', currentTheme.quinary)
  root.style.setProperty('--theme-border', currentTheme.border)
  root.style.setProperty('--theme-border-hover', currentTheme.borderHover)
  root.style.setProperty('--theme-senary', currentTheme.senary)
  root.style.setProperty('--theme-septenary', currentTheme.septenary)
  root.style.setProperty('--theme-octonary', currentTheme.octonary)
  
  // Guardar en localStorage
  localStorage.setItem(THEME_CONFIG.STORAGE_KEY, JSON.stringify(currentTheme))
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

// Función para generar un tema a partir de una paleta de colores con el mejor contraste
export function generateThemeFromPalette(palette) {
  if (!palette || palette.length === 0) {
    return defaultTheme
  }
  
  // Analizar la paleta para determinar los colores principales
  const colors = palette.map(color => {
    // Convertir hex a RGB para análisis
    const hex = color.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000
    
    return {
      hex: color,
      rgb: { r, g, b },
      brightness,
      saturation: Math.max(r, g, b) - Math.min(r, g, b)
    }
  })
  
  // Ordenar por saturación y brillo
  const sortedColors = colors.sort((a, b) => b.saturation - a.saturation)
  
  // Seleccionar colores para el tema
  const primary = sortedColors[0]?.hex || defaultTheme.primary
  const secondary = sortedColors[1]?.hex || defaultTheme.secondary
  
  // Encontrar colores claros y oscuros para texto
  const lightColors = colors.filter(c => c.brightness > 150)
  const darkColors = colors.filter(c => c.brightness < 100)
  
  // Seleccionar el mejor color de fondo
  const backgroundColor = lightColors.length > 0 ? lightColors[0].hex : defaultTheme.tertiary
  
  // Encontrar el mejor color de texto para el fondo seleccionado
  const textColor = findBestTextColor(backgroundColor)
  
  // Generar colores de borde con buen contraste
  const borderColor = findBestTextColor(backgroundColor, ['#000000', '#ffffff', '#cccccc'])
  const borderHoverColor = findBestTextColor(backgroundColor, ['#000000', '#ffffff', '#999999'])
  
  // Encontrar colores de acento que funcionen bien con el tema
  const accentColor = colors.find(c => c.saturation > 100)?.hex || primary
  
  // Generar colores adicionales con buen contraste
  const additionalLight = lightColors[1]?.hex || defaultTheme.quinary
  const additionalDark = darkColors[0]?.hex || defaultTheme.septenary
  
  // Crear el tema optimizado
  const optimizedTheme = {
    primary,
    secondary,
    tertiary: backgroundColor,
    quaternary: textColor,
    quinary: additionalLight,
    border: borderColor,
    borderHover: borderHoverColor,
    senary: colors.find(c => c.brightness > 150 && c.brightness < 200)?.hex || defaultTheme.senary,
    septenary: additionalDark,
    octonary: colors.find(c => c.brightness < 100)?.hex || defaultTheme.octonary
  }
  
  // Verificar y mejorar el contraste de todos los elementos
  return optimizeThemeContrast(optimizedTheme)
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
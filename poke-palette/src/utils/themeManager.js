// Sistema de gestión de temas dinámicos para Pokémon Palette Analyzer
import { calculateLuminance } from './contrastUtils.js'

// Tema por defecto
const defaultTheme = {
  primary: '#667eea',
  secondary: '#764ba2',
  tertiary: '#ffffff',
  quaternary: '#2d3748',
  quinary: '#f7fafc',
  border: '#e2e8f0',
  borderHover: '#cbd5e0',
  senary: '#a0aec0',
  septenary: '#718096',
  octonary: '#4a5568'
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
  localStorage.setItem('pokemon-palette-theme', JSON.stringify(currentTheme))
}

// Función para restaurar el tema por defecto
export function restoreDefaultTheme() {
  applyTheme(defaultTheme)
}

// Función para generar un tema a partir de una paleta de colores
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
  
  const textColor = darkColors.length > 0 ? darkColors[0].hex : defaultTheme.quaternary
  const backgroundColor = lightColors.length > 0 ? lightColors[0].hex : defaultTheme.tertiary
  
  // Generar colores de borde y acentos
  const borderColor = colors.find(c => c.brightness > 200)?.hex || defaultTheme.border
  const accentColor = colors.find(c => c.saturation > 100)?.hex || primary
  
  return {
    primary,
    secondary,
    tertiary: backgroundColor,
    quaternary: textColor,
    quinary: lightColors[1]?.hex || defaultTheme.quinary,
    border: borderColor,
    borderHover: colors.find(c => c.brightness > 180)?.hex || defaultTheme.borderHover,
    senary: colors.find(c => c.brightness > 150 && c.brightness < 200)?.hex || defaultTheme.senary,
    septenary: colors.find(c => c.brightness > 100 && c.brightness < 150)?.hex || defaultTheme.septenary,
    octonary: colors.find(c => c.brightness < 100)?.hex || defaultTheme.octonary
  }
}

// Función para mejorar el contraste de un tema
export function improveThemeContrast(theme) {
  const improvedTheme = { ...theme }
  
  // Función para calcular contraste
  function getContrastRatio(color1, color2) {
    const l1 = calculateLuminance(color1)
    const l2 = calculateLuminance(color2)
    const lighter = Math.max(l1, l2)
    const darker = Math.min(l1, l2)
    
    return (lighter + 0.05) / (darker + 0.05)
  }
  
  // Mejorar contraste de texto
  const textContrast = getContrastRatio(improvedTheme.quaternary, improvedTheme.tertiary)
  if (textContrast < 4.5) {
    // Si el contraste es bajo, usar negro o blanco según el fondo
    const bgLuminance = calculateLuminance(improvedTheme.tertiary)
    improvedTheme.quaternary = bgLuminance > 0.5 ? '#000000' : '#ffffff'
  }
  
  // Mejorar contraste de bordes
  const borderContrast = getContrastRatio(improvedTheme.border, improvedTheme.tertiary)
  if (borderContrast < 3) {
    improvedTheme.border = improvedTheme.quaternary
    improvedTheme.borderHover = improvedTheme.quaternary
  }
  
  return improvedTheme
}

// Función para cargar el tema guardado
export function loadSavedTheme() {
  try {
    const savedTheme = localStorage.getItem('pokemon-palette-theme')
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
  improveThemeContrast,
  loadSavedTheme,
  getCurrentTheme,
  getDefaultTheme,
  initializeTheme
} 
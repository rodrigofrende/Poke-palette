/**
 * Configuración y constantes de la aplicación
 */

// Configuración de la API
export const API_CONFIG = {
  BASE_URL: 'https://pokeapi.co/api/v2',
  IMAGE_BASE_URL: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork',
  SPRITE_BASE_URL: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon',
  MAX_POKEMON_LIMIT: 386, // Solo 3 primeras generaciones (Gen 1, 2 y 3) para mejor rendimiento
  DEFAULT_POKEMON_LIMIT: 151
}

// Configuración de paletas
export const PALETTE_CONFIG = {
  MAX_COLORS: 8,
  MIN_PERCENTAGE: 1.0,
  SAMPLE_RATE: 40, // Cada cuántos píxeles muestrear
  QUANTIZATION_FACTOR: 25 // Factor de cuantización de colores
}

// Configuración de contraste WCAG
export const CONTRAST_CONFIG = {
  AA_NORMAL: 4.5,
  AA_LARGE: 3.0,
  AAA_NORMAL: 7.0,
  AAA_LARGE: 4.5
}

// Configuración de temas
export const THEME_CONFIG = {
  STORAGE_KEY: 'pokemon-palette-theme',
  WELCOME_FLAG_KEY: 'pokemon-palette-welcome-shown'
}

// Configuración de animaciones
export const ANIMATION_CONFIG = {
  FADE_IN_DURATION: 0.5,
  SLIDE_IN_DURATION: 0.8,
  FLOAT_DURATION: 3
}

// Configuración de responsive
export const BREAKPOINTS = {
  MOBILE: 480,
  TABLET: 768,
  DESKTOP: 1024
}

// Configuración de colores por defecto
export const DEFAULT_COLORS = {
  PRIMARY: '#667eea',
  SECONDARY: '#764ba2',
  TERTIARY: '#ffffff',
  QUATERNARY: '#2d3748',
  QUINARY: '#f7fafc',
  BORDER: '#e2e8f0',
  BORDER_HOVER: '#cbd5e0',
  SENARY: '#a0aec0',
  SEPTENARY: '#718096',
  OCTONARY: '#4a5568'
}

// Configuración de tipos de Pokémon
export const POKEMON_TYPES = {
  NORMAL: 'normal',
  FIRE: 'fire',
  WATER: 'water',
  ELECTRIC: 'electric',
  GRASS: 'grass',
  ICE: 'ice',
  FIGHTING: 'fighting',
  POISON: 'poison',
  GROUND: 'ground',
  FLYING: 'flying',
  PSYCHIC: 'psychic',
  BUG: 'bug',
  ROCK: 'rock',
  GHOST: 'ghost',
  DRAGON: 'dragon',
  DARK: 'dark',
  STEEL: 'steel',
  FAIRY: 'fairy'
}

// Configuración de errores
export const ERROR_MESSAGES = {
  POKEMON_NOT_FOUND: 'Pokémon no encontrado',
  NETWORK_ERROR: 'Error de conexión',
  INVALID_COLOR: 'Color inválido',
  GENERIC_ERROR: 'Ha ocurrido un error inesperado'
} 
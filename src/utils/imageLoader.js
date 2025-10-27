/**
 * Sistema robusto de carga de imágenes de Pokémon con fallback múltiple
 * Incluye caché y throttling para evitar rate limiting
 */

import { generateSearchPlaceholder } from './placeholderGenerator.js'
import { getCachedImageUrl, cacheImageUrl, isImageCached } from './imageCache.js'
import { githubImageThrottler } from './requestThrottler.js'

/**
 * URLs de imagen en orden de prioridad (mejor a peor calidad)
 * @param {number|string} id - ID del Pokémon
 * @param {boolean} isShiny - Si es versión shiny
 * @returns {Array<string>} Array de URLs para intentar
 */
const getImageFallbackUrls = (id, isShiny = false) => {
  const urls = []
  
  // 1. Official Artwork (mejor calidad, pero no todos los Pokémon lo tienen)
  if (isShiny) {
    urls.push(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${id}.png`)
  } else {
    urls.push(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`)
  }
  
  // 2. Home sprites (buena calidad alternativa)
  if (isShiny) {
    urls.push(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/${id}.png`)
  } else {
    urls.push(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${id}.png`)
  }
  
  // 3. Sprites básicos (SIEMPRE existen para TODOS los Pokémon - GARANTIZADO)
  if (isShiny) {
    urls.push(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${id}.png`)
  } else {
    urls.push(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`)
  }
  
  // 4. ÚLTIMO RECURSO: Sprite desde CDN alternativo (100% confiable)
  // Este SIEMPRE existe porque es la versión espejo de GitHub
  urls.push(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`)
  
  return urls
}

/**
 * Obtiene la URL inicial para cargar (sin verificación asíncrona)
 * Usa caché si está disponible
 * @param {number|string} pokemonId - ID del Pokémon
 * @param {string} pokemonName - Nombre del Pokémon
 * @param {boolean} isShiny - Si es versión shiny
 * @returns {string} URL inicial para intentar
 */
export const getInitialPokemonImageUrl = (pokemonId, pokemonName = 'Pokemon', isShiny = false) => {
  // Verificar si tenemos la URL en caché
  const cachedUrl = getCachedImageUrl(pokemonId, isShiny)
  if (cachedUrl) {
    console.log(`[ImageLoader] 🎯 Using cached URL for ${pokemonName} (#${pokemonId})`)
    return cachedUrl
  }
  
  // Si no está en caché, retornar la primera URL (mejor calidad disponible)
  const urls = getImageFallbackUrls(pokemonId, isShiny)
  return urls[0]
}

/**
 * Precarga una imagen de Pokémon de forma simple y rápida
 * Sin verificaciones asíncronas - deja que el navegador maneje
 * @param {number|string} pokemonId - ID del Pokémon
 * @param {string} pokemonName - Nombre del Pokémon
 * @param {boolean} isShiny - Si es versión shiny
 * @returns {Promise<string>} URL inicial
 */
export const preloadPokemonImage = async (pokemonId, pokemonName = 'Pokemon', isShiny = false) => {
  // Simplemente retornar la URL inicial
  // El componente manejará los fallbacks con @error
  const url = getInitialPokemonImageUrl(pokemonId, pokemonName, isShiny)
  return url
}

/**
 * Handler optimizado para errores de imagen en componentes
 * Intenta TODOS los fallbacks antes de rendirse
 * CACHEA las URLs exitosas para futuros usos
 * @param {Event} event - Evento de error de imagen
 * @param {number|string} pokemonId - ID del Pokémon
 * @param {string} pokemonName - Nombre del Pokémon
 * @param {boolean} isShiny - Si es versión shiny
 */
export const handlePokemonImageError = (event, pokemonId, pokemonName = 'Pokemon', isShiny = false) => {
  const currentUrl = event.target.src
  
  // Evitar loops infinitos con placeholder
  if (currentUrl.startsWith('data:image/svg')) {
    console.error(`❌ CRITICAL: All image sources failed for ${pokemonName} (#${pokemonId})`)
    event.target.style.opacity = '0.5'
    return
  }
  
  // Obtener todas las URLs de fallback
  const urls = getImageFallbackUrls(pokemonId, isShiny)
  
  // Encontrar qué URL estamos intentando ahora
  let currentIndex = -1
  
  // Intentar matchear por diferentes partes de la URL
  for (let i = 0; i < urls.length; i++) {
    const urlParts = urls[i].split('/')
    const lastTwo = urlParts.slice(-2).join('/')
    const lastThree = urlParts.slice(-3).join('/')
    
    if (currentUrl.includes(lastTwo) || currentUrl.includes(lastThree)) {
      currentIndex = i
      break
    }
  }
  
  // Si hay una siguiente URL para intentar
  if (currentIndex < urls.length - 1) {
    const nextIndex = currentIndex + 1
    const nextUrl = urls[nextIndex]
    
    console.log(`🔄 Trying fallback ${nextIndex + 1}/${urls.length} for ${pokemonName}: ${nextUrl.split('/').slice(-3).join('/')}`)
    
    // Agregar listener para cachear si esta URL funciona
    // El { once: true } remueve automáticamente el listener después de ejecutarse
    const onLoad = () => {
      console.log(`✅ Fallback ${nextIndex + 1} worked! Caching for future use.`)
      cacheImageUrl(pokemonId, nextUrl, isShiny)
    }
    event.target.addEventListener('load', onLoad, { once: true })
    
    event.target.src = nextUrl
    return
  }
  
  // ESTO NO DEBERÍA PASAR: Todos los Pokémon tienen sprite básico
  console.error(`❌ IMPOSSIBLE: No valid image found for ${pokemonName} (#${pokemonId})`)
  console.error(`Tried ${urls.length} URLs:`, urls)
  
  // Como último recurso, intentar forzar el sprite básico sin shiny
  const basicSprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`
  if (currentUrl !== basicSprite) {
    console.log(`🚨 FORCING basic sprite for ${pokemonName}`)
    event.target.src = basicSprite
  } else {
    // Si incluso el sprite básico falló, algo está muy mal (red, GitHub down, etc.)
    console.error(`🔥 Network or GitHub issues detected - basic sprite failed`)
    event.target.src = generateSearchPlaceholder(pokemonName)
  }
}

/**
 * Obtiene la mejor URL disponible para un Pokémon sin probar
 * Útil cuando necesitas una URL inmediata
 * @param {number|string} pokemonId - ID del Pokémon
 * @param {boolean} isShiny - Si es versión shiny
 * @returns {string} Primera URL de fallback
 */
export const getBestPokemonImageUrl = (pokemonId, isShiny = false) => {
  const urls = getImageFallbackUrls(pokemonId, isShiny)
  return urls[0] // Retorna la mejor URL disponible
}


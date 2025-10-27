/**
 * Sistema de caché de imágenes para reducir solicitudes a GitHub
 */

// Caché en memoria (rápido pero se pierde al recargar)
const memoryCache = new Map()

// Configuración
const CACHE_CONFIG = {
  STORAGE_KEY: 'poke_palette_image_cache',
  MAX_CACHE_SIZE: 100, // Máximo de URLs en caché
  MAX_AGE: 1000 * 60 * 60 * 24, // 24 horas
  VERSION: '1.0'
}

/**
 * Estructura del caché en localStorage:
 * {
 *   version: '1.0',
 *   timestamp: Date.now(),
 *   images: {
 *     'pokemon-123': { url: '...', timestamp: Date.now() },
 *     ...
 *   }
 * }
 */

/**
 * Obtiene la caché del localStorage
 */
function getStorageCache() {
  try {
    const cached = localStorage.getItem(CACHE_CONFIG.STORAGE_KEY)
    if (!cached) return null
    
    const data = JSON.parse(cached)
    
    // Verificar versión
    if (data.version !== CACHE_CONFIG.VERSION) {
      clearCache()
      return null
    }
    
    return data
  } catch (error) {
    console.warn('[ImageCache] Error reading from localStorage:', error)
    return null
  }
}

/**
 * Guarda la caché en localStorage
 */
function saveStorageCache(cache) {
  try {
    localStorage.setItem(CACHE_CONFIG.STORAGE_KEY, JSON.stringify(cache))
  } catch (error) {
    console.warn('[ImageCache] Error saving to localStorage:', error)
    // Si falla (cuota excedida), limpiar caché antiguo
    if (error.name === 'QuotaExceededError') {
      clearOldEntries()
      try {
        localStorage.setItem(CACHE_CONFIG.STORAGE_KEY, JSON.stringify(cache))
      } catch (retryError) {
        console.error('[ImageCache] Failed to save even after cleanup')
      }
    }
  }
}

/**
 * Obtiene una URL cacheada para un Pokémon
 */
export function getCachedImageUrl(pokemonId, isShiny = false) {
  const cacheKey = `pokemon-${pokemonId}${isShiny ? '-shiny' : ''}`
  
  // 1. Verificar caché en memoria (más rápido)
  if (memoryCache.has(cacheKey)) {
    const cached = memoryCache.get(cacheKey)
    if (Date.now() - cached.timestamp < CACHE_CONFIG.MAX_AGE) {
      console.log(`[ImageCache] 🎯 HIT (memory) for ${cacheKey}`)
      return cached.url
    }
    // Expirado, remover
    memoryCache.delete(cacheKey)
  }
  
  // 2. Verificar caché en localStorage
  const storageCache = getStorageCache()
  if (storageCache?.images?.[cacheKey]) {
    const cached = storageCache.images[cacheKey]
    if (Date.now() - cached.timestamp < CACHE_CONFIG.MAX_AGE) {
      console.log(`[ImageCache] 💾 HIT (storage) for ${cacheKey}`)
      // Promover a memoria
      memoryCache.set(cacheKey, cached)
      return cached.url
    }
  }
  
  console.log(`[ImageCache] ❌ MISS for ${cacheKey}`)
  return null
}

/**
 * Guarda una URL en el caché
 */
export function cacheImageUrl(pokemonId, url, isShiny = false) {
  const cacheKey = `pokemon-${pokemonId}${isShiny ? '-shiny' : ''}`
  const entry = {
    url,
    timestamp: Date.now()
  }
  
  // Guardar en memoria
  memoryCache.set(cacheKey, entry)
  
  // Guardar en localStorage
  let storageCache = getStorageCache() || {
    version: CACHE_CONFIG.VERSION,
    timestamp: Date.now(),
    images: {}
  }
  
  storageCache.images[cacheKey] = entry
  
  // Limitar tamaño del caché
  const entries = Object.entries(storageCache.images)
  if (entries.length > CACHE_CONFIG.MAX_CACHE_SIZE) {
    // Remover las entradas más antiguas
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp)
    const toKeep = entries.slice(-CACHE_CONFIG.MAX_CACHE_SIZE)
    storageCache.images = Object.fromEntries(toKeep)
  }
  
  saveStorageCache(storageCache)
  console.log(`[ImageCache] ✅ CACHED ${cacheKey}`)
}

/**
 * Verifica si una imagen está en caché
 */
export function isImageCached(pokemonId, isShiny = false) {
  return getCachedImageUrl(pokemonId, isShiny) !== null
}

/**
 * Precarga una imagen en el caché
 */
export function preloadImage(pokemonId, url, isShiny = false) {
  return new Promise((resolve, reject) => {
    // Si ya está en caché, no recargar
    if (isImageCached(pokemonId, isShiny)) {
      resolve(getCachedImageUrl(pokemonId, isShiny))
      return
    }
    
    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    img.onload = () => {
      cacheImageUrl(pokemonId, url, isShiny)
      resolve(url)
    }
    
    img.onerror = () => {
      reject(new Error(`Failed to preload image: ${url}`))
    }
    
    img.src = url
  })
}

/**
 * Limpia entradas antiguas del caché
 */
export function clearOldEntries() {
  const storageCache = getStorageCache()
  if (!storageCache) return
  
  const now = Date.now()
  const validEntries = Object.entries(storageCache.images)
    .filter(([_, entry]) => now - entry.timestamp < CACHE_CONFIG.MAX_AGE)
  
  storageCache.images = Object.fromEntries(validEntries)
  saveStorageCache(storageCache)
  
  console.log(`[ImageCache] 🧹 Cleaned old entries. Remaining: ${validEntries.length}`)
}

/**
 * Limpia todo el caché
 */
export function clearCache() {
  memoryCache.clear()
  try {
    localStorage.removeItem(CACHE_CONFIG.STORAGE_KEY)
    console.log('[ImageCache] 🗑️ Cache cleared')
  } catch (error) {
    console.error('[ImageCache] Error clearing cache:', error)
  }
}

/**
 * Obtiene estadísticas del caché
 */
export function getCacheStats() {
  const storageCache = getStorageCache()
  return {
    memorySize: memoryCache.size,
    storageSize: storageCache ? Object.keys(storageCache.images).length : 0,
    maxSize: CACHE_CONFIG.MAX_CACHE_SIZE,
    version: CACHE_CONFIG.VERSION
  }
}

// Limpiar caché antiguo al iniciar
clearOldEntries()


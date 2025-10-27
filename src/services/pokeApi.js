// Servicio para interactuar con la PokeAPI
import { API_CONFIG } from '../config/constants.js'

/**
 * Obtiene una lista de Pokémon desde la PokeAPI
 * @param {number} limit - Número de Pokémon a obtener (máximo 1025 para todos los Pokémon)
 * @param {number} offset - Número de Pokémon a saltar
 * @returns {Promise<Object>} Lista de Pokémon
 */
export const getPokemonList = async (limit = API_CONFIG.DEFAULT_POKEMON_LIMIT, offset = 0) => {
  try {
    // Validar parámetros
    if (limit < 1 || limit > API_CONFIG.MAX_POKEMON_LIMIT) {
      throw new Error(`El límite debe estar entre 1 y ${API_CONFIG.MAX_POKEMON_LIMIT}`);
    }
    
    if (offset < 0) {
      throw new Error('El offset no puede ser negativo');
    }
    
    const response = await fetch(`${API_CONFIG.BASE_URL}/pokemon?limit=${limit}&offset=${offset}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching Pokémon list:', error);
    throw error;
  }
};

/**
 * Obtiene los detalles de un Pokémon específico por ID o nombre
 * @param {string|number} identifier - ID o nombre del Pokémon
 * @returns {Promise<Object>} Detalles del Pokémon
 */
export const getPokemonDetails = async (identifier) => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/pokemon/${identifier}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching Pokémon details for ${identifier}:`, error);
    throw error;
  }
};

/**
 * Obtiene información de especies de un Pokémon
 * @param {string|number} identifier - ID o nombre del Pokémon
 * @returns {Promise<Object>} Información de la especie
 */
export const getPokemonSpecies = async (identifier) => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/pokemon-species/${identifier}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching Pokémon species for ${identifier}:`, error);
    throw error;
  }
};

/**
 * Obtiene información de tipos de Pokémon
 * @param {string|number} identifier - ID o nombre del tipo
 * @returns {Promise<Object>} Información del tipo
 */
export const getPokemonType = async (identifier) => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/type/${identifier}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching Pokémon type for ${identifier}:`, error);
    throw error;
  }
};

/**
 * Obtiene una lista de todos los tipos de Pokémon
 * @returns {Promise<Object>} Lista de tipos
 */
export const getPokemonTypes = async () => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/type`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching Pokémon types:', error);
    throw error;
  }
};

/**
 * Función auxiliar para obtener la URL de la imagen del Pokémon
 * @param {number} id - ID del Pokémon
 * @param {boolean} isShiny - Si es shiny o no
 * @returns {string} URL de la imagen oficial del Pokémon
 */
export const getPokemonImageUrl = (id, isShiny = false) => {
  if (isShiny) {
    return `${API_CONFIG.SPRITE_BASE_URL}/shiny/${id}.png`;
  }
  return `${API_CONFIG.IMAGE_BASE_URL}/${id}.png`;
};

/**
 * Función auxiliar para obtener la URL de la imagen del sprite del Pokémon
 * @param {number} id - ID del Pokémon
 * @param {boolean} isShiny - Si es shiny o no
 * @returns {string} URL del sprite del Pokémon
 */
export const getPokemonSpriteUrl = (id, isShiny = false) => {
  if (isShiny) {
    return `${API_CONFIG.SPRITE_BASE_URL}/shiny/${id}.png`;
  }
  return `${API_CONFIG.SPRITE_BASE_URL}/${id}.png`;
};

/**
 * Obtiene información completa de un Pokémon incluyendo detalles y especie
 * @param {string|number} identifier - ID o nombre del Pokémon
 * @param {boolean} isShiny - Si es shiny o no
 * @returns {Promise<Object>} Información completa del Pokémon
 */
export const getPokemonCompleteInfo = async (identifier, isShiny = false) => {
  try {
    const [details, species] = await Promise.all([
      getPokemonDetails(identifier),
      getPokemonSpecies(identifier)
    ]);
    
    return {
      details,
      species,
      imageUrl: getPokemonImageUrl(details.id, isShiny),
      spriteUrl: getPokemonSpriteUrl(details.id, isShiny)
    };
  } catch (error) {
    console.error(`Error fetching complete Pokémon info for ${identifier}:`, error);
    throw error;
  }
}; 

/**
 * Obtiene un Pokémon aleatorio
 * @returns {Promise<Object>} Detalles del Pokémon aleatorio
 */
export const getRandomPokemon = async () => {
  try {
    // Generar un ID aleatorio entre 1 y el límite máximo
    const randomId = Math.floor(Math.random() * API_CONFIG.MAX_POKEMON_LIMIT) + 1;
    
    const response = await fetch(`${API_CONFIG.BASE_URL}/pokemon/${randomId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const pokemon = await response.json();
    
    // Agregar la URL de la imagen oficial
    pokemon.imageUrl = getPokemonImageUrl(randomId);
    
    return pokemon;
  } catch (error) {
    console.error('Error fetching random Pokémon:', error);
    throw error;
  }
}

/**
 * Cache para la lista completa de Pokémon
 */
let pokemonListCache = null
let isLoadingCache = false
const cachePromises = []

/**
 * Obtiene la lista de Pokémon con carga progresiva
 * Primero carga los primeros 150 (Gen 1-2) para búsquedas rápidas,
 * luego carga el resto en background
 * @returns {Promise<Array>} Lista de Pokémon
 */
export const getPokemonListProgressive = async () => {
  // Si ya está en cache, retornar
  if (pokemonListCache) {
    return pokemonListCache
  }
  
  // Si ya está cargando, esperar a que termine
  if (isLoadingCache) {
    return new Promise((resolve) => {
      cachePromises.push(resolve)
    })
  }
  
  isLoadingCache = true
  
  try {
    // FASE 1: Cargar primeros 150 Pokémon (Gen 1-2) - INMEDIATO
    console.log('🚀 Cargando primeros 150 Pokémon...')
    const firstBatchResponse = await fetch(`${API_CONFIG.BASE_URL}/pokemon?limit=150&offset=0`)
    
    if (!firstBatchResponse.ok) {
      throw new Error(`HTTP error! status: ${firstBatchResponse.status}`)
    }
    
    const firstBatchData = await firstBatchResponse.json()
    pokemonListCache = firstBatchData.results
    
    console.log('✅ Primeros 150 Pokémon cargados')
    
    // Resolver las promesas pendientes con el primer batch
    cachePromises.forEach(resolve => resolve(pokemonListCache))
    cachePromises.length = 0
    
    // FASE 2: Cargar el resto en background (por lotes de 200)
    loadRemainingPokemonInBackground()
    
    return pokemonListCache
    
  } catch (error) {
    console.error('Error loading progressive Pokémon list:', error)
    isLoadingCache = false
    throw error
  }
}

/**
 * Carga el resto de Pokémon en background por lotes
 * Ahora limitado a las 3 primeras generaciones (386 Pokémon total)
 */
const loadRemainingPokemonInBackground = async () => {
  try {
    const TOTAL_POKEMON = API_CONFIG.MAX_POKEMON_LIMIT // 386
    const remainingCount = TOTAL_POKEMON - 150 // 236 Pokémon restantes
    
    console.log(`📦 Cargando ${remainingCount} Pokémon restantes (Gen 2-3) en background...`)
    
    // Cargar de una sola vez los 236 restantes (más eficiente para un número menor)
    const response = await fetch(`${API_CONFIG.BASE_URL}/pokemon?limit=${remainingCount}&offset=150`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    
    // Agregar los resultados al cache
    pokemonListCache.push(...data.results)
    
    console.log(`✅ Lista completa cargada: ${pokemonListCache.length} Pokémon (Gen 1-3)`)
    isLoadingCache = false
    
  } catch (error) {
    console.error('Error loading remaining Pokémon:', error)
    isLoadingCache = false
  }
}

/**
 * Limpia el cache de la lista de Pokémon
 */
export const clearPokemonListCache = () => {
  pokemonListCache = null
  isLoadingCache = false
  cachePromises.length = 0
  console.log('🗑️ Cache de Pokémon limpiado')
} 
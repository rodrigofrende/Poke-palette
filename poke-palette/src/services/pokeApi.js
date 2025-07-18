// Servicio para interactuar con la PokeAPI
// Base URL de la PokeAPI
const BASE_URL = 'https://pokeapi.co/api/v2';

/**
 * Obtiene una lista de Pokémon con paginación
 * @param {number} limit - Número de Pokémon a obtener (máximo 151 para la primera generación)
 * @param {number} offset - Número de Pokémon a saltar
 * @returns {Promise<Object>} Lista de Pokémon
 */
export const getPokemonList = async (limit = 151, offset = 0) => {
  try {
    // Validar parámetros
    if (limit < 1 || limit > 1000) {
      throw new Error('El límite debe estar entre 1 y 1000');
    }
    
    if (offset < 0) {
      throw new Error('El offset no puede ser negativo');
    }
    
    const response = await fetch(`${BASE_URL}/pokemon?limit=${limit}&offset=${offset}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('No se encontraron Pokémon con los criterios especificados');
      } else if (response.status === 429) {
        throw new Error('Demasiadas solicitudes. Intenta de nuevo en unos momentos');
      } else {
        throw new Error(`Error del servidor: ${response.status}`);
      }
    }
    
    const data = await response.json();
    return data;
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
    const response = await fetch(`${BASE_URL}/pokemon/${identifier}`);
    
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
    const response = await fetch(`${BASE_URL}/pokemon-species/${identifier}`);
    
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
    const response = await fetch(`${BASE_URL}/type/${identifier}`);
    
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
    const response = await fetch(`${BASE_URL}/type`);
    
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
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${id}.png`;
  }
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
};

/**
 * Función auxiliar para obtener la URL de la imagen del sprite del Pokémon
 * @param {number} id - ID del Pokémon
 * @param {boolean} isShiny - Si es shiny o no
 * @returns {string} URL del sprite del Pokémon
 */
export const getPokemonSpriteUrl = (id, isShiny = false) => {
  if (isShiny) {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${id}.png`;
  }
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
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
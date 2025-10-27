/**
 * Genera un placeholder SVG inline como data URL
 * Evita dependencias de servicios externos como via.placeholder.com
 * @param {number} width - Ancho del placeholder
 * @param {number} height - Alto del placeholder
 * @param {string} text - Texto a mostrar
 * @param {string} bgColor - Color de fondo (hex sin #)
 * @param {string} textColor - Color del texto (hex sin #)
 * @returns {string} Data URL del SVG
 */
export const generatePlaceholder = (
  width = 200,
  height = 200,
  text = 'Image',
  bgColor = 'FF6B6B',
  textColor = 'FFFFFF'
) => {
  // Calcular tamaño de fuente dinámico basado en el ancho
  const fontSize = Math.max(12, Math.min(width / 8, 24))
  
  // Truncar texto si es muy largo
  const maxLength = Math.floor(width / (fontSize * 0.6))
  const displayText = text.length > maxLength ? text.substring(0, maxLength) + '...' : text
  
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#${bgColor};stop-opacity:1" />
          <stop offset="100%" style="stop-color:#${bgColor}ee;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)" rx="8"/>
      <text 
        x="50%" 
        y="50%" 
        dominant-baseline="middle" 
        text-anchor="middle" 
        font-family="system-ui, -apple-system, sans-serif" 
        font-size="${fontSize}" 
        font-weight="600" 
        fill="#${textColor}"
        opacity="0.95"
      >${displayText}</text>
      <circle cx="50%" cy="30%" r="${width * 0.15}" fill="#${textColor}" opacity="0.1"/>
      <circle cx="50%" cy="30%" r="${width * 0.1}" fill="#${textColor}" opacity="0.15"/>
    </svg>
  `.trim()
  
  // Codificar SVG como data URL
  const encoded = encodeURIComponent(svg)
    .replace(/'/g, '%27')
    .replace(/"/g, '%22')
  
  return `data:image/svg+xml,${encoded}`
}

/**
 * Genera un placeholder específico para Pokémon
 * @param {string} pokemonName - Nombre del Pokémon
 * @param {number} size - Tamaño del placeholder
 * @returns {string} Data URL del SVG
 */
export const generatePokemonPlaceholder = (pokemonName = 'Pokemon', size = 200) => {
  // Capitalizar primera letra
  const displayName = pokemonName.charAt(0).toUpperCase() + pokemonName.slice(1)
  
  return generatePlaceholder(
    size,
    size,
    displayName,
    'FF6B6B', // Color primary de la app
    'FFFFFF'
  )
}

/**
 * Genera un placeholder para el WelcomeScreen
 * @param {string} pokemonName - Nombre del Pokémon
 * @returns {string} Data URL del SVG
 */
export const generateWelcomePlaceholder = (pokemonName = 'Pokemon') => {
  return generatePokemonPlaceholder(pokemonName, 120)
}

/**
 * Genera un placeholder para cards de búsqueda
 * @param {string} pokemonName - Nombre del Pokémon
 * @returns {string} Data URL del SVG
 */
export const generateSearchPlaceholder = (pokemonName = 'Pokemon') => {
  return generatePokemonPlaceholder(pokemonName, 200)
}


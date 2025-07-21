// Gestor de la pantalla de bienvenida
const WELCOME_FLAG_KEY = 'pokemon-palette-welcome-shown'

/**
 * Verifica si la pantalla de bienvenida ya fue mostrada
 * @returns {boolean} true si ya fue mostrada, false si es la primera visita
 */
export function hasSeenWelcome() {
  return localStorage.getItem(WELCOME_FLAG_KEY) === 'true'
}

/**
 * Marca la pantalla de bienvenida como vista
 */
export function markWelcomeAsSeen() {
  localStorage.setItem(WELCOME_FLAG_KEY, 'true')
}

/**
 * Resetea el flag de bienvenida (para mostrar la bienvenida nuevamente)
 */
export function resetWelcomeFlag() {
  localStorage.removeItem(WELCOME_FLAG_KEY)
}

/**
 * Verifica si debe mostrar la pantalla de bienvenida
 */
export function shouldShowWelcome() {
  // Si no ha visto la bienvenida, mostrarla
  if (!hasSeenWelcome()) {
    return true
  }
  
  // Si presionó F5, resetear y mostrar
  if (window.performance && window.performance.navigation.type === 1) {
    resetWelcomeFlag()
    return true
  }
  
  return false
} 
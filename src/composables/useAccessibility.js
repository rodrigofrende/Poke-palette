import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { logger } from '../utils/logger.js'

/**
 * Composable para mejorar la accesibilidad de la aplicación
 * Implementa patrones ARIA y mejores prácticas de a11y
 */
export function useAccessibility() {
  const announcements = ref([])
  const focusHistory = ref([])
  const currentFocus = ref(null)
  
  // Crear live region para anuncios
  let liveRegion = null

  /**
   * Inicializa las utilidades de accesibilidad
   */
  const initializeA11y = () => {
    createLiveRegion()
    setupFocusTracking()
    setupKeyboardNavigation()
    logger.debug('A11y', 'Accessibility utilities initialized')
  }

  /**
   * Crea una región live para anuncios de screen reader
   */
  const createLiveRegion = () => {
    if (liveRegion) return
    
    // Verificar que document.body existe
    if (!document.body) {
      logger.warn('A11y', 'document.body not available yet, cannot create live region')
      return
    }

    try {
      liveRegion = document.createElement('div')
      liveRegion.setAttribute('aria-live', 'polite')
      liveRegion.setAttribute('aria-atomic', 'true')
      liveRegion.setAttribute('class', 'sr-only')
      liveRegion.style.cssText = `
        position: absolute !important;
        width: 1px !important;
        height: 1px !important;
        padding: 0 !important;
        margin: -1px !important;
        overflow: hidden !important;
        clip: rect(0, 0, 0, 0) !important;
        white-space: nowrap !important;
        border: 0 !important;
      `
      
      document.body.appendChild(liveRegion)
      logger.debug('A11y', 'Live region created successfully')
    } catch (error) {
      logger.error('A11y', 'Error creating live region:', error)
      liveRegion = null
    }
  }

  /**
   * Anuncia un mensaje para lectores de pantalla
   * @param {string} message - Mensaje a anunciar
   * @param {string} priority - Prioridad ('polite' o 'assertive')
   */
  const announce = (message, priority = 'polite') => {
    if (!liveRegion) createLiveRegion()
    
    // Verificar que el liveRegion existe después de intentar crearlo
    if (!liveRegion) {
      logger.warn('A11y', 'Live region not available, skipping announcement')
      return
    }
    
    const announcement = {
      id: Date.now(),
      message,
      priority,
      timestamp: new Date().toISOString()
    }
    
    announcements.value.push(announcement)
    
    // Cambiar la prioridad si es necesario
    if (priority === 'assertive') {
      liveRegion.setAttribute('aria-live', 'assertive')
    }
    
    // Anunciar el mensaje
    liveRegion.textContent = message
    
    // Restaurar prioridad después de un tiempo
    setTimeout(() => {
      // Verificar que liveRegion todavía existe (puede ser null si el componente se desmontó)
      if (!liveRegion) return
      
      if (priority === 'assertive') {
        liveRegion.setAttribute('aria-live', 'polite')
      }
      liveRegion.textContent = ''
    }, 1000)
    
    logger.debug('A11y', `Announced: "${message}" (${priority})`)
  }

  /**
   * Configura el seguimiento del foco
   */
  const setupFocusTracking = () => {
    const handleFocus = (event) => {
      const element = event.target
      currentFocus.value = element
      
      focusHistory.value.push({
        element,
        timestamp: Date.now(),
        tagName: element.tagName,
        id: element.id,
        className: element.className
      })
      
      // Mantener solo los últimos 10 elementos
      if (focusHistory.value.length > 10) {
        focusHistory.value.shift()
      }
    }

    document.addEventListener('focusin', handleFocus)
    
    // Cleanup function será retornada
    return () => document.removeEventListener('focusin', handleFocus)
  }

  /**
   * Configura la navegación por teclado
   */
  const setupKeyboardNavigation = () => {
    const handleKeyDown = (event) => {
      // Escape key - cerrar modales o volver atrás
      if (event.key === 'Escape') {
        handleEscapeKey(event)
      }
      
      // Tab trapping para modales
      if (event.key === 'Tab') {
        handleTabKey(event)
      }
      
      // Navegación con flechas
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        handleArrowKeys(event)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    
    return () => document.removeEventListener('keydown', handleKeyDown)
  }

  /**
   * Maneja la tecla Escape
   * @param {KeyboardEvent} event - Evento de teclado
   */
  const handleEscapeKey = (event) => {
    // Buscar modales abiertos
    const openModal = document.querySelector('[role="dialog"][aria-hidden="false"]')
    if (openModal) {
      const closeButton = openModal.querySelector('[aria-label*="cerrar"], [aria-label*="close"]')
      if (closeButton) {
        closeButton.click()
        event.preventDefault()
      }
    }
    
    // Buscar dropdowns abiertos
    const openDropdown = document.querySelector('[aria-expanded="true"]')
    if (openDropdown) {
      openDropdown.setAttribute('aria-expanded', 'false')
      openDropdown.focus()
      event.preventDefault()
    }
  }

  /**
   * Maneja la navegación con Tab
   * @param {KeyboardEvent} event - Evento de teclado
   */
  const handleTabKey = (event) => {
    const modal = event.target.closest('[role="dialog"]')
    if (modal) {
      trapFocus(modal, event)
    }
  }

  /**
   * Maneja las teclas de flecha
   * @param {KeyboardEvent} event - Evento de teclado
   */
  const handleArrowKeys = (event) => {
    const target = event.target
    
    // Navegación en listas con role="listbox" o similar
    if (target.closest('[role="listbox"], [role="menu"], [role="tablist"]')) {
      handleArrowNavigation(event)
    }
  }

  /**
   * Implementa navegación con flechas en listas
   * @param {KeyboardEvent} event - Evento de teclado
   */
  const handleArrowNavigation = (event) => {
    const container = event.target.closest('[role="listbox"], [role="menu"], [role="tablist"]')
    const items = container.querySelectorAll('[role="option"], [role="menuitem"], [role="tab"]')
    const currentIndex = Array.from(items).indexOf(event.target)
    
    let nextIndex = currentIndex
    
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        nextIndex = (currentIndex + 1) % items.length
        break
      case 'ArrowUp':
      case 'ArrowLeft':
        nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1
        break
    }
    
    if (nextIndex !== currentIndex) {
      items[nextIndex].focus()
      event.preventDefault()
    }
  }

  /**
   * Atrapa el foco dentro de un modal
   * @param {Element} modal - Elemento modal
   * @param {KeyboardEvent} event - Evento de teclado
   */
  const trapFocus = (modal, event) => {
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]
    
    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement.focus()
        event.preventDefault()
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement.focus()
        event.preventDefault()
      }
    }
  }

  /**
   * Mejora la accesibilidad de un elemento
   * @param {Element} element - Elemento a mejorar
   * @param {Object} options - Opciones de mejora
   */
  const enhanceElement = (element, options = {}) => {
    const {
      label,
      description,
      role,
      expanded,
      pressed,
      selected,
      invalid,
      required
    } = options

    if (label) {
      element.setAttribute('aria-label', label)
    }
    
    if (description) {
      const descId = `desc-${Date.now()}`
      const descElement = document.createElement('div')
      descElement.id = descId
      descElement.textContent = description
      descElement.className = 'sr-only'
      element.parentNode.insertBefore(descElement, element.nextSibling)
      element.setAttribute('aria-describedby', descId)
    }
    
    if (role) element.setAttribute('role', role)
    if (expanded !== undefined) element.setAttribute('aria-expanded', expanded.toString())
    if (pressed !== undefined) element.setAttribute('aria-pressed', pressed.toString())
    if (selected !== undefined) element.setAttribute('aria-selected', selected.toString())
    if (invalid !== undefined) element.setAttribute('aria-invalid', invalid.toString())
    if (required !== undefined) element.setAttribute('aria-required', required.toString())
  }

  /**
   * Verifica el contraste de colores
   * @param {string} foreground - Color de primer plano
   * @param {string} background - Color de fondo
   * @returns {Object} - Información de contraste
   */
  const checkColorContrast = (foreground, background) => {
    // Esta función sería más compleja en una implementación real
    // Por ahora, retorna una estructura básica
    return {
      ratio: 4.5, // Placeholder
      level: 'AA',
      passes: true
    }
  }

  /**
   * Agrega skip links para navegación rápida
   */
  const addSkipLinks = () => {
    const skipLinks = document.createElement('div')
    skipLinks.className = 'skip-links'
    skipLinks.innerHTML = `
      <a href="#main-content" class="skip-link">Saltar al contenido principal</a>
      <a href="#navigation" class="skip-link">Saltar a navegación</a>
    `
    
    // Estilos para skip links
    const style = document.createElement('style')
    style.textContent = `
      .skip-links {
        position: absolute;
        top: -40px;
        left: 6px;
        z-index: 1000;
      }
      .skip-link {
        position: absolute;
        top: -40px;
        left: 6px;
        background: #000;
        color: #fff;
        padding: 8px;
        text-decoration: none;
        border-radius: 4px;
        z-index: 1000;
      }
      .skip-link:focus {
        top: 6px;
      }
    `
    
    document.head.appendChild(style)
    document.body.insertBefore(skipLinks, document.body.firstChild)
  }

  /**
   * Limpia las utilidades de accesibilidad
   */
  const cleanupA11y = () => {
    if (liveRegion) {
      try {
        // Verificar que el elemento todavía está en el DOM antes de removerlo
        if (liveRegion.parentNode) {
          liveRegion.parentNode.removeChild(liveRegion)
        }
      } catch (error) {
        logger.warn('A11y', 'Error removing live region:', error)
      } finally {
        liveRegion = null
      }
    }
    
    logger.debug('A11y', 'Accessibility utilities cleaned up')
  }

  return {
    // Estado
    announcements,
    focusHistory,
    currentFocus,
    
    // Métodos principales
    initializeA11y,
    announce,
    enhanceElement,
    checkColorContrast,
    addSkipLinks,
    cleanupA11y,
    
    // Utilidades de foco
    trapFocus
  }
}
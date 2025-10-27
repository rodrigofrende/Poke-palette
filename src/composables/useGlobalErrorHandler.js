import { ref } from 'vue'
import { logger } from '../utils/logger.js'

/**
 * Composable para manejo global de errores de la aplicación
 * Funciona como un Error Boundary para Vue 3
 */
export function useGlobalErrorHandler() {
  const errors = ref([])
  const hasGlobalError = ref(false)
  const lastError = ref(null)

  /**
   * Registra un error global
   * @param {Error} error - Error capturado
   * @param {string} context - Contexto donde ocurrió el error
   * @param {Object} metadata - Metadatos adicionales
   */
  const captureError = (error, context = 'unknown', metadata = {}) => {
    const errorInfo = {
      id: Date.now() + Math.random(),
      error,
      context,
      metadata,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      stack: error.stack
    }

    errors.value.push(errorInfo)
    lastError.value = errorInfo
    hasGlobalError.value = true

    // Log del error
    logger.error('Global Error Captured:', {
      message: error.message,
      context,
      stack: error.stack,
      metadata
    })

    // En producción, aquí enviarías el error a un servicio como Sentry
    if (!import.meta.env.DEV) {
      sendErrorToService(errorInfo)
    }

    return errorInfo
  }

  /**
   * Maneja errores de promesas no capturadas
   * @param {PromiseRejectionEvent} event - Evento de promesa rechazada
   */
  const handleUnhandledRejection = (event) => {
    const error = event.reason instanceof Error ? event.reason : new Error(event.reason)
    captureError(error, 'unhandledPromiseRejection', {
      reason: event.reason,
      type: 'promise'
    })
    
    // Prevenir que el error aparezca en la consola
    event.preventDefault()
  }

  /**
   * Maneja errores JavaScript globales
   * @param {ErrorEvent} event - Evento de error
   */
  const handleGlobalError = (event) => {
    const error = event.error || new Error(event.message)
    captureError(error, 'globalError', {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      type: 'javascript'
    })
  }

  /**
   * Maneja errores de recursos (imágenes, scripts, etc.)
   * @param {Event} event - Evento de error de recurso
   */
  const handleResourceError = (event) => {
    const target = event.target || event.srcElement
    const error = new Error(`Failed to load resource: ${target.src || target.href || 'unknown'}`)
    
    captureError(error, 'resourceError', {
      tagName: target.tagName,
      src: target.src,
      href: target.href,
      type: 'resource'
    })
  }

  /**
   * Envía error a servicio de monitoreo (placeholder)
   * @param {Object} errorInfo - Información del error
   */
  const sendErrorToService = (errorInfo) => {
    // Aquí integrarías con servicios como:
    // - Sentry
    // - LogRocket
    // - Bugsnag
    // - Tu propio servicio de logging
    
    logger.debug('ErrorService', 'Would send error to monitoring service:', errorInfo)
  }

  /**
   * Limpia un error específico
   * @param {string} errorId - ID del error a limpiar
   */
  const clearError = (errorId) => {
    errors.value = errors.value.filter(error => error.id !== errorId)
    
    if (errors.value.length === 0) {
      hasGlobalError.value = false
      lastError.value = null
    } else {
      lastError.value = errors.value[errors.value.length - 1]
    }
  }

  /**
   * Limpia todos los errores
   */
  const clearAllErrors = () => {
    errors.value = []
    hasGlobalError.value = false
    lastError.value = null
  }

  /**
   * Inicializa los listeners de errores globales
   */
  const initializeGlobalHandlers = () => {
    // Errores JavaScript no capturados
    window.addEventListener('error', handleGlobalError)
    
    // Promesas rechazadas no capturadas
    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    
    // Errores de recursos (imágenes, scripts, etc.)
    window.addEventListener('error', handleResourceError, true)

    logger.debug('ErrorHandler', 'Global error handlers initialized')
  }

  /**
   * Limpia los listeners de errores globales
   */
  const cleanupGlobalHandlers = () => {
    window.removeEventListener('error', handleGlobalError)
    window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    window.removeEventListener('error', handleResourceError, true)

    logger.debug('ErrorHandler', 'Global error handlers cleaned up')
  }

  /**
   * Wrapper para funciones async que captura errores automáticamente
   * @param {Function} fn - Función async a envolver
   * @param {string} context - Contexto de la función
   * @returns {Function} - Función envuelta con manejo de errores
   */
  const withErrorBoundary = (fn, context = 'asyncFunction') => {
    return async (...args) => {
      try {
        return await fn(...args)
      } catch (error) {
        captureError(error, context, { args })
        throw error // Re-lanzar para que el código llamador pueda manejarlo
      }
    }
  }

  /**
   * Recuperación de errores para componentes críticos
   * @param {Function} fallbackFn - Función de fallback a ejecutar
   * @param {string} context - Contexto del error
   */
  const recoverFromError = (fallbackFn, context = 'recovery') => {
    try {
      return fallbackFn()
    } catch (error) {
      captureError(error, `${context}_recovery`, { recoveryAttempt: true })
      logger.warn('Recovery function also failed:', error)
      return null
    }
  }

  /**
   * Obtiene estadísticas de errores
   * @returns {Object} - Estadísticas de errores
   */
  const getErrorStats = () => {
    const now = new Date()
    const lastHour = new Date(now.getTime() - 60 * 60 * 1000)
    
    const recentErrors = errors.value.filter(
      error => new Date(error.timestamp) > lastHour
    )

    const errorsByContext = errors.value.reduce((acc, error) => {
      acc[error.context] = (acc[error.context] || 0) + 1
      return acc
    }, {})

    return {
      total: errors.value.length,
      recent: recentErrors.length,
      byContext: errorsByContext,
      hasRecent: recentErrors.length > 0
    }
  }

  return {
    // Estado
    errors,
    hasGlobalError,
    lastError,
    
    // Métodos principales
    captureError,
    clearError,
    clearAllErrors,
    
    // Gestión de handlers
    initializeGlobalHandlers,
    cleanupGlobalHandlers,
    
    // Utilidades
    withErrorBoundary,
    recoverFromError,
    getErrorStats
  }
}
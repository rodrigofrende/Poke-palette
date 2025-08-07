/**
 * Logger condicional para desarrollo y producción
 * En desarrollo muestra todos los logs, en producción solo errores críticos
 */

const isDev = import.meta.env.DEV

export const logger = {
  /**
   * Log de información - solo en desarrollo
   * @param {...any} args - Argumentos a loggear
   */
  log: (...args) => {
    if (isDev) {
      console.log(...args)
    }
  },

  /**
   * Log de información con emoji - solo en desarrollo
   * @param {...any} args - Argumentos a loggear
   */
  info: (...args) => {
    if (isDev) {
      console.info(...args)
    }
  },

  /**
   * Log de advertencia - siempre visible pero con diferente tratamiento
   * @param {...any} args - Argumentos a loggear
   */
  warn: (...args) => {
    if (isDev) {
      console.warn(...args)
    } else {
      // En producción, solo log interno sin mostrar en consola
      // Aquí podrías enviar a un servicio de logging como Sentry
    }
  },

  /**
   * Log de error - siempre visible
   * @param {...any} args - Argumentos a loggear
   */
  error: (...args) => {
    console.error(...args)
    // En producción también podrías enviar a un servicio de error tracking
  },

  /**
   * Log de debug con contexto - solo en desarrollo
   * @param {string} context - Contexto del log
   * @param {...any} args - Argumentos a loggear
   */
  debug: (context, ...args) => {
    if (isDev) {
      console.log(`[${context}]`, ...args)
    }
  },

  /**
   * Log de performance - solo en desarrollo
   * @param {string} label - Etiqueta del timer
   * @param {Function} fn - Función a medir (opcional)
   */
  time: (label, fn) => {
    if (isDev) {
      console.time(label)
      if (fn) {
        const result = fn()
        console.timeEnd(label)
        return result
      }
    } else if (fn) {
      return fn()
    }
  },

  /**
   * Finaliza un timer de performance - solo en desarrollo
   * @param {string} label - Etiqueta del timer
   */
  timeEnd: (label) => {
    if (isDev) {
      console.timeEnd(label)
    }
  },

  /**
   * Log de tabla - solo en desarrollo
   * @param {any} data - Datos a mostrar en tabla
   */
  table: (data) => {
    if (isDev) {
      console.table(data)
    }
  },

  /**
   * Log agrupado - solo en desarrollo
   * @param {string} label - Etiqueta del grupo
   * @param {Function} fn - Función que contiene los logs del grupo
   */
  group: (label, fn) => {
    if (isDev) {
      console.group(label)
      fn()
      console.groupEnd()
    } else {
      fn()
    }
  },

  /**
   * Log agrupado colapsado - solo en desarrollo
   * @param {string} label - Etiqueta del grupo
   * @param {Function} fn - Función que contiene los logs del grupo
   */
  groupCollapsed: (label, fn) => {
    if (isDev) {
      console.groupCollapsed(label)
      fn()
      console.groupEnd()
    } else {
      fn()
    }
  }
}

// Alias para facilitar la migración
export const log = logger.log
export const warn = logger.warn
export const error = logger.error
export const info = logger.info
export const debug = logger.debug

export default logger
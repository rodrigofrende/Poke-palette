import { ref } from 'vue'

/**
 * Composable para manejar errores y notificaciones de la aplicación
 */
export function useErrorHandler() {
  const errorNotification = ref({
    show: false,
    title: '',
    message: '',
    type: 'error'
  })

  /**
   * Muestra una notificación de error
   * @param {string} title - Título del error
   * @param {string} message - Mensaje del error
   * @param {string} type - Tipo de notificación ('error', 'warning', 'info', 'success')
   */
  const showErrorNotification = (title, message, type = 'error') => {
    errorNotification.value = {
      show: true,
      title,
      message,
      type
    }
  }

  /**
   * Cierra la notificación de error actual
   */
  const closeErrorNotification = () => {
    errorNotification.value.show = false
  }

  /**
   * Maneja errores de búsqueda de Pokémon
   * @param {Object} errorData - Datos del error
   */
  const handleSearchError = (errorData) => {
    showErrorNotification(errorData.title, errorData.message, errorData.type)
  }

  /**
   * Maneja errores de análisis de imágenes
   * @param {Error} error - Error de análisis
   */
  const handleAnalysisError = (error) => {
    showErrorNotification(
      'Error de Análisis',
      'No se pudo analizar la imagen del Pokémon. Por favor, intenta con otro Pokémon.',
      'error'
    )
  }

  /**
   * Maneja errores de red/API
   * @param {Error} error - Error de red
   */
  const handleNetworkError = (error) => {
    showErrorNotification(
      'Error de Conexión',
      'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
      'error'
    )
  }

  /**
   * Maneja errores generales
   * @param {Error} error - Error general
   * @param {string} context - Contexto donde ocurrió el error
   */
  const handleGenericError = (error, context = 'aplicación') => {
    showErrorNotification(
      'Error Inesperado',
      `Ha ocurrido un error inesperado en ${context}. Por favor, recarga la página.`,
      'error'
    )
  }

  /**
   * Muestra notificación de éxito
   * @param {string} title - Título del éxito
   * @param {string} message - Mensaje del éxito
   */
  const showSuccessNotification = (title, message) => {
    showErrorNotification(title, message, 'success')
  }

  /**
   * Muestra notificación de información
   * @param {string} title - Título de la información
   * @param {string} message - Mensaje de la información
   */
  const showInfoNotification = (title, message) => {
    showErrorNotification(title, message, 'info')
  }

  /**
   * Muestra notificación de advertencia
   * @param {string} title - Título de la advertencia
   * @param {string} message - Mensaje de la advertencia
   */
  const showWarningNotification = (title, message) => {
    showErrorNotification(title, message, 'warning')
  }

  return {
    // Estado
    errorNotification,
    
    // Métodos generales
    showErrorNotification,
    closeErrorNotification,
    
    // Manejadores específicos
    handleSearchError,
    handleAnalysisError,
    handleNetworkError,
    handleGenericError,
    
    // Notificaciones específicas
    showSuccessNotification,
    showInfoNotification,
    showWarningNotification
  }
}
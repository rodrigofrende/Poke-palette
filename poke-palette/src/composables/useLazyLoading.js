import { ref, computed } from 'vue'

/**
 * Composable para manejar lazy loading
 */
export function useLazyLoading() {
  const loadingStates = ref(new Map())
  const errorStates = ref(new Map())
  const loadedComponents = ref(new Set())

  /**
   * Registrar un componente para lazy loading
   * @param {string} componentName - Nombre del componente
   */
  const registerComponent = (componentName) => {
    loadingStates.value.set(componentName, false)
    errorStates.value.set(componentName, null)
  }

  /**
   * Marcar componente como cargando
   * @param {string} componentName - Nombre del componente
   */
  const setLoading = (componentName) => {
    loadingStates.value.set(componentName, true)
    errorStates.value.set(componentName, null)
  }

  /**
   * Marcar componente como cargado
   * @param {string} componentName - Nombre del componente
   */
  const setLoaded = (componentName) => {
    loadingStates.value.set(componentName, false)
    errorStates.value.set(componentName, null)
    loadedComponents.value.add(componentName)
  }

  /**
   * Marcar componente con error
   * @param {string} componentName - Nombre del componente
   * @param {Error} error - Error ocurrido
   */
  const setError = (componentName, error) => {
    loadingStates.value.set(componentName, false)
    errorStates.value.set(componentName, error)
  }

  /**
   * Verificar si un componente está cargando
   * @param {string} componentName - Nombre del componente
   * @returns {boolean}
   */
  const isLoading = (componentName) => {
    return loadingStates.value.get(componentName) || false
  }

  /**
   * Verificar si un componente tiene error
   * @param {string} componentName - Nombre del componente
   * @returns {boolean}
   */
  const hasError = (componentName) => {
    return errorStates.value.get(componentName) !== null
  }

  /**
   * Verificar si un componente está cargado
   * @param {string} componentName - Nombre del componente
   * @returns {boolean}
   */
  const isLoaded = (componentName) => {
    return loadedComponents.value.has(componentName)
  }

  /**
   * Obtener error de un componente
   * @param {string} componentName - Nombre del componente
   * @returns {Error|null}
   */
  const getError = (componentName) => {
    return errorStates.value.get(componentName) || null
  }

  /**
   * Estadísticas de carga
   */
  const stats = computed(() => ({
    total: loadingStates.value.size,
    loading: Array.from(loadingStates.value.values()).filter(Boolean).length,
    loaded: loadedComponents.value.size,
    errors: Array.from(errorStates.value.values()).filter(Boolean).length
  }))

  /**
   * Limpiar estados
   */
  const clearStates = () => {
    loadingStates.value.clear()
    errorStates.value.clear()
    loadedComponents.value.clear()
  }

  return {
    // Estados
    loadingStates: computed(() => loadingStates.value),
    errorStates: computed(() => errorStates.value),
    loadedComponents: computed(() => loadedComponents.value),
    
    // Métodos
    registerComponent,
    setLoading,
    setLoaded,
    setError,
    isLoading,
    hasError,
    isLoaded,
    getError,
    clearStates,
    
    // Estadísticas
    stats
  }
} 
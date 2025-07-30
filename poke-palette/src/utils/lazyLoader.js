/**
 * Utilidades para lazy loading inteligente
 */

// Cache para componentes ya cargados
const componentCache = new Map()

/**
 * Crea un componente lazy con preloading inteligente
 * @param {Function} importFn - Función de importación
 * @param {string} componentName - Nombre del componente para debugging
 * @returns {Object} Componente async
 */
export function createLazyComponent(importFn, componentName = 'Unknown') {
  return {
    name: `Lazy${componentName}`,
    async setup() {
      try {
        // Verificar si ya está en cache
        if (componentCache.has(componentName)) {
          return componentCache.get(componentName)
        }
        
        // Cargar el componente
        const component = await importFn()
        
        // Guardar en cache
        componentCache.set(componentName, component)
        
        console.log(`✅ Componente ${componentName} cargado exitosamente`)
        return component
      } catch (error) {
        console.error(`❌ Error cargando componente ${componentName}:`, error)
        throw error
      }
    }
  }
}

/**
 * Preload un componente en segundo plano
 * @param {Function} importFn - Función de importación
 * @param {string} componentName - Nombre del componente
 */
export function preloadComponent(importFn, componentName) {
  // Solo preload si no está en cache
  if (!componentCache.has(componentName)) {
    console.log(`🔄 Precargando componente ${componentName}...`)
    
    importFn()
      .then(component => {
        componentCache.set(componentName, component)
        console.log(`✅ Componente ${componentName} precargado exitosamente`)
      })
      .catch(error => {
        console.warn(`⚠️ Error precargando componente ${componentName}:`, error)
      })
  }
}

/**
 * Preload múltiples componentes
 * @param {Array} components - Array de objetos { importFn, name }
 */
export function preloadComponents(components) {
  components.forEach(({ importFn, name }) => {
    preloadComponent(importFn, name)
  })
}

/**
 * Limpiar cache de componentes
 */
export function clearComponentCache() {
  componentCache.clear()
  console.log('🧹 Cache de componentes limpiado')
}

/**
 * Obtener estadísticas del cache
 */
export function getCacheStats() {
  return {
    cachedComponents: componentCache.size,
    componentNames: Array.from(componentCache.keys())
  }
} 
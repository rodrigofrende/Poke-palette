/**
 * Sistema de throttling para limitar solicitudes y evitar rate limiting
 */

class RequestThrottler {
  constructor(maxRequests = 10, timeWindow = 60000) {
    this.maxRequests = maxRequests // Máximo de requests
    this.timeWindow = timeWindow // Ventana de tiempo en ms (default: 1 minuto)
    this.requests = [] // Array de timestamps de requests
    this.queue = [] // Cola de requests pendientes
    this.processing = false
  }

  /**
   * Limpia requests antiguos fuera de la ventana de tiempo
   */
  cleanOldRequests() {
    const now = Date.now()
    this.requests = this.requests.filter(
      timestamp => now - timestamp < this.timeWindow
    )
  }

  /**
   * Verifica si se puede hacer un request
   */
  canMakeRequest() {
    this.cleanOldRequests()
    return this.requests.length < this.maxRequests
  }

  /**
   * Obtiene el tiempo de espera hasta poder hacer el siguiente request
   */
  getWaitTime() {
    this.cleanOldRequests()
    
    if (this.canMakeRequest()) return 0
    
    // Calcular cuánto tiempo hasta que el request más antiguo expire
    const oldestRequest = this.requests[0]
    const waitTime = this.timeWindow - (Date.now() - oldestRequest)
    return Math.max(0, waitTime)
  }

  /**
   * Registra un nuevo request
   */
  registerRequest() {
    this.requests.push(Date.now())
    console.log(`[Throttler] Request registered. ${this.requests.length}/${this.maxRequests} in current window`)
  }

  /**
   * Ejecuta una función con throttling
   * @param {Function} fn - Función a ejecutar
   * @returns {Promise} - Promesa que se resuelve cuando se ejecuta la función
   */
  async throttle(fn) {
    // Si podemos hacer el request inmediatamente
    if (this.canMakeRequest()) {
      this.registerRequest()
      return await fn()
    }

    // Si no, agregar a la cola
    const waitTime = this.getWaitTime()
    console.log(`[Throttler] ⏳ Rate limit reached. Waiting ${Math.ceil(waitTime / 1000)}s before next request`)

    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject, addedAt: Date.now() })
      this.processQueue()
    })
  }

  /**
   * Procesa la cola de requests pendientes
   */
  async processQueue() {
    if (this.processing || this.queue.length === 0) return

    this.processing = true

    while (this.queue.length > 0) {
      if (!this.canMakeRequest()) {
        const waitTime = this.getWaitTime()
        console.log(`[Throttler] 💤 Waiting ${Math.ceil(waitTime / 1000)}s to process next queued request`)
        await new Promise(resolve => setTimeout(resolve, waitTime + 100))
      }

      const item = this.queue.shift()
      if (!item) break

      try {
        this.registerRequest()
        const result = await item.fn()
        item.resolve(result)
      } catch (error) {
        item.reject(error)
      }
    }

    this.processing = false
  }

  /**
   * Obtiene estadísticas del throttler
   */
  getStats() {
    this.cleanOldRequests()
    return {
      currentRequests: this.requests.length,
      maxRequests: this.maxRequests,
      queuedRequests: this.queue.length,
      canMakeRequest: this.canMakeRequest(),
      waitTime: this.getWaitTime()
    }
  }

  /**
   * Reinicia el throttler
   */
  reset() {
    this.requests = []
    this.queue = []
    this.processing = false
    console.log('[Throttler] 🔄 Reset')
  }
}

// Crear instancia global para imágenes de GitHub
// Límite conservador: 10 requests por minuto
export const githubImageThrottler = new RequestThrottler(10, 60000)

// Para requests a la API de PokeAPI (más generoso)
export const pokeApiThrottler = new RequestThrottler(20, 60000)

export default RequestThrottler


<template>
  <div v-if="hasError" class="error-boundary">
    <div class="error-container">
      <div class="error-icon">💥</div>
      <h2>¡Oops! Algo salió mal</h2>
      <p class="error-message">
        {{ errorMessage }}
      </p>
      
      <div class="error-details" v-if="showDetails">
        <h3>Detalles técnicos:</h3>
        <pre class="error-stack">{{ errorStack }}</pre>
      </div>
      
      <div class="error-actions">
        <button @click="retry" class="retry-btn">
          🔄 Intentar de nuevo
        </button>
        <button @click="toggleDetails" class="details-btn">
          {{ showDetails ? '🔼 Ocultar' : '🔽 Ver' }} detalles
        </button>
        <button @click="reportError" class="report-btn">
          📤 Reportar error
        </button>
      </div>
      
      <div class="error-suggestions">
        <h3>¿Qué puedes hacer?</h3>
        <ul>
          <li>Recarga la página</li>
          <li>Verifica tu conexión a internet</li>
          <li>Intenta con un Pokémon diferente</li>
          <li>Si el problema persiste, reporta el error</li>
        </ul>
      </div>
    </div>
  </div>
  <slot v-else />
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useGlobalErrorHandler } from '../../composables/useGlobalErrorHandler.js'
import { logger } from '../../utils/logger.js'

const props = defineProps({
  fallback: {
    type: Function,
    default: null
  },
  context: {
    type: String,
    default: 'ErrorBoundary'
  },
  showRetry: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['error', 'retry'])

const { captureError, clearAllErrors } = useGlobalErrorHandler()

const hasError = ref(false)
const errorMessage = ref('')
const errorStack = ref('')
const showDetails = ref(false)
const retryCount = ref(0)

const handleError = (error, context = props.context) => {
  hasError.value = true
  errorMessage.value = error.message || 'Error desconocido'
  errorStack.value = error.stack || 'Stack trace no disponible'
  
  // Capturar el error globalmente
  captureError(error, context, {
    component: 'ErrorBoundary',
    retryCount: retryCount.value
  })
  
  emit('error', error)
  logger.error('Error Boundary activated:', error)
}

const retry = async () => {
  retryCount.value++
  hasError.value = false
  errorMessage.value = ''
  errorStack.value = ''
  showDetails.value = false
  
  // Limpiar errores previos
  clearAllErrors()
  
  emit('retry', retryCount.value)
  
  // Esperar al siguiente tick para que el componente se re-renderice
  await nextTick()
  
  logger.debug('ErrorBoundary', `Retry attempt #${retryCount.value}`)
}

const toggleDetails = () => {
  showDetails.value = !showDetails.value
}

const reportError = () => {
  // Aquí podrías abrir un modal de reporte o enviar a un servicio
  const errorReport = {
    message: errorMessage.value,
    stack: errorStack.value,
    context: props.context,
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
    retryCount: retryCount.value
  }
  
  logger.info('Error report generated:', errorReport)
  
  // Simular envío de reporte
  alert('Error reportado. Gracias por ayudarnos a mejorar la aplicación.')
}

// Capturar errores de Vue
const errorHandler = (error, instance, info) => {
  handleError(error, `Vue:${info}`)
}

onMounted(() => {
  // Registrar handler de errores de Vue si está disponible
  if (window.app && window.app.config) {
    window.app.config.errorHandler = errorHandler
  }
})

onUnmounted(() => {
  // Limpiar handler si es necesario
  if (window.app && window.app.config && window.app.config.errorHandler === errorHandler) {
    window.app.config.errorHandler = null
  }
})

// Exponer método para uso externo
defineExpose({
  handleError,
  retry,
  hasError
})
</script>

<style scoped>
.error-boundary {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 20px;
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  border-radius: 15px;
  border: 2px solid #fca5a5;
}

.error-container {
  text-align: center;
  max-width: 600px;
  background: white;
  padding: 32px;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 16px;
  animation: shake 0.5s ease-in-out;
}

.error-container h2 {
  color: #dc2626;
  margin-bottom: 12px;
  font-size: 1.8rem;
}

.error-message {
  color: #7f1d1d;
  font-size: 1.1rem;
  margin-bottom: 24px;
  padding: 16px;
  background: #fef2f2;
  border-radius: 8px;
  border-left: 4px solid #dc2626;
}

.error-details {
  margin: 20px 0;
  text-align: left;
}

.error-details h3 {
  color: #7f1d1d;
  margin-bottom: 8px;
  font-size: 1rem;
}

.error-stack {
  background: #1f2937;
  color: #f9fafb;
  padding: 12px;
  border-radius: 6px;
  font-size: 0.8rem;
  overflow-x: auto;
  max-height: 200px;
  overflow-y: auto;
}

.error-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
  margin: 24px 0;
}

.error-actions button {
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.retry-btn {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.details-btn {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
}

.report-btn {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
}

.error-actions button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.error-suggestions {
  text-align: left;
  background: #f9fafb;
  padding: 20px;
  border-radius: 8px;
  margin-top: 20px;
}

.error-suggestions h3 {
  color: #374151;
  margin-bottom: 12px;
  font-size: 1.1rem;
}

.error-suggestions ul {
  color: #6b7280;
  padding-left: 20px;
}

.error-suggestions li {
  margin-bottom: 6px;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

@media (max-width: 768px) {
  .error-container {
    padding: 20px;
    margin: 10px;
  }
  
  .error-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .error-actions button {
    width: 100%;
  }
}
</style>
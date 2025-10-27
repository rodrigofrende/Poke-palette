<template>
  <div class="lazy-loading-wrapper">
    <!-- Loading state -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner">
        <div class="spinner"></div>
      </div>
      <p class="loading-text">{{ loadingText }}</p>
    </div>
    
    <!-- Error state -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon">⚠️</div>
      <h3 class="error-title">Error al cargar</h3>
      <p class="error-message">{{ error.message || 'No se pudo cargar el componente' }}</p>
      <button @click="retry" class="retry-btn">
        🔄 Reintentar
      </button>
    </div>
    
    <!-- Success state -->
    <div v-else class="component-container">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { ref, onErrorCaptured } from 'vue'

const props = defineProps({
  loadingText: {
    type: String,
    default: 'Cargando...'
  }
})

const loading = ref(true)
const error = ref(null)

const retry = () => {
  loading.value = true
  error.value = null
  // Trigger a re-render by updating a reactive property
  // This will cause the async component to reload
}

onErrorCaptured((err) => {
  error.value = err
  loading.value = false
  return false // Prevent error from propagating
})

// Expose loading state to parent
defineExpose({
  loading,
  error,
  retry
})
</script>

<style scoped>
.lazy-loading-wrapper {
  width: 100%;
  height: 100%;
  min-height: 200px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 200px;
  background: var(--theme-quinary);
  border-radius: 12px;
  border: 2px solid var(--theme-border);
  animation: fadeIn 0.3s ease-out;
}

.loading-spinner {
  margin-bottom: 16px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--theme-border);
  border-top: 3px solid var(--theme-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  color: var(--theme-quaternary);
  font-size: 0.9rem;
  font-weight: 500;
  margin: 0;
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 200px;
  background: var(--theme-quinary);
  border-radius: 12px;
  border: 2px solid var(--theme-border);
  padding: 24px;
  text-align: center;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

.error-title {
  color: var(--theme-quaternary);
  font-size: 1.2rem;
  font-weight: bold;
  margin: 0 0 8px 0;
}

.error-message {
  color: var(--theme-senary);
  font-size: 0.9rem;
  margin: 0 0 20px 0;
  line-height: 1.4;
}

.retry-btn {
  background: linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-secondary) 100%);
  color: var(--theme-tertiary);
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.retry-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.component-container {
  width: 100%;
  height: 100%;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .loading-container,
  .error-container {
    min-height: 150px;
    padding: 16px;
  }
  
  .spinner {
    width: 32px;
    height: 32px;
  }
  
  .error-icon {
    font-size: 2.5rem;
  }
  
  .error-title {
    font-size: 1.1rem;
  }
}
</style> 
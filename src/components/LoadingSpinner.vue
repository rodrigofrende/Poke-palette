<template>
  <div class="loading-spinner-container" :class="[size, variant]">
    <div class="loading-spinner">
      <div class="spinner-ring"></div>
      <div class="spinner-ring"></div>
      <div class="spinner-ring"></div>
    </div>
    <p v-if="message" class="loading-message">{{ message }}</p>
  </div>
</template>

<script setup>
const props = defineProps({
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'white'].includes(value)
  },
  message: {
    type: String,
    default: ''
  }
})
</script>

<style scoped>
.loading-spinner-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 20px;
}

.loading-spinner {
  position: relative;
  display: inline-block;
}

.spinner-ring {
  position: absolute;
  border-radius: 50%;
  border: 3px solid transparent;
  animation: spin 1.2s linear infinite;
}

.spinner-ring:nth-child(1) {
  animation-delay: -0.45s;
}

.spinner-ring:nth-child(2) {
  animation-delay: -0.3s;
}

.spinner-ring:nth-child(3) {
  animation-delay: -0.15s;
}

/* Tamaños */
.loading-spinner-container.small .spinner-ring {
  width: 20px;
  height: 20px;
  border-width: 2px;
}

.loading-spinner-container.medium .spinner-ring {
  width: 30px;
  height: 30px;
  border-width: 3px;
}

.loading-spinner-container.large .spinner-ring {
  width: 40px;
  height: 40px;
  border-width: 4px;
}

/* Variantes de color */
.loading-spinner-container.primary .spinner-ring {
  border-top-color: var(--theme-primary);
}

.loading-spinner-container.secondary .spinner-ring {
  border-top-color: var(--theme-secondary);
}

.loading-spinner-container.white .spinner-ring {
  border-top-color: white;
}

.loading-message {
  margin: 0;
  font-size: 14px;
  color: var(--theme-quaternary);
  text-align: center;
  font-weight: 500;
}

.loading-spinner-container.small .loading-message {
  font-size: 12px;
}

.loading-spinner-container.large .loading-message {
  font-size: 16px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Variante centrada para overlays */
.loading-spinner-container.overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
  z-index: 100;
}

/* Responsive */
@media (max-width: 768px) {
  .loading-spinner-container {
    padding: 16px;
    gap: 12px;
  }
  
  .loading-message {
    font-size: 13px;
  }
}
</style> 
<template>
  <div ref="containerRef" class="lazy-image-container" :class="{ 'loaded': isLoaded, 'error': hasError }">
    <!-- Placeholder mientras carga -->
    <div v-if="!isLoaded && !hasError" class="image-placeholder">
      <div class="placeholder-spinner"></div>
    </div>
    
    <!-- Imagen real -->
    <img
      ref="imageRef"
      v-show="isLoaded"
      :key="imageSrc"
      :src="imageSrc"
      :alt="alt"
      :class="imageClass"
      @load="onImageLoad"
      @error="onImageError"
      :style="imageStyle"
    />
    
    <!-- Error state -->
    <div v-if="hasError" class="image-error">
      <div class="error-icon">🖼️</div>
      <p class="error-text">Error al cargar imagen</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'

const props = defineProps({
  src: {
    type: String,
    required: true
  },
  alt: {
    type: String,
    default: ''
  },
  imageClass: {
    type: String,
    default: ''
  },
  imageStyle: {
    type: Object,
    default: () => ({})
  },
  lazy: {
    type: Boolean,
    default: false
  }
})

const containerRef = ref(null)
const imageRef = ref(null)
const isLoaded = ref(false)
const hasError = ref(false)
const imageSrc = ref('')
let observer = null

const onImageLoad = () => {
  isLoaded.value = true
  hasError.value = false
}

const onImageError = () => {
  hasError.value = true
  isLoaded.value = false
  console.error('Error loading image:', props.src)
}

const loadImage = () => {
  if (imageSrc.value !== props.src) {
    imageSrc.value = props.src
  }
}

// Watch for src changes to reload image
watch(() => props.src, (newSrc) => {
  if (newSrc && newSrc !== imageSrc.value) {
    isLoaded.value = false
    hasError.value = false
    
    if (props.lazy && containerRef.value) {
      // Si es lazy, esperar a que sea visible
      setupObserver()
    } else {
      // Si no es lazy, cargar inmediatamente
      loadImage()
    }
  }
}, { immediate: true })

const setupObserver = () => {
  if (!containerRef.value) return
  
  // Limpiar observer anterior si existe
  if (observer) {
    observer.disconnect()
  }
  
  observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        loadImage()
        observer.unobserve(entry.target)
      }
    })
  }, {
    rootMargin: '100px',
    threshold: 0.01
  })
  
  observer.observe(containerRef.value)
}

onMounted(() => {
  if (!props.lazy) {
    // Si no es lazy, cargar inmediatamente
    loadImage()
  } else if (containerRef.value) {
    // Si es lazy, configurar observer
    setupObserver()
  }
})

onBeforeUnmount(() => {
  if (observer) {
    observer.disconnect()
    observer = null
  }
})
</script>

<style scoped>
.lazy-image-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: inherit;
  background: var(--bg-secondary);
}

.image-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%);
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

.placeholder-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--border-light);
  border-top: 4px solid var(--theme-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.lazy-image-container img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  opacity: 0;
  transform: scale(0.95);
  transition: opacity 0.4s ease, transform 0.4s ease;
}

.lazy-image-container.loaded img {
  opacity: 1;
  transform: scale(1);
}

.image-error {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--bg-tertiary);
  color: var(--theme-gray-500);
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.error-icon {
  font-size: 2.5rem;
  margin-bottom: var(--spacing-sm);
  opacity: 0.5;
}

.error-text {
  font-size: var(--text-sm);
  margin: 0;
  text-align: center;
  font-weight: 500;
}

/* Responsive */
@media (max-width: 768px) {
  .placeholder-spinner {
    width: 32px;
    height: 32px;
    border-width: 3px;
  }
  
  .error-icon {
    font-size: 2rem;
  }
  
  .error-text {
    font-size: var(--text-xs);
  }
}

@media (max-width: 480px) {
  .placeholder-spinner {
    width: 28px;
    height: 28px;
  }
  
  .error-icon {
    font-size: 1.5rem;
  }
}
</style> 
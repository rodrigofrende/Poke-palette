<template>
  <div class="lazy-image-container" :class="{ 'loaded': isLoaded }">
    <!-- Placeholder mientras carga -->
    <div v-if="!isLoaded" class="image-placeholder">
      <div class="placeholder-spinner"></div>
    </div>
    
    <!-- Imagen real -->
    <img
      v-show="isLoaded"
      :src="src"
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
import { ref, onMounted } from 'vue'

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
    default: true
  }
})

const isLoaded = ref(false)
const hasError = ref(false)

const onImageLoad = () => {
  isLoaded.value = true
  hasError.value = false
}

const onImageError = () => {
  hasError.value = true
  isLoaded.value = false
}

onMounted(() => {
  if (!props.lazy) {
    // Si no es lazy, cargar inmediatamente
    return
  }
  
  // Implementar Intersection Observer para lazy loading
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // La imagen está visible, cargarla
        const img = entry.target.querySelector('img')
        if (img && img.src !== props.src) {
          img.src = props.src
        }
        observer.unobserve(entry.target)
      }
    })
  }, {
    rootMargin: '50px' // Cargar 50px antes de que sea visible
  })
  
  const container = document.querySelector('.lazy-image-container')
  if (container) {
    observer.observe(container)
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
}

.image-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: var(--theme-quinary);
  border: 2px solid var(--theme-border);
  border-radius: inherit;
}

.placeholder-spinner {
  width: 30px;
  height: 30px;
  border: 3px solid var(--theme-border);
  border-top: 3px solid var(--theme-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.lazy-image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.3s ease;
}

.lazy-image-container.loaded img {
  opacity: 1;
}

.image-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: var(--theme-quinary);
  border: 2px solid var(--theme-border);
  border-radius: inherit;
  color: var(--theme-senary);
}

.error-icon {
  font-size: 2rem;
  margin-bottom: 8px;
}

.error-text {
  font-size: 0.8rem;
  margin: 0;
  text-align: center;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .placeholder-spinner {
    width: 24px;
    height: 24px;
  }
  
  .error-icon {
    font-size: 1.5rem;
  }
  
  .error-text {
    font-size: 0.7rem;
  }
}
</style> 
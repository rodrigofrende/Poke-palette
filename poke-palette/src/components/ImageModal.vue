<template>
  <div v-if="isVisible" class="image-modal-overlay" @click="closeModal">
    <div class="image-modal-content" @click.stop>
      <!-- Botón de cerrar -->
      <button @click="closeModal" class="modal-close-btn">
        <span class="modal-close-icon">×</span>
      </button>
      
      <!-- Imagen amplificada -->
      <div class="modal-image-container">
        <img 
          :src="imageUrl" 
          :alt="imageAlt"
          class="modal-image"
          @error="handleImageError"
        />
      </div>
      
      <!-- Información de la imagen -->
      <div class="modal-image-info" v-if="imageName">
        <h3 class="modal-image-title">{{ imageName }}</h3>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

// Props
const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  },
  imageUrl: {
    type: String,
    required: true
  },
  imageAlt: {
    type: String,
    default: 'Imagen amplificada'
  },
  imageName: {
    type: String,
    default: ''
  }
})

// Emits
const emit = defineEmits(['close'])

// Métodos
const closeModal = () => {
  emit('close')
}

const handleImageError = (event) => {
  console.error('Error al cargar la imagen del modal:', event.target.src)
  // Opcional: mostrar una imagen de error por defecto
  event.target.style.display = 'none'
}

// Cerrar modal con tecla Escape
const handleEscapeKey = (event) => {
  if (event.key === 'Escape' && props.isVisible) {
    closeModal()
  }
}

// Agregar/remover event listener para la tecla Escape
watch(() => props.isVisible, (isVisible) => {
  if (isVisible) {
    document.addEventListener('keydown', handleEscapeKey)
    // Prevenir scroll del body
    document.body.style.overflow = 'hidden'
  } else {
    document.removeEventListener('keydown', handleEscapeKey)
    // Restaurar scroll del body
    document.body.style.overflow = ''
  }
})
</script>

<style scoped>
.image-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  backdrop-filter: blur(5px);
  animation: modalFadeIn 0.3s ease-out;
}

.image-modal-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  background: var(--theme-tertiary);
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  border: 2px solid var(--theme-border);
  overflow: hidden;
  animation: modalSlideIn 0.4s ease-out;
}

.modal-close-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  background: rgba(0, 0, 0, 0.7);
  border: 2px solid var(--theme-border);
  border-radius: 50%;
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
  color: white;
}

.modal-close-btn:hover {
  background: var(--theme-primary);
  color: var(--theme-tertiary);
  transform: scale(1.1);
  border-color: var(--theme-primary);
}

.modal-close-icon {
  font-size: 24px;
  font-weight: bold;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.modal-image-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  max-width: 100%;
  max-height: 100%;
}

.modal-image {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  transition: transform 0.3s ease;
}

.modal-image:hover {
  transform: scale(1.02);
}

.modal-image-info {
  padding: 20px;
  text-align: center;
  border-top: 1px solid var(--theme-border);
  background: var(--theme-quinary);
}

.modal-image-title {
  margin: 0;
  color: var(--theme-quaternary);
  font-size: 1.3rem;
  font-weight: bold;
}

/* Animaciones */
@keyframes modalFadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

@keyframes modalSlideIn {
  0% {
    opacity: 0;
    transform: scale(0.8) translateY(-20px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .image-modal-content {
    max-width: 95vw;
    max-height: 95vh;
  }
  
  .modal-image-container {
    padding: 15px;
  }
  
  .modal-image {
    max-height: 60vh;
  }
  
  .modal-close-btn {
    width: 40px;
    height: 40px;
    top: 10px;
    right: 10px;
  }
  
  .modal-close-icon {
    font-size: 20px;
  }
  
  .modal-image-info {
    padding: 15px;
  }
  
  .modal-image-title {
    font-size: 1.1rem;
  }
}

@media (max-width: 480px) {
  .image-modal-content {
    max-width: 98vw;
    max-height: 98vh;
  }
  
  .modal-image-container {
    padding: 10px;
  }
  
  .modal-image {
    max-height: 50vh;
  }
  
  .modal-close-btn {
    width: 35px;
    height: 35px;
    top: 8px;
    right: 8px;
  }
  
  .modal-close-icon {
    font-size: 18px;
  }
  
  .modal-image-info {
    padding: 12px;
  }
  
  .modal-image-title {
    font-size: 1rem;
  }
}
</style> 
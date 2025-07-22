<template>
  <Transition name="notification">
    <div v-if="show" class="error-notification" :class="type">
      <div class="notification-content">
        <div class="notification-icon">
          <span v-if="type === 'error'">⚠️</span>
          <span v-else-if="type === 'warning'">⚠️</span>
          <span v-else>ℹ️</span>
        </div>
        <div class="notification-text">
          <h4 class="notification-title">{{ title }}</h4>
          <p class="notification-message">{{ message }}</p>
        </div>
        <button 
          @click="closeNotification" 
          class="notification-close"
          aria-label="Cerrar notificación"
        >
          ×
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Error'
  },
  message: {
    type: String,
    default: 'Ha ocurrido un error'
  },
  type: {
    type: String,
    default: 'error',
    validator: (value) => ['error', 'warning', 'info'].includes(value)
  },
  autoClose: {
    type: Boolean,
    default: true
  },
  duration: {
    type: Number,
    default: 5000
  }
})

const emit = defineEmits(['close'])

const closeNotification = () => {
  emit('close')
}

// Auto-close functionality
watch(() => props.show, (newValue) => {
  if (newValue && props.autoClose) {
    setTimeout(() => {
      closeNotification()
    }, props.duration)
  }
})
</script>

<style scoped>
.error-notification {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  max-width: 400px;
  min-width: 300px;
  border-radius: 12px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid;
}

.error-notification.error {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
  border-color: #d63031;
  color: white;
}

.error-notification.warning {
  background: linear-gradient(135deg, #fdcb6e 0%, #e17055 100%);
  border-color: #e17055;
  color: white;
}

.error-notification.info {
  background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
  border-color: #0984e3;
  color: white;
}

.notification-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px 20px;
}

.notification-icon {
  font-size: 20px;
  flex-shrink: 0;
  margin-top: 2px;
}

.notification-text {
  flex: 1;
  min-width: 0;
}

.notification-title {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.2;
}

.notification-message {
  margin: 0;
  font-size: 14px;
  line-height: 1.4;
  opacity: 0.9;
}

.notification-close {
  background: none;
  border: none;
  color: inherit;
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
  flex-shrink: 0;
  margin-top: 2px;
}

.notification-close:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

/* Animaciones */
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%) scale(0.9);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.9);
}

/* Responsive */
@media (max-width: 768px) {
  .error-notification {
    top: 10px;
    right: 10px;
    left: 10px;
    max-width: none;
    min-width: auto;
  }
  
  .notification-content {
    padding: 12px 16px;
  }
  
  .notification-title {
    font-size: 15px;
  }
  
  .notification-message {
    font-size: 13px;
  }
}
</style> 
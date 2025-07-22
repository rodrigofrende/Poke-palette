<template>
  <div class="pokeball-loader-container" :class="[size, variant]">
    <div class="pokeball">
      <div class="pokeball-top"></div>
      <div class="pokeball-center">
        <div class="pokeball-button"></div>
      </div>
      <div class="pokeball-bottom"></div>
    </div>
    <p v-if="message" class="loader-message">{{ message }}</p>
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
.pokeball-loader-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 20px;
}

.pokeball {
  position: relative;
  width: 60px;
  height: 60px;
  animation: spin 2s linear infinite;
}

.pokeball-loader-container.small .pokeball {
  width: 40px;
  height: 40px;
}

.pokeball-loader-container.large .pokeball {
  width: 80px;
  height: 80px;
}

.pokeball-top {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 50%;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
  border-radius: 50% 50% 0 0;
  border: 3px solid #2d3748;
  box-sizing: border-box;
}

.pokeball-bottom {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 50%;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 0 0 50% 50%;
  border: 3px solid #2d3748;
  border-top: none;
  box-sizing: border-box;
}

.pokeball-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 20px;
  background: #2d3748;
  border-radius: 50%;
  border: 3px solid #f8f9fa;
  box-sizing: border-box;
  z-index: 2;
}

.pokeball-loader-container.small .pokeball-center {
  width: 15px;
  height: 15px;
}

.pokeball-loader-container.large .pokeball-center {
  width: 25px;
  height: 25px;
}

.pokeball-button {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 8px;
  height: 8px;
  background: #f8f9fa;
  border-radius: 50%;
  box-sizing: border-box;
}

.pokeball-loader-container.small .pokeball-button {
  width: 6px;
  height: 6px;
}

.pokeball-loader-container.large .pokeball-button {
  width: 10px;
  height: 10px;
}

/* Variantes de color */
.pokeball-loader-container.primary .pokeball-top {
  background: linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-secondary) 100%);
}

.pokeball-loader-container.secondary .pokeball-top {
  background: linear-gradient(135deg, #fdcb6e 0%, #e17055 100%);
}

.pokeball-loader-container.white .pokeball-top {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
}

.pokeball-loader-container.white .pokeball-bottom {
  background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
}

.pokeball-loader-container.white .pokeball-center {
  background: #ffffff;
  border-color: #2d3748;
}

.pokeball-loader-container.white .pokeball-button {
  background: #2d3748;
}

.loader-message {
  margin: 0;
  font-size: 14px;
  color: var(--theme-quaternary);
  text-align: center;
  font-weight: 500;
}

.pokeball-loader-container.small .loader-message {
  font-size: 12px;
}

.pokeball-loader-container.large .loader-message {
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
.pokeball-loader-container.overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  z-index: 100;
  border-radius: 12px;
}

/* Responsive */
@media (max-width: 768px) {
  .pokeball-loader-container {
    padding: 16px;
    gap: 12px;
  }
  
  .loader-message {
    font-size: 13px;
  }
}
</style> 
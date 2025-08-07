<template>
  <div v-if="show" class="analysis-progress">
    <div class="progress-container">
      <div class="progress-header">
        <div class="progress-icon">🎨</div>
        <div class="progress-text">
          <h3>Analizando Pokémon</h3>
          <p>{{ message || 'Procesando imagen...' }}</p>
        </div>
      </div>
      
      <div class="progress-bar-container">
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: `${progress}%` }"
          ></div>
        </div>
        <span class="progress-percentage">{{ Math.round(progress) }}%</span>
      </div>
      
      <div class="progress-details">
        <div class="progress-step">
          <span class="step-icon">🔍</span>
          <span :class="{ active: progress >= 25 }">Muestreando píxeles</span>
        </div>
        <div class="progress-step">
          <span class="step-icon">⚡</span>
          <span :class="{ active: progress >= 50 }">Agrupando colores</span>
        </div>
        <div class="progress-step">
          <span class="step-icon">🎯</span>
          <span :class="{ active: progress >= 75 }">Seleccionando paleta</span>
        </div>
        <div class="progress-step">
          <span class="step-icon">✨</span>
          <span :class="{ active: progress >= 100 }">Finalizando</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  show: {
    type: Boolean,
    default: false
  },
  progress: {
    type: Number,
    default: 0
  },
  message: {
    type: String,
    default: ''
  }
})
</script>

<style scoped>
.analysis-progress {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease-out;
}

.progress-container {
  background: var(--theme-quinary);
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  border: 2px solid var(--theme-border);
  max-width: 400px;
  width: 90%;
}

.progress-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.progress-icon {
  font-size: 3rem;
  animation: pulse 2s infinite;
}

.progress-text h3 {
  margin: 0 0 4px 0;
  color: var(--theme-quaternary);
  font-size: 1.4rem;
  font-weight: bold;
}

.progress-text p {
  margin: 0;
  color: var(--theme-senary);
  font-size: 0.9rem;
}

.progress-bar-container {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: var(--theme-border);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--theme-primary), var(--theme-secondary));
  border-radius: 4px;
  transition: width 0.3s ease;
  animation: shimmer 2s infinite;
}

.progress-percentage {
  font-weight: bold;
  color: var(--theme-quaternary);
  font-size: 0.9rem;
  min-width: 40px;
  text-align: right;
}

.progress-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.progress-step {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  background: var(--theme-tertiary);
  border: 1px solid var(--theme-border);
  transition: all 0.3s ease;
}

.progress-step.active {
  background: linear-gradient(135deg, var(--theme-primary), var(--theme-secondary));
  color: white;
  transform: scale(1.02);
}

.step-icon {
  font-size: 1.2rem;
  opacity: 0.7;
}

.progress-step.active .step-icon {
  opacity: 1;
}

.progress-step span:last-child {
  font-size: 0.8rem;
  font-weight: 500;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

@keyframes shimmer {
  0% {
    background-position: -200% center;
  }
  100% {
    background-position: 200% center;
  }
}

.progress-fill {
  background: linear-gradient(
    90deg,
    var(--theme-primary) 0%,
    var(--theme-secondary) 25%,
    var(--theme-primary) 50%,
    var(--theme-secondary) 75%,
    var(--theme-primary) 100%
  );
  background-size: 200% 100%;
}

@media (max-width: 768px) {
  .progress-container {
    padding: 24px;
    margin: 20px;
  }
  
  .progress-details {
    grid-template-columns: 1fr;
  }
  
  .progress-step {
    padding: 6px 10px;
  }
  
  .progress-step span:last-child {
    font-size: 0.75rem;
  }
}
</style>
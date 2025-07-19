<template>
  <div class="theme-status">
    <div class="theme-indicator">
      <div class="theme-dot" :class="{ 'improved': isContrastImproved }"></div>
      <span class="theme-label">{{ themeName }}</span>
    </div>
    
    <div class="theme-actions">
      <button 
        v-if="!isContrastImproved" 
        @click="$emit('improve-contrast')" 
        class="theme-btn improve"
        title="Mejorar contraste global"
      >
        🎯 Mejorar
      </button>
      
      <button 
        v-if="isContrastImproved" 
        @click="$emit('restore-theme')" 
        class="theme-btn restore"
        title="Restaurar tema original"
      >
        🔄 Restaurar
      </button>
      
      <button 
        @click="$emit('reset-theme')" 
        class="theme-btn reset"
        title="Volver al tema por defecto"
      >
        🏠 Reset
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  themeName: {
    type: String,
    default: 'Tema Original'
  },
  isContrastImproved: {
    type: Boolean,
    default: false
  }
})

defineEmits(['improve-contrast', 'restore-theme', 'reset-theme'])
</script>

<style scoped>
.theme-status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 15px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  margin-bottom: 15px;
}

.theme-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
}

.theme-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #e53e3e;
  transition: all 0.3s ease;
}

.theme-dot.improved {
  background: #38a169;
  box-shadow: 0 0 8px rgba(56, 161, 105, 0.5);
}

.theme-label {
  font-size: 0.8em;
  font-weight: 600;
  color: var(--theme-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.theme-actions {
  display: flex;
  gap: 8px;
}

.theme-btn {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.7em;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}

.theme-btn.improve {
  background: linear-gradient(135deg, #4CAF50, #8BC34A);
  color: white;
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
}

.theme-btn.improve:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
}

.theme-btn.restore {
  background: linear-gradient(135deg, #FF9800, #FFC107);
  color: white;
  box-shadow: 0 2px 8px rgba(255, 152, 0, 0.3);
}

.theme-btn.restore:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 152, 0, 0.4);
}

.theme-btn.reset {
  background: rgba(255, 255, 255, 0.2);
  color: var(--theme-tertiary);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.theme-btn.reset:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .theme-status {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }
  
  .theme-actions {
    width: 100%;
    justify-content: center;
  }
}
</style> 
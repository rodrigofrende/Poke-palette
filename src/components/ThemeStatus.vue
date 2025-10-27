<template>
  <div class="theme-status">
    <div class="theme-indicator">
      <div class="theme-dot"></div>
      <span class="theme-label">Tema Aplicado</span>
    </div>
    
    <div class="theme-actions">
      <button 
        @click="$emit('restore-theme')" 
        class="theme-btn restore"
        title="Restaurar tema original"
      >
        🔄 Restaurar
      </button>
      <button 
        @click="$emit('reset-theme')" 
        class="theme-btn reset"
        title="Resetear tema"
      >
        🔄 Reset
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  hasCustomTheme: {
    type: Boolean,
    default: false
  }
})

defineEmits(['restore-theme', 'reset-theme'])
</script>

<style scoped>
.theme-status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--theme-quinary);
  border-radius: 12px;
  border: 1px solid var(--theme-border);
  margin-bottom: 16px;
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
  background: var(--theme-primary);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.theme-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--theme-quaternary);
}

.theme-actions {
  display: flex;
  gap: 8px;
}

.theme-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 4px;
}

.theme-btn.restore {
  background: var(--theme-secondary);
  color: white;
}

.theme-btn.reset {
  background: var(--theme-tertiary);
  color: var(--theme-quaternary);
  border: 1px solid var(--theme-border);
}

.theme-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

@media (max-width: 768px) {
  .theme-status {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
  
  .theme-actions {
    width: 100%;
    justify-content: center;
  }
}
</style> 
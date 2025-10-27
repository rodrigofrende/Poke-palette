<template>
  <Transition name="slide-down">
    <div v-if="showBar" class="theme-palette-bar">
      <div class="bar-content">
        <div class="bar-header">
          <div class="bar-icon">🎨</div>
          <div class="bar-text">
            <span class="bar-title">✨ Tema de {{ pokemonName }} aplicado</span>
            <span class="bar-subtitle">{{ colorCount }} colores transformando la UI - 👀 Explora la app para ver los cambios</span>
          </div>
        </div>
        
        <!-- Barra de colores de la paleta -->
        <div class="color-strip">
          <div 
            v-for="(color, index) in paletteColors" 
            :key="index"
            class="color-segment"
            :style="{ backgroundColor: color }"
            :title="color"
          />
        </div>
        
        <div class="bar-actions">
          <button @click="$emit('restore')" class="bar-btn secondary" title="Restaurar tema original">
            <span>🔄</span>
          </button>
          <button @click="$emit('close')" class="bar-btn primary" title="Cerrar">
            <span>×</span>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  showBar: {
    type: Boolean,
    default: false
  },
  pokemonName: {
    type: String,
    default: 'Pokémon'
  },
  paletteColors: {
    type: Array,
    default: () => []
  },
  colorCount: {
    type: Number,
    default: 0
  }
})

defineEmits(['restore', 'close'])
</script>

<style scoped>
.theme-palette-bar {
  position: fixed;
  top: 60px;
  left: 0;
  right: 0;
  z-index: var(--z-fixed);
  background: var(--bg-primary);
  border-bottom: 2px solid var(--border-color);
  box-shadow: var(--shadow-lg);
  animation: pulse-glow 2s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% {
    box-shadow: var(--shadow-lg);
  }
  50% {
    box-shadow: 0 8px 32px rgba(255, 107, 107, 0.3);
  }
}

.bar-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-sm) var(--spacing-md);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.bar-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-shrink: 0;
}

.bar-icon {
  font-size: 1.5rem;
  animation: rotate-icon 3s ease-in-out infinite;
}

@keyframes rotate-icon {
  0%, 100% {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(15deg);
  }
}

.bar-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.bar-title {
  font-size: var(--text-base);
  font-weight: 700;
  color: var(--theme-gray-900);
  display: flex;
  align-items: center;
  gap: 4px;
}

.bar-subtitle {
  font-size: var(--text-sm);
  color: var(--theme-gray-700);
  font-weight: 500;
  background: linear-gradient(90deg, var(--theme-primary), var(--theme-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: shimmer 3s ease-in-out infinite;
}

@keyframes shimmer {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.color-strip {
  flex: 1;
  display: flex;
  gap: 2px;
  height: 32px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
}

.color-segment {
  flex: 1;
  min-width: 0;
  transition: all var(--transition-base);
  cursor: pointer;
  position: relative;
}

.color-segment:hover {
  transform: scaleY(1.1);
  z-index: 1;
  box-shadow: var(--shadow-md);
}

.bar-actions {
  display: flex;
  gap: var(--spacing-xs);
  flex-shrink: 0;
}

.bar-btn {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-lg);
  transition: all var(--transition-base);
  background: var(--bg-secondary);
  color: var(--theme-gray-700);
}

.bar-btn:hover {
  transform: scale(1.1);
  box-shadow: var(--shadow-sm);
}

.bar-btn.primary {
  background: var(--bg-tertiary);
}

.bar-btn.primary:hover {
  background: var(--theme-danger);
  color: white;
}

.bar-btn.secondary:hover {
  background: var(--theme-primary);
  color: white;
}

/* Transiciones */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.slide-down-enter-from {
  transform: translateY(-100%);
  opacity: 0;
}

.slide-down-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .theme-palette-bar {
    top: auto;
    bottom: 0;
    border-bottom: none;
    border-top: 2px solid var(--border-color);
  }
  
  .bar-content {
    padding: var(--spacing-xs) var(--spacing-sm);
    flex-wrap: wrap;
  }
  
  .bar-header {
    flex: 1;
    min-width: 120px;
  }
  
  .bar-title {
    font-size: var(--text-sm);
  }
  
  .bar-subtitle {
    font-size: var(--text-xs);
  }
  
  .color-strip {
    height: 28px;
    order: 3;
    width: 100%;
    margin-top: var(--spacing-xs);
  }
  
  .bar-actions {
    order: 2;
  }
  
  .slide-down-enter-from,
  .slide-down-leave-to {
    transform: translateY(100%);
  }
}

@media (max-width: 480px) {
  .bar-icon {
    font-size: 1.2rem;
  }
  
  .color-strip {
    height: 24px;
  }
  
  .bar-btn {
    width: 28px;
    height: 28px;
    font-size: var(--text-base);
  }
}
</style>


<template>
  <div class="results-section">
    <h3>Paleta de Colores de {{ pokemonName }}</h3>
    
    <!-- Color palette -->
    <div class="palette-display">
      <div 
        v-for="(color, index) in palette" 
        :key="index"
        class="color-item"
        @click="copyColor(color.hex)"
      >
        <div 
          class="color-swatch" 
          :style="{ backgroundColor: color.hex }"
        ></div>
        <div class="color-info">
          <span class="color-hex">{{ color.hex }}</span>
          <span class="color-rgb">RGB({{ color.rgb.join(', ') }})</span>
          <span class="color-percentage">{{ color.percentage.toFixed(1) }}%</span>
        </div>
      </div>
    </div>
    
    <!-- Botones de theme -->
    <div class="theme-buttons">
      <button @click="$emit('apply-theme')" class="theme-btn apply">
        Aplicar paleta como theme
      </button>
      <button @click="$emit('restore-theme')" class="theme-btn restore">
        Restaurar theme por defecto
      </button>
    </div>
  </div>
</template>

<script setup>
// Props
const props = defineProps({
  palette: {
    type: Array,
    required: true
  },
  pokemonName: {
    type: String,
    default: 'la imagen'
  }
})

// Emits
const emit = defineEmits(['apply-theme', 'restore-theme'])

// Methods
const copyColor = async (hex) => {
  try {
    await navigator.clipboard.writeText(hex)
  } catch (error) {
    console.error('Error copying color:', error)
  }
}
</script>

<style scoped>
.results-section {
  background: var(--theme-tertiary);
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--theme-border);
}

.results-section h3 {
  color: var(--theme-quaternary);
  margin-bottom: 20px;
  text-align: center;
}

.palette-display {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  margin-bottom: 30px;
}

.color-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  border-radius: 10px;
  background: var(--theme-quinary);
  cursor: pointer;
  transition: transform 0.2s ease;
  border: 1px solid var(--theme-border);
}

.color-item:hover {
  transform: translateY(-2px);
}

.color-swatch {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  border: 2px solid var(--theme-border);
}

.color-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.color-hex {
  font-weight: bold;
  font-family: monospace;
  font-size: 1.1rem;
  color: var(--theme-quaternary);
}

.color-rgb {
  font-size: 0.9rem;
  color: var(--theme-quaternary);
  opacity: 0.7;
}

.color-percentage {
  font-size: 0.8rem;
  color: var(--theme-quaternary);
  opacity: 0.5;
}

.theme-buttons {
  display: flex;
  gap: 16px;
  margin: 24px 0 0 0;
  justify-content: center;
}

.theme-btn {
  padding: 10px 22px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  border: 2px solid var(--theme-border);
  transition: background 0.3s, color 0.3s, transform 0.2s;
}

.theme-btn.apply {
  background: var(--theme-primary);
  color: var(--theme-tertiary);
  border-color: var(--theme-primary);
}

.theme-btn.restore {
  background: var(--theme-quinary);
  color: var(--theme-quaternary);
  border-color: var(--theme-border);
}

.theme-btn:hover {
  transform: scale(1.05);
  filter: brightness(1.1);
  border-color: var(--theme-border-hover);
}

@media (max-width: 768px) {
  .palette-display {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .theme-buttons {
    flex-direction: column;
    align-items: center;
  }
}

@media (max-width: 480px) {
  .palette-display {
    grid-template-columns: 1fr;
  }
}
</style> 
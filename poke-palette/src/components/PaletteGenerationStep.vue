<template>
  <div v-if="palette.length > 0" class="palette-step-container">
    <!-- Botones principales en la parte superior -->
    <div class="main-actions">
      <div class="action-buttons">
        <button @click="handleApplyTheme" class="action-btn apply-theme">
          <span class="btn-icon">🎨</span>
          <span class="btn-text">Aplicar Paleta</span>
        </button>
        <button @click="handleRestoreTheme" class="action-btn restore-theme">
          <span class="btn-icon">🔄</span>
          <span class="btn-text">Restaurar Tema</span>
        </button>
      </div>
    </div>

    <!-- Tabs de navegación -->
    <TabNavigation 
      :tabs="tabs"
      :active-tab="activeTab"
      @tab-change="handleTabChange"
    />

    <!-- Contenido del tab Paleta de Colores -->
    <div v-if="activeTab === 'palette'" class="tab-content">
      <ColorPalette 
        :palette="palette"
        :pokemon-name="pokemonName"
        @apply-theme="handleApplyTheme"
        @restore-theme="handleRestoreTheme"
        @update-palette="handleUpdatePalette"
      />
    </div>

    <!-- Contenido del tab Exportar -->
    <div v-if="activeTab === 'export'" class="tab-content">
      <ExportSection 
        :palette="palette"
        :pokemon-name="pokemonName"
      />
    </div>
  </div>
  
  <div v-else class="empty-state">
    <div class="empty-icon">🎨</div>
    <h3>No hay paleta disponible</h3>
    <p>Primero debes generar una paleta en el paso anterior</p>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import ColorPalette from './ColorPalette.vue'
import ExportSection from './ExportSection.vue'
import TabNavigation from './TabNavigation.vue'
import { formatPokemonName } from '../utils/formatters.js'

// Props
const props = defineProps({
  palette: {
    type: Array,
    default: () => []
  },
  selectedPokemon: {
    type: Object,
    default: null
  }
})

// Emits
const emit = defineEmits(['apply-theme', 'restore-theme', 'update-palette'])

// Reactive data
const activeTab = ref('palette')

// Tabs configuration
const tabs = [
  { id: 'palette', title: 'Paleta de Colores', icon: '🎨' },
  { id: 'export', title: 'Exportar', icon: '📤' }
]

// Computed
const pokemonName = computed(() => {
  return props.selectedPokemon ? formatPokemonName(props.selectedPokemon.name) : 'la imagen'
})

// Methods
const handleTabChange = (tabId) => {
  activeTab.value = tabId
}

// Methods
const handleApplyTheme = () => {
  // Extraer solo los códigos hex de la paleta
  const colorHexes = props.palette.map(color => color.hex)
  emit('apply-theme', colorHexes)
}

const handleRestoreTheme = () => {
  emit('restore-theme')
}

const handleUpdatePalette = (updatedPalette) => {
  emit('update-palette', updatedPalette)
}
</script>

<style scoped>
.palette-step-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
}

/* Estilos para los botones principales */
.main-actions {
  background: var(--theme-quinary);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid var(--theme-border);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 8px;
}

.action-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  min-width: 160px;
  justify-content: center;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.action-btn.apply-theme {
  background: linear-gradient(135deg, var(--theme-primary), var(--theme-secondary));
  color: white;
  border-color: var(--theme-primary);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.action-btn.apply-theme:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  background: linear-gradient(135deg, var(--theme-secondary), var(--theme-primary));
}

.action-btn.restore-theme {
  background: linear-gradient(135deg, #f7fafc, #ffffff);
  color: var(--theme-quaternary);
  border-color: var(--theme-border);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.action-btn.restore-theme:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  border-color: var(--theme-primary);
  background: linear-gradient(135deg, #ffffff, #f7fafc);
}

.btn-icon {
  font-size: 1.1rem;
}

.btn-text {
  font-weight: 600;
}

.tab-content {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: var(--theme-quaternary);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  color: var(--theme-primary);
}

.empty-state p {
  margin: 0;
  opacity: 0.8;
}

/* Responsive */
@media (max-width: 768px) {
  .main-actions {
    padding: 12px;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 8px;
  }
  
  .action-btn {
    min-width: auto;
    width: 100%;
    padding: 14px 16px;
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .main-actions {
    padding: 10px;
  }
  
  .action-btn {
    padding: 12px 14px;
    font-size: 0.85rem;
  }
  
  .btn-icon {
    font-size: 1rem;
  }
}
</style> 
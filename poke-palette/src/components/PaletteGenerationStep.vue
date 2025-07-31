<template>
  <div v-if="palette.length > 0" class="palette-step-container">
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
const handleApplyTheme = (colorHexes) => {
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


</style> 
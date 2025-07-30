<template>
  <div v-if="palette.length > 0">
    <ColorPalette 
      :palette="palette"
      :pokemon-name="pokemonName"
      @apply-theme="handleApplyTheme"
      @restore-theme="handleRestoreTheme"
      @update-palette="handleUpdatePalette"
    />
  </div>
  
  <div v-else class="empty-state">
    <div class="empty-icon">🎨</div>
    <h3>No hay paleta disponible</h3>
    <p>Primero debes generar una paleta en el paso anterior</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import ColorPalette from './ColorPalette.vue'
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

// Computed
const pokemonName = computed(() => {
  return props.selectedPokemon ? formatPokemonName(props.selectedPokemon.name) : 'la imagen'
})

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
/* Usar estilos compartidos */

/* Estilos específicos para este componente */
</style> 
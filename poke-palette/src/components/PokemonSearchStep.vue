<template>
  <div class="step-container">
    <div class="step-content">
      <!-- Estado de búsqueda: Mostrar buscador directamente -->
      <div v-if="!currentSelectedPokemon">
        <PokemonSearch 
          :is-shiny="isShiny"
          :disabled="loadingPokemon || selectingPokemon"
          @select-pokemon="selectPokemonFromAPI"
          @update-shiny="updateShiny"
          @search-error="handleSearchError"
        />
      </div>
      
      <!-- Estado con Pokémon seleccionado -->
      <div v-if="currentSelectedPokemon || selectingPokemon">
        <!-- Loader mientras se carga el Pokémon -->
        <div v-if="loadingPokemon || selectingPokemon" class="loading-overlay">
          <PokeballLoader 
            size="large" 
            variant="primary"
            message="¡Atrapando Pokémon!"
          />
        </div>
        
        <!-- Tarjeta del Pokémon seleccionado -->
        <PokemonCard 
          v-if="currentSelectedPokemon && !loadingPokemon && !selectingPokemon"
          :pokemon="currentSelectedPokemon"
          :is-shiny="isShiny"
          @analyze="analyzeSelectedPokemon"
          @image-selected="handleImageSelected"
          @close="closePokemonCard"
          @update-shiny="updateShiny"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import PokemonSearch from './PokemonSearch.vue'
import PokemonCard from './PokemonCard.vue'
import PokeballLoader from './PokeballLoader.vue'
import { getPokemonDetails, getPokemonSpecies } from '../services/pokeApi.js'
import { formatPokemonName } from '../utils/formatters.js'

// Props
const props = defineProps({
  isShiny: {
    type: Boolean,
    default: false
  },
  selectedPokemon: {
    type: Object,
    default: null
  }
})

// Emits
const emit = defineEmits(['pokemon-selected', 'search-error', 'update-shiny'])

// Reactive data
const localSelectedPokemon = ref(null)
const loadingPokemon = ref(false)
const selectingPokemon = ref(false)

// Computed para usar el Pokémon del prop o el local
const currentSelectedPokemon = computed(() => {
  return props.selectedPokemon || localSelectedPokemon.value
})

// Watcher para sincronizar el estado local cuando cambie el prop
watch(() => props.selectedPokemon, (newPokemon) => {
  if (newPokemon && !localSelectedPokemon.value) {
    // Si viene un Pokémon del prop y no hay uno local, limpiar el local
    localSelectedPokemon.value = null
  }
}, { immediate: true })

const selectPokemonFromAPI = async (pokemon) => {
  selectingPokemon.value = true
  loadingPokemon.value = true
  
  try {
    const [details, species] = await Promise.all([
      getPokemonDetails(pokemon.name),
      getPokemonSpecies(pokemon.name)
    ])
    
    const baseUrl = props.isShiny 
      ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${details.id}.png`
      : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${details.id}.png`
    
    localSelectedPokemon.value = {
      ...details,
      species,
      imageUrl: baseUrl
    }
    
    emit('pokemon-selected', localSelectedPokemon.value)
  } catch (error) {
    console.error('Error fetching Pokémon details:', error)
    emit('search-error', {
      title: 'Pokémon no disponible',
      message: `Lo sentimos, "${formatPokemonName(pokemon.name)}" no está disponible en este momento. Intenta con otro Pokémon.`,
      type: 'warning'
    })
  } finally {
    loadingPokemon.value = false
    selectingPokemon.value = false
  }
}

const updateShiny = (value) => {
  emit('update-shiny', value)
}

const handleSearchError = (errorData) => {
  emit('search-error', errorData)
}

const handleImageSelected = (image) => {
  // Si el Pokémon viene del prop, no podemos modificarlo directamente
  // Solo podemos modificar el local
  if (localSelectedPokemon.value) {
    localSelectedPokemon.value.imageUrl = image.url
  }
  // Si viene del prop, emitir el evento para que el padre lo actualice
  if (props.selectedPokemon && !localSelectedPokemon.value) {
    emit('pokemon-selected', {
      ...props.selectedPokemon,
      imageUrl: image.url
    })
  }
}

const closePokemonCard = () => {
  localSelectedPokemon.value = null
  selectingPokemon.value = false
  loadingPokemon.value = false
  // Emitir evento al padre para limpiar el selectedPokemon global
  emit('pokemon-selected', null)
}

const analyzeSelectedPokemon = () => {
  // Usar el Pokémon actual (del prop o local)
  const pokemonToAnalyze = currentSelectedPokemon.value
  if (pokemonToAnalyze) {
    emit('analyze-pokemon', pokemonToAnalyze)
  }
}
</script>

<style scoped>
/* Usar estilos compartidos */

.search-container {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  transition: all 0.3s ease;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 15px;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  animation: fadeIn 0.3s ease-in-out;
}

@media (max-width: 768px) {
  .search-container {
    padding: 0 10px;
  }
}
</style> 
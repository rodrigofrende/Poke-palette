<template>
  <div class="search-section">
    <div class="search-container">
      <input 
        v-model="searchQuery"
        @input="searchPokemon"
        :placeholder="disabled ? 'Cargando Pokémon...' : 'Buscar Pokémon por nombre...'"
        class="search-input"
        :class="{ 'disabled': disabled }"
        :disabled="disabled"
        aria-label="Buscar Pokémon"
        role="searchbox"
        autocomplete="off"
      />
      <div class="search-icon">🔍</div>
    </div>
    
    <!-- Botón de Pokémon aleatorio -->
    <div class="random-pokemon-section">
      <button 
        @click="handleRandomPokemon"
        :disabled="loadingRandom || disabled"
        class="random-pokemon-btn"
        :class="{ 'disabled': disabled }"
        aria-label="Obtener Pokémon aleatorio"
      >
        <span class="btn-icon">🎲</span>
        <span class="btn-text">{{ 
          disabled ? 'Cargando...' : 
          loadingRandom ? 'Cargando...' : 
          '¡Pokémon Aleatorio!' 
        }}</span>
      </button>
    </div>
    
    <!-- Search results with animations -->
    <TransitionGroup 
      name="search-results" 
      tag="div" 
      class="search-results"
      v-if="searchResults.length > 0"
    >
      <div 
        v-for="(pokemon, index) in searchResults"
        :key="pokemon.name"
        @click="!disabled && selectPokemon(pokemon)"
        @keydown.enter="!disabled && selectPokemon(pokemon)"
        @keydown.space="!disabled && selectPokemon(pokemon)"
        class="search-item"
        :class="{ 'disabled': disabled }"
        :style="{ animationDelay: `${index * 0.1}s` }"
        role="button"
        :aria-label="`Seleccionar ${formatPokemonName(pokemon.name)}`"
        :tabindex="disabled ? -1 : 0"
      >
        <div class="pokemon-thumbnail-container">
          <img 
            :src="getPokemonImageUrl(pokemon.id || extractIdFromUrl(pokemon.url), isShiny)"
            :alt="pokemon.name"
            class="pokemon-thumbnail"
            @error="handleImageError"
          />
          <div class="pokemon-number">#{{ pokemon.id || extractIdFromUrl(pokemon.url) }}</div>
        </div>
        
        <div class="pokemon-details">
          <h4 class="pokemon-name">{{ formatPokemonName(pokemon.name) }}</h4>
          <div class="pokemon-types" v-if="pokemon.types">
            <TypeBadge 
              v-for="type in pokemon.types" 
              :key="type.type.name"
              :type="type.type.name"
            />
          </div>
        </div>
        
        <div class="select-indicator">
          <span class="select-arrow">→</span>
        </div>
      </div>
    </TransitionGroup>
    
    <!-- Loading state -->
    <div v-if="searching" class="search-loading">
      <div class="loading-spinner"></div>
      <p>Buscando Pokémon...</p>
      <div class="loading-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
    
    <!-- No results -->
    <div v-if="searchQuery.length >= 2 && searchResults.length === 0 && !searching" class="no-results">
      <p>No se encontraron Pokémon con "{{ searchQuery }}"</p>
    </div>
    
    <!-- Loading state message -->
    <div v-if="disabled && !searching" class="loading-message">
      <p>Espera mientras se carga el Pokémon...</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { getPokemonImageUrl, getRandomPokemon } from '../services/pokeApi.js'
import TypeBadge from './TypeBadge.vue'
import { formatPokemonName, extractIdFromUrl } from '../utils/formatters.js'

// Props
const props = defineProps({
  isShiny: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['select-pokemon', 'update-shiny', 'search-error'])

// Reactive data
const searchQuery = ref('')
const searchResults = ref([])
const searching = ref(false)
const loadingRandom = ref(false)



// Methods
const searchPokemon = async () => {
  if (searchQuery.value.length < 2) {
    searchResults.value = []
    return
  }
  
  searching.value = true
  
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=1025`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    
    const filtered = data.results.filter(pokemon => 
      pokemon.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    ).slice(0, 10)
    
    const pokemonWithIds = filtered.map((pokemon, index) => ({
      ...pokemon,
      id: extractIdFromUrl(pokemon.url)
    }))
    
    searchResults.value = pokemonWithIds
  } catch (error) {
    console.error('Error searching Pokémon:', error)
    searchResults.value = []
    // Emitir evento de error para que el componente padre lo maneje
    emit('search-error', {
      title: 'Error de conexión',
      message: 'No se pudo conectar con la base de datos de Pokémon. Verifica tu conexión a internet e intenta nuevamente.',
      type: 'error'
    })
  } finally {
    searching.value = false
  }
}

// Función para obtener un Pokémon aleatorio
const handleRandomPokemon = async () => {
  loadingRandom.value = true
  
  try {
    const randomPokemon = await getRandomPokemon()
    
    // Emitir el Pokémon aleatorio seleccionado
    emit('select-pokemon', randomPokemon)
    
    // Limpiar búsqueda y resultados
    searchQuery.value = ''
    searchResults.value = []
    
  } catch (error) {
    console.error('Error getting random Pokémon:', error)
    // Emitir evento de error para que el componente padre lo maneje
    emit('search-error', {
      title: 'Error al obtener Pokémon aleatorio',
      message: 'No se pudo obtener un Pokémon aleatorio. Verifica tu conexión a internet e intenta nuevamente.',
      type: 'error'
    })
  } finally {
    loadingRandom.value = false
  }
}


const handleImageError = (event) => {
  event.target.src = 'https://via.placeholder.com/96x96?text=Pokemon'
}

const selectPokemon = (pokemon) => {
  emit('select-pokemon', pokemon)
  // Limpiar búsqueda y resultados
  searchQuery.value = ''
  searchResults.value = []
  
  // Enfocar el input de búsqueda después de seleccionar
  const searchInput = document.querySelector('.search-input')
  if (searchInput) {
    searchInput.focus()
  }
}
</script>

<style scoped>
.search-section {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.search-container {
  position: relative;
  max-width: 500px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
  flex-shrink: 0;
}

.search-input {
  width: 100%;
  padding: 12px 20px 12px 50px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s ease;
  background: #ffffff;
  color: #2d3748;
  font-weight: 500;
}

.search-input::placeholder {
  color: #718096;
  opacity: 0.8;
  font-weight: 500;
}

.search-input:focus {
  outline: none;
  border-color: var(--theme-primary);
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
  background: var(--theme-tertiary);
}

.search-input.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: var(--theme-quinary);
}

.search-input.disabled:focus {
  border-color: var(--theme-border);
  box-shadow: none;
  background: var(--theme-quinary);
}

.search-icon {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
  color: #4a5568;
}



.search-results {
  max-width: 600px;
  margin: 0 auto;
  background: var(--theme-tertiary);
  border-radius: 12px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  flex-grow: 1;
  overflow-y: auto;
  overflow-x: hidden;
  border: 1px solid var(--theme-border);
  max-height: 320px;
}

.search-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 1px solid var(--theme-border);
  animation: slideIn 0.3s ease-out;
  width: 100%;
  box-sizing: border-box;
  min-height: 60px;
}

.search-item:last-child {
  border-bottom: none;
}

.search-item:hover:not(.disabled) {
  background: linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-secondary) 100%);
  color: var(--theme-tertiary);
  transform: translateX(5px);
}

.search-item.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
}

.search-item.disabled:hover {
  background: none;
  color: inherit;
  transform: none;
}

.search-item:hover:not(.disabled) .pokemon-name {
  color: var(--theme-tertiary);
}

.search-item:hover:not(.disabled) .type-badge {
  opacity: 0.8;
}

.pokemon-thumbnail-container {
  position: relative;
  flex-shrink: 0;
}

.pokemon-thumbnail {
  width: 60px;
  height: 60px;
  object-fit: contain;
  border-radius: 8px;
  background: var(--theme-quinary);
  padding: 5px;
  transition: transform 0.3s ease;
}

.search-item:hover:not(.disabled) .pokemon-thumbnail {
  transform: scale(1.1);
}

.pokemon-number {
  position: absolute;
  top: -5px;
  right: -5px;
  background: var(--theme-primary);
  color: var(--theme-tertiary);
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: bold;
}

.pokemon-details {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.pokemon-name {
  margin: 0 0 5px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--theme-quaternary);
  transition: color 0.3s ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pokemon-types {
  display: flex;
  gap: 5px;
  margin-bottom: 5px;
}

.pokemon-stats {
  display: flex;
  gap: 10px;
  font-size: 11px;
  color: var(--theme-quaternary);
  opacity: 0.7;
}

.stat-item {
  display: flex;
  gap: 3px;
}

.stat-label {
  font-weight: 500;
}

.stat-value {
  color: var(--theme-primary);
  font-weight: 600;
}

.select-indicator {
  opacity: 0;
  transition: all 0.3s ease;
}

.search-item:hover:not(.disabled) .select-indicator {
  opacity: 1;
  transform: translateX(5px);
}

.select-arrow {
  font-size: 18px;
  color: var(--theme-tertiary);
  font-weight: bold;
}

.search-loading {
  text-align: center;
  padding: 40px;
  color: var(--theme-quaternary);
}

.loading-spinner {
  width: 30px;
  height: 30px;
  border: 3px solid var(--theme-quinary);
  border-top: 3px solid var(--theme-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 15px;
}

.loading-dots {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 15px;
}

.loading-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--theme-primary);
  animation: loadingDots 1.4s infinite ease-in-out;
}

.loading-dots span:nth-child(1) {
  animation-delay: -0.32s;
}

.loading-dots span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes loadingDots {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.no-results {
  text-align: center;
  padding: 40px;
  color: var(--theme-quaternary);
  font-style: italic;
}

.loading-message {
  text-align: center;
  padding: 20px;
  color: var(--theme-primary);
  font-weight: 500;
  background: var(--theme-quinary);
  border-radius: 8px;
  margin-top: 10px;
  border: 1px solid var(--theme-border);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.search-results-enter-active,
.search-results-leave-active {
  transition: all 0.3s ease;
}

.search-results-enter-from,
.search-results-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* Estilos para el botón de Pokémon aleatorio */
.random-pokemon-section {
  text-align: center;
  flex-shrink: 0;
}

.random-pokemon-btn {
  background: linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-secondary) 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.random-pokemon-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.random-pokemon-btn:disabled,
.random-pokemon-btn.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  background: var(--theme-quinary);
  color: var(--theme-senary);
}

.random-pokemon-btn.disabled:hover {
  transform: none;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.random-pokemon-btn .btn-icon {
  font-size: 1.2rem;
  animation: spin 2s linear infinite;
}

.random-pokemon-btn:disabled .btn-icon {
  animation: none;
}

.random-pokemon-btn .btn-text {
  font-weight: 600;
}

/* Estilos responsive */
@media (max-width: 768px) {
  .search-results {
    max-width: 100%;
    max-height: 280px;
  }
  
  .search-container {
    max-width: 100%;
  }
  
  .search-item {
    min-height: 56px;
    padding: 12px 16px;
  }
  
  .pokemon-thumbnail {
    width: 50px;
    height: 50px;
  }
  
  .pokemon-name {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .search-results {
    max-height: 260px;
  }
  
  .search-item {
    min-height: 52px;
    padding: 10px 12px;
  }
  
  .pokemon-thumbnail {
    width: 45px;
    height: 45px;
  }
  
  .pokemon-name {
    font-size: 13px;
  }
}
</style> 
<template>
  <div class="search-section">
    <div class="search-container">
      <input 
        v-model="searchQuery"
        @input="searchPokemon"
        placeholder="Buscar Pokémon por nombre..."
        class="search-input"
      />
      <div class="search-icon">🔍</div>
    </div>
    
    <!-- Shiny toggle -->
    <div class="shiny-toggle">
      <label class="toggle-label">
        <input 
          :checked="isShiny"
          @change="$emit('update-shiny', $event.target.checked)"
          type="checkbox" 
          class="toggle-input"
        />
        <span class="toggle-slider"></span>
        <span class="toggle-text">✨ Shiny</span>
      </label>
    </div>
    
    <!-- Search results with animations -->
    <TransitionGroup 
      name="search-results" 
      tag="div" 
      class="search-results"
      v-if="searchResults.length > 0"
    >
      <div 
        v-for="pokemon in searchResults"
        :key="pokemon.name"
        @click="selectPokemon(pokemon)"
        class="search-item"
        :style="{ animationDelay: `${$index * 0.1}s` }"
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
          <div class="pokemon-stats" v-if="pokemon.stats">
            <span class="stat-item">
              <span class="stat-label">HP:</span>
              <span class="stat-value">{{ pokemon.stats[0]?.base_stat || 'N/A' }}</span>
            </span>
            <span class="stat-item">
              <span class="stat-label">ATK:</span>
              <span class="stat-value">{{ pokemon.stats[1]?.base_stat || 'N/A' }}</span>
            </span>
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
    </div>
    
    <!-- No results -->
    <div v-if="searchQuery.length >= 2 && searchResults.length === 0 && !searching" class="no-results">
      <p>No se encontraron Pokémon con "{{ searchQuery }}"</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { getPokemonImageUrl } from '../services/pokeApi.js'
import TypeBadge from './TypeBadge.vue'
import { formatPokemonName, extractIdFromUrl } from '../utils/formatters.js'

// Props
const props = defineProps({
  isShiny: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['select-pokemon', 'update-shiny'])

// Reactive data
const searchQuery = ref('')
const searchResults = ref([])
const searching = ref(false)



// Methods
const searchPokemon = async () => {
  if (searchQuery.value.length < 2) {
    searchResults.value = []
    return
  }
  
  searching.value = true
  
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=1000`)
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
  } finally {
    searching.value = false
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
}
</script>

<style scoped>
.search-section {
  margin-bottom: 30px;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
}

.search-container {
  position: relative;
  max-width: 400px;
  margin: 0 auto 20px;
  width: 100%;
  box-sizing: border-box;
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

.search-icon {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
  color: #4a5568;
}

.shiny-toggle {
  text-align: center;
  margin-bottom: 20px;
  background: #ffffff;
  padding: 15px 25px;
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border: 2px solid #e2e8f0;
  display: inline-block;
}

.toggle-label {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  font-weight: 600;
  color: #2d3748;
  font-size: 16px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.toggle-input {
  display: none;
}

.toggle-slider {
  position: relative;
  width: 60px;
  height: 30px;
  background: #f7fafc;
  border-radius: 15px;
  margin-right: 15px;
  transition: all 0.3s ease;
  border: 2px solid #e2e8f0;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
}

.toggle-slider:before {
  content: '';
  position: absolute;
  width: 24px;
  height: 24px;
  background: var(--theme-tertiary);
  border-radius: 50%;
  top: 1px;
  left: 1px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.toggle-input:checked + .toggle-slider {
  background: linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-secondary) 100%);
  border-color: var(--theme-primary);
}

.toggle-input:checked + .toggle-slider:before {
  transform: translateX(30px);
  background: var(--theme-tertiary);
}

.toggle-text {
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.search-results {
  max-width: 500px;
  margin: 0 auto;
  background: var(--theme-tertiary);
  border-radius: 12px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  max-height: 400px;
  overflow-y: auto;
  overflow-x: hidden;
  border: 1px solid var(--theme-border);
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
}

.search-item:last-child {
  border-bottom: none;
}

.search-item:hover {
  background: linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-secondary) 100%);
  color: var(--theme-tertiary);
  transform: translateX(5px);
}

.search-item:hover .pokemon-name {
  color: var(--theme-tertiary);
}

.search-item:hover .type-badge {
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

.search-item:hover .pokemon-thumbnail {
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

.search-item:hover .select-indicator {
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
</style> 
<template>
  <div class="pokemon-list">
    <h2>Pokémon List</h2>
    
    <!-- Loading state -->
    <div v-if="loading" class="loading">
      <p>Cargando Pokémon...</p>
    </div>
    
    <!-- Error state -->
    <div v-else-if="error" class="error">
      <p>Error: {{ error }}</p>
      <button @click="loadPokemon" class="retry-btn">Reintentar</button>
    </div>
    
    <!-- Pokemon grid -->
    <div v-else class="pokemon-grid">
      <div 
        v-for="pokemon in pokemonList" 
        :key="pokemon.name"
        class="pokemon-card"
        @click="selectPokemon(pokemon)"
      >
        <div class="pokemon-image">
          <img 
            :src="getPokemonImageUrl(pokemon.id || extractIdFromUrl(pokemon.url))" 
            :alt="pokemon.name"
            @error="handleImageError"
          />
        </div>
        <div class="pokemon-info">
          <h3>{{ formatPokemonName(pokemon.name) }}</h3>
          <p class="pokemon-id">#{{ pokemon.id || extractIdFromUrl(pokemon.url) }}</p>
        </div>
      </div>
    </div>
    
    <!-- Load more button -->
    <div v-if="!loading && !error" class="load-more">
      <button @click="loadMorePokemon" class="load-more-btn">
        Cargar más Pokémon
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getPokemonList, getPokemonImageUrl } from '../services/pokeApi.js'

// Reactive data
const pokemonList = ref([])
const loading = ref(false)
const error = ref(null)
const offset = ref(0)
const limit = ref(20)

// Methods
const loadPokemon = async () => {
  loading.value = true
  error.value = null
  
  try {
    const data = await getPokemonList(limit.value, offset.value)
    
    // Add IDs to each pokemon for easier access
    const pokemonWithIds = data.results.map((pokemon, index) => ({
      ...pokemon,
      id: offset.value + index + 1
    }))
    
    if (offset.value === 0) {
      pokemonList.value = pokemonWithIds
    } else {
      pokemonList.value.push(...pokemonWithIds)
    }
    
    offset.value += limit.value
  } catch (err) {
    error.value = err.message
    console.error('Error loading Pokémon:', err)
  } finally {
    loading.value = false
  }
}

const loadMorePokemon = () => {
  loadPokemon()
}

const selectPokemon = (pokemon) => {
  console.log('Pokémon seleccionado:', pokemon)
  // Aquí puedes emitir un evento o navegar a una página de detalles
}

const extractIdFromUrl = (url) => {
  const match = url.match(/\/(\d+)\/$/)
  return match ? parseInt(match[1]) : null
}

const formatPokemonName = (name) => {
  return name.charAt(0).toUpperCase() + name.slice(1)
}

const handleImageError = (event) => {
  // Fallback to a placeholder image if the official artwork fails to load
  event.target.src = 'https://via.placeholder.com/200x200?text=Pokemon'
}

// Lifecycle
onMounted(() => {
  loadPokemon()
})
</script>

<style scoped>
.pokemon-list {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h2 {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
}

.loading, .error {
  text-align: center;
  padding: 40px;
}

.error {
  color: #e74c3c;
}

.retry-btn, .load-more-btn {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 10px;
}

.retry-btn:hover, .load-more-btn:hover {
  background-color: #2980b9;
}

.pokemon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.pokemon-card {
  background: white;
  border-radius: 10px;
  padding: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  text-align: center;
}

.pokemon-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
}

.pokemon-image {
  width: 100%;
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
}

.pokemon-image img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.pokemon-info h3 {
  margin: 0 0 5px 0;
  color: #333;
  font-size: 18px;
}

.pokemon-id {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.load-more {
  text-align: center;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .pokemon-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 15px;
  }
  
  .pokemon-card {
    padding: 10px;
  }
  
  .pokemon-image {
    height: 120px;
  }
}
</style> 
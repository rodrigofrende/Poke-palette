<template>
  <div class="search-section">
    <!-- Hero Section con Search -->
    <div class="search-hero">
      <h2 class="hero-title">Encuentra tu Pokémon</h2>
      <p class="hero-subtitle">Busca por nombre o prueba con uno aleatorio</p>
      
      <div class="search-container">
        <div class="search-icon">🔍</div>
        <input 
          v-model="searchQuery"
          @input="searchPokemon"
          :placeholder="(disabled || loadingDatabase) ? 'Cargando Pokémon...' : 'Escribe el nombre del Pokémon...'"
          class="search-input"
          :class="{ 'disabled': disabled || loadingDatabase }"
          :disabled="disabled || loadingDatabase"
          aria-label="Buscar Pokémon"
          role="searchbox"
          autocomplete="off"
        />
        <div v-if="loadingDatabase" class="loading-badge">
          <span class="loading-spinner-small"></span>
          <span>Cargando {{ pokemonDatabase.length }} Pokémon...</span>
        </div>
      </div>
      
      <!-- Botón de Pokémon aleatorio -->
      <div class="random-section">
        <div class="divider">
          <span class="divider-text">o</span>
        </div>
        <button 
          @click="handleRandomPokemon"
          :disabled="loadingRandom || disabled || loadingDatabase"
          class="random-btn"
          :class="{ 'disabled': disabled || loadingDatabase }"
          aria-label="Obtener Pokémon aleatorio"
        >
          <span class="btn-icon">🎲</span>
          <span class="btn-text">{{ 
            (disabled || loadingDatabase) ? 'Cargando...' : 
            loadingRandom ? 'Cargando...' : 
            'Sorpréndeme' 
          }}</span>
        </button>
      </div>
    </div>
    
    <!-- Search results with modern grid -->
    <TransitionGroup 
      name="results-grid" 
      tag="div" 
      class="results-grid"
      v-if="searchResults.length > 0"
    >
      <article 
        v-for="(pokemon, index) in searchResults"
        :key="pokemon.name"
        @click="!disabled && selectPokemon(pokemon)"
        @keydown.enter="!disabled && selectPokemon(pokemon)"
        @keydown.space="!disabled && selectPokemon(pokemon)"
        class="pokemon-card"
        :class="{ 'disabled': disabled }"
        :style="{ animationDelay: `${index * 0.05}s` }"
        role="button"
        :aria-label="`Seleccionar ${formatPokemonName(pokemon.name)}`"
        :tabindex="disabled ? -1 : 0"
      >
        <div class="card-header">
          <span class="card-number">#{{ String(pokemon.id || extractIdFromUrl(pokemon.url)).padStart(3, '0') }}</span>
        </div>
        
        <div class="card-image-container">
          <img 
            :key="`pokemon-${pokemon.id || extractIdFromUrl(pokemon.url)}-${isShiny ? 'shiny' : 'normal'}`"
            :src="getPokemonImageUrl(pokemon.id || extractIdFromUrl(pokemon.url), isShiny)"
            :alt="pokemon.name"
            class="card-image"
            @error="handleImageError"
          />
        </div>
        
        <div class="card-content">
          <h3 class="card-title">{{ formatPokemonName(pokemon.name) }}</h3>
          <div class="card-types" v-if="pokemon.types">
            <TypeBadge 
              v-for="type in pokemon.types" 
              :key="type.type.name"
              :type="type.type.name"
            />
          </div>
        </div>
        
        <div class="card-hover-effect">
          <span class="hover-icon">✨</span>
          <span class="hover-text">Seleccionar</span>
        </div>
      </article>
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
import { ref, onMounted } from 'vue'
import { getPokemonImageUrl, getRandomPokemon, getPokemonListProgressive } from '../services/pokeApi.js'
import TypeBadge from './TypeBadge.vue'
import { formatPokemonName, extractIdFromUrl } from '../utils/formatters.js'
import { handlePokemonImageError } from '../utils/imageLoader.js'

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
const pokemonDatabase = ref([])
const loadingDatabase = ref(true)



// Methods
const searchPokemon = async () => {
  if (searchQuery.value.length < 2) {
    searchResults.value = []
    return
  }
  
  searching.value = true
  
  try {
    // Buscar en la base de datos ya cargada (mucho más rápido)
    const filtered = pokemonDatabase.value.filter(pokemon => 
      pokemon.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    ).slice(0, 20) // Mostrar hasta 20 resultados
    
    const pokemonWithIds = filtered.map((pokemon) => ({
      ...pokemon,
      id: extractIdFromUrl(pokemon.url)
    }))
    
    searchResults.value = pokemonWithIds
  } catch (error) {
    console.error('Error searching Pokémon:', error)
    searchResults.value = []
    // Emitir evento de error para que el componente padre lo maneje
    emit('search-error', {
      title: 'Error de búsqueda',
      message: 'Hubo un problema al buscar Pokémon. Intenta nuevamente.',
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
  const pokemonName = event.target.alt || 'Pokemon'
  
  // Extraer ID y estado shiny de la URL
  const idMatch = event.target.src.match(/\/(\d+)\.png/)
  if (idMatch) {
    const pokemonId = idMatch[1]
    const isShiny = event.target.src.includes('/shiny/')
    
    // Usar el sistema de fallback con múltiples intentos
    handlePokemonImageError(event, pokemonId, pokemonName, isShiny)
  }
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

// Cargar base de datos de Pokémon al montar
onMounted(async () => {
  try {
    console.log('🔄 Iniciando carga progresiva de Pokémon...')
    pokemonDatabase.value = await getPokemonListProgressive()
    loadingDatabase.value = false
    console.log(`✅ Base de datos lista con ${pokemonDatabase.value.length} Pokémon`)
  } catch (error) {
    console.error('Error loading Pokémon database:', error)
    loadingDatabase.value = false
    emit('search-error', {
      title: 'Error de carga',
      message: 'No se pudo cargar la base de datos de Pokémon. Verifica tu conexión a internet.',
      type: 'error'
    })
  }
})
</script>

<style scoped>
.search-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  width: 100%;
  height: 100%;
  max-height: calc(100vh - 100px);
  overflow-y: auto;
  overflow-x: hidden;
}

/* Hero Section */
.search-hero {
  text-align: center;
  padding: var(--spacing-lg) 0;
  flex-shrink: 0;
}

.hero-title {
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--theme-gray-900);
  margin: 0 0 var(--spacing-xs) 0;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: var(--text-base);
  color: var(--theme-gray-500);
  margin: 0 0 var(--spacing-lg) 0;
}

/* Search Input */
.search-container {
  position: relative;
  max-width: 600px;
  margin: 0 auto var(--spacing-md);
  width: 100%;
}

.search-icon {
  position: absolute;
  left: var(--spacing-lg);
  top: 50%;
  transform: translateY(-50%);
  font-size: var(--text-2xl);
  pointer-events: none;
  z-index: 2;
}

.search-input {
  width: 100%;
  padding: var(--spacing-lg) var(--spacing-lg) var(--spacing-lg) 60px;
  border: 2px solid var(--border-light);
  border-radius: var(--radius-full);
  font-size: var(--text-base);
  transition: var(--transition-base);
  background: var(--bg-primary);
  color: var(--theme-gray-900);
  font-weight: 500;
  box-shadow: var(--shadow-sm);
}

.loading-badge {
  position: absolute;
  right: var(--spacing-md);
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-md);
  background: linear-gradient(135deg, var(--theme-primary), var(--theme-secondary));
  color: white;
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: 700;
  pointer-events: none;
  box-shadow: var(--shadow-md);
  z-index: 3;
  letter-spacing: 0.5px;
}

.loading-spinner-small {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.search-input::placeholder {
  color: var(--theme-gray-500);
}

.search-input:focus {
  outline: none;
  border-color: var(--theme-primary);
  box-shadow: 0 0 0 4px rgba(255, 107, 107, 0.1), var(--shadow-md);
  transform: translateY(-2px);
}

.search-input.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: var(--bg-tertiary);
}

/* Random Button Section */
.random-section {
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: var(--spacing-lg) 0;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  border-bottom: 2px solid var(--border-light);
}

.divider-text {
  padding: 0 var(--spacing-md);
  color: var(--theme-gray-500);
  font-weight: 600;
  text-transform: uppercase;
  font-size: var(--text-sm);
}

.random-btn {
  width: 100%;
  padding: var(--spacing-lg) var(--spacing-xl);
  background: var(--gradient-secondary);
  color: white;
  border: none;
  border-radius: var(--radius-full);
  font-size: var(--text-base);
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition-base);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  box-shadow: var(--shadow-secondary);
}

.random-btn:hover:not(.disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(78, 205, 196, 0.4);
}

.random-btn.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: var(--theme-gray-300);
}

.btn-icon {
  font-size: var(--text-2xl);
  animation: spin 3s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.random-btn.disabled .btn-icon {
  animation: none;
}



/* Results Grid */
.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: var(--spacing-lg);
  padding: var(--spacing-lg) 0;
  animation: fadeIn 0.4s ease-out;
  flex: 1;
  align-content: start;
  min-height: 400px;
}

/* Pokemon Card */
.pokemon-card {
  position: relative;
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  border: 2px solid var(--border-light);
  cursor: pointer;
  transition: var(--transition-base);
  overflow: hidden;
  animation: cardSlideIn 0.4s ease-out both;
  box-shadow: var(--shadow-sm);
}

.pokemon-card:hover:not(.disabled) {
  transform: translateY(-8px) scale(1.02);
  box-shadow: var(--shadow-xl);
  border-color: var(--theme-primary);
}

.pokemon-card.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
}

.card-header {
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--bg-secondary);
  display: flex;
  justify-content: flex-end;
}

.card-number {
  font-size: var(--text-xs);
  font-weight: bold;
  color: var(--theme-gray-500);
  font-family: var(--font-mono);
}

.card-image-container {
  padding: var(--spacing-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  min-height: 160px;
  position: relative;
}

.card-image {
  width: 120px;
  height: 120px;
  object-fit: contain;
  transition: var(--transition-base);
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.1));
}

.pokemon-card:hover:not(.disabled) .card-image {
  transform: scale(1.1) translateY(-4px);
}

.card-content {
  padding: var(--spacing-md);
  text-align: center;
}

.card-title {
  font-size: var(--text-lg);
  font-weight: bold;
  color: var(--theme-gray-900);
  margin: 0 0 var(--spacing-sm) 0;
  line-height: 1.2;
}

.card-types {
  display: flex;
  gap: var(--spacing-xs);
  justify-content: center;
  flex-wrap: wrap;
}

.card-hover-effect {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: var(--spacing-md);
  background: var(--gradient-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  transform: translateY(100%);
  transition: var(--transition-base);
  font-weight: 600;
}

.pokemon-card:hover:not(.disabled) .card-hover-effect {
  transform: translateY(0);
}

.hover-icon {
  font-size: var(--text-lg);
}

@keyframes cardSlideIn {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Loading and Empty States */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.search-loading {
  text-align: center;
  padding: var(--spacing-3xl) var(--spacing-lg);
  color: var(--theme-gray-700);
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--theme-gray-100);
  border-top: 4px solid var(--theme-primary);
  border-radius: 50%;
  animation: spinLoader 0.8s linear infinite;
  margin: 0 auto var(--spacing-lg);
}

@keyframes spinLoader {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-dots {
  display: flex;
  justify-content: center;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-lg);
}

.loading-dots span {
  width: 10px;
  height: 10px;
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
    transform: scale(0.6);
    opacity: 0.3;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.no-results {
  text-align: center;
  padding: var(--spacing-3xl) var(--spacing-lg);
  color: var(--theme-gray-500);
  font-size: var(--text-base);
}

.loading-message {
  text-align: center;
  padding: var(--spacing-lg);
  color: var(--theme-primary);
  font-weight: 500;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  margin-top: var(--spacing-md);
  border: 1px solid var(--border-light);
}

/* Responsive Design - Mobile First */
@media (max-width: 768px) {
  .hero-title {
    font-size: var(--text-2xl);
  }
  
  .hero-subtitle {
    font-size: var(--text-base);
  }
  
  .search-input {
    padding: var(--spacing-md) var(--spacing-md) var(--spacing-md) 52px;
    font-size: var(--text-sm);
  }
  
  .search-icon {
    left: var(--spacing-md);
    font-size: var(--text-xl);
  }
  
  .results-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: var(--spacing-md);
  }
  
  .card-image-container {
    min-height: 140px;
    padding: var(--spacing-md);
  }
  
  .card-image {
    width: 100px;
    height: 100px;
  }
  
  .card-title {
    font-size: var(--text-base);
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: var(--text-xl);
  }
  
  .hero-subtitle {
    font-size: var(--text-sm);
  }
  
  .search-input {
    padding: var(--spacing-sm) var(--spacing-sm) var(--spacing-sm) 48px;
  }
  
  .results-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: var(--spacing-sm);
  }
  
  .card-image-container {
    min-height: 120px;
    padding: var(--spacing-sm);
  }
  
  .card-image {
    width: 80px;
    height: 80px;
  }
  
  .card-title {
    font-size: var(--text-sm);
  }
  
  .random-btn {
    padding: var(--spacing-md) var(--spacing-lg);
    font-size: var(--text-sm);
  }
}

/* Touch targets for mobile (min 44x44px) */
@media (hover: none) and (pointer: coarse) {
  .pokemon-card {
    min-height: 220px;
  }
  
  .random-btn {
    min-height: 48px;
  }
}
</style> 
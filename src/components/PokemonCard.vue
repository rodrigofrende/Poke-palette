<template>
  <div class="selected-pokemon animate-in">
    <div class="pokemon-card animate-in">
      <!-- Close button -->
                  <button @click="$emit('close')" class="close-btn" title="Cerrar">
              <span class="close-icon">×</span>
            </button>
      
      <div class="pokemon-header">
        <div class="pokemon-image-container">
          <img 
            :key="pokemonImageUrl"
            :src="pokemonImageUrl" 
            :alt="pokemon.name"
            class="pokemon-image"
            @load="handleImageLoad"
            @error="handleImageError"
            @click="openImageModal(pokemonImageUrl, formatPokemonName(pokemon.name))"
            :title="`Click para ver imagen en grande`"
          />
          <div v-if="imageLoading" class="image-loading-overlay">
            <div class="loading-spinner"></div>
          </div>
        </div>
        
        <div class="pokemon-basic-info">
          <h3>{{ formatPokemonName(pokemon.name) }}</h3>
          <p class="pokemon-id">#{{ pokemon.id }}</p>
          
          <div class="pokemon-types">
            <TypeBadge 
              v-for="type in pokemon.types" 
              :key="type.type.name"
              :type="type.type.name"
            />
          </div>
        </div>
        
        <!-- Controles en el espacio libre -->
        <div class="controls-container">
          <!-- Shiny toggle -->
          <div class="shiny-toggle-compact">
            <label class="toggle-label-compact">
              <input 
                :checked="localIsShiny"
                @change="handleShinyToggle($event.target.checked)"
                type="checkbox" 
                class="toggle-input-compact"
              />
              <span class="toggle-slider-compact"></span>
              <span class="toggle-text-compact">✨ Shiny</span>
            </label>
          </div>
          
          <!-- Botón de análisis -->
          <button @click="$emit('analyze')" class="action-btn primary animate-in">
            <span class="btn-icon">🎨</span>
            <span class="btn-text">Generar Paleta</span>
          </button>
        </div>
      </div>
      
      <!-- Navegación de secciones -->
      <TabNavigation 
        :tabs="sections"
        :active-tab="activeSection"
        @tab-change="setActiveSection"
      />
      
      <!-- Contenido dinámico basado en sección activa -->
      <div class="section-content">
        <!-- Información General -->
        <div v-if="activeSection === 'info'" class="section-panel">
          <div class="pokemon-info-container">
            <!-- Información Física -->
            <div class="info-section">
              <h4>📏 Información Física</h4>
              <div class="physical-grid">
                <div class="physical-item">
                  <span class="physical-label">Altura:</span>
                  <span class="physical-value">{{ (pokemon.height / 10).toFixed(1) }} m</span>
                </div>
                <div class="physical-item">
                  <span class="physical-label">Peso:</span>
                  <span class="physical-value">{{ (pokemon.weight / 10).toFixed(1) }} kg</span>
                </div>
                <div class="physical-item">
                  <span class="physical-label">Color base:</span>
                  <span class="physical-value">{{ formatColorName(pokemon.species?.color?.name) }}</span>
                </div>
                <div class="physical-item">
                  <span class="physical-label">Forma:</span>
                  <span class="physical-value">{{ formatShapeName(pokemon.species?.shape?.name) }}</span>
                </div>
              </div>
            </div>
            
            <!-- Descripción -->
            <div class="info-section" v-if="pokemon.species?.flavor_text_entries">
              <h4>📖 Descripción</h4>
              <p class="description-text">
                {{ getSpanishDescription(pokemon.species.flavor_text_entries) }}
              </p>
            </div>
          </div>
        </div>
        
        <!-- Galería de imágenes - Nuevo diseño con scroll horizontal -->
        <div v-if="activeSection === 'gallery'" class="section-panel">
          <div class="pokemon-gallery-new">
            <div class="gallery-header">
              <h4>🎨 Galería de Sprites</h4>
              <span class="gallery-count">{{ filteredGalleryImages.length }} sprites</span>
            </div>
            
            <!-- Filtros de categoría -->
            <div class="gallery-filters">
              <button 
                @click="activeFilter = 'all'"
                class="filter-chip"
                :class="{ active: activeFilter === 'all' }"
              >
                <span>Todos</span>
                <span class="filter-count">{{ totalValidImages }}</span>
              </button>
              <button 
                v-for="category in availableCategories" 
                :key="category"
                @click="activeFilter = category"
                class="filter-chip"
                :class="{ active: activeFilter === category }"
              >
                <span>{{ category }}</span>
                <span class="filter-count">{{ getCategoryCount(category) }}</span>
              </button>
            </div>
            
            <!-- Scroll horizontal de imágenes -->
            <div class="gallery-scroll-container">
              <div v-if="filteredGalleryImages.length > 0" class="gallery-scroll-track">
                <div 
                  v-for="(image, index) in filteredGalleryImages" 
                  :key="`sprite-${index}`"
                  class="gallery-card"
                  :class="{ 
                    'selected': selectedImage && selectedImage.url === image.url,
                    'loading': image.loading 
                  }"
                >
                  <div class="gallery-card-image">
                    <img 
                      :src="image.url" 
                      :alt="`${formatPokemonName(pokemon.name)} - ${image.name}`"
                      class="sprite-image"
                      @error="handleGalleryImageError"
                      @click="selectImage(image)"
                      loading="lazy"
                      decoding="async"
                    />
                    
                    <!-- Badge de categoría -->
                    <div class="sprite-badge" :class="`badge-${image.category.toLowerCase()}`">
                      {{ image.category }}
                    </div>
                    
                    <!-- Indicador de seleccionado -->
                    <div v-if="selectedImage && selectedImage.url === image.url" class="selected-indicator">
                      <span class="check-icon">✓</span>
                    </div>
                  </div>
                  
                  <div class="gallery-card-info">
                    <span class="sprite-name">{{ image.name }}</span>
                    <button 
                      @click.stop="openImageModal(image.url, `${formatPokemonName(pokemon.name)} - ${image.name}`)"
                      class="sprite-zoom-btn"
                      title="Ver en grande"
                    >
                      🔍
                    </button>
                  </div>
                </div>
              </div>
              
              <!-- Mensaje cuando no hay sprites en la categoría -->
              <div v-else class="gallery-empty-state">
                <div class="empty-icon">🖼️</div>
                <p class="empty-text">No hay sprites disponibles en esta categoría</p>
                <button @click="activeFilter = 'all'" class="reset-filter-btn">Ver todos</button>
              </div>
            </div>
            
            <!-- Hints de navegación -->
            <div class="gallery-hints">
              <span class="hint-text">← Desliza para ver más →</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal para imagen amplificada -->
    <ImageModal
      :is-visible="isModalVisible"
      :image-url="modalImageUrl"
      :image-alt="modalImageName"
      :image-name="modalImageName"
      @close="closeImageModal"
    />
  </div>
</template>

<script setup>
import TypeBadge from './TypeBadge.vue'
import ImageModal from './ImageModal.vue'
import TabNavigation from './TabNavigation.vue'
import { 
  formatPokemonName, 
  formatColorName, 
  formatShapeName, 
  formatEggGroupName, 
  getSpanishDescription 
} from '../utils/formatters.js'
import { ref, computed, watch } from 'vue'
import { handlePokemonImageError, getBestPokemonImageUrl } from '../utils/imageLoader.js'

// Props
const props = defineProps({
  pokemon: {
    type: Object,
    required: true
  },
  isShiny: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['analyze', 'image-selected', 'close', 'update-shiny'])

// Reactive data
const selectedImage = ref(null)
const openCategories = ref([])
const activeSection = ref('info') // Sección por defecto
const imageLoading = ref(true)
const activeFilter = ref('all') // Filtro activo en la galería

// Track failed images to update counter accurately
const failedImages = ref(new Set())
const loadingImages = ref(new Set())

// Estado local para el toggle shiny
const localIsShiny = ref(props.isShiny)

// Modal state
const isModalVisible = ref(false)
const modalImageUrl = ref('')
const modalImageName = ref('')

// Watcher para sincronizar el estado local con el prop
watch(() => props.isShiny, (newValue) => {
  localIsShiny.value = newValue
})

// Computed para la URL de la imagen
const pokemonImageUrl = computed(() => {
  if (!props.pokemon) return ''
  
  // Si el Pokémon tiene una imageUrl específica (seleccionada de la galería), usarla
  if (props.pokemon.imageUrl) {
    return props.pokemon.imageUrl
  }
  
  // Usar el sistema de fallback para obtener la mejor URL disponible
  return getBestPokemonImageUrl(props.pokemon.id, localIsShiny.value)
})

// Watch para resetear loading cuando cambia la URL
watch(pokemonImageUrl, () => {
  imageLoading.value = true
})

// Handlers para carga de imágenes
const handleImageLoad = () => {
  imageLoading.value = false
}

const handleImageError = (event) => {
  imageLoading.value = false
  
  // Usar el sistema de fallback con múltiples intentos
  handlePokemonImageError(
    event, 
    props.pokemon?.id, 
    props.pokemon?.name || 'Pokemon', 
    localIsShiny.value
  )
}

// Método para manejar el cambio del toggle
const handleShinyToggle = (checked) => {
  console.log('🔄 Toggle shiny cambiado:', checked)
  localIsShiny.value = checked
  emit('update-shiny', checked)
  
  // Si hay una imagen específica seleccionada, limpiarla para usar la URL generada automáticamente
  if (props.pokemon.imageUrl) {
    emit('image-selected', {
      name: checked ? 'Shiny Oficial' : 'Oficial',
      url: checked 
        ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${props.pokemon.id}.png`
        : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${props.pokemon.id}.png`,
      category: 'Oficial'
    })
  }
}

// Definición de secciones
const sections = [
  { id: 'info', title: 'Información', icon: '📋' },
  { id: 'gallery', title: 'Galería', icon: '🎨' }
]

// Computed properties
const pokemonImages = computed(() => {
  const images = []
  const id = props.pokemon.id
  
  // Determinar generación del Pokémon basado en su ID
  const getGeneration = (pokemonId) => {
    if (pokemonId <= 151) return 1
    if (pokemonId <= 251) return 2
    if (pokemonId <= 386) return 3
    if (pokemonId <= 493) return 4
    if (pokemonId <= 649) return 5
    if (pokemonId <= 721) return 6
    if (pokemonId <= 809) return 7
    return 8
  }
  
  const generation = getGeneration(id)
  
  // Imagen oficial (alta calidad) - siempre disponible
  images.push({
    name: 'Oficial',
    url: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
    category: 'Oficial'
  })
  
  // Imagen shiny oficial - siempre disponible
  images.push({
    name: 'Shiny Oficial',
    url: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${id}.png`,
    category: 'Oficial'
  })
  
  // Sprites de generaciones (solo las que existían cuando apareció el Pokémon)
  if (generation <= 1) {
    images.push({
      name: 'Gen 1',
      url: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-i/red-blue/${id}.png`,
      category: 'Generaciones'
    })
  }
  
  if (generation <= 2) {
    images.push({
      name: 'Gen 2',
      url: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-ii/crystal/${id}.png`,
      category: 'Generaciones'
    })
    
    images.push({
      name: 'Gen 2 Shiny',
      url: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-ii/crystal/shiny/${id}.png`,
      category: 'Generaciones'
    })
  }
  
  if (generation <= 3) {
    images.push({
      name: 'Gen 3',
      url: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/emerald/${id}.png`,
      category: 'Generaciones'
    })
  }
  
  if (generation <= 4) {
    images.push({
      name: 'Gen 4',
      url: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iv/diamond-pearl/${id}.png`,
      category: 'Generaciones'
    })
  }
  
  if (generation <= 5) {
    images.push({
      name: 'Gen 5',
      url: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/${id}.png`,
      category: 'Generaciones'
    })
  }
  
  if (generation <= 7) {
    images.push({
      name: 'Gen 7',
      url: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-vii/ultra-sun-ultra-moon/${id}.png`,
      category: 'Generaciones'
    })
  }
  
  if (generation <= 8 && id <= 809) {
    images.push({
      name: 'Gen 8',
      url: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-viii/icons/${id}.png`,
      category: 'Generaciones'
    })
  }
  
  // Sprites animados (solo si el Pokémon existe en Gen 5)
  if (generation <= 5) {
    images.push({
      name: 'Animado',
      url: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${id}.gif`,
      category: 'Animados'
    })
    
    images.push({
      name: 'Animado Shiny',
      url: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/shiny/${id}.gif`,
      category: 'Animados'
    })
  }
  
  // Sprites básicos (actuales) - disponibles para todos
  images.push({
    name: 'Frente',
    url: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
    category: 'Básicos'
  })
  
  images.push({
    name: 'Espalda',
    url: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/${id}.png`,
    category: 'Básicos'
  })
  
  images.push({
    name: 'Shiny Frente',
    url: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${id}.png`,
    category: 'Básicos'
  })
  
  images.push({
    name: 'Shiny Espalda',
    url: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/shiny/${id}.png`,
    category: 'Básicos'
  })
  
  // Sprites de Home (disponibles hasta Gen 8)
  if (id <= 898) {
    images.push({
      name: 'Home',
      url: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${id}.png`,
      category: 'Especiales'
    })
    
    images.push({
      name: 'Home Shiny',
      url: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/${id}.png`,
      category: 'Especiales'
    })
  }
  
  return images
})

// Group images by category - show all categories even if empty
const groupedImages = computed(() => {
  const groups = {}
  
  // Definir todas las categorías posibles
  const allCategories = ['Oficial', 'Generaciones', 'Animados', 'Básicos', 'Especiales']
  
  // Inicializar todas las categorías
  allCategories.forEach(category => {
    groups[category] = []
  })
  
  // Agregar imágenes a sus categorías
  pokemonImages.value.forEach(image => {
    if (groups[image.category]) {
      groups[image.category].push(image)
    }
  })
  
  return groups
})

// Categorías disponibles (que tienen al menos una imagen)
const availableCategories = computed(() => {
  const categories = new Set()
  pokemonImages.value.forEach(image => {
    categories.add(image.category)
  })
  return Array.from(categories)
})

// Imágenes filtradas según el filtro activo, excluyendo las que fallaron al cargar
const filteredGalleryImages = computed(() => {
  const failed = failedImages.value
  let images = pokemonImages.value.filter(img => !failed.has(img.url))
  
  if (activeFilter.value === 'all') {
    return images
  }
  return images.filter(img => img.category === activeFilter.value)
})

// Obtener conteo de categoría, excluyendo las que fallaron
const getCategoryCount = (category) => {
  const failed = failedImages.value
  return pokemonImages.value.filter(img => 
    img.category === category && !failed.has(img.url)
  ).length
}

// Total de imágenes válidas (que no fallaron)
const totalValidImages = computed(() => {
  const failed = failedImages.value
  return pokemonImages.value.filter(img => !failed.has(img.url)).length
})

// Methods
const setActiveSection = (sectionId) => {
  activeSection.value = sectionId
}

const selectImage = (image) => {
  // Reemplazar la imagen seleccionada con la de la galería
  selectedImage.value = image
  emit('image-selected', image)
  
  // Mostrar notificación de cambio
  console.log(`🖼️ Imagen cambiada a: ${image.name}`)
}

const openImageModal = (imageUrl, imageName) => {
  modalImageUrl.value = imageUrl
  modalImageName.value = imageName
  isModalVisible.value = true
}

const closeImageModal = () => {
  isModalVisible.value = false
}

const handleGalleryImageError = (event) => {
  const url = event.target.src
  
  // Agregar al Set de imágenes fallidas (esto actualizará automáticamente los contadores)
  failedImages.value.add(url)
  
  // Log para debug (solo en desarrollo)
  if (import.meta.env.DEV) {
    console.log(`❌ Sprite no disponible: ${url}`)
  }
  
  // Forzar actualización reactiva
  failedImages.value = new Set(failedImages.value)
}

// Limpiar imágenes fallidas cuando cambie el Pokémon
watch(() => props.pokemon.id, () => {
  failedImages.value = new Set()
  loadingImages.value = new Set()
})

// Watcher to set first available category as open by default
watch(groupedImages, (newGroups) => {
  const availableCategories = Object.keys(newGroups)
  if (availableCategories.length > 0 && openCategories.value.length === 0) {
    // Buscar la primera categoría que tenga imágenes
    const firstCategoryWithImages = availableCategories.find(category => 
      newGroups[category] && newGroups[category].length > 0
    )
    if (firstCategoryWithImages) {
      openCategories.value = [firstCategoryWithImages]
    } else {
      // Si no hay categorías con imágenes, abrir la primera
      openCategories.value = [availableCategories[0]]
    }
  }
}, { immediate: true })

const toggleCategory = (category) => {
  // Solo permite una categoría abierta a la vez
  if (openCategories.value.includes(category)) {
    // Si la categoría está abierta, la cierra
    openCategories.value = []
  } else {
    // Si está cerrada, abre solo esta categoría
    openCategories.value = [category]
  }
}
</script>

<style scoped>
.selected-pokemon {
  display: flex;
  justify-content: center;
  padding: 12px; /* Reducido de 18px para mobile-first */
  min-height: 0;
  flex: 1;
  /* Altura mínima ajustada para evitar saltos de layout */
  min-height: 200px; /* Reducido de 250px */
}

.pokemon-card {
  display: flex;
  flex-direction: column;
  gap: 12px; /* Reducido de 15px */
  background: var(--theme-tertiary);
  padding: 14px; /* Reducido de 18px para mobile-first */
  border-radius: 16px; /* Más compacto */
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12); /* Sombra más sutil */
  max-width: 800px;
  width: 100%;
  border: 1px solid var(--theme-border);
  position: relative;
  height: fit-content;
  min-height: 0;
  overflow: visible;
  /* Altura mínima ajustada para mantener consistencia */
  min-height: 180px; /* Reducido de 200px */
}

.close-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  background: var(--theme-quinary);
  border: 2px solid var(--theme-border);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
  color: var(--theme-quaternary);
}

.close-btn:hover {
  background: var(--theme-primary);
  color: var(--theme-tertiary);
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.close-btn .close-icon {
  font-size: 24px;
  font-weight: bold;
  color: var(--theme-quaternary);
  line-height: 1;
  display: block;
  transition: all 0.3s ease;
}

.close-btn:hover .close-icon {
  color: white;
  transform: scale(1.1);
}

.pokemon-header {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 15px;
  padding: 0;
  flex-shrink: 0;
}

.pokemon-image-container {
  position: relative;
  flex-shrink: 0;
  margin-right: 0;
  width: 120px;
  height: 120px;
}

.image-loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  border-radius: 15px;
  z-index: 1;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--border-light);
  border-top: 4px solid var(--theme-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.pokemon-image {
  width: 120px;
  height: 120px;
  object-fit: contain;
  border-radius: 15px;
  background: linear-gradient(135deg, var(--theme-quinary) 0%, var(--theme-quinary) 100%);
  padding: 10px;
  transition: opacity 0.3s ease, transform 0.3s ease;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  cursor: pointer;
}

.pokemon-image:hover {
  transform: scale(1.05);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.15);
}

.pokemon-basic-info {
  flex: 1;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  width: 100%;
  margin-right: 15px;
}

/* Controles compactos */
.controls-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  justify-content: center;
  min-width: 140px;
  flex-shrink: 0;
  margin-left: 15px;
  padding: 12px;
  background: var(--theme-quinary);
  border-radius: 12px;
  border: 1px solid var(--theme-border);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  min-height: 100px;
}

/* Shiny toggle compacto */
.shiny-toggle-compact {
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
}

.toggle-label-compact {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  gap: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--theme-quaternary);
}

.toggle-input-compact {
  display: none;
}

.toggle-slider-compact {
  position: relative;
  width: 40px;
  height: 20px;
  background: var(--theme-border);
  border-radius: 10px;
  transition: all 0.3s ease;
  display: inline-block;
}

.toggle-slider-compact::before {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  background: var(--theme-tertiary);
  border-radius: 50%;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.toggle-input-compact:checked + .toggle-slider-compact {
  background: var(--theme-primary);
}

.toggle-input-compact:checked + .toggle-slider-compact::before {
  transform: translateX(20px);
}

.toggle-text-compact {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--theme-quaternary);
  transition: color 0.3s ease;
}

.toggle-input-compact:checked ~ .toggle-text-compact {
  color: var(--theme-primary);
}

.pokemon-basic-info h3 {
  margin: 0;
  color: var(--theme-quaternary);
  font-size: 2.2rem;
  font-weight: bold;
}

.pokemon-basic-info p {
  color: var(--theme-quaternary);
  margin: 0;
  font-size: 1.3rem;
  font-weight: 500;
  opacity: 0.7;
}

.pokemon-types {
  display: flex;
  gap: 10px;
  margin-top: 8px;
}



/* Contenido de secciones */
.section-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 15px;
  min-height: 0;
  overflow: auto;
}

/* Contenedor de información agrupada */
.pokemon-info-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0;
  flex-grow: 1;
  max-height: 385px; /* Altura reducida para ver bordes completos */
}

.section-panel {
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 0;
  background: var(--theme-quinary);
  border-radius: 15px;
  border: 1px solid var(--theme-border);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.info-section {
  padding: 18px;
  border-bottom: 1px solid var(--theme-border);
}

.info-section:last-child {
  border-bottom: none;
}

.info-section h4 {
  color: var(--theme-quaternary);
  margin-bottom: 15px;
  font-size: 1.1rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 8px;
}

.pokemon-physical-info,
.pokemon-description,
.pokemon-gallery {
  margin: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
  flex-grow: 1;
  max-height: 100%;
}

.pokemon-physical-info h4,
.pokemon-description h4,
.pokemon-gallery h4,
.info-section h4 {
  margin: 0 0 10px 0;
  color: var(--theme-quaternary);
  font-size: 1.2rem;
  font-weight: 700;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.physical-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.physical-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background: var(--bg-secondary);
  border-radius: 8px;
  border: 1px solid var(--border-light);
  transition: all 0.3s ease;
}

.physical-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: var(--theme-primary);
}

.physical-label {
  font-weight: 600;
  color: var(--theme-gray-700);
  font-size: 0.9rem;
}

.physical-value {
  font-weight: bold;
  color: var(--theme-gray-900);
  font-size: 1rem;
}

.description-text {
  padding: 12px;
  background: var(--bg-secondary);
  border-radius: 8px;
  border: 1px solid var(--border-light);
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--theme-gray-800);
  margin: 0;
  font-weight: 500;
  width: 100%;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.gallery-categories {
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
  flex-grow: 1;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0;
  max-height: 385px; /* Altura reducida para ver bordes completos */
  scrollbar-width: thin;
  scrollbar-color: var(--theme-border) transparent;
}

.gallery-categories::-webkit-scrollbar {
  width: 6px;
}

.gallery-categories::-webkit-scrollbar-track {
  background: transparent;
}

.gallery-categories::-webkit-scrollbar-thumb {
  background: var(--theme-border);
  border-radius: 3px;
}

.gallery-categories::-webkit-scrollbar-thumb:hover {
  background: var(--theme-primary);
}

.gallery-category {
  background: var(--theme-quinary);
  border-radius: 15px;
  padding: 15px;
  border: 1px solid var(--theme-border);
  width: 100%;
  flex-shrink: 0;
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  padding-bottom: 8px;
  margin-bottom: 12px;
  border-bottom: 2px solid var(--theme-border);
  transition: all 0.3s ease;
}

.category-header:hover {
  border-bottom-color: var(--theme-primary);
}

.category-title {
  margin: 0;
  color: var(--theme-quaternary);
  font-size: 1.1rem;
  font-weight: 700;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.category-toggle {
  font-size: 18px;
  font-weight: bold;
  color: var(--theme-primary);
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 15px;
  width: 100%;
  max-height: 250px;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 5px;
  scrollbar-width: thin;
  scrollbar-color: var(--theme-border) transparent;
}

.gallery-grid::-webkit-scrollbar {
  width: 6px;
}

.gallery-grid::-webkit-scrollbar-track {
  background: transparent;
}

.gallery-grid::-webkit-scrollbar-thumb {
  background: var(--theme-border);
  border-radius: 3px;
}

.gallery-grid::-webkit-scrollbar-thumb:hover {
  background: var(--theme-primary);
}

.gallery-item {
  cursor: pointer;
  transition: all 0.3s ease;
}

.gallery-item:hover {
  transform: translateY(-5px);
}

.gallery-image-container {
  position: relative;
  border-radius: 15px;
  overflow: hidden;
  background: linear-gradient(135deg, var(--theme-quinary) 0%, var(--theme-tertiary) 100%);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.gallery-image-container:hover {
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.2);
  transform: scale(1.02);
}

.gallery-image {
  width: 100%;
  height: 120px;
  object-fit: contain;
  padding: 15px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.gallery-image.selected {
  border: 3px solid var(--theme-primary);
  border-radius: 8px;
  box-shadow: 0 0 15px rgba(102, 126, 234, 0.5);
  transform: scale(1.05);
}

.gallery-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  padding: 20px 10px 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.gallery-image-container:hover .gallery-overlay {
  opacity: 1;
}

.gallery-label {
  font-size: 0.85rem;
  color: white;
  font-weight: 600;
  text-align: center;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  flex: 1;
}

.gallery-modal-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 4px;
  color: white;
  padding: 4px 6px;
  font-size: 0.7rem;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
  margin-left: 8px;
}

.gallery-modal-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.empty-category-message {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  color: var(--theme-quaternary);
  font-style: italic;
  opacity: 0.7;
  text-align: center;
  width: 100%;
}

.empty-category-message p {
  margin: 0;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .pokemon-card {
    padding: 15px;
    margin: 0 10px;
    max-width: 100%;
  }
  
  .pokemon-header {
    flex-direction: column;
    align-items: center;
    gap: 12px; /* Reducido de 20px */
  }
  
  .pokemon-basic-info {
    text-align: center;
    margin-right: 0;
  }
  
  .pokemon-image-container {
    margin-right: 0;
    width: 110px; /* Reducido para mobile */
    height: 110px;
  }
  
  .pokemon-image {
    width: 110px; /* Reducido de 140px */
    height: 110px;
  }
  
  .controls-container {
    margin-left: 0;
    margin-top: 12px; /* Reducido de 15px */
    min-width: auto;
    width: 100%;
  }
  
  .action-btn.primary {
    padding: 14px 24px; /* Reducido de 16px 28px */
    font-size: 14px; /* Reducido de 15px */
    min-width: 150px; /* Reducido de 160px */
  }
  
  .gallery-grid {
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 12px;
    max-height: 200px;
    padding-right: 3px;
  }
  
  .gallery-image {
    height: 90px;
  }
  
  .gallery-category {
    padding: 15px;
  }
}

@media (max-width: 480px) {
  .pokemon-card {
    padding: 10px; /* Reducido de 12px */
    margin: 0 4px;
    gap: 10px; /* Reducir gaps internos */
  }
  
  .pokemon-header {
    gap: 8px; /* Reducido de 12px */
    margin-bottom: 8px; /* Reducir margen inferior */
  }
  
  .pokemon-image-container {
    width: 100px; /* Más compacto en móviles pequeños */
    height: 100px;
  }
  
  .pokemon-image {
    width: 100px; /* Reducido para móviles pequeños */
    height: 100px;
  }
  
  .controls-container {
    margin-top: 8px; /* Reducido de 10px */
  }
  
  .action-btn.primary {
    padding: 12px 20px;
    font-size: 13px;
    min-width: 140px;
  }
  
  .gallery-grid {
    grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
    gap: 8px;
    max-height: 150px;
    padding-right: 2px;
  }
  
  .gallery-image {
    height: 70px;
  }
  
  .gallery-category {
    padding: 12px;
  }
  
  .physical-item {
    padding: 10px 14px;
    min-height: 40px;
  }
}

/* Animación de entrada para el PokemonCard */
.pokemon-card.animate-in {
  animation: slideInUp 0.6s ease-out 0.2s both;
}

@keyframes slideInUp {
  0% {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Animación adicional para elementos internos */
.pokemon-header {
  animation: fadeInUp 0.8s ease-out 0.4s both;
}

.section-navigation {
  animation: fadeInUp 0.8s ease-out 0.5s both;
}

.section-content {
  animation: fadeInUp 0.8s ease-out 0.6s both;
}

/* Animación para el contenedor principal */
.selected-pokemon.animate-in {
  animation: containerSlideIn 0.6s ease-out 0.1s both;
}

@keyframes containerSlideIn {
  0% {
    opacity: 0;
    transform: translateY(20px) scale(0.98);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Animación específica para el botón Generar Paleta */
.action-btn.primary.animate-in {
  animation: buttonSlideIn 0.7s ease-out 0.7s both;
}

@keyframes buttonSlideIn {
  0% {
    opacity: 0;
    transform: translateY(20px) scale(0.9);
  }
  50% {
    opacity: 0.7;
    transform: translateY(-2px) scale(1.02);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes fadeInUp {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ============================================ */
/* NUEVA GALERÍA CON SCROLL HORIZONTAL */
/* ============================================ */

.pokemon-gallery-new {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  height: 100%;
  overflow: hidden;
}

/* Header de galería */
.gallery-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 var(--spacing-sm);
}

.gallery-header h4 {
  margin: 0;
  font-size: var(--text-xl);
  color: var(--theme-gray-900);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.gallery-count {
  font-size: var(--text-sm);
  color: var(--theme-gray-600);
  background: var(--bg-tertiary);
  padding: 4px 12px;
  border-radius: var(--radius-full);
  font-weight: 600;
}

/* Filtros tipo chips */
.gallery-filters {
  display: flex;
  gap: var(--spacing-sm);
  overflow-x: auto;
  overflow-y: hidden;
  padding: var(--spacing-sm);
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
}

.gallery-filters::-webkit-scrollbar {
  height: 4px;
}

.gallery-filters::-webkit-scrollbar-track {
  background: transparent;
}

.gallery-filters::-webkit-scrollbar-thumb {
  background: var(--border-light);
  border-radius: 2px;
}

.filter-chip {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--bg-secondary);
  border: 2px solid var(--border-light);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--theme-gray-700);
  cursor: pointer;
  transition: all var(--transition-base);
  white-space: nowrap;
  flex-shrink: 0;
}

.filter-chip:hover {
  border-color: var(--theme-primary);
  background: var(--bg-primary);
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

.filter-chip.active {
  background: var(--bg-primary);
  color: var(--theme-primary);
  border-color: var(--theme-primary);
  box-shadow: var(--shadow-sm);
  font-weight: 700;
}

.filter-count {
  background: var(--bg-tertiary);
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: bold;
  color: var(--theme-gray-700);
}

.filter-chip.active .filter-count {
  background: rgba(255, 107, 107, 0.1);
  color: var(--theme-primary);
}

/* Contenedor de scroll horizontal */
.gallery-scroll-container {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.gallery-scroll-track {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  overflow-x: auto;
  overflow-y: hidden;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  scroll-snap-type: x proximity; /* proximity en lugar de mandatory para mejor fluidez */
  height: 100%;
  
  /* Optimizaciones de performance */
  will-change: scroll-position;
  contain: layout style paint;
  transform: translateZ(0);
  backface-visibility: hidden;
  
  /* Mejor scrolling en móviles */
  overscroll-behavior-x: contain;
}

.gallery-scroll-track::-webkit-scrollbar {
  height: 8px;
}

.gallery-scroll-track::-webkit-scrollbar-track {
  background: var(--bg-tertiary);
  border-radius: 4px;
}

.gallery-scroll-track::-webkit-scrollbar-thumb {
  background: var(--theme-primary);
  border-radius: 4px;
}

.gallery-scroll-track::-webkit-scrollbar-thumb:hover {
  background: var(--theme-secondary);
}

/* Cards de sprites */
.gallery-card {
  flex-shrink: 0;
  width: 180px;
  background: var(--bg-primary);
  border-radius: var(--radius-md);
  border: 2px solid var(--border-light);
  overflow: hidden;
  transition: transform var(--transition-base), box-shadow var(--transition-base), border-color var(--transition-base);
  scroll-snap-align: start;
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  
  /* Optimizaciones de performance */
  will-change: transform;
  transform: translateZ(0);
  backface-visibility: hidden;
}

.gallery-card:hover {
  transform: translateY(-4px) translateZ(0);
  box-shadow: var(--shadow-lg);
  border-color: var(--theme-primary);
}

.gallery-card.selected {
  border-color: var(--theme-success);
  border-width: 3px;
  box-shadow: 0 0 0 3px rgba(81, 207, 102, 0.2);
}

.gallery-card-image {
  position: relative;
  width: 100%;
  height: 160px;
  background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-md);
}

.sprite-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transition: transform var(--transition-base);
  image-rendering: pixelated;
  
  /* Optimización de performance */
  transform: translateZ(0);
  backface-visibility: hidden;
  will-change: transform;
}

.gallery-card:hover .sprite-image {
  transform: scale(1.1) translateZ(0);
}

/* Badge de categoría - Colores más sutiles */
.sprite-badge {
  position: absolute;
  top: var(--spacing-sm);
  left: var(--spacing-sm);
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: bold;
  text-transform: uppercase;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.sprite-badge.badge-oficial {
  background: rgba(102, 126, 234, 0.9);
  color: white;
}

.sprite-badge.badge-generaciones {
  background: rgba(100, 181, 246, 0.9);
  color: white;
}

.sprite-badge.badge-animados {
  background: rgba(129, 199, 132, 0.9);
  color: white;
}

.sprite-badge.badge-básicos {
  background: rgba(149, 117, 205, 0.9);
  color: white;
}

.sprite-badge.badge-especiales {
  background: rgba(255, 183, 77, 0.9);
  color: white;
}

/* Indicador de seleccionado */
.selected-indicator {
  position: absolute;
  top: var(--spacing-sm);
  right: var(--spacing-sm);
  width: 32px;
  height: 32px;
  background: var(--theme-success);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-md);
  animation: checkPop 0.3s ease-out;
}

.check-icon {
  color: white;
  font-size: var(--text-lg);
  font-weight: bold;
}

@keyframes checkPop {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

/* Info del card */
.gallery-card-info {
  padding: var(--spacing-md);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-sm);
  background: var(--bg-primary);
  border-top: 1px solid var(--border-light);
}

.sprite-name {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--theme-gray-900);
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sprite-zoom-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-base);
  font-size: var(--text-base);
  flex-shrink: 0;
}

.sprite-zoom-btn:hover {
  background: var(--theme-primary);
  border-color: var(--theme-primary);
  transform: scale(1.1);
  box-shadow: var(--shadow-md);
}

/* Hints de navegación */
.gallery-hints {
  text-align: center;
  padding: var(--spacing-sm);
  color: var(--theme-gray-500);
  font-size: var(--text-sm);
  animation: bounce 2s ease-in-out infinite;
}

.hint-text {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
}

@keyframes bounce {
  0%, 100% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(4px);
  }
}

/* Empty state de galería */
.gallery-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-3xl);
  text-align: center;
  min-height: 300px;
}

.gallery-empty-state .empty-icon {
  font-size: 4rem;
  opacity: 0.5;
  margin-bottom: var(--spacing-lg);
}

.gallery-empty-state .empty-text {
  font-size: var(--text-lg);
  color: var(--theme-gray-600);
  margin-bottom: var(--spacing-lg);
}

.reset-filter-btn {
  padding: var(--spacing-sm) var(--spacing-xl);
  background: white;
  color: var(--theme-primary);
  border: 2px solid var(--theme-primary);
  border-radius: var(--radius-full);
  font-size: var(--text-base);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-base);
  box-shadow: var(--shadow-sm);
}

.reset-filter-btn:hover {
  background: var(--theme-primary);
  color: white;
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

/* Responsive - Mobile */
@media (max-width: 768px) {
  .gallery-card {
    width: 160px;
  }
  
  .gallery-card-image {
    height: 140px;
  }
  
  .gallery-header h4 {
    font-size: var(--text-lg);
  }
}

@media (max-width: 480px) {
  .gallery-card {
    width: 140px;
  }
  
  .gallery-card-image {
    height: 120px;
  }
  
  .filter-chip {
    font-size: var(--text-xs);
    padding: 6px 12px;
  }
  
  .gallery-hints {
    font-size: var(--text-xs);
  }
}

/* Touch devices - mejor UX */
@media (hover: none) and (pointer: coarse) {
  .gallery-card {
    /* Asegurar touch targets apropiados */
    min-height: 220px;
  }
  
  .filter-chip {
    min-height: 44px;
  }
  
  .sprite-zoom-btn {
    min-width: 44px;
    min-height: 44px;
  }
}
</style> 
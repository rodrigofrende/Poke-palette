<template>
  <div class="selected-pokemon animate-in">
    <div class="pokemon-card animate-in">
      <!-- Close button -->
      <button @click="$emit('close')" class="close-btn">
        <span class="close-icon">×</span>
      </button>
      
      <div class="pokemon-header">
        <div class="pokemon-image-container">
          <img 
            :src="pokemonImageUrl" 
            :alt="pokemon.name"
            class="pokemon-image"
            loading="lazy"
            @error="handleImageError"
            @click="openImageModal(pokemonImageUrl, formatPokemonName(pokemon.name))"
          />
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
          <button @click="$emit('analyze')" class="analyze-btn-compact animate-in">
            <span class="btn-icon-small">🎨</span>
            Generar Paleta
          </button>
        </div>
      </div>
      
      <!-- Navegación de secciones -->
      <div class="section-navigation">
        <button 
          v-for="section in sections" 
          :key="section.id"
          @click="setActiveSection(section.id)"
          :class="['nav-btn', { active: activeSection === section.id }]"
        >
          <span class="nav-icon">{{ section.icon }}</span>
          <span class="nav-text">{{ section.title }}</span>
        </button>
      </div>
      
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
        
        <!-- Galería de imágenes -->
        <div v-if="activeSection === 'gallery'" class="section-panel">
          <div class="pokemon-gallery">
            <h4>🎨 Galería de Sprites</h4>
            
            <div class="gallery-categories">
              <div 
                v-for="(images, category) in groupedImages" 
                :key="category"
                class="gallery-category"
              >
                <div class="category-header" @click="toggleCategory(category)">
                  <h5 class="category-title">{{ category }}</h5>
                  <span class="category-toggle">{{ openCategories.includes(category) ? '−' : '+' }}</span>
                </div>
                <div class="gallery-grid" v-if="openCategories.includes(category)">
                  <div 
                    v-if="images.length > 0"
                    v-for="(image, index) in images" 
                    :key="`${category}-${index}`"
                    class="gallery-item"
                    @click="selectImage(image)"
                  >
                    <div class="gallery-image-container">
                      <img 
                        :src="image.url" 
                        :alt="`${formatPokemonName(pokemon.name)} - ${image.name}`"
                        class="gallery-image"
                        loading="lazy"
                        @error="handleImageError"
                        @click.stop="openImageModal(image.url, `${formatPokemonName(pokemon.name)} - ${image.name}`)"
                      />
                      <div class="gallery-overlay">
                        <span class="gallery-label">{{ image.name }}</span>
                      </div>
                    </div>
                  </div>
                  <div v-else class="empty-category-message">
                    <p>No hay sprites disponibles para esta categoría</p>
                  </div>
                </div>
              </div>
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
import { 
  formatPokemonName, 
  formatColorName, 
  formatShapeName, 
  formatEggGroupName, 
  getSpanishDescription 
} from '../utils/formatters.js'
import { ref, computed, watch } from 'vue'

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
  
  const baseUrl = localIsShiny.value 
    ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${props.pokemon.id}.png`
    : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${props.pokemon.id}.png`
  
  return baseUrl
})

// Método para manejar el cambio del toggle
const handleShinyToggle = (checked) => {
  console.log('🔄 Toggle shiny cambiado:', checked)
  localIsShiny.value = checked
  emit('update-shiny', checked)
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
  
  // Imagen oficial (alta calidad)
  images.push({
    name: 'Oficial',
    url: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
    category: 'Oficial'
  })
  
  // Imagen shiny oficial
  images.push({
    name: 'Shiny Oficial',
    url: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${id}.png`,
    category: 'Oficial'
  })
  
  // Sprites de diferentes generaciones
  images.push({
    name: 'Gen 1',
    url: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-i/red-blue/${id}.png`,
    category: 'Generaciones'
  })
  
  images.push({
    name: 'Gen 1 Shiny',
    url: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-i/red-blue/shiny/${id}.png`,
    category: 'Generaciones'
  })
  
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
  
  images.push({
    name: 'Gen 3',
    url: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/emerald/${id}.png`,
    category: 'Generaciones'
  })
  
  images.push({
    name: 'Gen 4',
    url: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iv/diamond-pearl/${id}.png`,
    category: 'Generaciones'
  })
  
  images.push({
    name: 'Gen 5',
    url: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/${id}.png`,
    category: 'Generaciones'
  })
  
  // Sprites animados
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
  
  // Sprites de frente y espalda
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
  
  // Sprites de Home
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
  
  // Sprites de Dream World
  images.push({
    name: 'Dream World',
    url: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/${id}.svg`,
    category: 'Especiales'
  })
  
  // Sprites de Ultra Sun/Ultra Moon
  images.push({
    name: 'Ultra Sun',
    url: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-vii/ultra-sun-ultra-moon/${id}.png`,
    category: 'Generaciones'
  })
  
  images.push({
    name: 'Ultra Moon',
    url: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-vii/ultra-sun-ultra-moon/shiny/${id}.png`,
    category: 'Generaciones'
  })
  
  // Sprites de Sword/Shield
  images.push({
    name: 'Sword/Shield',
    url: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-viii/icons/${id}.png`,
    category: 'Generaciones'
  })
  
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

// Methods
const setActiveSection = (sectionId) => {
  activeSection.value = sectionId
}

const selectImage = (image) => {
  selectedImage.value = image
  emit('image-selected', image)
}

const openImageModal = (imageUrl, imageName) => {
  modalImageUrl.value = imageUrl
  modalImageName.value = imageName
  isModalVisible.value = true
}

const closeImageModal = () => {
  isModalVisible.value = false
}

const handleImageError = (event) => {
  // Hide the entire gallery item container if image fails to load
  const galleryItem = event.target.closest('.gallery-item')
  if (galleryItem) {
    galleryItem.style.display = 'none'
    
    // Check if the category is now empty and hide it
    const categoryContainer = galleryItem.closest('.gallery-category')
    if (categoryContainer) {
      const visibleItems = categoryContainer.querySelectorAll('.gallery-item:not([style*="display: none"])')
      if (visibleItems.length === 0) {
        categoryContainer.style.display = 'none'
      }
    }
  }
}

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
  padding: 18px;
  min-height: 0;
  flex: 1;
}

.pokemon-card {
  display: flex;
  flex-direction: column;
  gap: 15px;
  background: var(--theme-tertiary);
  padding: 18px;
  border-radius: 20px;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
  max-width: 800px;
  width: 100%;
  border: 1px solid var(--theme-border);
  position: relative;
  height: fit-content;
  min-height: 0;
  overflow: visible;
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
}

.close-btn:hover {
  background: var(--theme-primary);
  color: var(--theme-tertiary);
  transform: scale(1.1);
}

.close-icon {
  font-size: 20px;
  font-weight: bold;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  margin-top: -2px;
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
}

.pokemon-image {
  width: 120px;
  height: 120px;
  object-fit: contain;
  border-radius: 15px;
  background: linear-gradient(135deg, var(--theme-quinary) 0%, var(--theme-quinary) 100%);
  padding: 10px;
  transition: transform 0.3s ease;
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

.analyze-btn-compact {
  background: linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-secondary) 100%);
  color: var(--theme-tertiary);
  border: 3px solid var(--theme-border);
  padding: 14px 24px;
  border-radius: 12px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
  white-space: nowrap;
  position: relative;
  overflow: hidden;
  min-width: 140px;
  justify-content: center;
}

.analyze-btn-compact::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.6s ease;
}

.analyze-btn-compact:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  border-color: var(--theme-primary);
}

.analyze-btn-compact:hover::before {
  left: 100%;
}

.analyze-btn-compact:active {
  transform: translateY(-1px) scale(1.02);
}

.btn-icon-small {
  font-size: 16px;
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

/* Navegación de secciones */
.section-navigation {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  padding: 0;
  flex-shrink: 0;
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: var(--theme-quinary);
  border: 2px solid var(--theme-border);
  border-radius: 10px;
  color: var(--theme-quaternary);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 13px;
  min-width: 100px;
  justify-content: center;
}

.nav-btn:hover {
  background: var(--theme-primary);
  color: var(--theme-tertiary);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.nav-btn.active {
  background: var(--theme-primary);
  color: var(--theme-tertiary);
  border-color: var(--theme-primary);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.nav-icon {
  font-size: 16px;
}

.nav-text {
  font-size: 13px;
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
  background: var(--theme-tertiary);
  border-radius: 8px;
  border: 1px solid var(--theme-border);
  transition: all 0.3s ease;
}

.physical-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.physical-label {
  font-weight: 600;
  color: var(--theme-quaternary);
  font-size: 0.9rem;
}

.physical-value {
  font-weight: bold;
  color: var(--theme-primary);
  font-size: 0.9rem;
}

.description-text {
  padding: 12px;
  background: var(--theme-tertiary);
  border-radius: 8px;
  border: 1px solid var(--theme-border);
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--theme-quaternary);
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

.gallery-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  padding: 20px 10px 10px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.gallery-label {
  font-size: 0.85rem;
  color: white;
  font-weight: 600;
  text-align: center;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
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
    gap: 20px;
  }
  
  .pokemon-basic-info {
    text-align: center;
    margin-right: 0;
  }
  
  .pokemon-image-container {
    margin-right: 0;
  }
  
  .pokemon-image {
    width: 140px;
    height: 140px;
  }
  
  .controls-container {
    margin-left: 0;
    margin-top: 15px;
    min-width: auto;
    width: 100%;
  }
  
  .analyze-btn-compact {
    padding: 16px 28px;
    font-size: 15px;
    min-width: 160px;
  }
  
  .section-navigation {
    gap: 6px;
  }
  
  .nav-btn {
    padding: 8px 14px;
    min-width: 90px;
    font-size: 12px;
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
    padding: 12px;
    margin: 0 5px;
  }
  
  .pokemon-header {
    gap: 12px;
  }
  
  .controls-container {
    margin-top: 10px;
  }
  
  .analyze-btn-compact {
    padding: 12px 20px;
    font-size: 13px;
    min-width: 140px;
  }
  
  .section-navigation {
    flex-direction: column;
    gap: 8px;
  }
  
  .nav-btn {
    width: 100%;
    min-width: auto;
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
.analyze-btn-compact.animate-in {
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
</style> 
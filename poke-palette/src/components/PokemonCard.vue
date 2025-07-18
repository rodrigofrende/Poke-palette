<template>
  <div class="selected-pokemon">
    <div class="pokemon-card">
      <!-- Close button -->
      <button @click="$emit('close')" class="close-btn">
        <span class="close-icon">×</span>
      </button>
      
      <div class="pokemon-header">
        <div class="pokemon-image-container">
          <img 
            :src="pokemon.imageUrl" 
            :alt="pokemon.name"
            class="pokemon-image"
          />
          <div class="shiny-indicator" v-if="isShiny">✨</div>
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
        
        <button @click="$emit('analyze')" class="analyze-btn">
          <span class="btn-icon">🎨</span>
          Analizar Paleta
        </button>
      </div>
      
      <div class="pokemon-content">
        <!-- Información física -->
        <div class="pokemon-physical-info">
          <h4>Información Física</h4>
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
        <div class="pokemon-description" v-if="pokemon.species?.flavor_text_entries">
          <h4>Descripción</h4>
          <p class="description-text">
            {{ getSpanishDescription(pokemon.species.flavor_text_entries) }}
          </p>
        </div>
        
        <!-- Información de evolución -->
        <div class="pokemon-evolution" v-if="pokemon.species?.evolution_chain">
          <h4>Información de Evolución</h4>
          <div class="evolution-info">
            <div class="evolution-item">
              <span class="evolution-label">Cadena evolutiva:</span>
              <span class="evolution-value">{{ pokemon.species.evolution_chain.url.split('/').pop() }}</span>
            </div>
            <div class="evolution-item">
              <span class="evolution-label">Grupo de huevos:</span>
              <span class="evolution-value">{{ formatEggGroupName(pokemon.species.egg_groups?.[0]?.name) }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Galería de imágenes adicionales -->
      <div class="pokemon-gallery" v-if="Object.keys(groupedImages).length > 0">
        <div class="gallery-header" @click="toggleGallery">
          <h4>🎨 Galería de Sprites</h4>
          <span class="toggle-icon">{{ isGalleryOpen ? '−' : '+' }}</span>
        </div>
        
        <div class="gallery-categories" v-if="isGalleryOpen">
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
                    @error="handleImageError"
                  />
                  <div class="gallery-overlay">
                    <span class="gallery-label">{{ image.name }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import TypeBadge from './TypeBadge.vue'
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
const emit = defineEmits(['analyze', 'image-selected', 'close'])

// Reactive data
const selectedImage = ref(null)
const isGalleryOpen = ref(false)
const openCategories = ref([]) // Will be set dynamically based on available categories

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

// Group images by category and filter out empty ones
const groupedImages = computed(() => {
  const groups = {}
  pokemonImages.value.forEach(image => {
    if (!groups[image.category]) {
      groups[image.category] = []
    }
    groups[image.category].push(image)
  })
  
  // Filter out empty categories
  const filteredGroups = {}
  Object.keys(groups).forEach(category => {
    if (groups[category].length > 0) {
      filteredGroups[category] = groups[category]
    }
  })
  
  return filteredGroups
})

// Methods
const selectImage = (image) => {
  selectedImage.value = image
  emit('image-selected', image)
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

const toggleGallery = () => {
  isGalleryOpen.value = !isGalleryOpen.value
}

// Watcher to set first available category as open by default
watch(groupedImages, (newGroups) => {
  const availableCategories = Object.keys(newGroups)
  if (availableCategories.length > 0 && openCategories.value.length === 0) {
    openCategories.value = [availableCategories[0]]
  }
}, { immediate: true })

const toggleCategory = (category) => {
  const index = openCategories.value.indexOf(category)
  if (index > -1) {
    openCategories.value.splice(index, 1)
  } else {
    openCategories.value.push(category)
  }
}
</script>

<style scoped>
.selected-pokemon {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
}

.pokemon-card {
  display: flex;
  flex-direction: column;
  gap: 25px;
  background: var(--theme-tertiary);
  padding: 35px;
  border-radius: 25px;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
  margin-bottom: 20px;
  max-width: 800px;
  width: 100%;
  border: 1px solid var(--theme-border);
  position: relative;
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
}

.pokemon-header {
  display: flex;
  align-items: center;
  gap: 30px;
  margin-bottom: 20px;
}

.pokemon-image-container {
  position: relative;
  flex-shrink: 0;
  margin-right: 20px;
}

.pokemon-image {
  width: 180px;
  height: 180px;
  object-fit: contain;
  border-radius: 20px;
  background: linear-gradient(135deg, var(--theme-quinary) 0%, var(--theme-quinary) 100%);
  padding: 15px;
  transition: transform 0.3s ease;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.pokemon-image:hover {
  transform: scale(1.05);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.15);
}

.shiny-indicator {
  position: absolute;
  top: -12px;
  right: -12px;
  background: var(--theme-secondary);
  color: var(--theme-tertiary);
  padding: 6px 10px;
  border-radius: 18px;
  font-size: 14px;
  font-weight: bold;
  animation: sparkle 2s infinite;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

@keyframes sparkle {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.1); }
}

.pokemon-basic-info {
  flex: 1;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
  width: 100%;
  margin-right: 20px;
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

.pokemon-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 20px;
}

.pokemon-physical-info,
.pokemon-description,
.pokemon-evolution {
  margin: 0;
}

.pokemon-physical-info h4,
.pokemon-description h4,
.pokemon-evolution h4 {
  margin: 0 0 12px 0;
  color: var(--theme-quaternary);
  font-size: 1.2rem;
  font-weight: 700;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.physical-grid,
.evolution-info {
  display: grid;
  gap: 10px;
  width: 100%;
}

.physical-item,
.evolution-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 18px;
  background: var(--theme-quinary);
  border-radius: 12px;
  border: 1px solid var(--theme-border);
  color: var(--theme-quaternary);
  font-weight: 500;
  transition: all 0.3s ease;
  min-height: 44px;
}

.physical-item:hover,
.evolution-item:hover {
  transform: translateX(5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.physical-label,
.evolution-label {
  font-size: 0.95rem;
  color: var(--theme-quaternary);
  font-weight: 600;
  opacity: 0.8;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
  min-width: 0;
}

.physical-value,
.evolution-value {
  font-size: 0.95rem;
  color: var(--theme-quaternary);
  font-weight: 700;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  text-align: right;
  flex-shrink: 0;
  min-width: 0;
}

.description-text {
  padding: 15px;
  background: var(--theme-quinary);
  border-radius: 12px;
  border: 1px solid var(--theme-border);
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--theme-quaternary);
  margin: 0;
  font-weight: 600;
  width: 100%;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.analyze-btn {
  background: linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-secondary) 100%);
  color: var(--theme-tertiary);
  border: 2px solid var(--theme-border);
  padding: 12px 20px;
  border-radius: 12px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  flex-shrink: 0;
  white-space: nowrap;
}

.analyze-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.25);
  border-color: var(--theme-primary);
}

.btn-icon {
  font-size: 18px;
}

.pokemon-gallery {
  border-top: 2px solid var(--theme-border);
  padding-top: 25px;
}

.gallery-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  padding: 10px 0;
  transition: all 0.3s ease;
}

.gallery-header:hover {
  color: var(--theme-primary);
}

.gallery-header h4 {
  margin: 0;
  color: var(--theme-quaternary);
  font-size: 1.4rem;
  font-weight: 700;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.toggle-icon {
  font-size: 24px;
  font-weight: bold;
  color: var(--theme-primary);
}

.gallery-categories {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 20px;
  width: 100%;
}

.gallery-category {
  background: var(--theme-quinary);
  border-radius: 15px;
  padding: 20px;
  border: 1px solid var(--theme-border);
  width: 100%;
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  padding-bottom: 10px;
  margin-bottom: 15px;
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

@media (max-width: 768px) {
  .pokemon-card {
    padding: 20px;
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
  
  .analyze-btn {
    align-self: center;
    padding: 15px 25px;
    font-size: 16px;
  }
  
  .gallery-grid {
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 12px;
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
    padding: 15px;
    margin: 0 5px;
  }
  
  .pokemon-header {
    gap: 12px;
  }
  
  .analyze-btn {
    padding: 12px 20px;
    font-size: 14px;
  }
  
  .gallery-grid {
    grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
    gap: 8px;
  }
  
  .gallery-image {
    height: 70px;
  }
  
  .gallery-category {
    padding: 12px;
  }
  
  .physical-item,
  .evolution-item {
    padding: 10px 15px;
    min-height: 40px;
  }
}
</style> 
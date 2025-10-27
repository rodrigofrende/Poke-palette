<template>
  <div class="welcome-overlay" :class="{ 'fade-out': isExiting }">
    <div class="welcome-container">
      <!-- Logo y Branding -->
      <div class="welcome-header" :class="{ 'animate-in': showHeader }">
        <div class="brand-logo">
          <div class="pokeball">
            <div class="pokeball-top"></div>
            <div class="pokeball-center">
              <div class="pokeball-button"></div>
            </div>
            <div class="pokeball-bottom"></div>
          </div>
        </div>
        <h1 class="brand-title">PokéPalette</h1>
      </div>

      <!-- Demo Visual -->
      <div class="demo-section" :class="{ 'animate-in': showDemo }">
        <div class="demo-container">
          <div class="demo-pokemon">
            <div class="pokemon-showcase">
              <!-- Loading spinner -->
              <div v-if="imageLoading" class="image-loader">
                <div class="spinner"></div>
              </div>
              <!-- Imagen real con dimensiones explícitas para reservar espacio -->
              <img 
                v-show="!imageLoading"
                :key="currentDemoPokemonIndex"
                :src="currentDemoPokemon.sprite" 
                :alt="currentDemoPokemon.name"
                class="pokemon-image"
                width="100"
                height="100"
                @load="onImageLoaded"
                @error="onImageError"
              />
              <div class="pokemon-name">{{ currentDemoPokemon.name }}</div>
            </div>
          </div>
          
          <div class="demo-arrow">
            <span class="arrow-icon">→</span>
          </div>
          
          <div class="demo-palette">
            <div class="palette-grid">
              <div 
                v-for="(color, index) in currentDemoPokemon.colors" 
                :key="`${currentDemoPokemonIndex}-${index}`"
                class="color-tile"
                :style="{ backgroundColor: color }"
                :class="{ 'animate-color': showColors }"
                :title="color"
              >
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Features -->
      <div class="features-section" :class="{ 'animate-in': showFeatures }">
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">🔍</div>
            <h3 class="feature-title">Búsqueda Inteligente</h3>
            <p class="feature-description">Encuentra cualquier Pokémon al instante</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🎨</div>
            <h3 class="feature-title">Extracción Precisa</h3>
            <p class="feature-description">Colores dominantes con algoritmos avanzados</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📊</div>
            <h3 class="feature-title">Análisis WCAG</h3>
            <p class="feature-description">Contraste y accesibilidad validados</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">💾</div>
            <h3 class="feature-title">Export Múltiple</h3>
            <p class="feature-description">CSS, JSON, imagen y más formatos</p>
          </div>
        </div>
      </div>

      <!-- CTA Button -->
      <div class="cta-section" :class="{ 'animate-in': showStartButton }">
        <button @click="startApp" class="cta-btn">
          <span class="btn-text">Comenzar ahora</span>
          <span class="btn-icon">→</span>
        </button>
        <p class="cta-hint">Presiona Enter para empezar</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { handlePokemonImageError } from '../utils/imageLoader.js'

const emit = defineEmits(['start-app'])

const showHeader = ref(false)
const showDemo = ref(false)
const showColors = ref(false)
const showFeatures = ref(false)
const showStartButton = ref(false)
const isExiting = ref(false)
const currentDemoPokemonIndex = ref(0)
const imageLoading = ref(false)

// Demo Pokémon con sus colores característicos
const demoPokemon = [
  {
    id: 25,
    name: 'Pikachu',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
    colors: ['#FFD700', '#FF6B35', '#8B4513', '#FFE4B5', '#DAA520']
  },
  {
    id: 6,
    name: 'Charizard',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png',
    colors: ['#FF6B35', '#FF4500', '#FFD700', '#000000', '#4682B4']
  },
  {
    id: 1,
    name: 'Bulbasaur',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png',
    colors: ['#51CF66', '#3D9970', '#FF6B6B', '#2D3561', '#85C1E2']
  },
  {
    id: 7,
    name: 'Squirtle',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png',
    colors: ['#4ECDC4', '#85C1E2', '#FFE4B5', '#8B4513', '#FF6B35']
  }
]

const currentDemoPokemon = ref(demoPokemon[0])
let demoInterval = null

const startApp = () => {
  isExiting.value = true
  setTimeout(() => {
    emit('start-app')
  }, 500)
}

const handleKeyPress = (event) => {
  if (event.key === 'Enter') {
    startApp()
  }
}


const onImageLoaded = () => {
  imageLoading.value = false
}

const onImageError = (event) => {
  imageLoading.value = false
  
  // Usar el handler de fallback optimizado
  handlePokemonImageError(
    event,
    currentDemoPokemon.value.id,
    currentDemoPokemon.value.name,
    false
  )
}

const rotateDemoPokemon = () => {
  imageLoading.value = true
  currentDemoPokemonIndex.value = (currentDemoPokemonIndex.value + 1) % demoPokemon.length
  currentDemoPokemon.value = demoPokemon[currentDemoPokemonIndex.value]
  showColors.value = false
  
  // La imagen se cargará automáticamente con el nuevo src
  // El error handler manejará los fallbacks si es necesario
  
  setTimeout(() => {
    showColors.value = true
  }, 100)
}

onMounted(async () => {
  // Simplemente iniciar con las URLs predefinidas
  // El error handler (@error en el template) manejará los fallbacks
  imageLoading.value = false
  
  // Animación secuencial
  setTimeout(() => showHeader.value = true, 100)
  setTimeout(() => showDemo.value = true, 400)
  setTimeout(() => showColors.value = true, 700)
  setTimeout(() => showFeatures.value = true, 1000)
  setTimeout(() => showStartButton.value = true, 1300)
  
  // Rotar demo pokemon cada 4 segundos
  demoInterval = setInterval(rotateDemoPokemon, 4000)
  
  // Listener para Enter
  window.addEventListener('keypress', handleKeyPress)
})

onBeforeUnmount(() => {
  if (demoInterval) {
    clearInterval(demoInterval)
  }
  window.removeEventListener('keypress', handleKeyPress)
})
</script>

<style scoped>
.welcome-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, var(--theme-dark) 0%, var(--theme-dark-alt) 50%, #0F172A 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
  transition: opacity 0.5s ease-out;
  overflow-y: auto;
  padding: var(--spacing-md);
}

.welcome-overlay.fade-out {
  opacity: 0;
}

.welcome-container {
  max-width: 1100px;
  width: 100%;
  padding: var(--spacing-lg) var(--spacing-xl);
  text-align: center;
  color: white;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  justify-content: center;
  min-height: 100vh;
  overflow-y: auto;
}

/* Header */
.welcome-header {
  opacity: 0;
  transform: translateY(-30px);
  transition: all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.welcome-header.animate-in {
  opacity: 1;
  transform: translateY(0);
}

.brand-logo {
  margin-bottom: var(--spacing-lg);
  display: flex;
  justify-content: center;
}

.pokeball {
  width: 90px;
  height: 90px;
  position: relative;
  animation: float 3s ease-in-out infinite;
  filter: drop-shadow(0 10px 30px rgba(255, 59, 59, 0.5));
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-15px) rotate(5deg);
  }
}

.pokeball-top {
  width: 90px;
  height: 45px;
  background: linear-gradient(135deg, var(--theme-primary) 0%, #FF4500 100%);
  border-radius: 90px 90px 0 0;
  position: absolute;
  top: 0;
  box-shadow: inset 0 -3px 8px rgba(0, 0, 0, 0.2);
}

.pokeball-bottom {
  width: 90px;
  height: 45px;
  background: linear-gradient(135deg, #FFFFFF 0%, #E0E0E0 100%);
  border-radius: 0 0 90px 90px;
  position: absolute;
  bottom: 0;
  box-shadow: inset 0 3px 8px rgba(0, 0, 0, 0.1);
}

.pokeball-center {
  width: 32px;
  height: 32px;
  background: #FFFFFF;
  border: 4px solid var(--theme-gray-900);
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 0 4px #FFFFFF, 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pokeball-button {
  width: 12px;
  height: 12px;
  background: var(--theme-gray-300);
  border-radius: 50%;
  border: 2px solid var(--theme-gray-700);
}

.brand-title {
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 800;
  margin: 0 0 var(--spacing-md) 0;
  background: linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-secondary) 50%, var(--theme-accent) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 2px;
  text-shadow: 0 0 40px rgba(255, 107, 107, 0.3);
  /* Altura mínima para reservar espacio y evitar layout shifts */
  min-height: 4rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-subtitle {
  font-size: clamp(1rem, 2vw, 1.3rem);
  color: var(--theme-gray-300);
  margin: 0;
  font-weight: 500;
  letter-spacing: 0.5px;
}

/* Demo Section */
.demo-section {
  opacity: 0;
  transform: scale(0.9);
  transition: all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.demo-section.animate-in {
  opacity: 1;
  transform: scale(1);
}

.demo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-xl);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.demo-pokemon {
  flex-shrink: 0;
}

.pokemon-showcase {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  border: 2px solid rgba(255, 255, 255, 0.15);
  box-shadow: var(--shadow-xl);
  position: relative;
  /* Altura fija para reservar espacio y evitar layout shifts */
  height: 170px;
  width: 140px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.image-loader {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.2);
  border-top: 4px solid var(--theme-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.pokemon-image {
  width: 100px;
  height: 100px;
  object-fit: contain;
  animation: pokemonFloat 3s ease-in-out infinite;
  filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.3));
  /* Reservar espacio explícito para prevenir layout shifts */
  flex-shrink: 0;
  display: block;
}

@keyframes pokemonFloat {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-12px);
  }
}

.pokemon-name {
  margin-top: var(--spacing-sm);
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--theme-accent);
  text-transform: capitalize;
  letter-spacing: 1px;
  /* Altura fija para evitar layout shifts al cambiar nombres */
  height: 1.5em;
  line-height: 1.5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.demo-arrow {
  font-size: 2.5rem;
  color: var(--theme-primary);
  animation: arrowPulse 2s ease-in-out infinite;
}

@keyframes arrowPulse {
  0%, 100% {
    transform: translateX(0) scale(1);
    opacity: 1;
  }
  50% {
    transform: translateX(10px) scale(1.1);
    opacity: 0.7;
  }
}

.demo-palette {
  flex-shrink: 0;
}

.palette-grid {
  display: grid;
  grid-template-columns: repeat(5, 50px);
  gap: var(--spacing-sm);
  /* Dimensiones fijas para evitar layout shifts */
  width: 282px; /* 5 * 50px + 4 * 8px (gap) */
  height: 50px;
}

.color-tile {
  width: 50px;
  height: 50px;
  border-radius: var(--radius-md);
  border: 3px solid rgba(255, 255, 255, 0.2);
  box-shadow: var(--shadow-md);
  opacity: 0;
  transform: scale(0) rotate(-180deg);
  transition: all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  /* Reservar espacio en el layout desde el principio */
  min-width: 50px;
  min-height: 50px;
  flex-shrink: 0;
}

.color-tile.animate-color {
  opacity: 1;
  transform: scale(1) rotate(0deg);
}

.color-tile:nth-child(1) { transition-delay: 0.1s; }
.color-tile:nth-child(2) { transition-delay: 0.2s; }
.color-tile:nth-child(3) { transition-delay: 0.3s; }
.color-tile:nth-child(4) { transition-delay: 0.4s; }
.color-tile:nth-child(5) { transition-delay: 0.5s; }

.color-tile:hover {
  transform: scale(1.15) rotate(5deg);
  box-shadow: var(--shadow-xl);
  border-color: rgba(255, 255, 255, 0.5);
}

/* Features */
.features-section {
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.features-section.animate-in {
  opacity: 1;
  transform: translateY(0);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--spacing-lg);
}

.feature-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%);
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  transition: all var(--transition-base);
  animation: fadeIn 0.6s ease backwards;
  /* Altura mínima para consistencia y evitar layout shifts */
  min-height: 160px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.feature-card:nth-child(1) { animation-delay: 0.1s; }
.feature-card:nth-child(2) { animation-delay: 0.2s; }
.feature-card:nth-child(3) { animation-delay: 0.3s; }
.feature-card:nth-child(4) { animation-delay: 0.4s; }

.feature-card:hover {
  transform: translateY(-8px);
  border-color: var(--theme-primary);
  box-shadow: 0 12px 40px rgba(255, 107, 107, 0.3);
  background: linear-gradient(135deg, rgba(255, 107, 107, 0.15) 0%, rgba(78, 205, 196, 0.1) 100%);
}

.feature-icon {
  font-size: 2.5rem;
  margin-bottom: var(--spacing-sm);
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
  /* Dimensiones fijas para el icono */
  height: 2.5rem;
  width: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.feature-title {
  font-size: var(--text-lg);
  font-weight: 700;
  margin: 0 0 var(--spacing-sm) 0;
  color: var(--theme-accent);
  letter-spacing: 0.5px;
}

.feature-description {
  font-size: var(--text-sm);
  color: var(--theme-gray-300);
  margin: 0;
  line-height: 1.5;
}

/* CTA */
.cta-section {
  opacity: 0;
  transform: scale(0.9);
  transition: all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
}

.cta-section.animate-in {
  opacity: 1;
  transform: scale(1);
}

.cta-btn {
  background: var(--gradient-primary);
  color: white;
  border: none;
  padding: var(--spacing-md) var(--spacing-2xl);
  border-radius: var(--radius-full);
  font-size: var(--text-lg);
  font-weight: 700;
  cursor: pointer;
  transition: all var(--transition-base);
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  box-shadow: var(--shadow-primary);
  letter-spacing: 0.5px;
}

.cta-btn:hover {
  transform: translateY(-4px) scale(1.05);
  box-shadow: 0 16px 48px rgba(255, 107, 107, 0.4);
}

.cta-btn:active {
  transform: translateY(-2px) scale(1.02);
}

.btn-icon {
  transition: transform var(--transition-base);
  font-size: 1.2em;
}

.cta-btn:hover .btn-icon {
  transform: translateX(8px);
}

.cta-hint {
  margin: 0;
  font-size: var(--text-xs);
  color: var(--theme-gray-500);
  font-style: italic;
  text-align: center;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 992px) {
  .demo-container {
    flex-direction: column;
    gap: var(--spacing-xl);
  }
  
  .demo-arrow {
    transform: rotate(90deg);
  }
  
  .features-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .palette-grid {
    /* Mantener dimensiones consistentes en tablets */
    grid-template-columns: repeat(5, 50px);
    width: 282px;
  }
}

@media (max-width: 768px) {
  .welcome-container {
    padding: var(--spacing-md);
    gap: var(--spacing-md);
  }
  
  .brand-title {
    font-size: 2rem;
    min-height: 3rem;
  }
  
  .brand-subtitle {
    font-size: 0.95rem;
  }
  
  .pokemon-image {
    width: 80px;
    height: 80px;
  }
  
  .pokemon-showcase {
    height: 150px;
    width: 120px;
  }
  
  .palette-grid {
    grid-template-columns: repeat(5, 40px);
    width: 232px; /* 5 * 40px + 4 * 8px */
    height: 40px;
  }
  
  .color-tile {
    width: 40px;
    height: 40px;
    min-width: 40px;
    min-height: 40px;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-sm);
  }
  
  .feature-card {
    padding: var(--spacing-md);
    min-height: 140px;
  }
  
  .feature-icon {
    font-size: 2rem;
    height: 2rem;
    width: 2rem;
  }
  
  .cta-btn {
    padding: var(--spacing-sm) var(--spacing-xl);
    font-size: var(--text-base);
  }
  
  .demo-container {
    padding: var(--spacing-md);
    gap: var(--spacing-md);
  }
}

@media (max-width: 480px) {
  .welcome-overlay {
    padding: var(--spacing-xs);
  }
  
  .welcome-container {
    padding: var(--spacing-sm);
    gap: var(--spacing-sm);
  }
  
  .pokeball {
    width: 60px;
    height: 60px;
  }
  
  .pokeball-top,
  .pokeball-bottom {
    width: 60px;
  }
  
  .pokeball-top {
    height: 30px;
  }
  
  .pokeball-bottom {
    height: 30px;
  }
  
  .brand-title {
    font-size: 1.75rem;
    min-height: 2.5rem;
  }
  
  .brand-subtitle {
    font-size: 0.85rem;
  }
  
  .demo-container {
    padding: var(--spacing-sm);
    gap: var(--spacing-sm);
  }
  
  .pokemon-image {
    width: 70px;
    height: 70px;
  }
  
  .pokemon-showcase {
    height: 130px;
    width: 110px;
    padding: var(--spacing-sm);
  }
  
  .palette-grid {
    grid-template-columns: repeat(5, 35px);
    width: 195px; /* 5 * 35px + 4 * 5px (gap xs) */
    height: 35px;
    gap: var(--spacing-xs);
  }
  
  .color-tile {
    width: 35px;
    height: 35px;
    min-width: 35px;
    min-height: 35px;
    border-width: 2px;
  }
  
  .feature-card {
    padding: var(--spacing-sm);
    min-height: 120px;
  }
  
  .feature-icon {
    font-size: 2rem;
    height: 2rem;
    width: 2rem;
    margin-bottom: var(--spacing-xs);
  }
  
  .feature-title {
    font-size: var(--text-base);
  }
  
  .feature-description {
    font-size: var(--text-xs);
  }
  
  .cta-btn {
    padding: var(--spacing-sm) var(--spacing-lg);
    font-size: var(--text-sm);
  }
}
</style>

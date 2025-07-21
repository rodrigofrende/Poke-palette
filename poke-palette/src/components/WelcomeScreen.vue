<template>
  <div class="welcome-overlay" :class="{ 'fade-out': isExiting }">
    <div class="welcome-container">
      <!-- Título principal -->
      <div class="welcome-header" :class="{ 'animate-in': showHeader }">
        <div class="pokemon-logo">
          <div class="pokeball">
            <div class="pokeball-top"></div>
            <div class="pokeball-center"></div>
            <div class="pokeball-bottom"></div>
          </div>
        </div>
        <h1 class="welcome-title">Analizador de Paletas Pokémon</h1>
        <p class="welcome-subtitle">Extrae y analiza colores de tus Pokémon favoritos</p>
      </div>

      <!-- Ejemplo animado -->
      <div class="demo-section" :class="{ 'animate-in': showDemo }">
        <div class="demo-container">
          <div class="demo-pokemon">
            <div class="pokemon-card">
              <img 
                src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png" 
                alt="Pikachu"
                class="pokemon-image"
              />
              <div class="pokemon-info">
                <h3>Pikachu</h3>
                <p>#025</p>
              </div>
            </div>
          </div>
          
          <div class="demo-arrow">→</div>
          
          <div class="demo-palette">
            <h4>Paleta Extraída</h4>
            <div class="palette-colors">
              <div 
                v-for="(color, index) in demoColors" 
                :key="index"
                class="color-swatch"
                :style="{ backgroundColor: color }"
                :class="{ 'animate-color': showColors }"
              >
                <span class="color-hex">{{ color }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Características rápidas -->
      <div class="features-grid" :class="{ 'animate-in': showFeatures }">
        <div class="feature-item">
          <div class="feature-icon">🔍</div>
          <h3>Búsqueda Inteligente</h3>
          <p>Encuentra cualquier Pokémon</p>
        </div>
        <div class="feature-item">
          <div class="feature-icon">🎨</div>
          <h3>Extracción Automática</h3>
          <p>Colores dominantes</p>
        </div>
        <div class="feature-item">
          <div class="feature-icon">📊</div>
          <h3>Análisis de Contraste</h3>
          <p>Accesibilidad WCAG</p>
        </div>
        <div class="feature-item">
          <div class="feature-icon">💾</div>
          <h3>Exportación Fácil</h3>
          <p>Múltiples formatos</p>
        </div>
      </div>

      <!-- Botón de comenzar -->
      <div class="start-section" :class="{ 'animate-in': showStartButton }">
        <button @click="startApp" class="start-btn">
          <span class="btn-text">¡Comenzar!</span>
          <span class="btn-icon">→</span>
        </button>
        <p class="start-hint">Presiona F5 para ver esta introducción nuevamente</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const emit = defineEmits(['start-app'])

const showHeader = ref(false)
const showDemo = ref(false)
const showColors = ref(false)
const showFeatures = ref(false)
const showStartButton = ref(false)
const isExiting = ref(false)

const demoColors = [
  '#FFD700', // Amarillo dorado
  '#FF6B35', // Naranja
  '#8B4513', // Marrón
  '#FFE4B5', // Beige claro
  '#DAA520'  // Dorado
]

const startApp = () => {
  isExiting.value = true
  setTimeout(() => {
    emit('start-app')
  }, 500)
}

onMounted(() => {
  // Animación secuencial más rápida
  setTimeout(() => showHeader.value = true, 200)
  setTimeout(() => showDemo.value = true, 500)
  setTimeout(() => showColors.value = true, 800)
  setTimeout(() => showFeatures.value = true, 1100)
  setTimeout(() => showStartButton.value = true, 1400)
})
</script>

<style scoped>
.welcome-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  transition: opacity 0.5s ease-out;
}

.welcome-overlay.fade-out {
  opacity: 0;
}

.welcome-container {
  max-width: 700px;
  padding: 20px;
  text-align: center;
  color: white;
}

/* Header animado */
.welcome-header {
  opacity: 0;
  transform: translateY(-30px);
  transition: all 0.8s ease-out;
  margin-bottom: 40px;
}

.welcome-header.animate-in {
  opacity: 1;
  transform: translateY(0);
}

.pokemon-logo {
  margin-bottom: 20px;
}

.pokeball {
  width: 60px;
  height: 60px;
  margin: 0 auto;
  position: relative;
  animation: bounce 2s infinite;
}

.pokeball-top {
  width: 60px;
  height: 30px;
  background: #ff3b3b;
  border-radius: 30px 30px 0 0;
  position: absolute;
  top: 0;
}

.pokeball-bottom {
  width: 60px;
  height: 30px;
  background: white;
  border-radius: 0 0 30px 30px;
  position: absolute;
  bottom: 0;
}

.pokeball-center {
  width: 15px;
  height: 15px;
  background: white;
  border: 2px solid #333;
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

.welcome-title {
  font-size: 2rem;
  font-weight: bold;
  margin: 10px 0 5px 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.welcome-subtitle {
  font-size: 1rem;
  opacity: 0.9;
  margin-bottom: 20px;
}

/* Demo section */
.demo-section {
  margin: 15px 0;
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s ease-out;
}

.demo-section.animate-in {
  opacity: 1;
  transform: translateY(0);
}

.demo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  margin: 10px 0;
}

.demo-pokemon {
  flex-shrink: 0;
}

.pokemon-card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  text-align: center;
}

.pokemon-image {
  width: 80px;
  height: 80px;
  margin-bottom: 6px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

.pokemon-info h3 {
  margin: 0 0 2px 0;
  font-size: 0.9rem;
}

.pokemon-info p {
  margin: 0;
  opacity: 0.8;
  font-size: 0.7rem;
}

.demo-arrow {
  font-size: 1.2rem;
  color: #ff3b3b;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.demo-palette {
  flex-shrink: 0;
}

.demo-palette h4 {
  margin: 0 0 8px 0;
  font-size: 0.9rem;
}

.palette-colors {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: center;
}

.color-swatch {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  opacity: 0;
  transform: scale(0.5);
  transition: all 0.5s ease-out;
}

.color-swatch.animate-color {
  opacity: 1;
  transform: scale(1);
}

.color-hex {
  font-size: 0.5rem;
  font-weight: bold;
  color: white;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

/* Features grid */
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
  margin: 15px 0;
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s ease-out;
}

.features-grid.animate-in {
  opacity: 1;
  transform: translateY(0);
}

.feature-item {
  background: rgba(255, 255, 255, 0.1);
  padding: 12px;
  border-radius: 10px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: transform 0.3s ease;
}

.feature-item:hover {
  transform: translateY(-5px);
}

.feature-icon {
  font-size: 1.5rem;
  margin-bottom: 8px;
}

.feature-item h3 {
  font-size: 0.9rem;
  margin-bottom: 4px;
}

.feature-item p {
  font-size: 0.7rem;
  opacity: 0.8;
  line-height: 1.2;
}

/* Start button */
.start-section {
  margin-top: 15px;
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s ease-out;
}

.start-section.animate-in {
  opacity: 1;
  transform: translateY(0);
}

.start-btn {
  background: linear-gradient(45deg, #ff3b3b, #ff6b6b);
  color: white;
  border: none;
  padding: 10px 25px;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0 auto;
}

.start-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(255, 59, 59, 0.3);
}

.btn-icon {
  transition: transform 0.3s ease;
}

.start-btn:hover .btn-icon {
  transform: translateX(5px);
}

.start-hint {
  margin-top: 8px;
  font-size: 0.7rem;
  opacity: 0.7;
}

/* Responsive */
@media (max-width: 768px) {
  .welcome-container {
    padding: 10px;
  }
  
  .welcome-title {
    font-size: 1.5rem;
  }
  
  .demo-container {
    flex-direction: column;
    gap: 10px;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .palette-colors {
    gap: 4px;
  }
  
  .color-swatch {
    width: 35px;
    height: 35px;
  }
  
  .color-hex {
    font-size: 0.4rem;
  }
}
</style> 
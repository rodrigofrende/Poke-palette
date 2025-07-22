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
  align-items: flex-start;
  justify-content: center;
  z-index: 1000;
  transition: opacity 0.5s ease-out;
  overflow-y: auto;
}

.welcome-overlay.fade-out {
  opacity: 0;
}

.welcome-container {
  max-width: 1200px;
  padding: 32px;
  text-align: center;
  color: white;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0;
  overflow-y: auto;
  overflow-x: hidden;
}

/* Header animado */
.welcome-header {
  opacity: 0;
  transform: translateY(-30px);
  transition: all 0.8s cubic-bezier(.77,0,.18,1);
  margin-bottom: 24px;
  background: rgba(30,30,30,0.7);
  border-radius: 18px;
  padding: 20px 0 16px 0;
  box-shadow: 0 4px 24px 0 rgba(0,0,0,0.25);
}

.welcome-header.animate-in {
  opacity: 1;
  transform: translateY(0);
}

.pokemon-logo {
  margin-bottom: 16px;
}

.pokeball {
  width: 70px;
  height: 70px;
  margin: 0 auto;
  position: relative;
  animation: bounce 2s infinite;
}

.pokeball-top {
  width: 70px;
  height: 35px;
  background: #ff3b3b;
  border-radius: 35px 35px 0 0;
  position: absolute;
  top: 0;
}

.pokeball-bottom {
  width: 70px;
  height: 35px;
  background: white;
  border-radius: 0 0 35px 35px;
  position: absolute;
  bottom: 0;
}

.pokeball-center {
  width: 18px;
  height: 18px;
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
  font-family: var(--font-pokemon);
  font-size: 1.5rem;
  font-weight: bold;
  margin: 16px 0 8px 0;
  letter-spacing: 1.5px;
  text-shadow: 2px 2px 6px rgba(0,0,0,0.7), 0 1px 0 #fff;
  line-height: 1.2;
}

.welcome-subtitle {
  font-family: var(--font-body);
  font-size: 1.2rem;
  opacity: 0.92;
  margin-bottom: 20px;
  color: #e0e0e0;
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
}

/* Demo section */
.demo-section {
  margin: 20px 0 16px 0;
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s cubic-bezier(.77,0,.18,1);
}

.demo-section.animate-in {
  opacity: 1;
  transform: translateY(0);
}

.demo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  margin: 12px 0;
}

.demo-pokemon {
  flex-shrink: 0;
  filter: drop-shadow(0 2px 8px #0008);
}

.pokemon-card {
  background: rgba(255,255,255,0.13);
  border-radius: 16px;
  padding: 16px 14px 14px 14px;
  backdrop-filter: blur(12px);
  border: 1.5px solid rgba(255,255,255,0.22);
  text-align: center;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.18);
}

.pokemon-image {
  width: 80px;
  height: 80px;
  margin-bottom: 8px;
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
  font-family: var(--font-body);
  font-size: 1.2rem;
  margin: 0 0 4px 0;
  color: #fffbe7;
  letter-spacing: 0.5px;
}

.pokemon-info p {
  font-family: var(--font-body);
  margin: 0;
  opacity: 0.85;
  font-size: 0.95rem;
  color: #ffe066;
}

.demo-arrow {
  font-size: 1.8rem;
  color: #ff3b3b;
  animation: pulse 2s infinite;
  filter: drop-shadow(0 1px 2px #0008);
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
  background: rgba(255,255,255,0.08);
  border-radius: 14px;
  padding: 14px 18px 12px 18px;
  box-shadow: 0 2px 8px 0 rgba(0,0,0,0.13);
}

.demo-palette h4 {
  margin: 0 0 10px 0;
  font-size: 1.1rem;
  font-family: var(--font-body);
  color: #ffe066;
  letter-spacing: 0.5px;
}

.palette-colors {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
}

.color-swatch {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  opacity: 0;
  transform: scale(0.5);
  transition: all 0.5s cubic-bezier(.77,0,.18,1);
  box-shadow: 0 2px 8px 0 rgba(0,0,0,0.18);
  border: 2px solid #fff2;
}

.color-swatch.animate-color {
  opacity: 1;
  transform: scale(1);
}

.color-hex {
  font-size: 0.65rem;
  font-weight: bold;
  color: #fff;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
  background: rgba(0,0,0,0.18);
  border-radius: 4px;
  padding: 2px 4px;
}

/* Features grid */
.features-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin: 20px 0 0 0;
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s cubic-bezier(.77,0,.18,1);
}

.features-grid.animate-in {
  opacity: 1;
  transform: translateY(0);
}

.feature-item {
  background: rgba(255,255,255,0.10);
  padding: 16px 12px 14px 12px;
  border-radius: 16px;
  backdrop-filter: blur(10px);
  border: 1.5px solid rgba(255,255,255,0.22);
  transition: transform 0.3s cubic-bezier(.77,0,.18,1);
  box-shadow: 0 2px 8px 0 rgba(0,0,0,0.13);
}

.feature-item:hover {
  transform: translateY(-3px) scale(1.02);
}

.feature-icon {
  font-size: 1.8rem;
  margin-bottom: 8px;
}

.feature-item h3 {
  font-size: 1rem;
  margin-bottom: 4px;
  font-family: var(--font-body);
  color: #ffe066;
  letter-spacing: 0.5px;
}

.feature-item p {
  font-size: 0.8rem;
  opacity: 0.85;
  line-height: 1.2;
  font-family: var(--font-body);
  color: #f8f8f8;
}

/* Start button */
.start-section {
  margin-top: 40px;
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s cubic-bezier(.77,0,.18,1);
}

.start-section.animate-in {
  opacity: 1;
  transform: translateY(0);
}

.start-btn {
  background: linear-gradient(45deg, #ff3b3b, #ff6b6b);
  color: white;
  border: none;
  padding: 16px 36px;
  border-radius: 50px;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(.77,0,.18,1);
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 auto;
  box-shadow: 0 2px 12px 0 rgba(255,59,59,0.18);
}

.start-btn:hover {
  transform: translateY(-2px) scale(1.04);
  box-shadow: 0 10px 24px rgba(255,59,59,0.28);
}

.btn-icon {
  transition: transform 0.3s cubic-bezier(.77,0,.18,1);
}

.start-btn:hover .btn-icon {
  transform: translateX(7px);
}

.start-hint {
  margin-top: 8px;
  font-size: 0.75rem;
  opacity: 0.7;
  color: #e0e0e0;
}

/* Responsive */
@media (max-width: 768px) {
  .welcome-container {
    padding: 20px;
    min-height: 100vh;
    justify-content: flex-start;
    padding-top: 40px;
    padding-bottom: 40px;
  }
  
  .welcome-title {
    font-size: 1.3rem;
  }
  
  .demo-container {
    flex-direction: column;
    gap: 12px;
  }
  
  .features-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  
  .palette-colors {
    gap: 6px;
  }
  
  .color-swatch {
    width: 40px;
    height: 40px;
  }
  
  .color-hex {
    font-size: 0.5rem;
  }
  
  .start-btn {
    font-size: 1.1rem;
    padding: 14px 28px;
  }
  
  .pokemon-image {
    width: 70px;
    height: 70px;
  }
  
  .feature-item {
    padding: 14px 10px 12px 10px;
  }
  
  .feature-item h3 {
    font-size: 0.9rem;
  }
  
  .feature-item p {
    font-size: 0.75rem;
  }
  
  .welcome-title {
    font-size: 1.2rem;
  }
  
  .welcome-subtitle {
    font-size: 1rem;
  }
  
  .demo-section {
    margin: 15px 0 12px 0;
  }
  
  .features-grid {
    margin-top: 20px;
  }
  
  .start-section {
    margin-top: 30px;
  }
}

@media (max-width: 480px) {
  .welcome-container {
    padding: 15px;
    padding-top: 30px;
    padding-bottom: 30px;
  }
  
  .welcome-title {
    font-size: 1.1rem;
  }
  
  .welcome-subtitle {
    font-size: 0.9rem;
  }
  
  .demo-container {
    gap: 8px;
  }
  
  .pokemon-image {
    width: 60px;
    height: 60px;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  
  .feature-item {
    padding: 12px 8px 10px 8px;
  }
  
  .start-btn {
    font-size: 1rem;
    padding: 12px 24px;
  }
}
</style> 
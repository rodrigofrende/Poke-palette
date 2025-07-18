<template>
  <div class="results-section">
    <h3>Paleta de Colores <InfoTooltip text="Muestra los colores dominantes extraídos de la imagen. Los colores están ordenados por frecuencia de aparición. Haz clic en cualquier color para copiar su código hexadecimal al portapapeles." size="medium" /></h3>
    
    <!-- Color palette -->
    <div class="palette-display">
      <div 
        v-for="(color, index) in palette" 
        :key="index"
        class="color-item"
        @click="copyColor(color.hex)"
      >
        <div 
          class="color-swatch" 
          :style="{ backgroundColor: color.hex }"
        ></div>
        <div class="color-info">
          <span class="color-hex">{{ color.hex }}</span>
          <span class="color-rgb">RGB({{ color.rgb.join(', ') }})</span>
          <span class="color-percentage">{{ color.percentage.toFixed(1) }}%</span>
        </div>
      </div>
    </div>
    
    <!-- Mensaje informativo cuando hay pocos colores -->
    <div v-if="palette.length < 8" class="palette-info">
      <p class="info-message">
        <span class="info-icon">ℹ️</span>
        Se encontraron {{ palette.length }} colores dominantes en la imagen. 
        <span v-if="palette.length < 4">La imagen tiene una paleta de colores limitada.</span>
      </p>
    </div>
    
    <!-- Botones de theme -->
    <div class="theme-buttons">
      <div class="button-container">
        <button @click="applyThemeGlobally" class="theme-btn apply">
          Aplicar paleta como theme
        </button>
        <InfoTooltip text="Aplica la paleta de colores extraída como tema completo de la aplicación, incluyendo fondo y colores internos." size="small" />
      </div>
      <div class="button-container">
        <button @click="restoreDefaultTheme" class="theme-btn restore">
          Restaurar theme por defecto
        </button>
        <InfoTooltip text="Restaura la configuración de colores original de la aplicación. Revierte todos los cambios de tema aplicados." size="small" />
      </div>
    </div>
    
    <!-- Notification -->
    <Transition name="notification">
      <div v-if="showNotification" class="notification">
        <div class="notification-content">
          <span class="notification-icon">✓</span>
          <span class="notification-text">{{ notificationText }}</span>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import InfoTooltip from './InfoTooltip.vue'

// Props
const props = defineProps({
  palette: {
    type: Array,
    required: true
  },
  pokemonName: {
    type: String,
    default: 'la imagen'
  }
})

// Emits
const emit = defineEmits(['apply-theme', 'restore-theme'])

// Reactive data
const showNotification = ref(false)
const notificationText = ref('')

// NO watcher ni efecto sobre palette aquí
// Solo el botón llama a applyThemeGlobally

// Función para generar color de borde basado en el color principal
function getBorderColor(hexColor) {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  const darkerR = Math.max(0, r - 40);
  const darkerG = Math.max(0, g - 40);
  const darkerB = Math.max(0, b - 40);
  
  return `#${darkerR.toString(16).padStart(2, '0')}${darkerG.toString(16).padStart(2, '0')}${darkerB.toString(16).padStart(2, '0')}`;
}

// Methods
const copyColor = async (hex) => {
  try {
    await navigator.clipboard.writeText(hex)
    notificationText.value = `¡Color ${hex} copiado al portapapeles!`
    showNotification.value = true
    
    // Hide notification after 3 seconds
    setTimeout(() => {
      showNotification.value = false
    }, 3000)
  } catch (error) {
    console.error('Error copying color:', error)
    
    // Fallback para navegadores que no soportan clipboard API
    const textArea = document.createElement('textarea')
    textArea.value = hex
    document.body.appendChild(textArea)
    textArea.select()
    
    try {
      document.execCommand('copy')
      notificationText.value = `¡Color ${hex} copiado al portapapeles!`
    } catch (fallbackError) {
      notificationText.value = 'Error al copiar el color. Intenta seleccionar y copiar manualmente.'
    }
    
    document.body.removeChild(textArea)
    showNotification.value = true
    
    setTimeout(() => {
      showNotification.value = false
    }, 3000)
  }
}

const applyThemeGlobally = () => {
  if (props.palette.length === 0) return
  
  const root = document.documentElement
  
  // Aplicar colores de la paleta como variables CSS globales
  props.palette.forEach((color, index) => {
    root.style.setProperty(`--theme-color-${index + 1}`, color.hex)
  })
  
  // Aplicar colores principales incluyendo fondo
  if (props.palette.length >= 1) {
    root.style.setProperty('--theme-primary', props.palette[0].hex)
    root.style.setProperty('--theme-border', getBorderColor(props.palette[0].hex))
  }
  if (props.palette.length >= 2) {
    root.style.setProperty('--theme-secondary', props.palette[1].hex)
    root.style.setProperty('--theme-tertiary', props.palette[1].hex)
  }
  if (props.palette.length >= 3) {
    root.style.setProperty('--theme-quaternary', props.palette[2].hex)
  }
  if (props.palette.length >= 4) {
    root.style.setProperty('--theme-quinary', props.palette[3].hex)
  }
  if (props.palette.length >= 5) {
    root.style.setProperty('--theme-senary', props.palette[4].hex)
  }
  if (props.palette.length >= 6) {
    root.style.setProperty('--theme-septenary', props.palette[5].hex)
  }
  
  console.log('Tema completo aplicado (incluyendo fondo):', props.palette.map(c => c.hex))
  emit('apply-theme')
}

const restoreDefaultTheme = () => {
  const root = document.documentElement
  
  // Restaurar colores por defecto SOLO si el usuario lo pide explícitamente
  root.style.setProperty('--theme-primary', '#667eea')
  root.style.setProperty('--theme-secondary', '#764ba2')
  root.style.setProperty('--theme-tertiary', '#ffffff')
  root.style.setProperty('--theme-quaternary', '#2d3748')
  root.style.setProperty('--theme-quinary', '#f7fafc')
  root.style.setProperty('--theme-border', '#e2e8f0')
  root.style.setProperty('--theme-senary', '#a0aec0')
  root.style.setProperty('--theme-septenary', '#718096')
  
  console.log('Tema restaurado por defecto')
  emit('restore-theme')
}

// Solo la función applyPaletteAsBackground puede cambiar --theme-primary y --theme-secondary
</script>

<style scoped>
.results-section {
  background: var(--theme-tertiary);
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--theme-border);
}

.results-section h3 {
  color: var(--theme-quaternary);
  margin-bottom: 20px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.info-icon {
  font-size: 1.1rem;
  color: var(--theme-primary);
  cursor: help;
  opacity: 0.8;
  transition: all 0.3s ease;
  display: inline-block;
}

.info-icon:hover {
  opacity: 1;
  transform: scale(1.1);
  color: var(--theme-secondary);
}

.palette-display {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
  margin-bottom: 30px;
}

.color-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  border-radius: 10px;
  background: var(--theme-quinary);
  cursor: pointer;
  transition: transform 0.2s ease;
  border: 1px solid var(--theme-border);
}

.color-item:hover {
  transform: translateY(-2px);
}

.color-swatch {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  border: 2px solid var(--theme-border);
}

.color-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.color-hex {
  font-weight: bold;
  font-family: monospace;
  font-size: 1.1rem;
  color: var(--theme-quaternary);
}

.color-rgb {
  font-size: 0.9rem;
  color: var(--theme-quaternary);
  opacity: 0.7;
}

.color-percentage {
  font-size: 0.8rem;
  color: var(--theme-quaternary);
  opacity: 0.5;
}

.palette-info {
  text-align: center;
  margin-bottom: 20px;
  padding: 15px;
  background: var(--theme-quinary);
  border-radius: 10px;
  border: 1px solid var(--theme-border);
}

.info-message {
  color: var(--theme-quaternary);
  font-size: 0.95rem;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.info-message .info-icon {
  font-size: 1.1rem;
  opacity: 0.8;
}

.theme-buttons {
  display: flex;
  gap: 16px;
  margin: 24px 0 0 0;
  justify-content: center;
  flex-wrap: wrap;
}

.button-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.theme-btn {
  padding: 10px 22px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  border: 2px solid var(--theme-border);
  transition: background 0.3s, color 0.3s, transform 0.2s;
}

.theme-btn.apply {
  background: var(--theme-primary);
  color: var(--theme-tertiary);
  border-color: var(--theme-primary);
}

.theme-btn.restore {
  background: var(--theme-quinary);
  color: var(--theme-quaternary);
  border-color: var(--theme-border);
}

.theme-btn:hover {
  transform: scale(1.05);
  filter: brightness(1.1);
  border-color: var(--theme-border-hover);
}

@media (max-width: 768px) {
  .palette-display {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .theme-buttons {
    flex-direction: column;
    align-items: center;
  }
}

@media (max-width: 480px) {
  .palette-display {
    grid-template-columns: 1fr;
  }
}

/* Notification styles */
.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10000;
  max-width: 300px;
}

.notification-content {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 12px 16px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.notification-icon {
  font-size: 16px;
  font-weight: bold;
  color: white;
}

.notification-text {
  font-size: 14px;
  font-weight: 500;
  color: white;
}

/* Notification animations */
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%) scale(0.9);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.9);
}

.notification-enter-to,
.notification-leave-from {
  opacity: 1;
  transform: translateX(0) scale(1);
}

/* Responsive notification */
@media (max-width: 768px) {
  .notification {
    top: 10px;
    right: 10px;
    left: 10px;
    max-width: none;
  }
  
  .notification-content {
    padding: 10px 14px;
  }
  
  .notification-text {
    font-size: 13px;
  }
}

/* Responsive para móviles */
@media (max-width: 768px) {
  .theme-buttons {
    flex-direction: column;
    gap: 12px;
  }
  
  .button-container {
    width: 100%;
  }
  
  .theme-btn {
    width: 100%;
    padding: 12px 16px;
  }
}
</style> 
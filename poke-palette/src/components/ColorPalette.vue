<template>
  <div class="palette-container">
    <h3>Paleta de Colores <InfoTooltip text="Muestra los colores dominantes extraídos de la imagen. Los colores están ordenados por frecuencia de aparición. Haz clic en cualquier color para copiar su código hexadecimal al portapapeles." size="medium" /></h3>
    
    <!-- Color palette -->
    <div class="palette-display">
      <div 
        v-for="(color, index) in palette" 
        :key="index"
        class="color-item"
      >
        <div class="color-swatch-container">
          <!-- Color original (siempre visible) -->
          <div 
            class="color-swatch original" 
            :style="{ backgroundColor: color.originalHex || color.hex }"
            @click="copyColor(color.originalHex || color.hex)"
          ></div>
          
          <!-- Color actual (siempre presente, pero con opacidad condicional) -->
          <div 
            class="color-swatch current" 
            :class="{ 'has-changes': color.hex !== (color.originalHex || color.hex) }"
            :style="{ backgroundColor: color.hex }"
            @click="copyColor(color.hex)"
          ></div>
          
          <!-- Input de color con tooltip -->
          <div class="color-picker-container">
            <input 
              type="color" 
              :value="color.hex"
              @input="updateColor(index, $event.target.value)"
              class="color-picker"
            />
            <InfoTooltip 
              text="Haz clic para editar este color. El color original se mantiene arriba para referencia." 
              size="small" 
            />
          </div>
        </div>
        <div class="color-info">
          <span class="color-hex">{{ color.hex }}</span>
          <span class="color-rgb">RGB({{ color.rgb.join(', ') }})</span>
          <span class="color-percentage">{{ color.percentage.toFixed(1) }}%</span>
        </div>
        
        <!-- Botones de acción del lado derecho -->
        <div class="color-actions">
          <button 
            @click="copyColor(color.hex)"
            class="action-btn copy-btn"
            title="Copiar color"
          >
            📋
          </button>
          <button 
            @click="restoreOriginalColor(index)"
            class="action-btn restore-btn"
            :class="{ 'visible': color.originalHex && color.hex !== color.originalHex }"
            title="Restaurar color original"
          >
            ↩️
          </button>
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
    
    <!-- Botones de theme (ocultos ya que están en la parte superior) -->
    <div class="theme-buttons" style="display: none;">
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
import { ref, watch } from 'vue'
import InfoTooltip from './InfoTooltip.vue'
import { applyTheme, restoreDefaultTheme as restoreDefault, generateThemeFromPalette } from '../utils/themeManager.js'

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
const emit = defineEmits(['apply-theme', 'restore-theme', 'update-palette'])

// Reactive data
const showNotification = ref(false)
const notificationText = ref('')

// Watcher para debuggear
watch(() => props.palette, (newPalette) => {
  console.log('🎨 ColorPalette - Nueva paleta recibida:', newPalette)
  console.log('Longitud de la paleta:', newPalette.length)
  if (newPalette.length > 0) {
    console.log('Primer color:', newPalette[0])
  }
}, { immediate: true })

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
const updateColor = (index, newHex) => {
  // Convertir hex a RGB
  const r = parseInt(newHex.slice(1, 3), 16)
  const g = parseInt(newHex.slice(3, 5), 16)
  const b = parseInt(newHex.slice(5, 7), 16)
  
  // Crear nueva paleta con el color actualizado
  const updatedPalette = [...props.palette]
  updatedPalette[index] = {
    ...updatedPalette[index],
    hex: newHex,
    rgb: [r, g, b],
    // Guardar el color original si no existe
    originalHex: updatedPalette[index].originalHex || updatedPalette[index].hex
  }
  
  // Emitir evento para actualizar la paleta
  emit('update-palette', updatedPalette)
  
  console.log(`🎨 Color ${index} actualizado a ${newHex}`)
}

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
      showNotification.value = true
      
      setTimeout(() => {
        showNotification.value = false
      }, 3000)
    } catch (fallbackError) {
      console.error('Fallback copy failed:', fallbackError)
      notificationText.value = 'Error al copiar el color'
      showNotification.value = true
      
      setTimeout(() => {
        showNotification.value = false
      }, 3000)
    }
    
    document.body.removeChild(textArea)
  }
}

const restoreOriginalColor = (index) => {
  const color = props.palette[index]
  if (color.originalHex) {
    // Convertir hex original a RGB
    const r = parseInt(color.originalHex.slice(1, 3), 16)
    const g = parseInt(color.originalHex.slice(3, 5), 16)
    const b = parseInt(color.originalHex.slice(5, 7), 16)
    
    // Crear nueva paleta con el color restaurado
    const updatedPalette = [...props.palette]
    updatedPalette[index] = {
      ...updatedPalette[index],
      hex: color.originalHex,
      rgb: [r, g, b]
    }
    
    // Emitir evento para actualizar la paleta
    emit('update-palette', updatedPalette)
    
    // Mostrar notificación
    notificationText.value = `¡Color restaurado a ${color.originalHex}!`
    showNotification.value = true
    
    setTimeout(() => {
      showNotification.value = false
    }, 3000)
    
    console.log(`🎨 Color ${index} restaurado a ${color.originalHex}`)
  }
}

const applyThemeGlobally = () => {
  console.log('🔧 Aplicando tema global...')
  console.log('Paleta recibida:', props.palette)
  
  if (props.palette.length === 0) {
    console.log('❌ No hay paleta disponible')
    return
  }
  
  // Extraer solo los códigos hex de la paleta
  const colorHexes = props.palette.map(color => color.hex)
  console.log('Colores hex extraídos:', colorHexes)
  
  // Generar tema usando el nuevo sistema
  const newTheme = generateThemeFromPalette(colorHexes)
  console.log('Tema generado:', newTheme)
  
  // Aplicar el tema
  applyTheme(newTheme)
  
  console.log('✅ Tema aplicado usando nuevo sistema:', newTheme)
  
  // Mostrar notificación
  notificationText.value = `¡Tema aplicado con ${props.palette.length} colores de ${props.pokemonName}!`
  showNotification.value = true
  setTimeout(() => {
    showNotification.value = false
  }, 3000)
  
  // Emitir evento
  emit('apply-theme', colorHexes)
}

const restoreDefaultTheme = () => {
  console.log('🔄 Restaurando tema por defecto...')
  
  // Usar el nuevo sistema para restaurar
  restoreDefault()
  
  console.log('✅ Tema restaurado usando nuevo sistema')
  
  // Mostrar notificación
  notificationText.value = '¡Tema restaurado al estado original!'
  showNotification.value = true
  setTimeout(() => {
    showNotification.value = false
  }, 3000)
  
  // Emitir evento
  emit('restore-theme')
}

// Solo la función applyPaletteAsBackground puede cambiar --theme-primary y --theme-secondary
</script>

<style scoped>
.palette-container {
  background: var(--theme-tertiary);
  border-radius: 15px;
  padding: 0;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--theme-border);
  max-height: calc(100vh - 200px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.palette-container h3 {
  color: var(--theme-quaternary);
  margin-bottom: 20px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px 20px 0 20px;
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
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
  max-height: calc(100vh - 400px);
  overflow-y: auto;
  padding: 0 20px;
  scrollbar-width: thin;
  scrollbar-color: var(--theme-border) transparent;
}

.palette-display::-webkit-scrollbar {
  width: 6px;
}

.palette-display::-webkit-scrollbar-track {
  background: transparent;
}

.palette-display::-webkit-scrollbar-thumb {
  background: var(--theme-border);
  border-radius: 3px;
}

.palette-display::-webkit-scrollbar-thumb:hover {
  background: var(--theme-primary);
}

.color-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  border-radius: 10px;
  background: var(--theme-quinary);
  transition: all 0.3s ease;
  border: 1px solid var(--theme-border);
  position: relative;
  min-height: 80px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.color-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.color-swatch-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.color-swatch {
  width: 45px;
  height: 45px;
  border-radius: 8px;
  border: 2px solid var(--theme-border);
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.color-swatch.original {
  border-color: var(--theme-primary);
  position: relative;
}

.color-swatch.original::after {
  content: 'ORIGINAL';
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--theme-primary);
  color: var(--theme-tertiary);
  font-size: 8px;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 4px;
  white-space: nowrap;
}

.color-swatch.current {
  border-color: var(--theme-border);
  position: relative;
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.3s ease;
}

.color-swatch.current.has-changes {
  border-color: var(--theme-secondary);
  opacity: 1;
  transform: scale(1);
}

.color-swatch.current.has-changes::after {
  content: 'EDITADO';
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--theme-secondary);
  color: var(--theme-tertiary);
  font-size: 8px;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 4px;
  white-space: nowrap;
  animation: labelSlideIn 0.3s ease-out;
}

@keyframes labelSlideIn {
  0% {
    opacity: 0;
    transform: translateX(-50%) translateY(-5px);
  }
  100% {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.color-swatch:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.color-picker-container {
  position: relative;
  display: flex;
  align-items: center;
  gap: 5px;
}

.color-picker {
  width: 30px;
  height: 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background: none;
  padding: 0;
}

.color-picker::-webkit-color-swatch-wrapper {
  padding: 0;
}

.color-picker::-webkit-color-swatch {
  border: 1px solid var(--theme-border);
  border-radius: 4px;
}

/* Contenedor de botones de acción */
.color-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
}

.action-btn {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  background: linear-gradient(135deg, #f7fafc, #ffffff);
  border: 1px solid var(--theme-border);
  color: var(--theme-quaternary);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.action-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15);
  border-color: var(--theme-primary);
}

.action-btn.copy-btn:hover {
  background: var(--theme-primary);
  color: var(--theme-tertiary);
}

.action-btn.restore-btn {
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.3s ease;
}

.action-btn.restore-btn.visible {
  opacity: 1;
  transform: scale(1);
}

.action-btn.restore-btn:hover {
  background: var(--theme-secondary);
  color: var(--theme-tertiary);
}

/* Estilos específicos para cada tipo de botón */
.copy-btn {
  background: linear-gradient(135deg, #f7fafc, #ffffff);
  border: 1px solid var(--theme-border);
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 12px;
  color: var(--theme-quaternary);
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.copy-btn:hover {
  background: linear-gradient(135deg, var(--theme-primary), var(--theme-secondary));
  color: white;
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
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
  gap: 8px;
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.color-hex {
  font-size: 1.1rem;
  font-weight: bold;
  color: var(--theme-quaternary);
  font-family: 'Courier New', monospace;
}

.color-rgb {
  font-size: 0.9rem;
  color: var(--theme-senary);
  font-family: 'Courier New', monospace;
}

.color-percentage {
  font-size: 0.85rem;
  color: var(--theme-primary);
  font-weight: 600;
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
  gap: 12px;
  margin: 16px 0 0 0;
  justify-content: center;
  flex-wrap: wrap;
  flex-shrink: 0;
  padding: 0 20px 20px 20px;
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
  background: linear-gradient(135deg, var(--theme-primary), var(--theme-secondary));
  color: white;
  border-color: var(--theme-primary);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.theme-btn.restore {
  background: linear-gradient(135deg, #f7fafc, #ffffff);
  color: var(--theme-quaternary);
  border-color: var(--theme-border);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.theme-btn:hover {
  transform: scale(1.05);
  filter: brightness(1.1);
  border-color: var(--theme-border-hover);
}

@media (max-width: 768px) {
  .palette-container {
    padding: 12px;
    max-height: calc(100vh - 120px);
    border-radius: 12px;
  }
  
  .palette-container h3 {
    font-size: 1.1rem;
    padding: 12px 0 16px 0;
    margin-bottom: 16px;
  }
  
  .palette-display {
    grid-template-columns: 1fr;
    gap: 12px;
    padding: 0 12px;
    max-height: calc(100vh - 280px);
  }
  
  .color-item {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 12px;
    min-height: 120px;
    padding: 16px 12px;
  }
  
  .color-swatch-container {
    flex-direction: row;
    gap: 8px;
    align-items: center;
    justify-content: center;
  }
  
  .color-swatch {
    width: 60px;
    height: 60px;
  }
  
  .color-swatch.original::after,
  .color-swatch.current.has-changes::after {
    font-size: 7px;
    padding: 1px 4px;
    top: -6px;
  }
  
  .color-info {
    gap: 6px;
    width: 100%;
    max-width: 200px;
    text-align: center;
  }
  
  .color-hex {
    font-size: 1rem;
    word-break: break-all;
    overflow-wrap: break-word;
  }
  
  .color-rgb {
    font-size: 0.8rem;
    word-break: break-all;
    overflow-wrap: break-word;
  }
  
  .color-percentage {
    font-size: 0.9rem;
  }
  
  .color-actions {
    margin-left: 0;
    padding-left: 0;
    flex-direction: row;
    gap: 8px;
    justify-content: center;
  }
  
  .action-btn {
    width: 32px;
    height: 32px;
    font-size: 12px;
  }
  
  .theme-buttons {
    flex-direction: column;
    gap: 12px;
    padding: 0 12px 16px 12px;
  }
  
  .button-container {
    width: 100%;
  }
  
  .theme-btn {
    width: 100%;
    padding: 14px 16px;
    font-size: 0.9rem;
  }
  
  .palette-info {
    margin: 16px 12px;
    padding: 12px;
  }
  
  .info-message {
    font-size: 0.9rem;
    flex-direction: column;
    gap: 6px;
  }
}

@media (max-width: 480px) {
  .palette-container {
    padding: 8px;
    max-height: calc(100vh - 100px);
  }
  
  .palette-container h3 {
    font-size: 1rem;
    padding: 8px 0 12px 0;
    margin-bottom: 12px;
  }
  
  .palette-display {
    gap: 8px;
    padding: 0 8px;
    max-height: calc(100vh - 240px);
  }
  
  .color-item {
    min-height: 100px;
    padding: 12px 8px;
    gap: 8px;
  }
  
  .color-swatch {
    width: 50px;
    height: 50px;
  }
  
  .color-swatch.original::after,
  .color-swatch.current.has-changes::after {
    font-size: 6px;
    padding: 1px 3px;
    top: -5px;
  }
  
  .color-info {
    max-width: 180px;
    gap: 4px;
  }
  
  .color-hex {
    font-size: 0.9rem;
  }
  
  .color-rgb {
    font-size: 0.75rem;
  }
  
  .color-percentage {
    font-size: 0.8rem;
  }
  
  .action-btn {
    width: 28px;
    height: 28px;
    font-size: 10px;
  }
  
  .theme-btn {
    padding: 12px 14px;
    font-size: 0.85rem;
  }
  
  .palette-info {
    margin: 12px 8px;
    padding: 10px;
  }
  
  .info-message {
    font-size: 0.85rem;
  }
}

@media (max-width: 360px) {
  .palette-container {
    padding: 6px;
  }
  
  .palette-container h3 {
    font-size: 0.9rem;
    padding: 6px 0 10px 0;
  }
  
  .palette-display {
    padding: 0 6px;
  }
  
  .color-item {
    padding: 10px 6px;
    min-height: 90px;
  }
  
  .color-swatch {
    width: 45px;
    height: 45px;
  }
  
  .color-info {
    max-width: 160px;
  }
  
  .color-hex {
    font-size: 0.8rem;
  }
  
  .color-rgb {
    font-size: 0.7rem;
  }
  
  .color-percentage {
    font-size: 0.75rem;
  }
  
  .action-btn {
    width: 26px;
    height: 26px;
    font-size: 9px;
  }
  
  .theme-btn {
    padding: 10px 12px;
    font-size: 0.8rem;
  }
}

/* Mejoras específicas para pantallas muy pequeñas */
@media (max-width: 320px) {
  .palette-container {
    padding: 4px;
  }
  
  .palette-display {
    padding: 0 4px;
  }
  
  .color-item {
    padding: 8px 4px;
    min-height: 80px;
  }
  
  .color-swatch {
    width: 40px;
    height: 40px;
  }
  
  .color-info {
    max-width: 140px;
  }
  
  .color-hex {
    font-size: 0.75rem;
  }
  
  .color-rgb {
    font-size: 0.65rem;
  }
  
  .color-percentage {
    font-size: 0.7rem;
  }
  
  .action-btn {
    width: 24px;
    height: 24px;
    font-size: 8px;
  }
  
  .theme-btn {
    padding: 8px 10px;
    font-size: 0.75rem;
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

/* Animación de entrada para el componente ColorPalette */
.palette-container.animate-in {
  animation: paletteSlideIn 0.8s ease-out 0.3s both;
}

@keyframes paletteSlideIn {
  0% {
    opacity: 0;
    transform: translateY(40px) scale(0.95);
  }
  60% {
    opacity: 0.8;
    transform: translateY(-5px) scale(1.02);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Animación para los elementos internos de la paleta */
.palette-display {
  animation: fadeInUp 0.6s ease-out 0.6s both;
}

.theme-buttons {
  animation: fadeInUp 0.6s ease-out 0.8s both;
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
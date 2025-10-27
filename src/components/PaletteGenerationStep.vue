<template>
  <div class="palette-generation-step">
    <div v-if="palette.length > 0" class="palette-content">
      
      <!-- Stats Header - Compacto y Visual -->
      <div class="stats-header">
        <div class="stat-card primary-stat">
          <div class="stat-icon">🎨</div>
          <div class="stat-content">
            <div class="stat-value">{{ palette.length }}</div>
            <div class="stat-label">Colores</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">🌡️</div>
          <div class="stat-content">
            <div class="stat-value">{{ colorTemperature }}</div>
            <div class="stat-label">Temp.</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">✨</div>
          <div class="stat-content">
            <div class="stat-value">{{ colorHarmony }}</div>
            <div class="stat-label">Armonía</div>
          </div>
        </div>
      </div>

      <!-- Quick Actions - Más prominente con preview de paleta -->
      <div class="action-cards">
        <button @click="handleApplyTheme" class="action-card primary mega">
          <div class="action-content">
            <div class="action-icon mega-icon">🎨</div>
            <div class="action-text">
              <span class="action-title">Aplicar Paleta</span>
              <span class="action-subtitle">Transforma la UI con estos {{ palette.length }} colores</span>
            </div>
          </div>
          <!-- Mini preview de la paleta -->
          <div class="palette-preview">
            <div 
              v-for="(color, idx) in palette" 
              :key="idx"
              class="mini-color"
              :style="{ backgroundColor: color.hex }"
              :title="color.hex"
            />
          </div>
        </button>
        
        <button @click="handleRestoreTheme" class="action-card secondary">
          <div class="action-icon">🔄</div>
          <div class="action-text">
            <span class="action-title">Restaurar</span>
            <span class="action-subtitle">Tema original</span>
          </div>
        </button>
      </div>

      <!-- Color Grid - Mobile First con más info -->
      <div class="colors-section">
        <div class="section-header">
          <h3>Paleta de Colores</h3>
          <button @click="toggleExpandAll" class="expand-btn">
            {{ allExpanded ? 'Colapsar Todo' : 'Expandir Todo' }}
          </button>
        </div>
        
        <div class="colors-grid">
          <div 
            v-for="(color, index) in palette" 
            :key="index"
            class="color-card"
            :class="{ expanded: expandedCards[index] }"
            @click="toggleCard(index)"
          >
            <!-- Color Preview -->
            <div class="color-preview" :style="{ backgroundColor: color.hex }">
              <div class="color-overlay">
                <button 
                  @click.stop="copyColor(color.hex)"
                  class="copy-color-btn"
                  title="Copiar HEX"
                >
                  📋
                </button>
              </div>
            </div>
            
            <!-- Color Info - Always Visible -->
            <div class="color-info-compact">
              <div class="color-main-info">
                <span class="color-hex">{{ color.hex }}</span>
                <span class="color-badge">{{ getSuggestedUse(index) }}</span>
              </div>
              <div class="color-percentage-bar">
                <div 
                  class="percentage-fill" 
                  :style="{ width: `${color.percentage}%`, backgroundColor: color.hex }"
                ></div>
                <span class="percentage-text">{{ color.percentage.toFixed(1) }}%</span>
              </div>
            </div>
            
            <!-- Expanded Details -->
            <transition name="expand">
              <div v-if="expandedCards[index]" class="color-details" @click.stop>
                <div class="detail-row">
                  <span class="detail-label">HEX</span>
                  <span class="detail-value mono">{{ color.hex }}</span>
                  <button @click="copyColor(color.hex)" class="mini-copy-btn">📋</button>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">RGB</span>
                  <span class="detail-value mono">{{ color.rgb.join(', ') }}</span>
                  <button @click="copyColor(`rgb(${color.rgb.join(', ')})`)" class="mini-copy-btn">📋</button>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">HSL</span>
                  <span class="detail-value mono">{{ calculateHSL(color.rgb) }}</span>
                  <button @click="copyColor(calculateHSL(color.rgb))" class="mini-copy-btn">📋</button>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Uso sugerido</span>
                  <span class="detail-value">{{ getSuggestedUseDescription(index) }}</span>
                </div>
                
                <!-- Color Picker -->
                <div class="color-picker-row">
                  <label class="detail-label">Editar color</label>
                  <input 
                    type="color" 
                    :value="color.hex"
                    @input="updateColor(index, $event.target.value)"
                    class="color-input"
                  />
                  <button 
                    v-if="color.originalHex && color.hex !== color.originalHex"
                    @click="restoreOriginalColor(index)"
                    class="restore-btn-mini"
                    title="Restaurar original"
                  >
                    ↩️
                  </button>
                </div>

                <!-- Contraste Preview Mini -->
                <div class="contrast-preview-mini">
                  <div class="preview-sample" :style="{ backgroundColor: color.hex, color: '#fff' }">
                    Texto Blanco
                  </div>
                  <div class="preview-sample" :style="{ backgroundColor: color.hex, color: '#000' }">
                    Texto Negro
                  </div>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </div>

      <!-- Export Section Compact -->
      <div class="export-section-compact">
        <button @click="toggleExport" class="export-toggle-btn">
          <span class="export-icon">📤</span>
          <span>{{ showExport ? 'Ocultar' : 'Mostrar' }} Opciones de Exportación</span>
          <span class="toggle-arrow" :class="{ rotated: showExport }">▼</span>
        </button>
        
        <transition name="slide-down">
          <div v-if="showExport" class="export-content">
            <ExportSection 
              :palette="palette"
              :pokemon-name="pokemonName"
            />
          </div>
        </transition>
      </div>
      
    </div>
    
    <div v-else class="empty-state">
      <div class="empty-icon">🎨</div>
      <h3>No hay paleta disponible</h3>
      <p>Primero debes generar una paleta en el paso anterior</p>
    </div>

    <!-- Notification -->
    <Transition name="notification">
      <div v-if="showNotification" class="notification-toast">
        <span class="notification-icon">✓</span>
        <span class="notification-text">{{ notificationText }}</span>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import ExportSection from './ExportSection.vue'
import { formatPokemonName } from '../utils/formatters.js'

// Props
const props = defineProps({
  palette: {
    type: Array,
    default: () => []
  },
  selectedPokemon: {
    type: Object,
    default: null
  }
})

// Emits
const emit = defineEmits(['apply-theme', 'restore-theme', 'update-palette'])

// State
const expandedCards = reactive({})
const allExpanded = ref(false)
const showExport = ref(false)
const showNotification = ref(false)
const notificationText = ref('')

// Computed
const pokemonName = computed(() => {
  return props.selectedPokemon ? formatPokemonName(props.selectedPokemon.name) : 'la imagen'
})

const colorTemperature = computed(() => {
  if (props.palette.length === 0) return 'N/A'
  
  // Calcular temperatura promedio basado en tonos
  let warmCount = 0
  let coolCount = 0
  
  props.palette.forEach(color => {
    const [r, g, b] = color.rgb
    // Colores cálidos tienen más rojo/amarillo
    if (r > b && (r + g) > (g + b)) warmCount++
    else coolCount++
  })
  
  if (warmCount > coolCount) return '🔥 Cálida'
  if (coolCount > warmCount) return '❄️ Fría'
  return '⚖️ Neutra'
})

const colorHarmony = computed(() => {
  if (props.palette.length < 2) return 'N/A'
  
  // Análisis simple de armonía basado en variación de colores
  const uniqueHues = new Set()
  props.palette.forEach(color => {
    const hsl = rgbToHsl(color.rgb)
    uniqueHues.add(Math.floor(hsl[0] / 30)) // Agrupar en segmentos de 30°
  })
  
  const variety = uniqueHues.size
  if (variety >= 5) return '🌈 Alta'
  if (variety >= 3) return '✨ Media'
  return '🎯 Baja'
})

// Methods
const toggleCard = (index) => {
  expandedCards[index] = !expandedCards[index]
}

const toggleExpandAll = () => {
  allExpanded.value = !allExpanded.value
  props.palette.forEach((_, index) => {
    expandedCards[index] = allExpanded.value
  })
}

const toggleExport = () => {
  showExport.value = !showExport.value
}

const handleApplyTheme = () => {
  const colorHexes = props.palette.map(color => color.hex)
  emit('apply-theme', colorHexes)
  showNotificationMessage('¡Tema aplicado exitosamente!')
}

const handleRestoreTheme = () => {
  emit('restore-theme')
  showNotificationMessage('Tema restaurado')
}

const updateColor = (index, newHex) => {
  const r = parseInt(newHex.slice(1, 3), 16)
  const g = parseInt(newHex.slice(3, 5), 16)
  const b = parseInt(newHex.slice(5, 7), 16)
  
  const updatedPalette = [...props.palette]
  updatedPalette[index] = {
    ...updatedPalette[index],
    hex: newHex,
    rgb: [r, g, b],
    originalHex: updatedPalette[index].originalHex || updatedPalette[index].hex
  }
  
  emit('update-palette', updatedPalette)
  showNotificationMessage('Color actualizado')
}

const restoreOriginalColor = (index) => {
  const color = props.palette[index]
  if (color.originalHex) {
    const r = parseInt(color.originalHex.slice(1, 3), 16)
    const g = parseInt(color.originalHex.slice(3, 5), 16)
    const b = parseInt(color.originalHex.slice(5, 7), 16)
    
    const updatedPalette = [...props.palette]
    updatedPalette[index] = {
      ...updatedPalette[index],
      hex: color.originalHex,
      rgb: [r, g, b]
    }
    
    emit('update-palette', updatedPalette)
    showNotificationMessage('Color restaurado')
  }
}

const copyColor = async (value) => {
  try {
    await navigator.clipboard.writeText(value)
    showNotificationMessage(`${value} copiado`)
  } catch (error) {
    console.error('Error copying:', error)
  }
}

const showNotificationMessage = (message) => {
  notificationText.value = message
  showNotification.value = true
  setTimeout(() => {
    showNotification.value = false
  }, 2000)
}

const calculateHSL = (rgb) => {
  const hsl = rgbToHsl(rgb)
  return `${Math.round(hsl[0])}°, ${Math.round(hsl[1])}%, ${Math.round(hsl[2])}%`
}

const rgbToHsl = (rgb) => {
  let [r, g, b] = rgb.map(val => val / 255)
  
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h, s, l = (max + min) / 2
  
  if (max === min) {
    h = s = 0
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }
  
  return [h * 360, s * 100, l * 100]
}

const getSuggestedUse = (index) => {
  const suggestions = ['Principal', 'Secundario', 'Acento', 'Fondo', 'Detalle']
  return suggestions[index] || `Color ${index + 1}`
}

const getSuggestedUseDescription = (index) => {
  const descriptions = [
    'Color dominante, ideal para marca principal',
    'Complemento perfecto para el principal',
    'Ideal para llamadas de acción y destacados',
    'Excelente para fondos y áreas grandes',
    'Perfecto para detalles y elementos pequeños'
  ]
  return descriptions[index] || 'Color complementario para tu diseño'
}
</script>

<style scoped>
.palette-generation-step {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}

.palette-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  padding: var(--spacing-md);
  animation: fadeIn 0.3s ease;
}

/* Stats Header */
.stats-header {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.stat-card {
  background: var(--bg-primary);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  box-shadow: var(--shadow-sm);
  border: 2px solid var(--border-light);
  transition: all var(--transition-base);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--theme-primary);
}

.stat-card.primary-stat {
  grid-column: 1 / -1;
  background: var(--gradient-primary);
  color: white;
  border-color: transparent;
}

.stat-icon {
  font-size: 2rem;
}

.stat-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  line-height: 1;
}

.stat-label {
  font-size: var(--text-sm);
  opacity: 0.9;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

/* Action Cards */
.action-cards {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-md);
}

.action-card {
  background: var(--bg-primary);
  border: 2px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  cursor: pointer;
  transition: all var(--transition-base);
  text-align: left;
  position: relative;
  overflow: hidden;
}

.action-card.primary.mega {
  background: var(--gradient-primary);
  color: white;
  border-color: transparent;
  box-shadow: var(--shadow-xl);
  padding: var(--spacing-lg);
  min-height: 100px;
  flex-direction: column;
  align-items: stretch;
  animation: pulse-glow-action 2s ease-in-out infinite;
}

@keyframes pulse-glow-action {
  0%, 100% {
    box-shadow: var(--shadow-xl);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 12px 48px rgba(255, 107, 107, 0.4);
    transform: scale(1.02);
  }
}

.action-card.primary.mega:hover {
  transform: scale(1.03) !important;
  box-shadow: 0 16px 64px rgba(255, 107, 107, 0.5);
  animation: none;
}

.action-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex: 1;
}

.palette-preview {
  display: flex;
  gap: 4px;
  margin-top: var(--spacing-sm);
  padding: var(--spacing-sm);
  background: rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-sm);
  backdrop-filter: blur(4px);
}

.mini-color {
  flex: 1;
  height: 32px;
  border-radius: var(--radius-xs);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transition: all var(--transition-base);
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.mini-color:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

.action-card.primary {
  background: var(--gradient-primary);
  color: white;
  border-color: transparent;
  box-shadow: var(--shadow-primary);
}

.action-card.secondary {
  box-shadow: var(--shadow-sm);
}

.action-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.action-card.secondary:hover {
  border-color: var(--theme-primary);
}

.action-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.mega-icon {
  font-size: 3rem;
  animation: rotate-icon 3s ease-in-out infinite;
}

@keyframes rotate-icon {
  0%, 100% {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(15deg) scale(1.1);
  }
}

.action-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.action-title {
  font-weight: 700;
  font-size: var(--text-base);
}

.action-card.primary.mega .action-title {
  font-size: var(--text-xl);
}

.action-subtitle {
  font-size: var(--text-xs);
  opacity: 0.9;
}

.action-card.primary.mega .action-subtitle {
  font-size: var(--text-base);
}

/* Colors Section */
.colors-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-header h3 {
  margin: 0;
  font-size: var(--text-xl);
  color: var(--theme-gray-900);
}

.expand-btn {
  padding: var(--spacing-xs) var(--spacing-md);
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: all var(--transition-base);
}

.expand-btn:hover {
  background: var(--theme-primary);
  color: white;
  border-color: var(--theme-primary);
}

/* Colors Grid */
.colors-grid {
  display: grid;
  gap: var(--spacing-md);
}

.color-card {
  background: var(--bg-primary);
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-md);
  border: 2px solid var(--border-light);
  cursor: pointer;
  transition: all var(--transition-base);
}

.color-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  border-color: var(--theme-primary);
}

.color-preview {
  height: 120px;
  position: relative;
  overflow: hidden;
}

.color-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-base);
}

.color-card:hover .color-overlay {
  background: rgba(0, 0, 0, 0.2);
}

.copy-color-btn {
  padding: var(--spacing-sm) var(--spacing-md);
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: var(--radius-sm);
  font-size: var(--text-lg);
  cursor: pointer;
  transform: scale(0);
  transition: all var(--transition-base);
}

.color-card:hover .copy-color-btn {
  transform: scale(1);
}

/* Color Info Compact */
.color-info-compact {
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.color-main-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.color-hex {
  font-family: var(--font-mono);
  font-weight: bold;
  font-size: var(--text-lg);
  color: var(--theme-gray-900);
}

.color-badge {
  padding: 4px 8px;
  background: var(--bg-secondary);
  color: var(--theme-gray-700);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: bold;
  text-transform: uppercase;
}

.color-percentage-bar {
  position: relative;
  height: 8px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.percentage-fill {
  height: 100%;
  transition: width var(--transition-base);
  border-radius: var(--radius-full);
}

.percentage-text {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  font-size: var(--text-xs);
  font-weight: bold;
  color: var(--theme-gray-700);
}

/* Color Details */
.color-details {
  padding: 0 var(--spacing-md) var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  border-top: 1px solid var(--border-light);
  padding-top: var(--spacing-md);
}

.detail-row {
  display: grid;
  grid-template-columns: 80px 1fr auto;
  gap: var(--spacing-sm);
  align-items: center;
}

.detail-label {
  font-size: var(--text-sm);
  color: var(--theme-gray-700);
  font-weight: 600;
  text-transform: uppercase;
}

.detail-value {
  font-size: var(--text-sm);
  color: var(--theme-gray-900);
}

.detail-value.mono {
  font-family: var(--font-mono);
  background: var(--bg-tertiary);
  padding: 4px 8px;
  border-radius: var(--radius-sm);
}

.mini-copy-btn {
  padding: 4px 8px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: var(--text-sm);
  transition: all var(--transition-base);
}

.mini-copy-btn:hover {
  background: var(--theme-primary);
  border-color: var(--theme-primary);
}

.color-picker-row {
  display: grid;
  grid-template-columns: 80px 1fr auto;
  gap: var(--spacing-sm);
  align-items: center;
}

.color-input {
  width: 100%;
  height: 40px;
  border: 2px solid var(--border-light);
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.restore-btn-mini {
  padding: 4px 8px;
  background: var(--theme-warning);
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: var(--text-lg);
}

/* Contrast Preview Mini */
.contrast-preview-mini {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-sm);
  margin-top: var(--spacing-sm);
}

.preview-sample {
  padding: var(--spacing-sm);
  border-radius: var(--radius-sm);
  text-align: center;
  font-size: var(--text-sm);
  font-weight: bold;
  border: 1px solid var(--border-light);
}

/* Export Section Compact */
.export-section-compact {
  margin-top: var(--spacing-lg);
}

.export-toggle-btn {
  width: 100%;
  padding: var(--spacing-md);
  background: var(--gradient-secondary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  transition: all var(--transition-base);
  box-shadow: var(--shadow-secondary);
}

.export-toggle-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.export-icon {
  font-size: var(--text-xl);
}

.toggle-arrow {
  margin-left: auto;
  transition: transform var(--transition-base);
}

.toggle-arrow.rotated {
  transform: rotate(180deg);
}

.export-content {
  margin-top: var(--spacing-md);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: var(--spacing-3xl);
  color: var(--theme-gray-500);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: var(--spacing-lg);
  opacity: 0.5;
}

.empty-state h3 {
  margin: 0 0 var(--spacing-sm) 0;
  color: var(--theme-gray-900);
}

/* Notification */
.notification-toast {
  position: fixed;
  bottom: var(--spacing-xl);
  left: 50%;
  transform: translateX(-50%);
  background: var(--theme-gray-900);
  color: white;
  padding: var(--spacing-md) var(--spacing-xl);
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-xl);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  z-index: var(--z-tooltip);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.notification-icon {
  font-size: var(--text-xl);
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.expand-enter-active, .expand-leave-active {
  transition: all var(--transition-base);
  max-height: 500px;
}

.expand-enter-from, .expand-leave-to {
  opacity: 0;
  max-height: 0;
}

.slide-down-enter-active, .slide-down-leave-active {
  transition: all var(--transition-base);
}

.slide-down-enter-from, .slide-down-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.notification-enter-active, .notification-leave-active {
  transition: all var(--transition-base);
}

.notification-enter-from, .notification-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}

/* Responsive - Tablet */
@media (min-width: 768px) {
  .palette-content {
    padding: var(--spacing-xl);
    gap: var(--spacing-xl);
  }
  
  .stats-header {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .stat-card.primary-stat {
    grid-column: auto;
  }
  
  .colors-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Responsive - Desktop */
@media (min-width: 1024px) {
  .colors-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Mobile Small */
@media (max-width: 380px) {
  .action-cards {
    grid-template-columns: 1fr;
  }
  
  .stat-icon {
    font-size: 1.5rem;
  }
  
  .stat-value {
    font-size: 1.2rem;
  }
}
</style>

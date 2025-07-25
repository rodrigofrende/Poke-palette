<template>
  <div class="step-container">
    <div class="step-header">
      <h2>📊 Análisis de Contraste</h2>
      <p>Evalúa la legibilidad y accesibilidad de los colores</p>
    </div>
    
    <div class="step-content">
      <div v-if="contrastAnalysis.length > 0">
        <!-- Navegación de tabs -->
        <div class="contrast-tabs-navigation">
          <button 
            v-for="tab in contrastTabs" 
            :key="tab.id"
            @click="setContrastActiveTab(tab.id)"
            :class="['contrast-tab-btn', { active: contrastActiveTab === tab.id }]"
          >
            <span class="tab-icon">{{ tab.icon }}</span>
            <span class="tab-text">{{ tab.title }}</span>
          </button>
        </div>
        
        <!-- Contenido de tabs -->
        <div class="contrast-tabs-content">
          <!-- Tab: Resumen -->
          <div v-if="contrastActiveTab === 'overview'" class="contrast-tab-panel">
            <h3>
              📊 Análisis de Contraste
              <InfoTooltip text="Evalúa la legibilidad del texto sobre cada color de la paleta. Los resultados indican si el contraste cumple con los estándares de accesibilidad web. Los colores que aprueban son adecuados para uso en interfaces, mientras que los que fallan requieren ajustes para garantizar la legibilidad." size="medium" />
            </h3>
            
            <!-- Hint intuitivo para el usuario -->
            <div class="contrast-hint-inline">
              <div class="hint-inline-content">
                <span class="hint-inline-icon">💡</span>
                <span class="hint-inline-text">¿Algunos textos se ven difíciles de leer? Usa el botón "Mejorar Contraste Global" para optimizar automáticamente la legibilidad</span>
              </div>
            </div>
            
            <!-- Global Contrast Analysis -->
            <div class="global-contrast-analysis">
              <div class="analysis-header">
                <div class="analysis-title">
                  <span class="analysis-icon">⚙️</span>
                  <span class="analysis-text">Análisis General de la Aplicación</span>
                </div>
              </div>
              <div class="contrast-metrics">
                <div class="metric-card">
                  <div class="metric-header">
                    <span class="metric-icon">📊</span>
                    <span class="metric-title">CONTRASTE PROMEDIO</span>
                  </div>
                  <div class="metric-value">{{ globalContrastScore.toFixed(1) }}</div>
                  <div class="metric-bar">
                    <div 
                      class="metric-fill" 
                      :style="{ width: `${Math.min(globalContrastScore * 10, 100)}%` }"
                      :class="{ 'excellent': globalContrastScore >= 7, 'good': globalContrastScore >= 5 && globalContrastScore < 7, 'poor': globalContrastScore < 5 }"
                    ></div>
                  </div>
                  <div class="metric-label">{{ getContrastLabel(globalContrastScore) }}</div>
                </div>
                
                <div class="metric-card">
                  <div class="metric-header">
                    <span class="metric-icon">✅</span>
                    <span class="metric-title">ELEMENTOS APROBADOS</span>
                  </div>
                  <div class="metric-value">{{ passedElements }}/{{ totalElements }}</div>
                  <div class="metric-bar">
                    <div 
                      class="metric-fill" 
                      :style="{ width: `${(passedElements / totalElements) * 100}%` }"
                      :class="{ 'excellent': (passedElements / totalElements) >= 0.8, 'good': (passedElements / totalElements) >= 0.6 && (passedElements / totalElements) < 0.8, 'poor': (passedElements / totalElements) < 0.6 }"
                    ></div>
                  </div>
                  <div class="metric-label">{{ Math.round((passedElements / totalElements) * 100) }}% DE APROBACIÓN</div>
                </div>
                
                <div class="metric-card">
                  <div class="metric-header">
                    <span class="metric-icon">🎨</span>
                    <span class="metric-title">PALETA ACTUAL</span>
                  </div>
                  <div class="metric-subtitle">{{ currentThemeName }}</div>
                  <div class="palette-preview">
                    <div 
                      v-for="(color, index) in currentThemeColors" 
                      :key="index"
                      class="theme-color-swatch"
                      :style="{ backgroundColor: color }"
                      :title="color"
                    ></div>
                  </div>
                  <div class="metric-label">{{ palette.length }} COLORES EXTRAÍDOS</div>
                </div>
              </div>
            </div>
            
            <!-- Análisis de Contraste Compacto -->
            <div class="contrast-analysis-compact">
              <div class="analysis-summary">
                <div class="summary-stats">
                  <div class="stat-item">
                    <span class="stat-icon">📊</span>
                    <span class="stat-label">Colores Analizados</span>
                    <span class="stat-value">{{ contrastAnalysis.length }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-icon">✅</span>
                    <span class="stat-label">Aprobados</span>
                    <span class="stat-value">{{ passedElements }}/{{ totalElements }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-icon">🎯</span>
                    <span class="stat-label">Promedio</span>
                    <span class="stat-value">{{ globalContrastScore.toFixed(1) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Tab: Detalles -->
          <div v-if="contrastActiveTab === 'details'" class="contrast-tab-panel">
            <h3>
              🔍 Análisis Detallado de Contraste
              <InfoTooltip text="Análisis individual de cada color de la paleta con texto blanco y negro. Los resultados muestran el ratio de contraste y si cumple con los estándares WCAG AA." size="medium" />
            </h3>
            
            <div class="contrast-grid">
              <div 
                v-for="(result, index) in contrastAnalysis" 
                :key="index"
                class="contrast-card"
              >
                <div class="card-header">
                  <div class="color-preview" :style="{ backgroundColor: result.background }"></div>
                  <div class="color-info">
                    <span class="color-hex">{{ result.background }}</span>
                    <span class="color-name">Color {{ index + 1 }}</span>
                  </div>
                </div>
                
                <div class="text-comparison">
                  <button 
                    class="preview-btn white"
                    :style="{ 
                      backgroundColor: result.background || '#ccc', 
                      color: result.whiteText || '#fff' 
                    }"
                  >
                    Blanco
                  </button>
                  <button 
                    class="preview-btn black"
                    :style="{ 
                      backgroundColor: result.background || '#ccc', 
                      color: result.blackText || '#000' 
                    }"
                  >
                    Negro
                  </button>
                </div>
                
                <div class="card-status">
                  <span class="status-icon" :class="{ 'pass': result.whitePasses || result.blackPasses, 'fail': !result.whitePasses && !result.blackPasses }">
                    {{ (result.whitePasses || result.blackPasses) ? '✅' : '❌' }}
                  </span>
                  <span class="status-text">
                    {{ (result.whitePasses || result.blackPasses) ? 'WCAG AA' : 'Falla' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else class="empty-state">
        <div class="empty-icon">📊</div>
        <h3>No hay análisis disponible</h3>
        <p>Genera una paleta primero para poder analizar el contraste</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import InfoTooltip from './InfoTooltip.vue'

// Props
const props = defineProps({
  contrastAnalysis: {
    type: Array,
    default: () => []
  },
  palette: {
    type: Array,
    default: () => []
  },
  currentTheme: {
    type: Object,
    default: () => ({})
  },
  isContrastImproved: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['improve-contrast', 'restore-contrast'])

// Reactive data
const contrastActiveTab = ref('overview')

// Definición de tabs para análisis de contraste
const contrastTabs = [
  { id: 'overview', title: 'Resumen', icon: '📊' },
  { id: 'details', title: 'Detalles', icon: '🔍' }
]

// Computed properties for global analysis
const globalContrastScore = computed(() => {
  if (props.contrastAnalysis.length === 0) return 0
  
  // Calcular el promedio de todos los ratios (blanco y negro)
  let totalRatio = 0
  let totalCount = 0
  
  props.contrastAnalysis.forEach(result => {
    if (typeof result.whiteRatio === 'number' && !isNaN(result.whiteRatio)) {
      totalRatio += result.whiteRatio
      totalCount++
    }
    if (typeof result.blackRatio === 'number' && !isNaN(result.blackRatio)) {
      totalRatio += result.blackRatio
      totalCount++
    }
  })
  
  if (totalCount === 0) return 0
  
  const averageRatio = totalRatio / totalCount
  
  // Convert ratio to a 0-10 scale
  return Math.min(averageRatio / 2, 10)
})

const passedElements = computed(() => {
  let passedCount = 0
  let totalCount = 0
  
  props.contrastAnalysis.forEach(result => {
    if (typeof result.whitePasses === 'boolean') {
      totalCount++
      if (result.whitePasses) passedCount++
    }
    if (typeof result.blackPasses === 'boolean') {
      totalCount++
      if (result.blackPasses) passedCount++
    }
  })
  
  return passedCount
})

const totalElements = computed(() => {
  let totalCount = 0
  
  props.contrastAnalysis.forEach(result => {
    if (typeof result.whitePasses === 'boolean') totalCount++
    if (typeof result.blackPasses === 'boolean') totalCount++
  })
  
  return totalCount
})

const currentThemeName = computed(() => {
  return props.isContrastImproved ? 'Tema Mejorado' : 'Tema Original'
})

const currentThemeColors = computed(() => {
  const theme = props.currentTheme
  return [
    theme.primary,
    theme.secondary,
    theme.tertiary,
    theme.quaternary,
    theme.quinary
  ].filter(Boolean)
})

// Methods
const setContrastActiveTab = (tabId) => {
  contrastActiveTab.value = tabId
}

const getContrastLabel = (score) => {
  if (score >= 7) return 'EXCELENTE'
  if (score >= 5) return 'BUENO'
  if (score >= 3) return 'REGULAR'
  return 'NECESITA MEJORA'
}
</script>

<style scoped>
/* Estilos específicos para el análisis de contraste */

.contrast-tabs-navigation {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  border-bottom: 2px solid var(--theme-border);
  padding-bottom: 10px;
}

.contrast-tab-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: none;
  background: transparent;
  color: var(--theme-senary);
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s ease;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 0.85rem;
}

.contrast-tab-btn:hover {
  background: var(--theme-quinary);
  color: var(--theme-quaternary);
}

.contrast-tab-btn.active {
  background: linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-secondary) 100%);
  color: var(--theme-tertiary);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.tab-icon {
  font-size: 1.1em;
}

.tab-text {
  font-size: 0.8rem;
}

.contrast-tabs-content {
  flex: 1;
  overflow: auto;
}

.contrast-tab-panel {
  animation: fadeIn 0.3s ease-in-out;
}

.contrast-tab-panel h3 {
  color: var(--theme-quaternary);
  margin-bottom: 20px;
  font-size: 1.3rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 10px;
}

.contrast-hint-inline {
  background: linear-gradient(135deg, #e6f3ff 0%, #f0f8ff 100%);
  border: 1px solid #b3d9ff;
  border-radius: 10px;
  padding: 12px 16px;
  margin-bottom: 20px;
  animation: fadeIn 0.3s ease-in-out;
}

.hint-inline-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.hint-inline-icon {
  font-size: 1.2em;
  color: #0066cc;
}

.hint-inline-text {
  color: #0066cc;
  font-size: 0.9rem;
  font-weight: 500;
}

.global-contrast-analysis {
  background: var(--theme-quinary);
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--theme-border);
  margin-bottom: 20px;
}

.analysis-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.analysis-title {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--theme-quaternary);
  font-weight: 600;
  font-size: 1.1rem;
}

.analysis-icon {
  font-size: 1.3em;
}

.analysis-text {
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 0.9rem;
}

.contrast-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.metric-card {
  background: var(--theme-quinary);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--theme-border);
  text-align: center;
  transition: all 0.3s ease;
}

.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.metric-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 15px;
  color: var(--theme-primary);
  font-size: 0.8rem;
  font-weight: 600;
}

.metric-icon {
  font-size: 1.2em;
}

.metric-title {
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 0.75rem;
}

.metric-value {
  font-size: 2.5rem;
  font-weight: bold;
  color: var(--theme-quaternary);
  margin-bottom: 10px;
}

.metric-subtitle {
  color: var(--theme-primary);
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 15px;
}

.metric-bar {
  width: 100%;
  height: 6px;
  background: var(--theme-border);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 8px;
}

.metric-fill {
  height: 100%;
  border-radius: 3px;
  transition: all 0.3s ease;
}

.metric-fill.excellent {
  background: linear-gradient(90deg, #4CAF50, #8BC34A);
}

.metric-fill.good {
  background: linear-gradient(90deg, #FF9800, #FFC107);
}

.metric-fill.poor {
  background: linear-gradient(90deg, #F44336, #FF5722);
}

.metric-label {
  font-size: 0.75rem;
  color: var(--theme-septenary);
  font-weight: 500;
}

.palette-preview {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 10px;
}

.theme-color-swatch {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 2px solid var(--theme-border);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.theme-color-swatch:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.contrast-analysis-compact {
  background: var(--theme-quinary);
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--theme-border);
}

.analysis-summary {
  display: flex;
  justify-content: center;
}

.summary-stats {
  display: flex;
  gap: 30px;
  align-items: center;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.stat-icon {
  font-size: 1.5em;
  color: var(--theme-primary);
}

.stat-label {
  font-size: 0.75rem;
  color: var(--theme-senary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.stat-value {
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--theme-quaternary);
}

.contrast-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.contrast-card {
  background: var(--theme-quinary);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--theme-border);
  transition: all 0.3s ease;
}

.contrast-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.color-preview {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  border: 2px solid var(--theme-border);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.color-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.color-hex {
  font-family: 'Courier New', monospace;
  font-weight: bold;
  color: var(--theme-quaternary);
  font-size: 0.9rem;
}

.color-name {
  color: var(--theme-senary);
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.text-comparison {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.preview-btn {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid var(--theme-border);
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.preview-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.card-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px;
  border-radius: 6px;
  background: var(--theme-quinary);
  border: 1px solid var(--theme-border);
}

.status-icon {
  font-size: 1.1em;
}

.status-icon.pass {
  color: #4CAF50;
}

.status-icon.fail {
  color: #F44336;
}

.status-text {
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-text:has(.status-icon.pass) {
  color: #4CAF50;
}

.status-text:has(.status-icon.fail) {
  color: #F44336;
}

@media (max-width: 768px) {
  .contrast-tabs-navigation {
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .contrast-tab-btn {
    padding: 8px 12px;
    font-size: 0.8rem;
  }
  
  .contrast-metrics {
    grid-template-columns: 1fr;
  }
  
  .summary-stats {
    flex-direction: column;
    gap: 20px;
  }
  
  .contrast-grid {
    grid-template-columns: 1fr;
  }
  
  .metric-value {
    font-size: 2rem;
  }
  
  .metric-card {
    padding: 15px;
  }
}

@media (max-width: 480px) {
  .contrast-tab-btn {
    padding: 6px 10px;
    font-size: 0.75rem;
  }
  
  .tab-icon {
    font-size: 1em;
  }
  
  .tab-text {
    font-size: 0.7rem;
  }
  
  .metric-value {
    font-size: 1.8rem;
  }
  
  .metric-card {
    padding: 12px;
  }
  
  .contrast-card {
    padding: 15px;
  }
  
  .color-preview {
    width: 40px;
    height: 40px;
  }
  
  .text-comparison {
    flex-direction: column;
  }
}
</style> 
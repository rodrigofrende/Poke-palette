<template>
  <div class="contrast-analysis-step">
    <div v-if="contrastAnalysis.length > 0" class="contrast-content">
      
      <!-- Score Compacto y Visual -->
      <div class="score-header">
        <div class="score-main">
          <div class="score-circle" :class="getScoreClass(accessibilityScore)">
            {{ accessibilityScore }}
          </div>
          <div class="score-text">
            <h2>{{ getScoreDescription(accessibilityScore) }}</h2>
            <p>Accesibilidad WCAG</p>
          </div>
        </div>
        
        <!-- Stats Inline Compactos -->
        <div class="stats-inline">
          <div class="stat-item good">
            <span class="stat-icon">✓</span>
            <span class="stat-value">{{ goodColors }}</span>
          </div>
          <div class="stat-item mixed">
            <span class="stat-icon">~</span>
            <span class="stat-value">{{ mixedColors }}</span>
          </div>
          <div class="stat-item bad">
            <span class="stat-icon">✕</span>
            <span class="stat-value">{{ badColors }}</span>
          </div>
        </div>
      </div>

      <!-- Grid de Colores Compacto -->
      <div class="colors-grid">
        <div 
          v-for="(result, index) in contrastAnalysis" 
          :key="index"
          class="color-item"
          :class="getColorClass(result)"
          @click="toggleColorDetails(index)"
        >
          <div class="color-preview" :style="{ backgroundColor: result.background }">
            <div class="status-icon">{{ getStatusIcon(result) }}</div>
          </div>
          <div class="color-info">
            <div class="color-hex">{{ result.background }}</div>
            <div class="color-tests">
              <span class="test-result" :class="{ pass: result.whitePasses }">
                W: {{ result.whiteRatio.toFixed(1) }}
              </span>
              <span class="test-result" :class="{ pass: result.blackPasses }">
                B: {{ result.blackRatio.toFixed(1) }}
              </span>
            </div>
          </div>
          
          <!-- Detalles expandibles -->
          <div v-if="expandedColor === index" class="color-details">
            <div class="detail-row">
              <span>Texto Blanco:</span>
              <span :class="result.whitePasses ? 'pass' : 'fail'">
                {{ result.whitePasses ? '✓ Pasa' : '✕ Falla' }} ({{ result.whiteRatio.toFixed(2) }})
              </span>
            </div>
            <div class="detail-row">
              <span>Texto Negro:</span>
              <span :class="result.blackPasses ? 'pass' : 'fail'">
                {{ result.blackPasses ? '✓ Pasa' : '✕ Falla' }} ({{ result.blackRatio.toFixed(2) }})
              </span>
            </div>
            <button @click.stop="copyColor(result.background)" class="copy-btn">
              Copiar {{ result.background }}
            </button>
          </div>
        </div>
      </div>

      <!-- Explicación de Valores -->
      <div class="values-explainer">
        <div class="explainer-header">
          <div class="explainer-icon">💡</div>
          <div class="explainer-title">
            <h3>¿Qué significan los valores?</h3>
            <p>Cada color muestra su contraste con texto blanco (W) y negro (B)</p>
          </div>
        </div>
        
        <div class="values-grid">
          <div class="value-example">
            <div class="example-badge white">W: 4.8</div>
            <p><strong>Contraste con texto blanco</strong><br>
            Calculado según luminancia relativa del color vs. blanco (#FFFFFF)</p>
          </div>
          <div class="value-example">
            <div class="example-badge black">B: 3.2</div>
            <p><strong>Contraste con texto negro</strong><br>
            Calculado según luminancia relativa del color vs. negro (#000000)</p>
          </div>
        </div>
      </div>

      <!-- Info WCAG Mejorada -->
      <div class="wcag-info">
        <details>
          <summary>
            <div class="summary-content">
              <div class="summary-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" 
                        fill="currentColor" opacity="0.2"/>
                  <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" 
                        stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
                  <path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2" 
                        stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="summary-text">
                <strong>¿Qué es WCAG?</strong>
                <span>Estándares de accesibilidad web para todos</span>
              </div>
              <div class="summary-arrow">▼</div>
            </div>
          </summary>
          
          <div class="wcag-content">
            <div class="wcag-intro">
              <p><strong>WCAG</strong> (Web Content Accessibility Guidelines) son directrices internacionales 
              para hacer el contenido web accesible a personas con discapacidades visuales.</p>
            </div>
            
            <div class="wcag-standards">
              <h4>Niveles de Cumplimiento:</h4>
              
              <div class="standard-card aa-normal">
                <div class="standard-badge">AA</div>
                <div class="standard-info">
                  <strong>Texto Normal</strong>
                  <p>Ratio mínimo de <span class="ratio">4.5:1</span></p>
                  <small>Para texto de menos de 18pt (24px) o 14pt (18.5px) en negrita</small>
                </div>
              </div>
              
              <div class="standard-card aa-large">
                <div class="standard-badge">AA</div>
                <div class="standard-info">
                  <strong>Texto Grande</strong>
                  <p>Ratio mínimo de <span class="ratio">3:1</span></p>
                  <small>Para texto de 18pt (24px) o mayor, o 14pt (18.5px) en negrita</small>
                </div>
              </div>
              
              <div class="standard-card aaa">
                <div class="standard-badge">AAA</div>
                <div class="standard-info">
                  <strong>Nivel Premium</strong>
                  <p>Ratio mínimo de <span class="ratio">7:1</span></p>
                  <small>Cumplimiento mejorado para máxima accesibilidad</small>
                </div>
              </div>
            </div>
            
            <div class="wcag-formula">
              <h4>Cómo se calcula el contraste:</h4>
              <div class="formula-box">
                <code>Contraste = (L1 + 0.05) / (L2 + 0.05)</code>
                <p><small>Donde L1 y L2 son las luminancias relativas de los colores más claro y oscuro</small></p>
              </div>
              <div class="formula-example">
                <strong>Ejemplo:</strong> Un color con <strong>W: 4.8</strong> significa que tiene un contraste 
                de 4.8:1 con texto blanco, cumpliendo AA para texto normal.
              </div>
            </div>
          </div>
        </details>
      </div>

    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <div class="empty-icon">🎨</div>
      <h3>No hay análisis disponible</h3>
      <p>Genera una paleta primero para analizar el contraste</p>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

// Props
const props = defineProps({
  contrastAnalysis: {
    type: Array,
    required: true,
    default: () => []
  }
})

// Estado local
const expandedColor = ref(null)

// Computed properties SIMPLIFICADOS - solo cuenta colores, no tests
const goodColors = computed(() => {
  // Colores que pasan AMBOS tests
  return props.contrastAnalysis.filter(r => r.whitePasses && r.blackPasses).length
})

const mixedColors = computed(() => {
  // Colores que pasan solo UN test
  return props.contrastAnalysis.filter(r => 
    (r.whitePasses && !r.blackPasses) || (!r.whitePasses && r.blackPasses)
  ).length
})

const badColors = computed(() => {
  // Colores que NO pasan ningún test
  return props.contrastAnalysis.filter(r => !r.whitePasses && !r.blackPasses).length
})

const accessibilityScore = computed(() => {
  if (props.contrastAnalysis.length === 0) return 0
  
  // Score basado en colores buenos y mixtos
  const totalColors = props.contrastAnalysis.length
  const score = ((goodColors.value * 100) + (mixedColors.value * 50)) / totalColors
  
  return Math.round(score)
})

// Métodos
const toggleColorDetails = (index) => {
  expandedColor.value = expandedColor.value === index ? null : index
}

const getColorClass = (result) => {
  if (result.whitePasses && result.blackPasses) return 'good'
  if (!result.whitePasses && !result.blackPasses) return 'bad'
  return 'mixed'
}

const getStatusIcon = (result) => {
  if (result.whitePasses && result.blackPasses) return '✓'
  if (!result.whitePasses && !result.blackPasses) return '✕'
  return '~'
}

const getScoreClass = (score) => {
  if (score >= 80) return 'excellent'
  if (score >= 60) return 'good'
  if (score >= 40) return 'fair'
  return 'poor'
}

const getScoreDescription = (score) => {
  if (score >= 80) return 'Excelente Accesibilidad'
  if (score >= 60) return 'Buena Accesibilidad'
  if (score >= 40) return 'Accesibilidad Regular'
  return 'Accesibilidad Pobre'
}

const copyColor = async (hex) => {
  try {
    await navigator.clipboard.writeText(hex)
    // Opcional: mostrar feedback
  } catch (error) {
    console.error('Error copying:', error)
  }
}
</script>

<style scoped>
.contrast-analysis-step {
  padding: var(--spacing-lg);
  max-width: 1200px;
  margin: 0 auto;
}

.contrast-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

/* Score Header Compacto */
.score-header {
  background: linear-gradient(135deg, var(--theme-primary), var(--theme-secondary));
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-md);
  box-shadow: var(--shadow-md);
}

.score-main {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex: 1;
}

.score-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 3px solid rgba(255, 255, 255, 0.4);
  flex-shrink: 0;
}

.score-circle.excellent {
  background: rgba(76, 175, 80, 0.3);
  border-color: #4caf50;
}

.score-circle.good {
  background: rgba(139, 195, 74, 0.3);
  border-color: #8bc34a;
}

.score-circle.fair {
  background: rgba(255, 152, 0, 0.3);
  border-color: #ff9800;
}

.score-circle.poor {
  background: rgba(244, 67, 54, 0.3);
  border-color: #f44336;
}

.score-text h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
}

.score-text p {
  margin: 4px 0 0 0;
  opacity: 0.9;
  font-size: 0.9rem;
}

.stats-inline {
  display: flex;
  gap: var(--spacing-sm);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(5px);
  font-weight: 600;
}

.stat-icon {
  font-size: 1.2rem;
}

.stat-value {
  font-size: 1.1rem;
}

.stat-item.good .stat-icon {
  color: #4caf50;
}

.stat-item.mixed .stat-icon {
  color: #ff9800;
}

.stat-item.bad .stat-icon {
  color: #f44336;
}

/* Grid de Colores Compacto */
.colors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--spacing-md);
}

.color-item {
  background: var(--bg-primary);
  border: 2px solid var(--border-light);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  cursor: pointer;
  transition: all 0.3s ease;
}

.color-item:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.color-item.good {
  border-color: #4caf50;
  background: linear-gradient(to bottom, rgba(76, 175, 80, 0.05), var(--bg-primary));
}

.color-item.mixed {
  border-color: #ff9800;
  background: linear-gradient(to bottom, rgba(255, 152, 0, 0.05), var(--bg-primary));
}

.color-item.bad {
  border-color: #f44336;
  background: linear-gradient(to bottom, rgba(244, 67, 54, 0.05), var(--bg-primary));
}

.color-preview {
  width: 100%;
  height: 80px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--spacing-sm);
  position: relative;
  overflow: hidden;
}

.status-icon {
  font-size: 2rem;
  background: rgba(255, 255, 255, 0.9);
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-md);
}

.color-info {
  text-align: center;
}

.color-hex {
  font-family: var(--font-mono);
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--theme-gray-900);
  margin-bottom: 4px;
}

.color-tests {
  display: flex;
  justify-content: center;
  gap: var(--spacing-sm);
  font-size: 0.85rem;
}

.test-result {
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  background: var(--bg-secondary);
  color: var(--theme-gray-600);
  font-family: var(--font-mono);
  font-size: 0.75rem;
}

.test-result.pass {
  background: rgba(76, 175, 80, 0.1);
  color: #2e7d32;
  font-weight: 600;
}

/* Detalles Expandibles */
.color-details {
  margin-top: var(--spacing-md);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--border-light);
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 0.85rem;
}

.detail-row .pass {
  color: #2e7d32;
  font-weight: 600;
}

.detail-row .fail {
  color: #c62828;
  font-weight: 600;
}

.copy-btn {
  width: 100%;
  margin-top: var(--spacing-sm);
  padding: 8px;
  background: var(--theme-primary);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

.copy-btn:hover {
  background: var(--theme-secondary);
  transform: scale(1.02);
}

/* Explicación de Valores */
.values-explainer {
  background: linear-gradient(135deg, #e3f2fd, #f3e5f5);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  border: 2px solid #90caf9;
}

.explainer-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.explainer-icon {
  font-size: 2.5rem;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.explainer-title h3 {
  margin: 0;
  color: var(--theme-gray-900);
  font-size: 1.2rem;
}

.explainer-title p {
  margin: 4px 0 0 0;
  color: var(--theme-gray-600);
  font-size: 0.9rem;
}

.values-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
  margin-top: var(--spacing-md);
}

.value-example {
  background: white;
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}

.example-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: 0.95rem;
  margin-bottom: var(--spacing-sm);
}

.example-badge.white {
  background: var(--theme-gray-800);
  color: white;
}

.example-badge.black {
  background: var(--theme-gray-100);
  color: var(--theme-gray-900);
  border: 2px solid var(--theme-gray-300);
}

.value-example p {
  margin: 0;
  font-size: 0.85rem;
  line-height: 1.5;
  color: var(--theme-gray-700);
}

.value-example strong {
  color: var(--theme-gray-900);
}

/* Info WCAG Mejorada */
.wcag-info {
  background: var(--bg-primary);
  border: 2px solid var(--theme-primary);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-md);
}

.wcag-info details {
  cursor: pointer;
}

.wcag-info summary {
  list-style: none;
  padding: var(--spacing-md);
  background: linear-gradient(135deg, var(--theme-primary), var(--theme-secondary));
  color: white;
  user-select: none;
  transition: all 0.3s ease;
}

.wcag-info summary:hover {
  background: linear-gradient(135deg, var(--theme-secondary), var(--theme-primary));
  box-shadow: inset 0 0 20px rgba(255, 255, 255, 0.2);
}

.wcag-info summary::-webkit-details-marker {
  display: none;
}

.summary-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.summary-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  color: white;
}

.summary-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.summary-text strong {
  font-size: 1.1rem;
  font-weight: 700;
}

.summary-text span {
  font-size: 0.85rem;
  opacity: 0.9;
}

.summary-arrow {
  font-size: 1.2rem;
  transition: transform 0.3s ease;
}

.wcag-info details[open] .summary-arrow {
  transform: rotate(180deg);
}

.wcag-content {
  padding: var(--spacing-lg);
  background: var(--bg-secondary);
  animation: slideDown 0.3s ease;
}

.wcag-intro {
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-md);
  background: white;
  border-radius: var(--radius-md);
  border-left: 4px solid var(--theme-primary);
}

.wcag-intro p {
  margin: 0;
  line-height: 1.6;
  color: var(--theme-gray-800);
}

.wcag-standards h4 {
  margin: 0 0 var(--spacing-md) 0;
  color: var(--theme-gray-900);
  font-size: 1.1rem;
}

.standard-card {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: white;
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-sm);
  box-shadow: var(--shadow-sm);
  border-left: 4px solid;
}

.standard-card.aa-normal {
  border-left-color: #4caf50;
}

.standard-card.aa-large {
  border-left-color: #8bc34a;
}

.standard-card.aaa {
  border-left-color: #2196f3;
}

.standard-badge {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 1.1rem;
  background: var(--theme-gray-100);
  color: var(--theme-gray-800);
  border: 3px solid var(--theme-gray-300);
}

.standard-card.aa-normal .standard-badge {
  background: rgba(76, 175, 80, 0.1);
  color: #2e7d32;
  border-color: #4caf50;
}

.standard-card.aa-large .standard-badge {
  background: rgba(139, 195, 74, 0.1);
  color: #558b2f;
  border-color: #8bc34a;
}

.standard-card.aaa .standard-badge {
  background: rgba(33, 150, 243, 0.1);
  color: #1565c0;
  border-color: #2196f3;
}

.standard-info {
  flex: 1;
}

.standard-info strong {
  display: block;
  color: var(--theme-gray-900);
  margin-bottom: 4px;
  font-size: 1rem;
}

.standard-info p {
  margin: 4px 0;
  color: var(--theme-gray-700);
  font-size: 0.95rem;
}

.standard-info .ratio {
  font-family: var(--font-mono);
  font-weight: 700;
  color: var(--theme-primary);
  background: rgba(255, 107, 107, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
}

.standard-info small {
  display: block;
  margin-top: 4px;
  color: var(--theme-gray-500);
  font-size: 0.8rem;
  line-height: 1.4;
}

.wcag-formula {
  margin-top: var(--spacing-lg);
  padding: var(--spacing-md);
  background: white;
  border-radius: var(--radius-md);
  border: 2px dashed var(--theme-primary);
}

.wcag-formula h4 {
  margin: 0 0 var(--spacing-md) 0;
  color: var(--theme-gray-900);
  font-size: 1rem;
}

.formula-box {
  background: var(--theme-gray-900);
  color: #4caf50;
  padding: var(--spacing-md);
  border-radius: var(--radius-sm);
  margin-bottom: var(--spacing-md);
  font-family: var(--font-mono);
}

.formula-box code {
  display: block;
  font-size: 0.95rem;
  margin-bottom: var(--spacing-sm);
}

.formula-box p {
  margin: 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.75rem;
}

.formula-example {
  font-size: 0.9rem;
  line-height: 1.6;
  color: var(--theme-gray-700);
}

.formula-example strong {
  color: var(--theme-primary);
  font-family: var(--font-mono);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: var(--spacing-2xl);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: var(--spacing-md);
}

.empty-state h3 {
  color: var(--theme-gray-800);
  margin-bottom: var(--spacing-sm);
}

.empty-state p {
  color: var(--theme-gray-600);
}

/* Responsive */
@media (max-width: 768px) {
  .contrast-analysis-step {
    padding: var(--spacing-md);
  }

  .score-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .score-circle {
    width: 60px;
    height: 60px;
    font-size: 1.5rem;
  }

  .score-text h2 {
    font-size: 1.2rem;
  }

  .stats-inline {
    width: 100%;
    justify-content: space-around;
  }

  .colors-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: var(--spacing-sm);
  }
  
  .values-grid {
    grid-template-columns: 1fr;
  }
  
  .explainer-icon {
    font-size: 2rem;
  }
  
  .explainer-title h3 {
    font-size: 1rem;
  }
  
  .summary-text strong {
    font-size: 1rem;
  }
  
  .standard-card {
    flex-direction: column;
    text-align: center;
  }
  
  .standard-badge {
    margin: 0 auto;
  }
}
</style>

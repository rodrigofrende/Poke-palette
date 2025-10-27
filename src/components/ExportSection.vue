<template>
  <div class="export-section">
    <div class="export-header">
      <div class="export-header-icon">📤</div>
      <h3>Exportar Paleta</h3>
      <p class="export-description">
        Exporta la paleta de colores de {{ pokemonName }} en diferentes formatos para usar en tus proyectos
      </p>
    </div>

    <!-- Opciones de exportación -->
    <div class="export-options">
      <!-- Tailwind CSS -->
      <div class="export-option">
        <div class="export-option-header">
          <div class="export-icon tailwind-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div class="export-info">
            <h4>Tailwind CSS</h4>
            <p>Configuración de colores personalizados para Tailwind CSS</p>
          </div>
        </div>
        <div class="export-content">
          <div class="code-block">
            <div class="code-header">
              <div class="code-header-dots">
                <span class="dot red"></span>
                <span class="dot yellow"></span>
                <span class="dot green"></span>
              </div>
              <span class="code-header-title">tailwind.config.js</span>
              <button @click="copyToClipboard(tailwindCode)" class="copy-btn" title="Copiar código">
                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                  <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                </svg>
              </button>
            </div>
            <pre class="code-content">{{ tailwindCode }}</pre>
          </div>
        </div>
      </div>

      <!-- CSS Variables -->
      <div class="export-option">
        <div class="export-option-header">
          <div class="export-icon css-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>
            </svg>
          </div>
          <div class="export-info">
            <h4>CSS Variables</h4>
            <p>Variables CSS personalizadas para usar en cualquier proyecto</p>
          </div>
        </div>
        <div class="export-content">
          <div class="code-block">
            <div class="code-header">
              <div class="code-header-dots">
                <span class="dot red"></span>
                <span class="dot yellow"></span>
                <span class="dot green"></span>
              </div>
              <span class="code-header-title">styles.css</span>
              <button @click="copyToClipboard(cssCode)" class="copy-btn" title="Copiar código">
                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                  <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                </svg>
              </button>
            </div>
            <pre class="code-content">{{ cssCode }}</pre>
          </div>
        </div>
      </div>

      <!-- Figma -->
      <div class="export-option">
        <div class="export-option-header">
          <div class="export-icon figma-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <div class="export-info">
            <h4>Figma</h4>
            <p>Variables de color para Figma con nombres descriptivos</p>
          </div>
        </div>
        <div class="export-content">
          <div class="code-block">
            <div class="code-header">
              <div class="code-header-dots">
                <span class="dot red"></span>
                <span class="dot yellow"></span>
                <span class="dot green"></span>
              </div>
              <span class="code-header-title">figma-variables.json</span>
              <button @click="copyToClipboard(figmaCode)" class="copy-btn" title="Copiar código">
                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                  <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                </svg>
              </button>
            </div>
            <pre class="code-content">{{ figmaCode }}</pre>
          </div>
        </div>
      </div>

      <!-- JSON -->
      <div class="export-option">
        <div class="export-option-header">
          <div class="export-icon json-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
            </svg>
          </div>
          <div class="export-info">
            <h4>JSON</h4>
            <p>Datos estructurados con información completa de cada color</p>
          </div>
        </div>
        <div class="export-content">
          <div class="code-block">
            <div class="code-header">
              <div class="code-header-dots">
                <span class="dot red"></span>
                <span class="dot yellow"></span>
                <span class="dot green"></span>
              </div>
              <span class="code-header-title">palette-data.json</span>
              <button @click="copyToClipboard(jsonCode)" class="copy-btn" title="Copiar código">
                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                  <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                </svg>
              </button>
            </div>
            <pre class="code-content">{{ jsonCode }}</pre>
          </div>
        </div>
      </div>
    </div>

    <!-- Notificación de copiado -->
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
import { computed, ref } from 'vue'

// Props
const props = defineProps({
  palette: {
    type: Array,
    default: () => []
  },
  pokemonName: {
    type: String,
    default: 'Pokémon'
  }
})

// Reactive data
const showNotification = ref(false)
const notificationText = ref('')

// Computed properties para generar los códigos
const figmaCode = computed(() => {
  if (!props.palette.length) return '// No hay paleta disponible'
  
  const variables = props.palette.map((color, index) => {
    const name = `pokemon-${index + 1}`
    return `"${name}": "${color.hex}"`
  }).join(',\n  ')
  
  return `{
  ${variables}
}`
})

const jsonCode = computed(() => {
  if (!props.palette.length) return '// No hay paleta disponible'
  
  const paletteData = {
    pokemon: props.pokemonName,
    generatedAt: new Date().toISOString(),
    colors: props.palette.map((color, index) => ({
      id: index + 1,
      hex: color.hex,
      rgb: color.rgb,
      percentage: color.percentage,
      originalHex: color.originalHex || color.hex
    }))
  }
  
  return JSON.stringify(paletteData, null, 2)
})

const tailwindCode = computed(() => {
  if (!props.palette.length) return '// No hay paleta disponible'
  
  const colors = props.palette.map((color, index) => {
    const name = `pokemon-${index + 1}`
    return `"${name}": "${color.hex}"`
  }).join(',\n    ')
  
  return `module.exports = {
  theme: {
    extend: {
      colors: {
        ${colors}
      }
    }
  }
}`
})

const cssCode = computed(() => {
  if (!props.palette.length) return '/* No hay paleta disponible */'
  
  const variables = props.palette.map((color, index) => {
    const name = `--pokemon-${index + 1}`
    return `  ${name}: ${color.hex};`
  }).join('\n')
  
  return `:root {
${variables}
}`
})

// Methods
const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    notificationText.value = '¡Código copiado al portapapeles!'
    showNotification.value = true
    
    setTimeout(() => {
      showNotification.value = false
    }, 2000)
  } catch (err) {
    console.error('Error al copiar:', err)
    notificationText.value = 'Error al copiar al portapapeles'
    showNotification.value = true
    
    setTimeout(() => {
      showNotification.value = false
    }, 2000)
  }
}
</script>

<style scoped>
.export-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  overflow: visible;
}

.export-header {
  text-align: center;
  margin-bottom: 16px;
  padding: 24px;
  background: linear-gradient(135deg, var(--theme-primary), var(--theme-secondary));
  border-radius: 16px;
  color: white;
}

.export-header-icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

.export-header h3 {
  margin: 0 0 12px 0;
  font-size: 2rem;
  font-weight: bold;
}

.export-description {
  margin: 0;
  font-size: 1.1rem;
  opacity: 0.9;
  line-height: 1.5;
}

.export-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  flex: 1;
  min-height: 0;
  overflow: visible;
  width: 100%;
  box-sizing: border-box;
}

.export-option {
  background: var(--theme-tertiary);
  border: 2px solid var(--theme-border);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.export-option:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  transform: translateY(-4px);
  border-color: var(--theme-primary);
}

.export-option-header {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 24px;
  background: linear-gradient(135deg, var(--theme-quinary), var(--theme-tertiary));
  border-bottom: 2px solid var(--theme-border);
}

.export-icon {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  color: white;
  font-size: 1.8rem;
  transition: all 0.3s ease;
}

.export-icon svg {
  width: 32px;
  height: 32px;
}

.figma-icon {
  background: linear-gradient(135deg, #F24E1E, #FF6B35);
}

.json-icon {
  background: linear-gradient(135deg, #F7DF1E, #FFD700);
}

.tailwind-icon {
  background: linear-gradient(135deg, #06B6D4, #0891B2);
}

.css-icon {
  background: linear-gradient(135deg, #1572B6, #33A9DC);
}

.export-info h4 {
  margin: 0 0 8px 0;
  color: var(--theme-primary);
  font-size: 1.3rem;
  font-weight: bold;
}

.export-info p {
  margin: 0;
  color: var(--theme-quaternary);
  font-size: 1rem;
  line-height: 1.5;
}

.export-content {
  padding: 24px;
}

.code-block {
  background: #1e1e1e;
  border: 1px solid #333;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #2d2d2d;
  border-bottom: 1px solid #444;
  font-size: 0.9rem;
  font-weight: 500;
  color: #e0e0e0;
}

.code-header-dots {
  display: flex;
  gap: 6px;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.dot.red {
  background: #ff5f56;
}

.dot.yellow {
  background: #ffbd2e;
}

.dot.green {
  background: #27ca3f;
}

.code-header-title {
  flex: 1;
  text-align: center;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Fira Code', monospace;
  font-size: 0.85rem;
  color: #b4b4b4;
}

.copy-btn {
  background: linear-gradient(135deg, #404040, #505050);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 6px 10px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.copy-btn:hover {
  background: linear-gradient(135deg, #505050, #606060);
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

.code-content {
  margin: 0;
  padding: 20px;
  background: #1e1e1e;
  color: #d4d4d4;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Fira Code', monospace;
  font-size: 0.9rem;
  line-height: 1.6;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 300px;
  overflow-y: auto;
}

/* Syntax highlighting for different file types */
.code-content:has(+ .code-header-title:contains('tailwind.config.js')) {
  color: #06B6D4;
}

.code-content:has(+ .code-header-title:contains('styles.css')) {
  color: #1572B6;
}

.code-content:has(+ .code-header-title:contains('figma-variables.json')) {
  color: #F24E1E;
}

.code-content:has(+ .code-header-title:contains('palette-data.json')) {
  color: #F7DF1E;
}

.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  background: linear-gradient(135deg, var(--theme-primary), var(--theme-secondary));
  color: white;
  padding: 16px 24px;
  border-radius: 12px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  animation: slideIn 0.3s ease-out;
}

.notification-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.notification-icon {
  font-size: 1.2rem;
  font-weight: bold;
}

.notification-text {
  font-size: 1rem;
  font-weight: 500;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from,
.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

/* Responsive Design System */
@media (max-width: 1200px) {
  .export-options {
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 20px;
  }
  
  .export-header {
    padding: 20px;
  }
  
  .export-header h3 {
    font-size: 1.8rem;
  }
  
  .export-description {
    font-size: 1rem;
  }
}

@media (max-width: 768px) {
  .export-section {
    gap: 16px;
  }
  
  .export-options {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .export-header {
    padding: 16px;
    margin-bottom: 8px;
  }
  
  .export-header-icon {
    font-size: 2.5rem;
    margin-bottom: 12px;
  }
  
  .export-header h3 {
    font-size: 1.5rem;
    margin-bottom: 8px;
  }
  
  .export-description {
    font-size: 0.9rem;
  }
  
  .export-option {
    border-radius: 12px;
  }
  
  .export-option-header {
    padding: 16px;
    gap: 12px;
  }
  
  .export-icon {
    width: 40px;
    height: 40px;
  }
  
  .export-icon svg {
    width: 20px;
    height: 20px;
  }
  
  .export-info h4 {
    font-size: 1.1rem;
  }
  
  .export-info p {
    font-size: 0.85rem;
  }
  
  .export-content {
    padding: 16px;
  }
  
  .code-content {
    font-size: 0.8rem;
    padding: 12px;
    max-height: 250px;
  }
}

@media (max-width: 480px) {
  .export-section {
    gap: 12px;
  }
  
  .export-options {
    gap: 12px;
  }
  
  .export-header {
    padding: 12px;
  }
  
  .export-header-icon {
    font-size: 2rem;
    margin-bottom: 8px;
  }
  
  .export-header h3 {
    font-size: 1.3rem;
  }
  
  .export-description {
    font-size: 0.85rem;
  }
  
  .export-option {
    border-radius: 10px;
  }
  
  .export-option-header {
    padding: 12px;
    gap: 8px;
  }
  
  .export-content {
    padding: 12px;
  }
  
  .code-content {
    font-size: 0.75rem;
    padding: 10px;
    max-height: 200px;
  }
}

/* Landscape Mode */
@media (max-height: 500px) and (orientation: landscape) {
  .export-section {
    gap: 12px;
  }
  
  .export-header {
    padding: 12px;
  }
  
  .export-options {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 12px;
  }
  
  .code-content {
    max-height: 150px;
  }
}
</style> 
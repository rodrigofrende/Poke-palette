<template>
  <div class="export-section">
    <div class="export-header">
      <h3>📤 Exportar Paleta</h3>
      <p class="export-description">
        Exporta la paleta de colores de {{ pokemonName }} en diferentes formatos para usar en tus proyectos
      </p>
    </div>

    <!-- Opciones de exportación -->
    <div class="export-options">
      <!-- Figma -->
      <div class="export-option">
        <div class="export-option-header">
          <div class="export-icon">🎨</div>
          <div class="export-info">
            <h4>Figma</h4>
            <p>Variables de color para Figma con nombres descriptivos</p>
          </div>
        </div>
        <div class="export-content">
          <div class="code-block">
            <div class="code-header">
              <span>Variables de Figma</span>
              <button @click="copyToClipboard(figmaCode)" class="copy-btn" title="Copiar código">
                📋
              </button>
            </div>
            <pre class="code-content">{{ figmaCode }}</pre>
          </div>
        </div>
      </div>

      <!-- JSON -->
      <div class="export-option">
        <div class="export-option-header">
          <div class="export-icon">📄</div>
          <div class="export-info">
            <h4>JSON</h4>
            <p>Datos estructurados con información completa de cada color</p>
          </div>
        </div>
        <div class="export-content">
          <div class="code-block">
            <div class="code-header">
              <span>Datos JSON</span>
              <button @click="copyToClipboard(jsonCode)" class="copy-btn" title="Copiar código">
                📋
              </button>
            </div>
            <pre class="code-content">{{ jsonCode }}</pre>
          </div>
        </div>
      </div>

      <!-- Tailwind CSS -->
      <div class="export-option">
        <div class="export-option-header">
          <div class="export-icon">⚡</div>
          <div class="export-info">
            <h4>Tailwind CSS</h4>
            <p>Configuración de colores personalizados para Tailwind CSS</p>
          </div>
        </div>
        <div class="export-content">
          <div class="code-block">
            <div class="code-header">
              <span>Configuración de Tailwind</span>
              <button @click="copyToClipboard(tailwindCode)" class="copy-btn" title="Copiar código">
                📋
              </button>
            </div>
            <pre class="code-content">{{ tailwindCode }}</pre>
          </div>
        </div>
      </div>

      <!-- CSS Variables -->
      <div class="export-option">
        <div class="export-option-header">
          <div class="export-icon">🎯</div>
          <div class="export-info">
            <h4>CSS Variables</h4>
            <p>Variables CSS personalizadas para usar en cualquier proyecto</p>
          </div>
        </div>
        <div class="export-content">
          <div class="code-block">
            <div class="code-header">
              <span>Variables CSS</span>
              <button @click="copyToClipboard(cssCode)" class="copy-btn" title="Copiar código">
                📋
              </button>
            </div>
            <pre class="code-content">{{ cssCode }}</pre>
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
}

.export-header {
  text-align: center;
  margin-bottom: 8px;
}

.export-header h3 {
  margin: 0 0 8px 0;
  color: var(--theme-primary);
  font-size: 1.5rem;
}

.export-description {
  margin: 0;
  color: var(--theme-quaternary);
  font-size: 0.95rem;
  line-height: 1.4;
}

.export-options {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.export-option {
  background: var(--theme-tertiary);
  border: 1px solid var(--theme-border);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.export-option:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.export-option-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: var(--theme-quinary);
  border-bottom: 1px solid var(--theme-border);
}

.export-icon {
  font-size: 2rem;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--theme-primary);
  color: white;
  border-radius: 8px;
}

.export-info h4 {
  margin: 0 0 4px 0;
  color: var(--theme-primary);
  font-size: 1.1rem;
}

.export-info p {
  margin: 0;
  color: var(--theme-quaternary);
  font-size: 0.9rem;
  line-height: 1.4;
}

.export-content {
  padding: 20px;
}

.code-block {
  background: var(--theme-quinary);
  border: 1px solid var(--theme-border);
  border-radius: 8px;
  overflow: hidden;
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--theme-tertiary);
  border-bottom: 1px solid var(--theme-border);
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--theme-primary);
}

.copy-btn {
  background: var(--theme-primary);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 6px 10px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s ease;
}

.copy-btn:hover {
  background: var(--theme-secondary);
  transform: scale(1.05);
}

.code-content {
  margin: 0;
  padding: 16px;
  background: var(--theme-quinary);
  color: var(--theme-primary);
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.85rem;
  line-height: 1.4;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-word;
}

.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  background: var(--theme-primary);
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  animation: slideIn 0.3s ease-out;
}

.notification-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.notification-icon {
  font-size: 1.1rem;
}

.notification-text {
  font-size: 0.9rem;
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

@media (max-width: 768px) {
  .export-option-header {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
  
  .export-icon {
    width: 40px;
    height: 40px;
    font-size: 1.5rem;
  }
  
  .code-content {
    font-size: 0.8rem;
    padding: 12px;
  }
  
  .notification {
    top: 10px;
    right: 10px;
    left: 10px;
  }
}
</style> 
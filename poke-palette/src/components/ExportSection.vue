<template>
  <div class="export-section">
    <h3>Exportar Paleta <InfoTooltip text="Exporta la paleta de colores en diferentes formatos para uso en herramientas de diseño y desarrollo. Incluye opciones para CSS, Tailwind, Figma y JSON." size="medium" /></h3>
    <div class="export-buttons">
      <button @click="exportToCSS" class="export-btn css">
        Exportar CSS
                  <InfoTooltip text="Genera variables CSS personalizadas con los colores de la paleta. Incluye códigos hexadecimales y RGB para uso directo en proyectos web." size="small" />
      </button>
      <button @click="exportToTailwind" class="export-btn tailwind">
        Exportar Tailwind
                  <InfoTooltip text="Genera configuración de colores para Tailwind CSS. Incluye definiciones de colores personalizados para agregar a tu archivo tailwind.config.js." size="small" />
      </button>
      <button @click="exportToFigma" class="export-btn figma">
        Exportar Figma
                  <InfoTooltip text="Genera un archivo de colores compatible con Figma. Incluye códigos de color en formato que puede ser importado directamente en proyectos de Figma." size="small" />
      </button>
      <button @click="exportToJSON" class="export-btn json">
        Exportar JSON
                  <InfoTooltip text="Genera un archivo JSON con toda la información de la paleta. Incluye códigos hexadecimales, RGB, porcentajes y metadatos para uso en aplicaciones de desarrollo." size="small" />
      </button>
    </div>
    
    <!-- Generated code -->
    <div v-if="generatedCode" class="generated-code">
      <div class="code-header">
        <h4>Código Generado</h4>
        <button @click="copyCode" class="copy-code-btn">
          {{ copied ? '¡Copiado!' : 'Copiar' }}
        </button>
      </div>
      <pre><code>{{ generatedCode }}</code></pre>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { formatPokemonName } from '../utils/formatters.js'
import InfoTooltip from './InfoTooltip.vue'

// Props
const props = defineProps({
  palette: {
    type: Array,
    required: true
  },
  pokemon: {
    type: Object,
    default: null
  },
  isShiny: {
    type: Boolean,
    default: false
  }
})

// Reactive data
const generatedCode = ref('')
const copied = ref(false)

// Methods

const exportToCSS = () => {
  const pokemonName = props.pokemon ? props.pokemon.name : 'pokemon'
  const css = props.palette.map((color, index) => {
    return `--${pokemonName}-color-${index + 1}: ${color.hex};`
  }).join('\n  ')
  
  generatedCode.value = `/* Paleta de Colores ${formatPokemonName(pokemonName)} */\n:root {\n  ${css}\n}`
}

const exportToTailwind = () => {
  const pokemonName = props.pokemon ? props.pokemon.name : 'pokemon'
  const tailwind = props.palette.map((color, index) => {
    return `'${pokemonName}-${index + 1}': '${color.hex}',`
  }).join('\n    ')
  
  generatedCode.value = `// tailwind.config.js\ntheme: {\n  extend: {\n    colors: {\n      ${tailwind}\n    }\n  }\n}`
}

const exportToFigma = () => {
  const pokemonName = props.pokemon ? formatPokemonName(props.pokemon.name) : 'Pokemon'
  const figma = props.palette.map((color, index) => {
    return `${pokemonName} Color ${index + 1}: ${color.hex} (${color.percentage.toFixed(1)}%)`
  }).join('\n')
  
  generatedCode.value = `// Figma Color Palette - ${pokemonName}\n${figma}\n\nPara usar en Figma:\n1. Copia los códigos hex\n2. Pega en el panel de colores de Figma\n3. Organiza por porcentaje de uso`
}

const exportToJSON = () => {
  const pokemonName = props.pokemon ? props.pokemon.name : 'pokemon'
  const json = {
    name: `${formatPokemonName(pokemonName)} Palette`,
    pokemon: props.pokemon ? {
      id: props.pokemon.id,
      name: props.pokemon.name,
      types: props.pokemon.types.map(t => t.type.name),
      isShiny: props.isShiny
    } : null,
    colors: props.palette.map((color, index) => ({
      name: `Color ${index + 1}`,
      hex: color.hex,
      rgb: color.rgb,
      percentage: color.percentage
    }))
  }
  
  generatedCode.value = JSON.stringify(json, null, 2)
}

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(generatedCode.value)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (error) {
    console.error('Error copying code:', error)
  }
}
</script>

<style scoped>
.export-section {
  margin-bottom: 20px;
  margin-top: 20px;
}

.export-section h4 {
  color: var(--theme-quaternary);
  margin-bottom: 15px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.info-icon {
  font-size: 1rem;
  color: var(--theme-primary);
  cursor: help;
  opacity: 0.8;
  transition: all 0.3s ease;
  display: inline-block;
  margin-left: 4px;
}

.info-icon:hover {
  opacity: 1;
  transform: scale(1.1);
  color: var(--theme-secondary);
}

.export-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
}

.export-btn {
  padding: 10px 15px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

/* Mantener colores fijos para los botones de exportación */
.export-btn.css {
  background: #264de4;
  color: white;
}

.export-btn.tailwind {
  background: #38bdf8;
  color: white;
}

.export-btn.figma {
  background: #f24e1e;
  color: white;
}

.export-btn.json {
  background: #f7df1e;
  color: #333;
}

.export-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.generated-code {
  background: #2d3748;
  border-radius: 10px;
  padding: 20px;
  margin-top: 20px;
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.code-header h4 {
  color: white;
  margin: 0;
}

.copy-code-btn {
  background: #4a5568;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9rem;
}

.copy-code-btn:hover {
  background: #2d3748;
}

.generated-code pre {
  margin: 0;
  color: #e2e8f0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.9rem;
  line-height: 1.5;
  overflow-x: auto;
}

@media (max-width: 768px) {
  .export-buttons {
    grid-template-columns: 1fr;
  }
}
</style> 
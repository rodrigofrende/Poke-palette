<template>
  <div class="color-palette-extractor">
    <div class="upload-section">
      <h2>Analizador de Paletas Pokémon</h2>
      <p>Sube una imagen de un Pokémon para extraer su paleta de colores</p>
      
      <!-- Upload area -->
      <div 
        class="upload-area"
        @drop="handleDrop"
        @dragover.prevent
        @dragenter.prevent
        @click="triggerFileInput"
      >
        <div v-if="!selectedImage" class="upload-placeholder">
          <div class="upload-icon">📷</div>
          <p>Arrastra una imagen aquí o haz clic para seleccionar</p>
          <p class="upload-hint">Formatos soportados: JPG, PNG, WebP</p>
        </div>
        
        <div v-else class="image-preview">
          <img :src="selectedImage" alt="Imagen seleccionada" />
          <button @click="clearImage" class="clear-btn">×</button>
        </div>
      </div>
      
      <input 
        ref="fileInput"
        type="file" 
        accept="image/*" 
        @change="handleFileSelect" 
        style="display: none"
      />
      
      <!-- Extract button -->
      <button 
        v-if="selectedImage && !extracting"
        @click="extractPalette" 
        class="extract-btn"
      >
        Extraer Paleta de Colores
      </button>
      
      <div v-if="extracting" class="extracting">
        <div class="spinner"></div>
        <p>Analizando imagen...</p>
      </div>
    </div>
    
    <!-- Results section -->
    <div v-if="palette.length > 0" class="results-section">
      <h3>Paleta de Colores Extraída</h3>
      
      <!-- Color palette display -->
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
      
      <!-- Export options -->
      <div class="export-section">
        <h4>Exportar Paleta</h4>
        <div class="export-buttons">
          <button @click="exportToCSS" class="export-btn css">
            Exportar CSS
          </button>
          <button @click="exportToTailwind" class="export-btn tailwind">
            Exportar Tailwind
          </button>
          <button @click="exportToFigma" class="export-btn figma">
            Exportar Figma
          </button>
          <button @click="exportToJSON" class="export-btn json">
            Exportar JSON
          </button>
        </div>
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
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// Reactive data
const selectedImage = ref(null)
const extracting = ref(false)
const palette = ref([])
const generatedCode = ref('')
const copied = ref(false)
const fileInput = ref(null)

// Methods
const triggerFileInput = () => {
  fileInput.value.click()
}

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader()
    reader.onload = (e) => {
      selectedImage.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const handleDrop = (event) => {
  event.preventDefault()
  const file = event.dataTransfer.files[0]
  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader()
    reader.onload = (e) => {
      selectedImage.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const clearImage = () => {
  selectedImage.value = null
  palette.value = []
  generatedCode.value = ''
  copied.value = false
}

const extractPalette = async () => {
  if (!selectedImage.value) return
  
  extracting.value = true
  palette.value = []
  
  try {
    // Create canvas to analyze image
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const colors = extractColorsFromImageData(imageData)
      palette.value = colors
      
      extracting.value = false
    }
    
    img.src = selectedImage.value
  } catch (error) {
    console.error('Error extracting palette:', error)
    extracting.value = false
  }
}

const extractColorsFromImageData = (imageData) => {
  const data = imageData.data
  const colorMap = new Map()
  const totalPixels = data.length / 4
  
  // Sample pixels (every 10th pixel for performance)
  for (let i = 0; i < data.length; i += 40) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const a = data[i + 3]
    
    // Skip transparent pixels
    if (a < 128) continue
    
    // Quantize colors to reduce noise
    const quantizedR = Math.round(r / 25) * 25
    const quantizedG = Math.round(g / 25) * 25
    const quantizedB = Math.round(b / 25) * 25
    
    const colorKey = `${quantizedR},${quantizedG},${quantizedB}`
    colorMap.set(colorKey, (colorMap.get(colorKey) || 0) + 1)
  }
  
  // Convert to array and sort by frequency
  const colors = Array.from(colorMap.entries())
    .map(([colorKey, count]) => {
      const [r, g, b] = colorKey.split(',').map(Number)
      const hex = rgbToHex(r, g, b)
      const percentage = (count / totalPixels) * 100
      
      return {
        rgb: [r, g, b],
        hex,
        percentage
      }
    })
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 8) // Top 8 colors
  
  return colors
}

const rgbToHex = (r, g, b) => {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')
}

const copyColor = async (hex) => {
  try {
    await navigator.clipboard.writeText(hex)
    // Show feedback
    const originalText = event.target.textContent
    event.target.textContent = '¡Copiado!'
    setTimeout(() => {
      event.target.textContent = originalText
    }, 1000)
  } catch (error) {
    console.error('Error copying color:', error)
  }
}

const exportToCSS = () => {
  const css = palette.value.map((color, index) => {
    return `--pokemon-color-${index + 1}: ${color.hex};`
  }).join('\n  ')
  
  generatedCode.value = `/* Paleta de Colores Pokémon */\n:root {\n  ${css}\n}`
}

const exportToTailwind = () => {
  const tailwind = palette.value.map((color, index) => {
    return `'pokemon-${index + 1}': '${color.hex}',`
  }).join('\n    ')
  
  generatedCode.value = `// tailwind.config.js\ntheme: {\n  extend: {\n    colors: {\n      ${tailwind}\n    }\n  }\n}`
}

const exportToFigma = () => {
  const figma = palette.value.map((color, index) => {
    return `Color ${index + 1}: ${color.hex} (${color.percentage.toFixed(1)}%)`
  }).join('\n')
  
  generatedCode.value = `// Figma Color Palette\n${figma}\n\nPara usar en Figma:\n1. Copia los códigos hex\n2. Pega en el panel de colores de Figma\n3. Organiza por porcentaje de uso`
}

const exportToJSON = () => {
  const json = {
    name: 'Pokemon Palette',
    colors: palette.value.map((color, index) => ({
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
.color-palette-extractor {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.upload-section {
  text-align: center;
  margin-bottom: 40px;
}

.upload-section h2 {
  color: #333;
  margin-bottom: 10px;
}

.upload-section p {
  color: #666;
  margin-bottom: 30px;
}

.upload-area {
  border: 3px dashed #ddd;
  border-radius: 15px;
  padding: 40px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
  margin-bottom: 20px;
}

.upload-area:hover {
  border-color: #3498db;
  background: #f8f9fa;
}

.upload-placeholder {
  color: #666;
}

.upload-icon {
  font-size: 3rem;
  margin-bottom: 15px;
}

.upload-hint {
  font-size: 0.9rem;
  color: #999;
  margin-top: 10px;
}

.image-preview {
  position: relative;
  display: inline-block;
}

.image-preview img {
  max-width: 300px;
  max-height: 300px;
  border-radius: 10px;
}

.clear-btn {
  position: absolute;
  top: -10px;
  right: -10px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
}

.extract-btn {
  background: #3498db;
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.extract-btn:hover {
  background: #2980b9;
}

.extracting {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  margin: 20px 0;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.results-section {
  background: white;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
}

.results-section h3 {
  color: #333;
  margin-bottom: 20px;
  text-align: center;
}

.palette-display {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 30px;
}

.color-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  border-radius: 10px;
  background: #f8f9fa;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.color-item:hover {
  transform: translateY(-2px);
}

.color-swatch {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  border: 2px solid #ddd;
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
}

.color-rgb {
  font-size: 0.9rem;
  color: #666;
}

.color-percentage {
  font-size: 0.8rem;
  color: #999;
}

.export-section {
  margin-bottom: 30px;
}

.export-section h4 {
  color: #333;
  margin-bottom: 15px;
  text-align: center;
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
  .palette-display {
    grid-template-columns: 1fr;
  }
  
  .export-buttons {
    grid-template-columns: 1fr;
  }
  
  .upload-area {
    padding: 20px;
  }
}
</style> 
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
      
      <!-- Contrast Analysis Results -->
      <div v-if="contrastAnalysis.length > 0" class="contrast-analysis-section">
        <h4>📊 Análisis de Contraste</h4>
        <div class="contrast-results">
          <div 
            v-for="(result, index) in contrastAnalysis" 
            :key="index"
            class="contrast-item"
          >
            <div class="contrast-pair">
              <div class="contrast-info">
                <div class="color-labels">
                  <span class="contrast-label">
                    <span class="label-icon">🎨</span>
                    Fondo: 
                    <span class="color-code">
                      {{ result.background }}
                      <div 
                        class="color-sample background-sample" 
                        :style="{ backgroundColor: result.background }"
                        :title="`Fondo: ${result.background}`"
                      ></div>
                    </span>
                  </span>
                  <span class="contrast-label">
                    <span class="label-icon">✏️</span>
                    Texto: 
                    <span class="color-code">
                      {{ result.text }}
                      <div 
                        class="color-sample text-sample" 
                        :style="{ backgroundColor: result.text }"
                        :title="`Texto: ${result.text}`"
                      ></div>
                    </span>
                  </span>
                </div>
                <div class="contrast-metrics">
                  <span class="contrast-ratio">
                    <span class="ratio-icon">📊</span>
                    Ratio: {{ result.ratio.toFixed(2) }}
                  </span>
                  <span 
                    class="contrast-status"
                    :class="{ 'pass': result.passes, 'fail': !result.passes }"
                  >
                    <span class="status-icon">{{ result.passes ? '✅' : '❌' }}</span>
                    {{ result.passes ? 'Pasa' : 'Falla' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="contrast-actions">
          <button @click="applyContrastImprovements" class="contrast-btn improve">
            🔧 Mejorar Contraste
          </button>
          <button @click="restoreDefaultContrast" class="contrast-btn restore">
            🔄 Restaurar Contraste
          </button>
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
import { 
  getOptimalTextColor, 
  applyContrastToElement, 
  applyContrastToElements,
  checkWCAGCompliance,
  calculateContrastRatio,
  rgbToHex
} from '../utils/contrastUtils.js'

// Reactive data
const selectedImage = ref(null)
const extracting = ref(false)
const palette = ref([])
const generatedCode = ref('')
const copied = ref(false)
const fileInput = ref(null)
const contrastAnalysis = ref([])

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
  contrastAnalysis.value = []
}

// Función para analizar contraste de la paleta
function analyzePaletteContrast() {
  const analysis = [];
  
  // Analizar cada color de la paleta contra texto blanco y negro
  palette.value.forEach((color, index) => {
    const background = color.hex;
    
    // Validar que el color tenga el formato correcto
    if (!background || typeof background !== 'string' || !background.startsWith('#')) {
      console.warn('Invalid color format in palette:', background);
      return; // Saltar este color
    }
    
    // Test con texto blanco
    const whiteText = '#ffffff';
    const whiteRatio = calculateContrastRatio(whiteText, background);
    const whiteCompliance = checkWCAGCompliance(whiteText, background);
    
    analysis.push({
      background,
      text: whiteText,
      ratio: whiteRatio,
      passes: whiteCompliance.passes,
      type: 'white-text'
    });
    
    // Test con texto negro
    const blackText = '#000000';
    const blackRatio = calculateContrastRatio(blackText, background);
    const blackCompliance = checkWCAGCompliance(blackText, background);
    
    analysis.push({
      background,
      text: blackText,
      ratio: blackRatio,
      passes: blackCompliance.passes,
      type: 'black-text'
    });
  });
  
  contrastAnalysis.value = analysis;
}

// Función para aplicar mejoras de contraste
function applyContrastImprovements() {
  console.log('Aplicando mejoras de contraste...');
  
  // Aplicar contraste a elementos visibles actualmente
  applyContrastToVisibleElements();
}

// Función para aplicar contraste a elementos visibles
function applyContrastToVisibleElements() {
  // 1. Botones de modo (siempre visibles)
  const modeButtons = document.querySelectorAll('.mode-btn');
  modeButtons.forEach(button => {
    const backgroundColor = rgbToHex(getComputedStyle(button).backgroundColor);
    const contrastColor = getContrastColor(backgroundColor);
    button.style.color = contrastColor;
    console.log('Aplicado contraste a botón:', button.textContent, 'Color:', contrastColor);
  });
  
  // 2. Header principal
  const header = document.querySelector('.analyzer-header');
  if (header) {
    const headerBg = rgbToHex(getComputedStyle(header).backgroundColor);
    const headerText = header.querySelector('h2');
    const headerDesc = header.querySelector('p');
    
    if (headerText) {
      const contrastColor = getContrastColor(headerBg);
      headerText.style.color = contrastColor;
      console.log('Aplicado contraste a header h2:', contrastColor);
    }
    
    if (headerDesc) {
      const contrastColor = getContrastColor(headerBg);
      headerDesc.style.color = contrastColor;
      console.log('Aplicado contraste a header p:', contrastColor);
    }
  }
  
  // 3. Botones de contraste (si están visibles)
  const contrastButtons = document.querySelectorAll('.contrast-btn');
  contrastButtons.forEach(button => {
    const backgroundColor = rgbToHex(getComputedStyle(button).backgroundColor);
    const contrastColor = getContrastColor(backgroundColor);
    button.style.color = contrastColor;
    console.log('Aplicado contraste a botón de contraste:', button.textContent, 'Color:', contrastColor);
  });
  
  // 4. Elementos de la paleta de colores (si están visibles)
  const colorItems = document.querySelectorAll('.color-item');
  colorItems.forEach(item => {
    const backgroundColor = rgbToHex(getComputedStyle(item).backgroundColor);
    const contrastColor = getContrastColor(backgroundColor);
    
    // Aplicar a elementos de texto dentro del color-item
    const textElements = item.querySelectorAll('.color-hex, .color-rgb, .color-percentage');
    textElements.forEach(textEl => {
      textEl.style.color = contrastColor;
    });
    console.log('Aplicado contraste a elementos de color');
  });
  
  // 5. Botones de tema (si están visibles)
  const themeButtons = document.querySelectorAll('.theme-btn');
  themeButtons.forEach(button => {
    const backgroundColor = rgbToHex(getComputedStyle(button).backgroundColor);
    const contrastColor = getContrastColor(backgroundColor);
    button.style.color = contrastColor;
    console.log('Aplicado contraste a botón de tema:', button.textContent, 'Color:', contrastColor);
  });
  
  // 6. Elementos de análisis de contraste (si están visibles)
  const contrastItems = document.querySelectorAll('.contrast-item');
  contrastItems.forEach(item => {
    const backgroundColor = rgbToHex(getComputedStyle(item).backgroundColor);
    const contrastColor = getContrastColor(backgroundColor);
    
    // Aplicar a elementos de texto dentro del contrast-item
    const textElements = item.querySelectorAll('.contrast-label, .contrast-ratio, .contrast-status');
    textElements.forEach(textEl => {
      textEl.style.color = contrastColor;
    });
    console.log('Aplicado contraste a elementos de análisis');
  });
  
  console.log('Mejoras de contraste aplicadas');
}

// Función para restaurar contraste por defecto
function restoreDefaultContrast() {
  console.log('Restaurando contraste por defecto...');
  
  // Restaurar todos los elementos que podrían haber sido modificados
  const elementsToRestore = [
    '.mode-btn',
    '.analyzer-header h2',
    '.analyzer-header p',
    '.contrast-btn',
    '.color-hex',
    '.color-rgb',
    '.color-percentage',
    '.theme-btn',
    '.contrast-label',
    '.contrast-ratio',
    '.contrast-status'
  ];
  
  elementsToRestore.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
      element.style.color = '';
      console.log('Restaurado contraste de:', element.textContent || selector);
    });
  });
  
  console.log('Contraste restaurado por defecto');
}

// Función mejorada para calcular el contraste de un color
function getContrastColor(hexColor) {
  return getOptimalTextColor(hexColor);
}

const extractPalette = async () => {
  if (!selectedImage.value) return
  
  extracting.value = true
  palette.value = []
  contrastAnalysis.value = []
  
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
      
      // Analizar contraste después de generar la paleta
      analyzePaletteContrast();
      
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
  let totalSampledPixels = 0
  
  // Sample pixels (every 10th pixel for performance)
  for (let i = 0; i < data.length; i += 40) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const a = data[i + 3]
    
    // Skip transparent pixels
    if (a < 128) continue
    
    totalSampledPixels++
    
    // Quantize colors less aggressively to preserve more variation
    const quantizedR = Math.round(r / 15) * 15
    const quantizedG = Math.round(g / 15) * 15
    const quantizedB = Math.round(b / 15) * 15
    
    const colorKey = `${quantizedR},${quantizedG},${quantizedB}`
    colorMap.set(colorKey, (colorMap.get(colorKey) || 0) + 1)
  }
  
  // Convert to array and sort by frequency
  const allColors = Array.from(colorMap.entries())
    .map(([colorKey, count]) => {
      const [r, g, b] = colorKey.split(',').map(Number)
      const hex = rgbToHexValues(r, g, b)
      const percentage = (count / totalSampledPixels) * 100
      
      // Calculate HSL values for better color analysis
      const hsl = rgbToHsl(r, g, b)
      
      return {
        rgb: [r, g, b],
        hex,
        percentage,
        hsl,
        saturation: hsl.s,
        lightness: hsl.l
      }
    })
    .sort((a, b) => b.percentage - a.percentage)
  
  // Improved color selection algorithm
  const selectedColors = selectDiverseColors(allColors, 8)
  
  return selectedColors
}

// Convert RGB to HSL for better color analysis
const rgbToHsl = (r, g, b) => {
  r /= 255
  g /= 255
  b /= 255
  
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h, s, l = (max + min) / 2
  
  if (max === min) {
    h = s = 0 // achromatic
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    h /= 6
  }
  
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  }
}

// Improved color selection algorithm
const selectDiverseColors = (allColors, maxColors) => {
  if (allColors.length <= maxColors) {
    return allColors
  }
  
  const selected = []
  const used = new Set()
  
  // First, add the most frequent color
  selected.push(allColors[0])
  used.add(allColors[0].hex)
  
  // Then add colors that are most different from already selected ones
  for (let i = 1; i < maxColors; i++) {
    let bestColor = null
    let maxDifference = -1
    
    for (const color of allColors) {
      if (used.has(color.hex)) continue
      
      // Calculate minimum difference from all selected colors
      let minDifference = Infinity
      for (const selectedColor of selected) {
        const difference = calculateColorDifference(color, selectedColor)
        minDifference = Math.min(minDifference, difference)
      }
      
      // Prefer colors with higher saturation and good frequency
      const score = minDifference * (1 + color.saturation / 100) * (color.percentage / 100)
      
      if (score > maxDifference) {
        maxDifference = score
        bestColor = color
      }
    }
    
    if (bestColor) {
      selected.push(bestColor)
      used.add(bestColor.hex)
    }
  }
  
  return selected.sort((a, b) => b.percentage - a.percentage)
}

// Calculate color difference using multiple metrics
const calculateColorDifference = (color1, color2) => {
  const [r1, g1, b1] = color1.rgb
  const [r2, g2, b2] = color2.rgb
  
  // Euclidean distance in RGB space
  const rgbDiff = Math.sqrt(
    Math.pow(r1 - r2, 2) + 
    Math.pow(g1 - g2, 2) + 
    Math.pow(b1 - b2, 2)
  )
  
  // HSL difference
  const hDiff = Math.abs(color1.hsl.h - color2.hsl.h)
  const sDiff = Math.abs(color1.hsl.s - color2.hsl.s)
  const lDiff = Math.abs(color1.hsl.l - color2.hsl.l)
  
  // Weighted combination
  return rgbDiff * 0.6 + hDiff * 0.3 + sDiff * 0.1 + lDiff * 0.1
}

const rgbToHexValues = (r, g, b) => {
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

.contrast-analysis-section {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.contrast-analysis-section h4 {
  color: #333;
  margin-bottom: 20px;
  text-align: center;
  font-size: 1.3rem;
  font-weight: 700;
}

.contrast-results {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 240px));
  gap: 16px;
  margin-bottom: 25px;
  justify-content: center;
}

.contrast-item {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 16px;
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.contrast-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.contrast-pair {
  display: flex;
  align-items: center;
  gap: 16px;
}

.color-code {
  display: flex;
  align-items: center;
  gap: 5px;
  font-family: monospace;
  font-weight: bold;
}

.color-sample {
  width: 18px;
  height: 18px;
  border-radius: 3px;
  border: 1px solid #dee2e6;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.color-sample:hover {
  transform: scale(1.3);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.contrast-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.color-labels {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.contrast-label {
  font-size: 0.9rem;
  color: #495057;
  font-family: monospace;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  background: rgba(0, 0, 0, 0.03);
  border-radius: 4px;
  transition: all 0.3s ease;
}

.contrast-label:hover {
  background: rgba(0, 0, 0, 0.06);
}

.label-icon {
  font-size: 1em;
  opacity: 0.8;
}

.contrast-metrics {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.contrast-ratio {
  font-weight: bold;
  color: #495057;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: #ffffff;
  border-radius: 5px;
  border: 1px solid #dee2e6;
  font-size: 0.9rem;
}

.ratio-icon {
  font-size: 1em;
  opacity: 0.8;
}

.contrast-status {
  font-weight: bold;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 5px;
  transition: all 0.3s ease;
}

.contrast-status.pass {
  color: #38a169;
  background: rgba(56, 161, 105, 0.1);
  border: 1px solid rgba(56, 161, 105, 0.3);
}

.contrast-status.fail {
  color: #e53e3e;
  background: rgba(229, 62, 62, 0.1);
  border: 1px solid rgba(229, 62, 62, 0.3);
}

.contrast-status .status-icon {
  font-size: 1em;
}

.contrast-actions {
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-top: 25px;
}

.contrast-btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  border: 2px solid #dee2e6;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.contrast-btn.improve {
  background: #4caf50;
  color: white;
  border-color: #4caf50;
}

.contrast-btn.restore {
  background: #f8f9fa;
  color: #495057;
  border-color: #dee2e6;
}

.contrast-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.contrast-btn.improve:hover {
  background: #45a049;
  border-color: #45a049;
}

.contrast-btn.restore:hover {
  background: #e9ecef;
  color: #212529;
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
<template>
  <div class="selected-pokemon">
    <div class="pokemon-card">
      <div class="pokemon-image-container">
        <img 
          :src="pokemon.imageUrl" 
          :alt="pokemon.name"
          class="pokemon-image"
        />
        <div class="shiny-indicator" v-if="isShiny">✨</div>
      </div>
      
      <div class="pokemon-info">
        <h3>{{ formatPokemonName(pokemon.name) }}</h3>
        <p class="pokemon-id">#{{ pokemon.id }}</p>
        
        <div class="pokemon-types">
          <TypeBadge 
            v-for="type in pokemon.types" 
            :key="type.type.name"
            :type="type.type.name"
          />
        </div>
        
        <!-- Información física -->
        <div class="pokemon-physical-info">
          <h4>Información Física</h4>
          <div class="physical-grid">
            <div class="physical-item">
              <span class="physical-label">Altura:</span>
              <span class="physical-value">{{ (pokemon.height / 10).toFixed(1) }} m</span>
            </div>
            <div class="physical-item">
              <span class="physical-label">Peso:</span>
              <span class="physical-value">{{ (pokemon.weight / 10).toFixed(1) }} kg</span>
            </div>
            <div class="physical-item">
              <span class="physical-label">Color base:</span>
              <span class="physical-value">{{ formatColorName(pokemon.species?.color?.name) }}</span>
            </div>
            <div class="physical-item">
              <span class="physical-label">Forma:</span>
              <span class="physical-value">{{ formatShapeName(pokemon.species?.shape?.name) }}</span>
            </div>
          </div>
        </div>
        
        <!-- Descripción -->
        <div class="pokemon-description" v-if="pokemon.species?.flavor_text_entries">
          <h4>Descripción</h4>
          <p class="description-text">
            {{ getSpanishDescription(pokemon.species.flavor_text_entries) }}
          </p>
        </div>
        
        <!-- Información de evolución -->
        <div class="pokemon-evolution" v-if="pokemon.species?.evolution_chain">
          <h4>Información de Evolución</h4>
          <div class="evolution-info">
            <div class="evolution-item">
              <span class="evolution-label">Cadena evolutiva:</span>
              <span class="evolution-value">{{ pokemon.species.evolution_chain.url.split('/').pop() }}</span>
            </div>
            <div class="evolution-item">
              <span class="evolution-label">Grupo de huevos:</span>
              <span class="evolution-value">{{ formatEggGroupName(pokemon.species.egg_groups?.[0]?.name) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <button @click="$emit('analyze')" class="analyze-btn">
      <span class="btn-icon">🎨</span>
      Analizar Paleta de Colores
    </button>
  </div>
</template>

<script setup>
import TypeBadge from './TypeBadge.vue'
import { 
  formatPokemonName, 
  formatColorName, 
  formatShapeName, 
  formatEggGroupName, 
  getSpanishDescription 
} from '../utils/formatters.js'

// Props
const props = defineProps({
  pokemon: {
    type: Object,
    required: true
  },
  isShiny: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['analyze'])

// Methods
</script>

<style scoped>
.selected-pokemon {
  text-align: center;
  margin-bottom: 30px;
}

.pokemon-card {
  display: inline-flex;
  align-items: flex-start;
  gap: 30px;
  background: var(--theme-tertiary);
  padding: 30px;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  max-width: 600px;
  border: 1px solid var(--theme-border);
}

.pokemon-image-container {
  position: relative;
  flex-shrink: 0;
}

.pokemon-image {
  width: 150px;
  height: 150px;
  object-fit: contain;
  border-radius: 15px;
  background: linear-gradient(135deg, var(--theme-quinary) 0%, var(--theme-quinary) 100%);
  padding: 10px;
  transition: transform 0.3s ease;
}

.pokemon-image:hover {
  transform: scale(1.05);
}

.shiny-indicator {
  position: absolute;
  top: -10px;
  right: -10px;
  background: var(--theme-secondary);
  color: var(--theme-tertiary);
  padding: 5px 8px;
  border-radius: 15px;
  font-size: 12px;
  font-weight: bold;
  animation: sparkle 2s infinite;
}

@keyframes sparkle {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.pokemon-info {
  flex: 1;
  text-align: left;
}

.pokemon-info h3 {
  margin: 0 0 5px 0;
  color: var(--theme-quaternary);
  font-size: 2rem;
  font-weight: bold;
}

.pokemon-id {
  color: var(--theme-quaternary);
  margin: 0 0 15px 0;
  font-size: 1.2rem;
  font-weight: 500;
  opacity: 0.7;
}

.pokemon-types {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}

.pokemon-physical-info {
  margin-bottom: 20px;
}

.pokemon-physical-info h4 {
  margin: 0 0 10px 0;
  color: var(--theme-quaternary);
  font-size: 1.1rem;
}

.physical-grid {
  display: grid;
  gap: 8px;
}

.physical-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: var(--theme-quinary);
  border-radius: 8px;
  border: 1px solid var(--theme-border);
  color: var(--theme-quaternary);
  font-weight: 500;
}

.physical-label {
  font-size: 0.9rem;
  color: inherit;
  font-weight: 500;
  opacity: 0.9;
}

.physical-value {
  font-size: 0.9rem;
  color: inherit;
  font-weight: 600;
}

.pokemon-description {
  margin-bottom: 20px;
}

.pokemon-description h4 {
  margin: 0 0 10px 0;
  color: var(--theme-quaternary);
  font-size: 1.1rem;
}

.description-text {
  padding: 12px;
  background: var(--theme-quinary);
  border-radius: 8px;
  border: 1px solid var(--theme-border);
  font-size: 0.9rem;
  line-height: 1.5;
  color: var(--theme-quaternary);
  margin: 0;
  font-weight: 500;
}

.pokemon-evolution {
  margin-bottom: 20px;
}

.pokemon-evolution h4 {
  margin: 0 0 10px 0;
  color: var(--theme-quaternary);
  font-size: 1.1rem;
}

.evolution-info {
  display: grid;
  gap: 8px;
}

.evolution-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: var(--theme-quinary);
  border-radius: 8px;
  border: 1px solid var(--theme-border);
  color: var(--theme-quaternary);
  font-weight: 500;
}

.evolution-label {
  font-size: 0.9rem;
  color: inherit;
  font-weight: 500;
  opacity: 0.9;
}

.evolution-value {
  font-size: 0.9rem;
  color: inherit;
  font-weight: 600;
}

.analyze-btn {
  background: linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-secondary) 100%);
  color: var(--theme-tertiary);
  border: 2px solid var(--theme-border);
  padding: 15px 30px;
  border-radius: 10px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
}

.analyze-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  border-color: var(--theme-primary);
}

.btn-icon {
  font-size: 18px;
}
</style> 
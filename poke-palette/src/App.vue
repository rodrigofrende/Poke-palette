<script setup>
import { defineAsyncComponent } from 'vue'

// Lazy loading para el componente principal
const PokemonPaletteAnalyzer = defineAsyncComponent(() => 
  import('./components/PokemonPaletteAnalyzer.vue')
)
</script>

<template>
  <div class="app">
    <main>
      <PokemonPaletteAnalyzer />
    </main>
    <footer class="app-footer">
      <p>Hecho con ❤️ para diseñadores y desarrolladores</p>
    </footer>
  </div>
</template>

<style>
:root {
  --theme-primary: #667eea;
  --theme-secondary: #764ba2;
  --theme-tertiary: #ffffff;
  --theme-quaternary: #2d3748;
  --theme-quinary: #f7fafc;
}

.app {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-secondary) 100%);
  display: flex;
  flex-direction: column;
}

.app-header {
  text-align: center;
  padding: 40px 20px;
  color: var(--theme-tertiary);
}

.app-header h1 {
  margin: 0 0 10px 0;
  font-size: 3.5rem;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.app-header p {
  margin: 0;
  font-size: 1.3rem;
  opacity: 0.9;
}

main {
  flex: 1;
  padding: 12px;
}

.app-footer {
  text-align: center;
  padding: 12px;
  color: var(--theme-tertiary);
  opacity: 0.8;
  font-size: 0.85rem;
}

@media (max-width: 768px) {
  .app-header h1 {
    font-size: 2.5rem;
  }
  
  .app-header p {
    font-size: 1.1rem;
  }
}
</style>

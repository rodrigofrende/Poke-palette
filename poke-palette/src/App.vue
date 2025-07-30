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
      <Suspense>
        <template #default>
          <PokemonPaletteAnalyzer />
        </template>
        <template #fallback>
          <div class="app-loading">
            <div class="loading-spinner">
              <div class="spinner"></div>
            </div>
            <p class="loading-text">Cargando Pokémon Palette Analyzer...</p>
          </div>
        </template>
      </Suspense>
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

/* Loading styles for Suspense */
.app-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-secondary) 100%);
  color: var(--theme-tertiary);
}

.loading-spinner {
  margin-bottom: 20px;
}

.spinner {
  width: 60px;
  height: 60px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid var(--theme-tertiary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  font-size: 1.1rem;
  font-weight: 500;
  margin: 0;
  opacity: 0.9;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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

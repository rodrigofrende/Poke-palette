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
.app {
  min-height: 100vh;
  background: var(--bg-secondary);
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
  padding: 0;
  padding-bottom: 80px; /* Espacio para botones flotantes y footer */
}

.app-footer {
  text-align: center;
  padding: var(--spacing-md);
  color: var(--theme-gray-500);
  font-size: var(--text-sm);
  background: var(--bg-primary);
  border-top: 1px solid var(--border-light);
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

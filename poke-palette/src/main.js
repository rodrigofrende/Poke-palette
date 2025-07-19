import { createApp } from 'vue'
import App from './App.vue'
import './style.css'
import { initializeTheme } from './utils/themeManager.js'

// Inicializar el sistema de temas
initializeTheme()

createApp(App).mount('#app')

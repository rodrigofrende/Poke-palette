<template>
  <div class="quick-actions-menu" :class="{ open: isOpen }">
    <!-- Botón flotante principal -->
    <button 
      @click="toggleMenu" 
      class="fab-button"
      :class="{ active: isOpen }"
      :aria-label="isOpen ? 'Cerrar menú' : 'Abrir menú de acciones'"
    >
      <span class="fab-icon">{{ isOpen ? '✕' : '⚡' }}</span>
    </button>

    <!-- Menú de acciones -->
    <transition name="menu">
      <div v-if="isOpen" class="actions-list">
        <button 
          v-for="action in availableActions" 
          :key="action.id"
          @click="handleAction(action.id)"
          class="action-item"
          :disabled="action.disabled"
          :title="action.tooltip"
        >
          <span class="action-icon">{{ action.icon }}</span>
          <span class="action-label">{{ action.label }}</span>
        </button>
      </div>
    </transition>

    <!-- Backdrop -->
    <transition name="fade">
      <div 
        v-if="isOpen" 
        class="menu-backdrop"
        @click="toggleMenu"
      ></div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// Props
const props = defineProps({
  currentStep: {
    type: Number,
    default: 1
  },
  hasSelection: {
    type: Boolean,
    default: false
  },
  hasPalette: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits([
  'apply-theme',
  'restore-theme',
  'export-palette',
  'clear-selection',
  'analyze-contrast'
])

// State
const isOpen = ref(false)

// Computed
const availableActions = computed(() => {
  const actions = []
  
  // Acciones disponibles según el paso actual
  if (props.currentStep === 2 && props.hasPalette) {
    actions.push(
      {
        id: 'apply-theme',
        icon: '🎨',
        label: 'Aplicar Tema',
        tooltip: 'Aplicar paleta como tema',
        disabled: false
      },
      {
        id: 'restore-theme',
        icon: '🔄',
        label: 'Restaurar',
        tooltip: 'Restaurar tema original',
        disabled: false
      },
      {
        id: 'export-palette',
        icon: '📤',
        label: 'Exportar',
        tooltip: 'Exportar paleta',
        disabled: false
      }
    )
  }
  
  if (props.currentStep === 3 && props.hasPalette) {
    actions.push(
      {
        id: 'analyze-contrast',
        icon: '📊',
        label: 'Re-analizar',
        tooltip: 'Volver a analizar contraste',
        disabled: false
      }
    )
  }
  
  // Acción de limpiar selección siempre disponible si hay selección
  if (props.hasSelection) {
    actions.push({
      id: 'clear-selection',
      icon: '🗑️',
      label: 'Limpiar',
      tooltip: 'Limpiar selección y empezar de nuevo',
      disabled: false
    })
  }
  
  return actions
})

// Methods
const toggleMenu = () => {
  isOpen.value = !isOpen.value
}

const handleAction = (actionId) => {
  emit(actionId)
  toggleMenu()
}

// Cerrar menú al presionar Escape
const handleKeydown = (e) => {
  if (e.key === 'Escape' && isOpen.value) {
    toggleMenu()
  }
}

// Lifecycle
if (typeof window !== 'undefined') {
  window.addEventListener('keydown', handleKeydown)
}
</script>

<style scoped>
.quick-actions-menu {
  position: fixed;
  bottom: 90px; /* Espacio para no tapar el footer */
  right: var(--spacing-xl);
  z-index: var(--z-fixed);
}

/* FAB Button */
.fab-button {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--gradient-primary);
  color: white;
  border: none;
  box-shadow: var(--shadow-xl);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-base);
  position: relative;
  z-index: 2;
}

.fab-button:hover {
  transform: scale(1.1);
  box-shadow: 0 8px 32px rgba(255, 107, 107, 0.4);
}

.fab-button.active {
  background: var(--gradient-secondary);
  transform: rotate(90deg);
}

.fab-icon {
  font-size: 1.5rem;
  transition: all var(--transition-base);
}

/* Actions List */
.actions-list {
  position: absolute;
  bottom: 70px;
  right: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  z-index: 1;
}

.action-item {
  background: white;
  border: 2px solid var(--border-light);
  border-radius: var(--radius-full);
  padding: var(--spacing-sm) var(--spacing-lg);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  box-shadow: var(--shadow-lg);
  cursor: pointer;
  transition: all var(--transition-base);
  white-space: nowrap;
}

.action-item:hover:not(:disabled) {
  transform: translateX(-4px);
  border-color: var(--theme-primary);
  box-shadow: var(--shadow-xl);
}

.action-item:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-icon {
  font-size: 1.2rem;
}

.action-label {
  font-weight: 600;
  color: var(--theme-gray-900);
  font-size: var(--text-sm);
}

/* Backdrop */
.menu-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 0;
  backdrop-filter: blur(2px);
}

/* Animations */
.menu-enter-active,
.menu-leave-active {
  transition: all var(--transition-base);
}

.menu-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.8);
}

.menu-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.9);
}

.fade-enter-active,
.fade-leave-active {
  transition: all var(--transition-base);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (min-width: 768px) {
  .quick-actions-menu {
    display: none; /* Ocultar en desktop, ya que hay suficiente espacio en la UI principal */
  }
}

@media (max-width: 480px) {
  .quick-actions-menu {
    right: var(--spacing-md);
    bottom: 70px; /* Espacio para footer en mobile */
  }
  
  .fab-button {
    width: 48px;
    height: 48px;
  }
  
  .fab-icon {
    font-size: 1.3rem;
  }
  
  .action-item {
    padding: var(--spacing-xs) var(--spacing-md);
  }
  
  .action-label {
    font-size: var(--text-xs);
  }
}

/* Touch devices */
@media (hover: none) and (pointer: coarse) {
  .fab-button {
    /* Asegurar touch target mínimo */
    min-width: 56px;
    min-height: 56px;
  }
  
  .action-item {
    min-height: 44px;
  }
}
</style>


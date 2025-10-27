<template>
  <div class="tooltip-container">
    <span 
      ref="triggerRef"
      class="info-icon"
      :class="[`size-${size}`]"
      @mouseenter="showTooltip"
      @mouseleave="hideTooltip"
      @focus="showTooltip"
      @blur="hideTooltip"
      @keydown.enter="showTooltip"
      @keydown.escape="hideTooltip"
      role="button"
      :aria-label="`Información adicional: ${text}`"
      tabindex="0"
    >
      <svg :width="iconSize" :height="iconSize" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
        <path d="M12 16v-4M12 8h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </span>
    
    <Transition name="tooltip">
      <div 
        v-if="isVisible"
        ref="tooltipRef"
        class="custom-tooltip"
        :class="[`size-${size}`]"
        :style="tooltipStyle"
        role="tooltip"
        :aria-describedby="`tooltip-${Date.now()}`"
      >
        <div class="tooltip-content" :id="`tooltip-${Date.now()}`">
          {{ text }}
        </div>
        <div class="tooltip-arrow"></div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useFloating, offset, shift, flip, arrow } from '@floating-ui/vue'

const props = defineProps({
  text: {
    type: String,
    required: true
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  }
})

const triggerRef = ref(null)
const tooltipRef = ref(null)
const isVisible = ref(false)

const iconSize = computed(() => {
  switch (props.size) {
    case 'small': return 12
    case 'large': return 18
    default: return 14
  }
})

const { x, y, strategy } = useFloating(triggerRef, tooltipRef, {
  placement: 'top',
  middleware: [offset(8), shift(), flip()]
})

const tooltipStyle = computed(() => ({
  position: strategy.value,
  top: y.value ? `${y.value}px` : '',
  left: x.value ? `${x.value}px` : ''
}))

const showTooltip = () => {
  isVisible.value = true
}

const hideTooltip = () => {
  isVisible.value = false
}

// Cleanup
onUnmounted(() => {
  isVisible.value = false
})
</script>

<style scoped>
.tooltip-container {
  position: relative;
  display: inline-flex;
  align-items: center;
  margin-left: 6px;
}

.info-icon {
  color: #4a5568;
  cursor: help;
  opacity: 0.8;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
  border-radius: 50%;
  background: transparent;
  transition: all 0.2s ease;
  border: 1px solid rgba(74, 85, 104, 0.2);
}

.info-icon:hover {
  opacity: 1;
  color: #2d3748;
  background: rgba(74, 85, 104, 0.1);
  transform: scale(1.1);
  border-color: rgba(74, 85, 104, 0.4);
}

/* Size variants for icon */
.info-icon.size-small {
  width: 14px;
  height: 14px;
  padding: 1px;
}

.info-icon.size-medium {
  width: 16px;
  height: 16px;
  padding: 2px;
}

.info-icon.size-large {
  width: 18px;
  height: 18px;
  padding: 2px;
}

.custom-tooltip {
  position: absolute;
  background: #2d3748;
  color: #ffffff;
  padding: 0;
  border-radius: 6px;
  font-weight: 400;
  line-height: 1.4;
  z-index: 1000;
  box-shadow: 
    0 4px 6px -1px rgba(0, 0, 0, 0.2),
    0 2px 4px -1px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(4px);
}

/* Size variants for tooltip */
.custom-tooltip.size-small {
  font-size: 11px;
  max-width: 180px;
  min-width: 120px;
}

.custom-tooltip.size-medium {
  font-size: 12px;
  max-width: 240px;
  min-width: 160px;
}

.custom-tooltip.size-large {
  font-size: 13px;
  max-width: 300px;
  min-width: 200px;
}

.tooltip-content {
  position: relative;
}

.custom-tooltip.size-small .tooltip-content {
  padding: 6px 10px;
}

.custom-tooltip.size-medium .tooltip-content {
  padding: 8px 12px;
}

.custom-tooltip.size-large .tooltip-content {
  padding: 10px 14px;
}

.tooltip-arrow {
  position: absolute;
  width: 0;
  height: 0;
  border: 5px solid transparent;
  border-top-color: #2d3748;
  bottom: -5px;
  left: 50%;
  transform: translateX(-50%);
}

/* Tooltip animations */
.tooltip-enter-active,
.tooltip-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.tooltip-enter-from {
  opacity: 0;
  transform: translateY(8px) scale(0.9);
}

.tooltip-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(0.9);
}

.tooltip-enter-to,
.tooltip-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .custom-tooltip.size-small {
    max-width: 180px;
    min-width: 140px;
    font-size: 10px;
  }
  
  .custom-tooltip.size-medium {
    max-width: 260px;
    min-width: 180px;
    font-size: 12px;
  }
  
  .custom-tooltip.size-large {
    max-width: 320px;
    min-width: 220px;
    font-size: 14px;
  }
  
  .custom-tooltip.size-small .tooltip-content {
    padding: 6px 10px;
  }
  
  .custom-tooltip.size-medium .tooltip-content {
    padding: 10px 14px;
  }
  
  .custom-tooltip.size-large .tooltip-content {
    padding: 14px 18px;
  }
}
</style> 
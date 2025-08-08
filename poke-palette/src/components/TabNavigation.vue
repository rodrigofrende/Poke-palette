<template>
  <div class="tab-navigation">
    <button 
      v-for="tab in tabs" 
      :key="tab.id"
      @click="$emit('tab-change', tab.id)"
      :class="['nav-btn', { active: activeTab === tab.id }]"
    >
      <span class="nav-icon">{{ tab.icon }}</span>
      <span class="nav-text">{{ tab.title }}</span>
    </button>
  </div>
</template>

<script setup>
// Props
const props = defineProps({
  tabs: {
    type: Array,
    required: true,
    // Array de objetos con: { id, title, icon }
  },
  activeTab: {
    type: String,
    required: true
  }
})

// Emits
const emit = defineEmits(['tab-change'])
</script>

<style scoped>
/* Los estilos ahora están en shared.css para consistencia */
</style> 
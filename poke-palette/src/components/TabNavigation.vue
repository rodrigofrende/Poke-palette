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
.tab-navigation {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  padding: 0;
  flex-shrink: 0;
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: linear-gradient(135deg, #f7fafc, #ffffff);
  border: 2px solid var(--theme-border);
  border-radius: 10px;
  color: var(--theme-quaternary);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 13px;
  min-width: 100px;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.nav-btn:hover {
  background: linear-gradient(135deg, var(--theme-primary), var(--theme-secondary));
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
  border-color: var(--theme-primary);
}

.nav-btn.active {
  background: linear-gradient(135deg, var(--theme-primary), var(--theme-secondary));
  color: white;
  border-color: var(--theme-primary);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.nav-icon {
  font-size: 16px;
}

.nav-text {
  font-size: 13px;
}

@media (max-width: 768px) {
  .tab-navigation {
    flex-direction: column;
    gap: 6px;
  }
  
  .nav-btn {
    min-width: auto;
    padding: 12px 16px;
  }
  
  .nav-text {
    font-size: 12px;
  }
}
</style> 
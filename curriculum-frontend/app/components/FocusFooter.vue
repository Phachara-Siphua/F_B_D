<!-- components/FocusFooter.vue -->
<script setup lang="ts">
import type { FocusStep } from '~/composables/useFocusMode'

const props = defineProps<{
  isFocused: boolean
  currentIndex: number
  steps: FocusStep[]
}>()
const emit = defineEmits<{ (e: 'prev'): void; (e: 'next'): void }>()
</script>

<template>
  <div v-if="isFocused" class="page-footer">
    <button
      type="button" class="nav-btn"
      :disabled="currentIndex <= 0"
      @click="emit('prev')"
    >← <span>{{ currentIndex > 0 ? steps[currentIndex - 1]?.label : '' }}</span></button>

    <button
      type="button" class="nav-btn"
      :disabled="currentIndex >= steps.length - 1"
      @click="emit('next')"
    ><span>{{ currentIndex < steps.length - 1 ? steps[currentIndex + 1]?.label : '' }}</span> →</button>
  </div>
</template>

<style scoped>
.page-footer { display: flex; align-items: center; justify-content: space-between; margin-top: 22px; }
.nav-btn {
  border: 1px solid #E3DCC9; background: #fff; border-radius: 8px; padding: 10px 16px;
  font-size: 13px; font-weight: 600; color: #1B2A4A; display: flex; align-items: center; gap: 8px;
  cursor: pointer; transition: all .2s; max-width: 260px;
}
.nav-btn span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.nav-btn:hover:not([disabled]) { border-color: #A8793B; color: #A8793B; }
.nav-btn[disabled] { opacity: .35; pointer-events: none; }
</style>
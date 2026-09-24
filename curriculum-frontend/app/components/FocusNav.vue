<!-- components/FocusNav.vue -->
<script setup lang="ts">
import type { FocusStep } from '~/composables/useFocusMode'

const props = defineProps<{
  isFocused: boolean
  currentIndex: number
  total: number
  steps: FocusStep[]
}>()
const emit = defineEmits<{ (e: 'show-all'): void; (e: 'prev'): void; (e: 'next'): void }>()
</script>

<template>
  <div v-if="isFocused" class="item-nav">
    <button type="button" class="back-to-all" @click="emit('show-all')">☰ ดูหัวข้อทั้งหมดในหน้านี้</button>
    <span class="item-progress">หัวข้อที่ {{ currentIndex + 1 }} / {{ total }}</span>
  </div>
</template>

<style scoped>
.item-nav { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; gap: 10px; }
.back-to-all {
  border: 1px solid #E3DCC9; background: #fff; color: #1B2A4A; border-radius: 8px; padding: 8px 14px;
  font-size: 12.8px; font-weight: 600; display: flex; align-items: center; gap: 6px; cursor: pointer;
}
.back-to-all:hover { border-color: #A8793B; color: #A8793B; }
.item-progress { font-size: 12px; color: #736F60; }
</style>
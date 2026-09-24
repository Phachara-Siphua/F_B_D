<script setup lang="ts">
import type { Subject } from '~/types/curriculum'

defineProps<{ subject: Subject }>()
defineEmits<{ remove: [] }>()
</script>

<template>
  <div
    class="subject-card rounded border text-xs p-2 cursor-grab active:cursor-grabbing select-none relative group"
    :class="subject.isHighlight
      ? 'bg-blue-600 border-blue-700 text-white'
      : 'bg-white border-gray-300 text-gray-800'"
  >
    <!-- Remove button -->
    <button
      class="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white hidden group-hover:flex items-center justify-center text-xs z-10"
      @click.stop="$emit('remove')"
    >
      ✕
    </button>

    <p class="font-mono font-semibold leading-tight">{{ subject.code }}</p>
    <p class="text-[10px] opacity-75 leading-tight">{{ subject.credits }}</p>
    <p class="mt-1 leading-tight font-medium line-clamp-2">{{ subject.nameEn }}</p>
  </div>
</template>
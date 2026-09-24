<script setup lang="ts">
import type { Subject } from '~/types/curriculum'

const emit = defineEmits<{
  select: [subject: Subject]
}>()

const isOpen = defineModel<boolean>('open')
const query = ref('')

// Your full subject pool
const allSubjects: Subject[] = [
  { id: '010313005', code: '010313005', nameTh: 'ฟิสิกส์ I', nameEn: 'Physics I', credits: '3(3-0-6)' },
  { id: '010313006', code: '010313006', nameTh: 'ปฏิบัติการฟิสิกส์ I', nameEn: 'Physics Laboratory I', credits: '1(0-2-1)' },
  { id: '030543300', code: '030543300', nameTh: 'วงจรไฟฟ้าและอิเล็กทรอนิกส์เบื้องต้น', nameEn: 'Electrical and Electronics Drawing', credits: '3(2-2-5)', isHighlight: true },
  { id: '030543920', code: '030543920', nameTh: 'การโปรแกรมคอมพิวเตอร์', nameEn: 'Computer Programing', credits: '3(2-2-5)', isHighlight: true },
  // add all subjects here...
]

const filtered = computed(() =>
  query.value.trim() === ''
    ? allSubjects
    : allSubjects.filter(s =>
        s.code.includes(query.value) ||
        s.nameEn.toLowerCase().includes(query.value.toLowerCase()) ||
        s.nameTh.includes(query.value)
      )
)

function select(subject: Subject) {
  emit('select', subject)
  isOpen.value = false
  query.value = ''
}
</script>

<template>
  <UModal v-model:open="isOpen" title="ค้นหารายวิชา" :ui="{ content: 'max-w-2xl' }">
    <template #body>
      <UInput
        v-model="query"
        placeholder="ค้นหารหัสวิชา หรือชื่อวิชา..."
        icon="i-heroicons-magnifying-glass"
        autofocus
        size="lg"
        class="mb-4"
      />

      <div class="max-h-96 overflow-y-auto space-y-2">
        <div
          v-for="subject in filtered"
          :key="subject.id"
          class="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-blue-950 hover:bg-blue-50 cursor-pointer transition-all"
          @click="select(subject)"
        >
          <div class="flex items-center gap-3">
            <UBadge
              :label="subject.code"
              :color="subject.isHighlight ? 'info' : 'neutral'"
              variant="subtle"
              size="sm"
            />
            <div>
              <p class="font-medium text-sm text-gray-900">{{ subject.nameEn }}</p>
              <p class="text-xs text-gray-500">{{ subject.nameTh }}</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <UBadge :label="subject.credits" color="neutral" variant="outline" size="sm" />
            <UIcon name="i-heroicons-plus-circle" class="text-blue-950 w-5 h-5" />
          </div>
        </div>

        <div v-if="filtered.length === 0" class="text-center py-8 text-gray-400">
          <UIcon name="i-heroicons-face-frown" class="w-10 h-10 mx-auto mb-2" />
          <p>ไม่พบรายวิชา</p>
        </div>
      </div>
    </template>
  </UModal>
</template>
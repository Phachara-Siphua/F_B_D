<script setup lang="ts">
import { VueDraggable } from 'vue-draggable-plus'
import type { Subject, Semester } from '~/types/curriculum'

const showSearch = ref(false)
const targetSemesterId = ref<string | null>(null)

const semesters = ref<Semester[]>([
  { id: 's1-1', year: 1, term: 1, subjects: [
    { id: '010313005', code: '010313005', nameEn: 'Physics I', nameTh: 'ฟิสิกส์ I', credits: '3(3-0-6)' },
    { id: '010313006', code: '010313006', nameEn: 'Physics Laboratory I', nameTh: 'ปฏิบัติการฟิสิกส์ I', credits: '1(0-2-1)' },
    { id: '040203111', code: '040203111', nameEn: 'Engineering Mathematics I', nameTh: 'คณิตศาสตร์วิศวกรรม I', credits: '3(3-0-6)' },
    { id: '030543300', code: '030543300', nameEn: 'Electrical and Electronics Drawing', nameTh: '', credits: '3(2-2-5)', isHighlight: true },
    { id: '080103001', code: '080103001', nameEn: 'English I', nameTh: 'ภาษาอังกฤษ I', credits: '3(3-0-6)' },
  ]},
  { id: 's1-2', year: 1, term: 2, subjects: [] },
  { id: 's2-1', year: 2, term: 1, subjects: [] },
  { id: 's2-2', year: 2, term: 2, subjects: [] },
  { id: 's3-1', year: 3, term: 1, subjects: [] },
  { id: 's3-2', year: 3, term: 2, subjects: [] },
  { id: 's4-1', year: 4, term: 1, subjects: [] },
  { id: 's4-2', year: 4, term: 2, subjects: [] },
])

function openSearch(semesterId: string) {
  targetSemesterId.value = semesterId
  showSearch.value = true
}

function onSubjectSelected(subject: Subject) {
  const sem = semesters.value.find(s => s.id === targetSemesterId.value)
  if (!sem) return
  // avoid duplicates
  if (sem.subjects.find(s => s.id === subject.id)) return
  sem.subjects.push({ ...subject })
}

function removeSubject(semesterId: string, subjectId: string) {
  const sem = semesters.value.find(s => s.id === semesterId)
  if (!sem) return
  sem.subjects = sem.subjects.filter(s => s.id !== subjectId)
}

function totalCredits(sem: Semester) {
  return sem.subjects.reduce((acc, s) => {
    const n = parseInt(s.credits.split('(')[0]) || 0
    return acc + n
  }, 0)
}
</script>

<template>
  <div class="overflow-x-auto pb-4">
    <!-- Title -->
    <div class="text-center mb-6">
      <h2 class="font-bold text-blue-950 text-base">แผนภูมิแสดงความต่อเนื่องของการศึกษาในหลักสูตร</h2>
      <p class="text-sm text-gray-500">ลากวางรายวิชาระหว่างภาคการศึกษา หรือกด + เพื่อเพิ่มรายวิชา</p>
    </div>

    <!-- Semesters grid -->
    <div class="flex gap-3 min-w-max px-2">
      <div
        v-for="sem in semesters"
        :key="sem.id"
        class="flex flex-col w-44"
      >
        <!-- Semester header -->
        <div class="bg-blue-950 text-white text-center text-xs font-bold py-2 px-1 rounded-t-lg">
          <p>ภาคการศึกษาที่ {{ sem.term }}</p>
          <p class="opacity-75">ปีที่ {{ sem.year }}</p>
        </div>

        <!-- Draggable subject list -->
        <VueDraggable
          v-model="sem.subjects"
          group="subjects"
          animation="200"
          ghost-class="opacity-30"
          class="flex-1 min-h-32 bg-gray-50 border border-t-0 border-gray-200 p-2 space-y-2"
        >
          <SubjectCard
            v-for="subject in sem.subjects"
            :key="subject.id"
            :subject="subject"
            @remove="removeSubject(sem.id, subject.id)"
          />
        </VueDraggable>

        <!-- Footer: credits + add button -->
        <div class="bg-gray-100 border border-t-0 border-gray-200 rounded-b-lg px-2 py-2 flex items-center justify-between">
          <span class="text-xs text-gray-500 font-mono">{{ totalCredits(sem) }} หน่วยกิต</span>
          <UButton
            icon="i-heroicons-plus"
            size="xs"
            color="neutral"
            variant="ghost"
            @click="openSearch(sem.id)"
          />
        </div>
      </div>
    </div>
  </div>

  <!-- Search modal -->
  <SubjectSearchModal
    v-model:open="showSearch"
    @select="onSubjectSelected"
  />
</template>
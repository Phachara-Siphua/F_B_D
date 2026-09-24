<!-- pages/appendix/d.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getSteps } from '~/constants/toc'
const route = useRoute()
const router = useRouter()

// ===== Focus mode =====
const { isFocused, currentIndex, currentStep, isVisible, focusAnchor, next: nextStep, prev: prevStep, showAll, steps } = useFocusMode(getSteps('app-d'))

const programId = ref<string | null>(null)

// รายชื่อหัวข้อในภาคผนวก ง.
const sectionTitles = [
  "ระเบียบมหาวิทยาลัยฯ ว่าด้วยการศึกษาระดับปริญญาบัณฑิต"
]

const doneState = ref<Record<number, boolean>>({})
const keyToAnchor = (i: number) => 'sec-app-d-' + (i + 1)
const toggleDone = (index: number) => { 
  doneState.value[index] = !doneState.value[index]
  if (import.meta.client) {
    localStorage.setItem(`done-${keyToAnchor(index)}`, doneState.value[index] ? '1' : '0')
    window.dispatchEvent(new Event('storage')) 
  }
}

// Mock สำหรับการอัปโหลดไฟล์
const fileInput = ref<HTMLInputElement | null>(null)
const uploadedFile = ref<File | null>(null)

const triggerUpload = () => { fileInput.value?.click() }
const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) { uploadedFile.value = target.files[0] }
}
const removeFile = () => {
  uploadedFile.value = null
  if (fileInput.value) fileInput.value.value = ''
}

onMounted(() => { 
  if (route.query.id) { programId.value = route.query.id as string } 
  if (!import.meta.client) return
  ;(Object.keys(sectionTitles) as unknown as number[]).forEach((i) => {
    doneState.value[i] = localStorage.getItem(`done-${keyToAnchor(i)}`) === '1'
  })
})

const isSavingDraft = ref(false); const isSavingNext = ref(false)
const saveDraft = async () => { isSavingDraft.value = true; await new Promise(r => setTimeout(r, 1000)); isSavingDraft.value = false; }
const saveAndNext = async () => { isSavingNext.value = true; await new Promise(r => setTimeout(r, 1000)); isSavingNext.value = false; router.push({ path: '/appendix/e', query: { id: programId.value } }) }
</script>

<template>
  <div class="page-shell">
    <form @submit.prevent class="w-full">
      <div class="crumb"><span>เล่มหลักสูตร</span> › <b>ภาคผนวก</b> › <b class="text-[#1B2A4A] font-semibold">ภาคผนวก ง.</b></div>
      <div class="doc-head"><div class="doc-eyebrow">ภาคผนวก ง.</div><h1 class="doc-title">ระเบียบมหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ ว่าด้วยการศึกษาระดับปริญญาบัณฑิต</h1></div>

      <div v-if="!isFocused" class="toc-card">
        <div class="toc-label">หัวข้อในหน้านี้ — คลิกเพื่อเลือกกรอกทีละหัวข้อ</div>
        <div class="grid grid-cols-1 gap-[4px_18px]">
          <div class="toc-item" :class="{ 'filled': doneState[0] }" @click="focusAnchor('sec-app-d-1')">
            <div class="toc-dot"></div><span class="toc-num">ง.1</span><span class="lbl">{{ sectionTitles[0] }}</span>
          </div>
        </div>
      </div>

      <FocusNav :is-focused="isFocused" :current-index="currentIndex" :total="steps.length" :steps="steps" @show-all="showAll" />

      <div class="paper-card">
        <section class="topic-sec" id="sec-app-d-1" v-show="isVisible('sec-app-d-1')">
          <div class="sec-head">
            <div class="sec-number text-[#1B2A4A]">ง.1</div>
            <div class="flex-1 flex flex-col md:flex-row md:justify-between md:items-start gap-2">
              <h2 class="sec-title pt-1">{{ sectionTitles[0] }}</h2>
              <button type="button" class="sec-check" :class="{ 'on': doneState[0] }" @click="toggleDone(0)">{{ doneState[0] ? '✓ กรอกแล้ว' : 'ทำเครื่องหมายว่ากรอกแล้ว' }}</button>
            </div>
          </div>
          <div class="sec-body mt-4">
            <!-- 🌟 Upload Box -->
            <input type="file" ref="fileInput" class="hidden" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" @change="handleFileUpload" />
            <div v-if="!uploadedFile" class="upload-box cursor-pointer hover:bg-[#F3EFE4] transition-colors" @click="triggerUpload">
              <b>ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์</b>รองรับ PDF, DOCX, JPG — ใช้สำหรับเอกสารแนบที่ไม่ต้องพิมพ์เนื้อหาในระบบ
            </div>
            <!-- แสดงเมื่อมีไฟล์อัปโหลดแล้ว -->
            <div v-else class="flex items-center justify-between p-4 bg-[#FDFBF4] border border-[#A8793B] rounded-[10px]">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg bg-[#EEE0C6] text-[#A8793B] flex items-center justify-center"><UIcon name="i-heroicons-document-text" class="w-6 h-6" /></div>
                <div>
                  <p class="font-semibold text-[#1B2A4A] m-0 text-[14px]">{{ uploadedFile.name }}</p>
                  <p class="text-[#736F60] text-[12px] m-0">{{ (uploadedFile.size / 1024 / 1024).toFixed(2) }} MB</p>
                </div>
              </div>
              <button type="button" class="text-[#9C4132] hover:bg-[#FBECE8] p-2 rounded-md transition-colors" @click="removeFile"><UIcon name="i-heroicons-trash" class="w-5 h-5 block" /></button>
            </div>
          </div>
        </section>
      </div>

      <FocusFooter :is-focused="isFocused" :current-index="currentIndex" :steps="steps" @prev="prevStep" @next="nextStep" />

      <div class="page-footer">
        <button type="button" @click="router.push(`/appendix/c?id=${programId || ''}`)" class="nav-btn">← <span>ภาคผนวก ค. คำสั่งแต่งตั้ง</span></button>
        <div class="flex flex-col md:flex-row gap-3">
          <button type="button" @click="saveDraft()" :disabled="isSavingDraft" class="nav-btn"><UIcon name="i-heroicons-document-text" class="w-4 h-4 mr-1" /> {{ isSavingDraft ? 'กำลังบันทึก...' : 'บันทึกฉบับร่าง' }}</button>
          <button type="button" @click="saveAndNext()" :disabled="isSavingNext" class="btn-brass force-white-btn" style="border:none;border-radius:8px;padding:10px 16px;font-size:13px;font-weight:600;display:flex;align-items:center;gap:8px;cursor:pointer;">
            <span style="color:#ffffff !important;">{{ isSavingNext ? 'กำลังบันทึก...' : 'ภาคผนวก จ. ผลงานวิชาการอาจารย์' }}</span> <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </form>
  </div>
</template>


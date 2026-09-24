<!-- pages/number5.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getSteps } from '~/constants/toc'
const route = useRoute()
const router = useRouter()

// ===== Focus mode =====
const { isFocused, currentIndex, currentStep, isVisible, focusAnchor, next: nextStep, prev: prevStep, showAll, steps } = useFocusMode(getSteps('5'))

const config = useRuntimeConfig()
const API_BASE = (config.public.apiBase as string) || 'http://localhost:8000'

const programId = ref<string | null>(null)

// รายชื่อหัวข้อในหมวดที่ 5
const sectionTitles = [
  "กฎระเบียบหรือหลักเกณฑ์ในการให้ระดับคะแนน",
  "การทวนสอบมาตรฐานผลการเรียนรู้ขณะนักศึกษายังไม่สำเร็จการศึกษา",
  "การทวนสอบมาตรฐานผลการเรียนรู้หลังจากนักศึกษาสำเร็จการศึกษา",
  "เกณฑ์การสำเร็จการศึกษาตามหลักสูตร"
]

// ================= State ข้อมูลฟอร์ม =================
const form = ref<any>({
  id: null,
  // 5.1 - 5.3
  grading_rules: '',
  achievement_verify_during: '',
  achievement_verify_after: '',
  // 5.4 เกณฑ์การสำเร็จการศึกษา (Dynamic List)
  s5_4: [
    'เป็นไปตามระเบียบมหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ ว่าด้วยการศึกษาระดับปริญญาบัณฑิต',
    'สอบผ่านและมีหน่วยกิตสะสมครบตามโครงสร้างหลักสูตร'
  ]
})

// ================= Load Data =================
const isLoading = ref(false)
const loadError = ref('')

async function loadData() {
  if (!programId.value) {
    alert('ไม่พบรหัสหลักสูตร กรุณาเริ่มจากหน้าแรก')
    router.push('/')
    return
  }

  isLoading.value = true
  try {
    // โหลดข้อมูล 5.1 - 5.3 (Singleton)
    try {
      const evaluation: any = await $fetch(`${API_BASE}/programs/${programId.value}/evaluation`)
      if (evaluation) {
        form.value.grading_rules = evaluation.grading_rules || ''
        form.value.achievement_verify_during = evaluation.achievement_verify_during || ''
        form.value.achievement_verify_after = evaluation.achievement_verify_after || ''
      }
    } catch (err: any) {
      if (err?.response?.status !== 404) console.error('Failed to load evaluation', err)
    }

    // โหลดข้อมูล 5.4 เกณฑ์การสำเร็จการศึกษา (List)
    try {
      const criteriaList: any = await $fetch(`${API_BASE}/programs/${programId.value}/graduation-criteria/`)
      if (criteriaList && criteriaList.length > 0) {
        form.value.s5_4 = criteriaList
          .sort((a: any, b: any) => a.sort_order - b.sort_order)
          .map((item: any) => item.criterion)
      }
    } catch (err) {
      console.error('Failed to load criteria', err)
    }

  } catch (err) {
    console.error('Error in loadData', err)
    loadError.value = 'โหลดข้อมูลไม่สำเร็จ'
  } finally {
    isLoading.value = false
  }
}

// ================= Helper Functions (List) =================
const addList = (key: string) => { form.value[key].push('') }
const removeList = (key: string, idx: number) => {
  form.value[key].splice(idx, 1)
  if (form.value[key].length === 0) form.value[key].push('')
}

const doneState = ref<Record<number, boolean>>({})
const keyToAnchor = (i: number) => 'sec-5-' + (i + 1)
const toggleDone = (index: number) => { 
  doneState.value[index] = !doneState.value[index]
  if (import.meta.client) {
    localStorage.setItem(`done-${keyToAnchor(index)}`, doneState.value[index] ? '1' : '0')
    window.dispatchEvent(new Event('storage')) 
  }
}

onMounted(() => { 
  if (route.query.id) { 
    programId.value = route.query.id as string
    form.value.id = route.query.id as string 
    loadData()
  } 
  if (!import.meta.client) return
  ;(Object.keys(sectionTitles) as unknown as number[]).forEach((i) => {
    doneState.value[i] = localStorage.getItem(`done-${keyToAnchor(i)}`) === '1'
  })
})

// ================= Save Data =================
const isSavingDraft = ref(false)
const isSavingNext = ref(false)
const saveError = ref('')
const saveSuccess = ref('')

async function replaceChildren(resource: string, items: any[]) {
  try {
    const existing: any[] = await $fetch(`${API_BASE}/programs/${programId.value}/${resource}/`)
    if (existing && existing.length > 0) {
      await Promise.all(
        existing.map(e => $fetch(`${API_BASE}/programs/${programId.value}/${resource}/${e.id}`, { method: 'DELETE' }))
      )
    }
  } catch (e) {}

  for (const item of items) {
    await $fetch(`${API_BASE}/programs/${programId.value}/${resource}/`, { method: 'POST', body: item })
  }
}

const saveAll = async () => {
  if (!programId.value) return

  // Save 5.1 - 5.3 (Singleton)
  await $fetch(`${API_BASE}/programs/${programId.value}/evaluation`, {
    method: 'PUT',
    body: {
      grading_rules: form.value.grading_rules || null,
      achievement_verify_during: form.value.achievement_verify_during || null,
      achievement_verify_after: form.value.achievement_verify_after || null
    }
  })

  // Save 5.4 (List)
  const criteriaPayload = form.value.s5_4
    .filter((c: string) => c.trim())
    .map((criterion: string, index: number) => ({
      criterion,
      sort_order: index
    }))
  
  await replaceChildren('graduation-criteria', criteriaPayload)
}

const saveDraft = async () => { 
  isSavingDraft.value = true
  saveError.value = ''
  saveSuccess.value = ''
  try {
    await saveAll()
    saveSuccess.value = 'บันทึกข้อมูลหมวด 5 เรียบร้อยแล้ว'
    setTimeout(() => { saveSuccess.value = '' }, 3000)
  } catch (err: any) {
    console.error('Save failed', err)
    saveError.value = err?.data?.detail || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล'
  } finally {
    isSavingDraft.value = false 
  }
}

const saveAndNext = async () => { 
  isSavingNext.value = true
  saveError.value = ''
  try {
    await saveAll()
    router.push({ path: '/number6', query: { id: programId.value } })
  } catch (err: any) {
    console.error('Save failed', err)
    saveError.value = err?.data?.detail || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล'
  } finally {
    isSavingNext.value = false 
  }
}

const scrollToSec = (id: string) => {
  const el = document.getElementById(id)
  if (el) { 
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    el.classList.add('pulse')
    setTimeout(() => el.classList.remove('pulse'), 1200) 
  }
}
</script>

<template>
  <div class="page-shell">
    <form @submit.prevent class="w-full relative">

      <div v-if="isLoading" class="absolute top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm flex items-center justify-center p-4 rounded-lg shadow-sm border border-gray-100">
        <div class="flex items-center gap-2 text-[var(--c-gold)] font-bold">
          <UIcon name="i-heroicons-arrow-path" class="w-5 h-5 animate-spin" /> กำลังดึงข้อมูล...
        </div>
      </div>
      
      <!-- Breadcrumb & Title -->
      <div class="crumb">
        <span>เล่มหลักสูตร</span> › <b class="text-[#1B2A4A] font-semibold">หมวดที่ 5</b>
        <span class="page-badge">หน้า 6 / 9</span>
      </div>
      <div class="doc-head">
        <div class="doc-eyebrow">หมวดที่ 5</div>
        <h1 class="doc-title">หลักเกณฑ์ในการประเมินผลนักศึกษา</h1>
      </div>

      <!-- TOC Card (ซ่อนตอนอยู่ใน Focus Mode) -->
      <div v-if="!isFocused" class="toc-card">
        <div class="toc-label">หัวข้อในหน้านี้ — คลิกเพื่อเลือกกรอกทีละหัวข้อ</div>
        <div class="grid grid-cols-1 gap-[4px_18px]">
          <div v-for="(title, i) in sectionTitles" :key="i" class="toc-item" :class="{ 'filled': doneState[i] }" @click="focusAnchor(`sec-5-${i+1}`)">
            <div class="toc-dot"></div>
            <span class="toc-num">5.{{ i + 1 }}</span>
            <span class="lbl">{{ title }}</span>
          </div>
        </div>
      </div>

      <!-- Focus Navigation -->
      <FocusNav :is-focused="isFocused" :current-index="currentIndex" :total="steps.length" :steps="steps" @show-all="showAll" />

      <!-- Main Paper Card -->
      <div class="paper-card">
        
        <!-- 5.1 กฎระเบียบฯ -->
        <section :id="`sec-5-1`" v-show="isVisible(`sec-5-1`)" class="topic-sec">
          <div class="sec-head">
            <div class="sec-number text-[#1B2A4A]">5.1</div>
            <div class="flex-1 flex flex-col md:flex-row md:justify-between md:items-start gap-2">
              <h2 class="sec-title pt-1">{{ sectionTitles[0] }}</h2>
              <button type="button" class="sec-check" :class="{ 'on': doneState[0] }" @click="toggleDone(0)">{{ doneState[0] ? '✓ กรอกแล้ว' : 'ทำเครื่องหมายว่ากรอกแล้ว' }}</button>
            </div>
          </div>
          <div class="sec-body mt-4">
            <div class="fs-grid full">
              <div class="fs-field">
                <textarea v-model="form.grading_rules" class="field" :placeholder="`ระบุข้อมูล ${sectionTitles[0]}...`"></textarea>
              </div>
            </div>
          </div>
        </section>

        <!-- 5.2 การทวนสอบขณะเรียน -->
        <section :id="`sec-5-2`" v-show="isVisible(`sec-5-2`)" class="topic-sec">
          <div class="sec-head">
            <div class="sec-number text-[#1B2A4A]">5.2</div>
            <div class="flex-1 flex flex-col md:flex-row md:justify-between md:items-start gap-2">
              <h2 class="sec-title pt-1">{{ sectionTitles[1] }}</h2>
              <button type="button" class="sec-check" :class="{ 'on': doneState[1] }" @click="toggleDone(1)">{{ doneState[1] ? '✓ กรอกแล้ว' : 'ทำเครื่องหมายว่ากรอกแล้ว' }}</button>
            </div>
          </div>
          <div class="sec-body mt-4">
            <div class="fs-grid full">
              <div class="fs-field">
                <textarea v-model="form.achievement_verify_during" class="field" :placeholder="`ระบุข้อมูล ${sectionTitles[1]}...`"></textarea>
              </div>
            </div>
          </div>
        </section>

        <!-- 5.3 การทวนสอบหลังจบ -->
        <section :id="`sec-5-3`" v-show="isVisible(`sec-5-3`)" class="topic-sec">
          <div class="sec-head">
            <div class="sec-number text-[#1B2A4A]">5.3</div>
            <div class="flex-1 flex flex-col md:flex-row md:justify-between md:items-start gap-2">
              <h2 class="sec-title pt-1">{{ sectionTitles[2] }}</h2>
              <button type="button" class="sec-check" :class="{ 'on': doneState[2] }" @click="toggleDone(2)">{{ doneState[2] ? '✓ กรอกแล้ว' : 'ทำเครื่องหมายว่ากรอกแล้ว' }}</button>
            </div>
          </div>
          <div class="sec-body mt-4">
            <div class="fs-grid full">
              <div class="fs-field">
                <textarea v-model="form.achievement_verify_after" class="field" :placeholder="`ระบุข้อมูล ${sectionTitles[2]}...`"></textarea>
              </div>
            </div>
          </div>
        </section>

        <!-- 5.4 เกณฑ์การสำเร็จการศึกษา (Dynamic List) -->
        <section :id="`sec-5-4`" v-show="isVisible(`sec-5-4`)" class="topic-sec">
          <div class="sec-head">
            <div class="sec-number text-[#1B2A4A]">5.4</div>
            <div class="flex-1 flex flex-col md:flex-row md:justify-between md:items-start gap-2">
              <h2 class="sec-title pt-1">{{ sectionTitles[3] }}</h2>
              <button type="button" class="sec-check" :class="{ 'on': doneState[3] }" @click="toggleDone(3)">{{ doneState[3] ? '✓ กรอกแล้ว' : 'ทำเครื่องหมายว่ากรอกแล้ว' }}</button>
            </div>
          </div>
          <div class="sec-body mt-4">
            <div class="list-editor">
              <div class="list-row" v-for="(item, idx) in form.s5_4" :key="idx">
                <div class="list-num">{{ idx + 1 }}</div>
                <input v-model="form.s5_4[idx]" type="text" placeholder="ระบุเกณฑ์การสำเร็จการศึกษา..." />
                <button type="button" class="row-del" @click="removeList('s5_4', idx)">✕</button>
              </div>
              <button type="button" class="add-row" @click="addList('s5_4')">+ เพิ่มเกณฑ์</button>
            </div>
          </div>
        </section>

      </div>

      <!-- Focus Footer -->
      <FocusFooter :is-focused="isFocused" :current-index="currentIndex" :steps="steps" @prev="prevStep" @next="nextStep" />

      <!-- Action Footer -->
      <div v-if="saveError" style="color:#9C4132; font-size:12.8px; margin-bottom:8px; text-align: right;">{{ saveError }}</div>
      <div v-if="saveSuccess" style="color:#2E7D32; font-size:12.8px; margin-bottom:8px; text-align: right;">{{ saveSuccess }}</div>

      <div class="page-footer">
        <button type="button" @click="router.push(`/number4?id=${programId || ''}`)" class="nav-btn">
          ← <span>ผลการเรียนรู้ กลยุทธ์การสอน</span>
        </button>
        <div class="flex flex-col md:flex-row gap-3">
          <button type="button" @click="saveDraft()" :disabled="isSavingDraft || isSavingNext" class="nav-btn">
            <UIcon name="i-heroicons-document-text" class="w-4 h-4 mr-1" /> {{ isSavingDraft ? 'กำลังบันทึก...' : 'บันทึกฉบับร่าง' }}
          </button>
          <button type="button" @click="saveAndNext()" :disabled="isSavingNext || isSavingDraft" class="btn-brass force-white-btn" style="border:none;border-radius:8px;padding:10px 16px;font-size:13px;font-weight:600;display:flex;align-items:center;gap:8px;cursor:pointer;">
            <span style="color:#ffffff !important;">{{ isSavingNext ? 'กำลังบันทึก...' : 'หมวดที่ 6 การพัฒนาอาจารย์' }}</span> <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

    </form>
  </div>
</template>
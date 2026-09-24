<!-- pages/number8.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getSteps } from '~/constants/toc'
const route = useRoute()
const router = useRouter()

// ===== Focus mode =====
const { isFocused, currentIndex, currentStep, isVisible, focusAnchor, next: nextStep, prev: prevStep, showAll, steps } = useFocusMode(getSteps('8'))

const config = useRuntimeConfig()
const API_BASE = (config.public.apiBase as string) || 'http://localhost:8000'

const programId = ref<string | null>(null)

// รายชื่อหัวข้อในหมวดที่ 8
const sectionTitles = [
  "การประเมินกลยุทธ์การสอน",
  "การประเมินทักษะของอาจารย์ในการใช้แผนกลยุทธ์การสอน",
  "การประเมินหลักสูตรในภาพรวม",
  "การประเมินผลการดำเนินงานตามรายละเอียดหลักสูตร",
  "การทบทวนผลการประเมินและวางแผนปรับปรุง"
]

// ================= State ข้อมูลฟอร์ม =================
const form = ref<any>({
  id: null,
  sections: Array(5).fill(''),
  s8_1: [
    'มีการประเมินการสอนทุกรายวิชาโดยนักศึกษา เพื่อพัฒนาการเรียนการสอน',
    'มีการประเมินจากการทดสอบย่อย การสังเกตพฤติกรรมนักศึกษา และการอภิปรายโต้ตอบในชั้นเรียน',
    'มีการทดสอบกลางภาคและปลายภาคเพื่อชี้วัดความเข้าใจของผู้เรียน'
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
    const data: any = await $fetch(`${API_BASE}/programs/${programId.value}/evaluation-process/`)
    
    if (data && data.length > 0) {
      form.value.s8_1 = []
      
      data.sort((a: any, b: any) => a.sort_order - b.sort_order).forEach((item: any) => {
        if (item.section_no === '8.1') {
          form.value.s8_1.push(item.content)
        } else {
          const idx = parseInt(item.section_no.split('.')[1]) - 1
          if (idx >= 1 && idx <= 4) {
            form.value.sections[idx] = item.content || ''
          }
        }
      })

      // ป้องกัน Array ว่างเปล่า
      if (form.value.s8_1.length === 0) form.value.s8_1.push('')
    }
  } catch (err: any) {
    if (err?.response?.status !== 404) {
      console.error('Failed to load evaluation processes', err)
      loadError.value = 'โหลดข้อมูลไม่สำเร็จ'
    }
  } finally {
    isLoading.value = false
  }
}

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

  const payload: any[] = []
  
  // จัดเรียง 8.1 (แบบรายการ)
  form.value.s8_1.filter((x: string) => x.trim()).forEach((content: string, idx: number) => {
    payload.push({ section_no: '8.1', content, sort_order: idx })
  })

  // จัดเรียง 8.2 - 8.5 (แบบ Textarea)
  for (let i = 1; i <= 4; i++) {
    const content = form.value.sections[i]
    if (content.trim()) {
      payload.push({ section_no: `8.${i + 1}`, content, sort_order: 0 })
    }
  }

  // ยิงบันทึกรวดเดียว
  await replaceChildren('evaluation-process', payload)
}

const saveDraft = async () => { 
  isSavingDraft.value = true
  saveError.value = ''
  saveSuccess.value = ''
  try {
    await saveAll()
    saveSuccess.value = 'บันทึกข้อมูลหมวด 8 เรียบร้อยแล้ว'
    setTimeout(() => { saveSuccess.value = '' }, 3000)
  } catch (err: any) {
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
    router.push({ path: '/appendix/a', query: { id: programId.value } })
  } catch (err: any) {
    saveError.value = err?.data?.detail || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล'
  } finally {
    isSavingNext.value = false 
  }
}

// ================= Helper Functions =================
const addList = (key: string) => { form.value[key].push('') }
const removeList = (key: string, idx: number) => {
  form.value[key].splice(idx, 1)
  if (form.value[key].length === 0) form.value[key].push('')
}

const doneState = ref<Record<number, boolean>>({})
const keyToAnchor = (i: number) => 'sec-8-' + (i + 1)
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
</script>

<template>
  <div class="page-shell">
    <form @submit.prevent class="w-full relative">

      <div v-if="isLoading" class="absolute top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm flex items-center justify-center p-4 rounded-lg shadow-sm border border-gray-100">
        <div class="flex items-center gap-2 text-[var(--c-gold)] font-bold">
          <UIcon name="i-heroicons-arrow-path" class="w-5 h-5 animate-spin" /> กำลังดึงข้อมูล...
        </div>
      </div>

      <div class="crumb"><span>เล่มหลักสูตร</span> › <b class="text-[#1B2A4A] font-semibold">หมวดที่ 8</b><span class="page-badge">หน้า 9 / 9</span></div>
      <div class="doc-head"><div class="doc-eyebrow">หมวดที่ 8</div><h1 class="doc-title">การประเมินและปรับปรุงการดำเนินการของหลักสูตร</h1></div>

      <div v-if="!isFocused" class="toc-card">
        <div class="toc-label">หัวข้อในหน้านี้ — คลิกเพื่อเลือกกรอกทีละหัวข้อ</div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-[4px_18px]">
          <div v-for="(title, i) in sectionTitles" :key="i" class="toc-item" :class="{ 'filled': doneState[i] }" @click="focusAnchor(`sec-8-${i+1}`)">
            <div class="toc-dot"></div><span class="toc-num">8.{{ i + 1 }}</span><span class="lbl">{{ title }}</span>
          </div>
        </div>
      </div>

      <FocusNav :is-focused="isFocused" :current-index="currentIndex" :total="steps.length" :steps="steps" @show-all="showAll" />

      <div class="paper-card">
        <section v-for="(title, i) in sectionTitles" :key="i" :id="`sec-8-${i+1}`" v-show="isVisible(`sec-8-${i+1}`)" class="topic-sec">
          <div class="sec-head">
            <div class="sec-number">8.{{ i + 1 }}</div>
            <div class="flex-1 flex flex-col md:flex-row md:justify-between md:items-start gap-2">
              <h2 class="sec-title pt-1">{{ title }}</h2>
              <button type="button" class="sec-check" :class="{ 'on': doneState[i] }" @click="toggleDone(i)">{{ doneState[i] ? '✓ กรอกแล้ว' : 'ทำเครื่องหมายว่ากรอกแล้ว' }}</button>
            </div>
          </div>
          <div class="sec-body">
            <template v-if="i === 0">
              <div class="list-editor">
                <div class="list-row" v-for="(item, idx) in form.s8_1" :key="idx">
                  <div class="list-num">{{ idx + 1 }}</div>
                  <input v-model="form.s8_1[idx]" type="text" placeholder="ระบุการประเมินกลยุทธ์การสอน..." />
                  <button type="button" class="row-del" @click="removeList('s8_1', idx)">✕</button>
                </div>
                <button type="button" class="add-row" @click="addList('s8_1')">+ เพิ่มรายการ</button>
              </div>
            </template>
            <template v-else>
              <div class="fs-grid full"><div class="fs-field"><textarea v-model="form.sections[i]" class="field" :placeholder="`ระบุข้อมูล ${title}...`"></textarea></div></div>
            </template>
          </div>
        </section>
      </div>

      <FocusFooter :is-focused="isFocused" :current-index="currentIndex" :steps="steps" @prev="prevStep" @next="nextStep" />

      <!-- Action Footer -->
      <div v-if="saveError" style="color:#9C4132; font-size:12.8px; margin-bottom:8px; text-align: right;">{{ saveError }}</div>
      <div v-if="saveSuccess" style="color:#2E7D32; font-size:12.8px; margin-bottom:8px; text-align: right;">{{ saveSuccess }}</div>

      <div class="page-footer">
        <button type="button" @click="router.push(`/number7?id=${programId || ''}`)" class="nav-btn">← <span>การประกันคุณภาพหลักสูตร</span></button>
        <div class="flex flex-col md:flex-row gap-3">
          <button type="button" @click="saveDraft()" :disabled="isSavingDraft || isSavingNext" class="nav-btn"><UIcon name="i-heroicons-document-text" class="w-4 h-4 mr-1" /> {{ isSavingDraft ? 'กำลังบันทึก...' : 'บันทึกฉบับร่าง' }}</button>
          <button type="button" @click="saveAndNext()" :disabled="isSavingNext || isSavingDraft" class="btn-brass force-white-btn" style="border:none;border-radius:8px;padding:10px 16px;font-size:13px;font-weight:600;display:flex;align-items:center;gap:8px;cursor:pointer;">
            <span style="color:#ffffff !important;">{{ isSavingNext ? 'กำลังบันทึก...' : 'ภาคผนวก ก. แผนภูมิความต่อเนื่องฯ' }}</span> <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </form>
  </div>
</template>
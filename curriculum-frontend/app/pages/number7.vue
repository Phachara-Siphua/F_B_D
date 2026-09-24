<!-- pages/number7.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getSteps } from '~/constants/toc'
const route = useRoute()
const router = useRouter()

// ===== Focus mode =====
const { isFocused, currentIndex, currentStep, isVisible, focusAnchor, next: nextStep, prev: prevStep, showAll, steps } = useFocusMode(getSteps('7'))

const config = useRuntimeConfig()
const API_BASE = (config.public.apiBase as string) || 'http://localhost:8000'

const programId = ref<string | null>(null)

// รายชื่อหัวข้อในหมวดที่ 7
const sectionTitles = [
  "การกำกับมาตรฐาน", "บัณฑิต", "นักศึกษา", "อาจารย์",
  "หลักสูตร การเรียนการสอน การประเมินผู้เรียน", "สิ่งสนับสนุนการเรียนรู้",
  "ตัวบ่งชี้ผลการดำเนินงาน (Key Performance Indicators)"
]

// ================= State ข้อมูลฟอร์ม =================
const form = ref<any>({
  id: null,
  sections: Array(6).fill(''),
  s7_7: [
    { indicator: '1. อาจารย์ประจำหลักสูตรอย่างน้อยร้อยละ 80 มีส่วนร่วมในการประชุมเพื่อวางแผน ติดตาม และทบทวนการดำเนินงานหลักสูตร', y1: '✓', y2: '✓', y3: '✓', y4: '✓', y5: '✓' },
    { indicator: '2. มีรายละเอียดของหลักสูตรตามแบบ มคอ.2 ที่สอดคล้องกับกรอบมาตรฐานคุณวุฒิแห่งชาติ', y1: '✓', y2: '✓', y3: '✓', y4: '✓', y5: '✓' },
    { indicator: '3. มีรายละเอียดของรายวิชาและประสบการณ์ภาคสนาม (OBE 3 / OBE 4) ครบทุกรายวิชาก่อนเปิดสอน', y1: '✓', y2: '✓', y3: '✓', y4: '✓', y5: '✓' },
    { indicator: '4. จัดทำรายงานผลการดำเนินการของรายวิชาและประสบการณ์ภาคสนาม (OBE 5 / OBE 6) ภายใน 30 วัน', y1: '✓', y2: '✓', y3: '✓', y4: '✓', y5: '✓' },
    { indicator: '5. จัดทำรายงานผลการดำเนินการของหลักสูตร (OBE 7) ภายใน 60 วันหลังสิ้นปีการศึกษา', y1: '✓', y2: '✓', y3: '✓', y4: '✓', y5: '✓' }
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
    // โหลด 7.1 - 7.6 (Quality Sections)
    try {
      const qSections: any = await $fetch(`${API_BASE}/programs/${programId.value}/quality-sections/`)
      if (qSections && qSections.length > 0) {
        qSections.forEach((sec: any) => {
          const idx = parseInt(sec.section_no.split('.')[1]) - 1
          if (idx >= 0 && idx <= 5) {
            form.value.sections[idx] = sec.content || ''
          }
        })
      }
    } catch (err: any) {
      if (err?.response?.status !== 404) console.error('Failed to load quality sections', err)
    }

    // โหลด 7.7 (Quality KPIs)
    try {
      const kpis: any = await $fetch(`${API_BASE}/programs/${programId.value}/quality-kpis/`)
      if (kpis && kpis.length > 0) {
        form.value.s7_7 = kpis.map((k: any) => ({
          indicator: k.kpi_name || '',
          y1: k.y1 ? '✓' : '',
          y2: k.y2 ? '✓' : '',
          y3: k.y3 ? '✓' : '',
          y4: k.y4 ? '✓' : '',
          y5: k.y5 ? '✓' : ''
        }))
      }
    } catch (err: any) {
      if (err?.response?.status !== 404) console.error('Failed to load KPIs', err)
    }

  } catch (err) {
    console.error('Error in loadData', err)
    loadError.value = 'โหลดข้อมูลไม่สำเร็จ'
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

  // 1. บันทึก 7.1 - 7.6
  const sectionsPayload: any[] = []
  form.value.sections.forEach((content: string, idx: number) => {
    if (content.trim()) {
      sectionsPayload.push({
        section_no: `7.${idx + 1}`,
        title: sectionTitles[idx],
        content: content,
        sort_order: idx
      })
    }
  })
  await replaceChildren('quality-sections', sectionsPayload)

  // 2. บันทึก 7.7 (KPIs)
  const kpiPayload = form.value.s7_7
    .filter((k: any) => k.indicator.trim())
    .map((k: any) => ({
      kpi_name: k.indicator,
      description: '', // ถ้าอยากเพิ่มคำอธิบายในอนาคต
      y1: !!k.y1,
      y2: !!k.y2,
      y3: !!k.y3,
      y4: !!k.y4,
      y5: !!k.y5
    }))
  await replaceChildren('quality-kpis', kpiPayload)
}

const saveDraft = async () => { 
  isSavingDraft.value = true
  saveError.value = ''
  saveSuccess.value = ''
  try {
    await saveAll()
    saveSuccess.value = 'บันทึกข้อมูลหมวด 7 เรียบร้อยแล้ว'
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
    router.push({ path: '/number8', query: { id: programId.value } })
  } catch (err: any) {
    saveError.value = err?.data?.detail || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล'
  } finally {
    isSavingNext.value = false 
  }
}

// ================= Helper Functions =================
const addTable = (key: string, emptyObj: any) => { form.value[key].push({...emptyObj}) }
const removeTable = (key: string, idx: number, emptyObj: any) => {
  form.value[key].splice(idx, 1)
  if (form.value[key].length === 0) form.value[key].push({...emptyObj})
}

const doneState = ref<Record<number, boolean>>({})
const keyToAnchor = (i: number) => 'sec-7-' + (i + 1)
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

      <div class="crumb"><span>เล่มหลักสูตร</span> › <b class="text-[#1B2A4A] font-semibold">หมวดที่ 7</b><span class="page-badge">หน้า 8 / 9</span></div>
      <div class="doc-head"><div class="doc-eyebrow">หมวดที่ 7</div><h1 class="doc-title">การประกันคุณภาพหลักสูตร</h1></div>

      <div v-if="!isFocused" class="toc-card">
        <div class="toc-label">หัวข้อในหน้านี้ — คลิกเพื่อเลือกกรอกทีละหัวข้อ</div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-[4px_18px]">
          <div v-for="(title, i) in sectionTitles" :key="i" class="toc-item" :class="{ 'filled': doneState[i] }" @click="focusAnchor(`sec-7-${i+1}`)">
            <div class="toc-dot"></div><span class="toc-num">7.{{ i + 1 }}</span><span class="lbl">{{ title }}</span>
          </div>
        </div>
      </div>

      <FocusNav :is-focused="isFocused" :current-index="currentIndex" :total="steps.length" :steps="steps" @show-all="showAll" />

      <div class="paper-card">
        <section v-for="(title, i) in sectionTitles" :key="i" :id="`sec-7-${i+1}`" v-show="isVisible(`sec-7-${i+1}`)" class="topic-sec">
          <div class="sec-head">
            <div class="sec-number">7.{{ i + 1 }}</div>
            <div class="flex-1 flex flex-col md:flex-row md:justify-between md:items-start gap-2">
              <h2 class="sec-title pt-1">{{ title }}</h2>
              <button type="button" class="sec-check" :class="{ 'on': doneState[i] }" @click="toggleDone(i)">{{ doneState[i] ? '✓ กรอกแล้ว' : 'ทำเครื่องหมายว่ากรอกแล้ว' }}</button>
            </div>
          </div>
          <div class="sec-body">
            <template v-if="i === 6">
              <div class="overflow-x-auto">
                <table class="builder" style="min-width: 800px;">
                  <thead>
                    <tr>
                      <th style="min-width: 300px;">ตัวบ่งชี้ผลการดำเนินงาน</th>
                      <th style="width: 70px;" class="text-center">ปีที่ 1</th><th style="width: 70px;" class="text-center">ปีที่ 2</th>
                      <th style="width: 70px;" class="text-center">ปีที่ 3</th><th style="width: 70px;" class="text-center">ปีที่ 4</th>
                      <th style="width: 70px;" class="text-center">ปีที่ 5</th><th style="width: 40px;"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, idx) in form.s7_7" :key="idx">
                      <td><input v-model="row.indicator" type="text" placeholder="ระบุตัวบ่งชี้..."></td>
                      <td class="text-center">
                        <button type="button" class="w-full h-[38px] text-[16px] font-bold text-green-700 bg-transparent hover:bg-gray-100 transition-colors" @click="row.y1 = row.y1 === '✓' ? '' : '✓'">{{ row.y1 }}</button>
                      </td>
                      <td class="text-center">
                        <button type="button" class="w-full h-[38px] text-[16px] font-bold text-green-700 bg-transparent hover:bg-gray-100 transition-colors" @click="row.y2 = row.y2 === '✓' ? '' : '✓'">{{ row.y2 }}</button>
                      </td>
                      <td class="text-center">
                        <button type="button" class="w-full h-[38px] text-[16px] font-bold text-green-700 bg-transparent hover:bg-gray-100 transition-colors" @click="row.y3 = row.y3 === '✓' ? '' : '✓'">{{ row.y3 }}</button>
                      </td>
                      <td class="text-center">
                        <button type="button" class="w-full h-[38px] text-[16px] font-bold text-green-700 bg-transparent hover:bg-gray-100 transition-colors" @click="row.y4 = row.y4 === '✓' ? '' : '✓'">{{ row.y4 }}</button>
                      </td>
                      <td class="text-center">
                        <button type="button" class="w-full h-[38px] text-[16px] font-bold text-green-700 bg-transparent hover:bg-gray-100 transition-colors" @click="row.y5 = row.y5 === '✓' ? '' : '✓'">{{ row.y5 }}</button>
                      </td>
                      <td><button type="button" class="table-del" @click="removeTable('s7_7', idx, {indicator:'', y1:'', y2:'', y3:'', y4:'', y5:''})">✕</button></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <button type="button" class="add-row mt-2" @click="addTable('s7_7', {indicator:'', y1:'', y2:'', y3:'', y4:'', y5:''})">+ เพิ่มตัวบ่งชี้</button>
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
        <button type="button" @click="router.push(`/number6?id=${programId || ''}`)" class="nav-btn">← <span>การพัฒนาอาจารย์</span></button>
        <div class="flex flex-col md:flex-row gap-3">
          <button type="button" @click="saveDraft()" :disabled="isSavingDraft || isSavingNext" class="nav-btn"><UIcon name="i-heroicons-document-text" class="w-4 h-4 mr-1" /> {{ isSavingDraft ? 'กำลังบันทึก...' : 'บันทึกฉบับร่าง' }}</button>
          <button type="button" @click="saveAndNext()" :disabled="isSavingNext || isSavingDraft" class="btn-brass force-white-btn" style="border:none;border-radius:8px;padding:10px 16px;font-size:13px;font-weight:600;display:flex;align-items:center;gap:8px;cursor:pointer;">
            <span style="color:#ffffff !important;">{{ isSavingNext ? 'กำลังบันทึก...' : 'หมวดที่ 8 การประเมินฯ' }}</span> <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </form>
  </div>
</template>
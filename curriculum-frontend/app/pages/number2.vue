<!-- pages/number2.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getSteps } from '~/constants/toc'
const route = useRoute()
const router = useRouter()

// ===== Focus mode (แสดงทีละหัวข้อ/กลุ่มหัวข้อ ตามที่คลิกจาก Sidebar) =====
// หมวด 2 ถูกกำหนดใน constants/toc.ts ให้ 2.1-2.4 รวมเป็นการ์ดเดียวกัน (stepSizes: [4,1,1,1,1,1])
const { isFocused, currentIndex, currentStep, isVisible, focusAnchor, next: nextStep, prev: prevStep, showAll, steps } = useFocusMode(getSteps('2'))

const config = useRuntimeConfig()
const API_BASE = (config.public.apiBase as string) || 'http://localhost:8000'

// 🌟 ตัวแปรเก็บ ID หลักสูตรแยกต่างหาก เพื่อป้องกันความสับสน
const programId = ref<string | null>(null)

// ================= State ข้อมูลฟอร์มหน้า 2 =================
const form = ref({ 
  id: null as string | number | null,
  philosophy: '', 
  importance: '', 
  // 2.3 วัตถุประสงค์ของหลักสูตร
  objectives: [{ code: '', desc: '' }], 
  // 2.4 จุดเด่นเฉพาะของหลักสูตร
  uniquenessList: [''],
  // 2.5 - 2.8 ความคาดหวังของผลลัพธ์การเรียนรู้เมื่อสิ้นปีการศึกษา (YLO) แยกตามแขนง
  yloTelecom: [{ year: '', desc: '' }],
  yloComputer: [{ year: '', desc: '' }],
  yloInstrument: [{ year: '', desc: '' }],
  yloBroadcast: [{ year: '', desc: '' }],
  // 2.9 แผนพัฒนาปรับปรุง
  devPlans: [{ plan: '', strategy: '', indicator: '' }]
})

// ================= Load existing program =================
const isLoading = ref(false)
const loadError = ref('')

function safeParse(json: string | null | undefined, fallback: any) {
  if (!json) return fallback
  try {
    const parsed = JSON.parse(json)
    return Array.isArray(parsed) && parsed.length ? parsed : fallback
  } catch {
    return fallback
  }
}

async function loadProgram(id: string | number) {
  isLoading.value = true
  loadError.value = ''
  try {
    const data: any = await $fetch(`${API_BASE}/programs/${id}`)

    form.value.id = data.id
    form.value.philosophy = data.philosophy ?? ''
    form.value.importance = data.importance ?? ''

    form.value.objectives = safeParse(data.objectives, [{ code: '', desc: '' }])
    form.value.uniquenessList = safeParse(data.uniqueness, [''])

    try {
      const elo: any = await $fetch(`${API_BASE}/programs/${id}/elo-framework`)
      const parsed = elo?.framework ? JSON.parse(elo.framework) : {}
      form.value.yloTelecom = parsed.telecom?.length ? parsed.telecom : [{ year: '', desc: '' }]
      form.value.yloComputer = parsed.computer?.length ? parsed.computer : [{ year: '', desc: '' }]
      form.value.yloInstrument = parsed.instrument?.length ? parsed.instrument : [{ year: '', desc: '' }]
      form.value.yloBroadcast = parsed.broadcast?.length ? parsed.broadcast : [{ year: '', desc: '' }]
    } catch (err: any) {
      if (err?.response?.status !== 404) console.error('Failed to load ELO framework', err)
    }

    try {
      const devPlans: any = await $fetch(`${API_BASE}/programs/${id}/development-plans/`)
      if (devPlans && devPlans.length > 0) {
        form.value.devPlans = devPlans.sort((a: any, b: any) => a.sort_order - b.sort_order).map((p: any) => ({
          plan: p.plan ?? '', strategy: p.strategy ?? '', indicator: p.indicator ?? ''
        }))
      }
    } catch (err: any) {
      if (err?.response?.status !== 404) console.error('Failed to load development plans', err)
    }
  } catch (err: any) {
    console.error('Failed to load program', err)
    const status = err?.response?.status ?? err?.statusCode
    if (status === 404) {
      alert('ไม่พบข้อมูลหลักสูตรนี้ กำลังพากลับไปหน้าแรก')
      router.replace({ path: '/' })
    } else {
      loadError.value = 'โหลดข้อมูลไม่สำเร็จ กรุณาลองใหม่'
    }
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  if (route.query.id) {
    programId.value = route.query.id as string
    form.value.id = route.query.id as string
    loadProgram(form.value.id)
  } else {
    alert('ไม่พบรหัสหลักสูตร กรุณาเริ่มทำจากหน้าแรก')
    router.push('/')
  }
})

// ================= AI Integration =================
const handleAIGenerate = (section: string, payload?: any) => {
  console.log('Trigger AI Generation for:', section, payload)
  alert(`กำลังเรียกใช้ AI สำหรับหมวด: ${section}\n(รอ Backend เชื่อมต่อ API)`)
}

// ================= List & Table Actions =================
const addObjective = () => form.value.objectives.push({ code: '', desc: '' })
const removeObjective = (i: number) => { form.value.objectives.splice(i, 1); if(form.value.objectives.length === 0) form.value.objectives.push({ code: '', desc: '' }) }

const addUniqueness = () => form.value.uniquenessList.push('')
const removeUniqueness = (i: number) => { form.value.uniquenessList.splice(i, 1); if(form.value.uniquenessList.length === 0) form.value.uniquenessList.push('') }

const addYlo = (branch: 'Telecom' | 'Computer' | 'Instrument' | 'Broadcast') => form.value[`ylo${branch}`].push({ year: '', desc: '' })
const removeYlo = (branch: 'Telecom' | 'Computer' | 'Instrument' | 'Broadcast', i: number) => { 
    form.value[`ylo${branch}`].splice(i, 1); 
    if(form.value[`ylo${branch}`].length === 0) form.value[`ylo${branch}`].push({ year: '', desc: '' }) 
}

const addDevPlan = () => form.value.devPlans.push({ plan: '', strategy: '', indicator: '' })
const removeDevPlan = (i: number) => { form.value.devPlans.splice(i, 1); if(form.value.devPlans.length === 0) form.value.devPlans.push({ plan: '', strategy: '', indicator: '' }) }

// ================= Save helpers =================
async function replaceChildren(pid: string | number, resource: string, items: any[]) {
  try {
    const existing: any[] = await $fetch(`${API_BASE}/programs/${pid}/${resource}/`)
    if (existing && existing.length > 0) {
      await Promise.all(
        existing.map(e => $fetch(`${API_BASE}/programs/${pid}/${resource}/${e.id}`, { method: 'DELETE' }))
      )
    }
  } catch (err) {}

  for (const item of items) {
    await $fetch(`${API_BASE}/programs/${pid}/${resource}/`, { method: 'POST', body: item })
  }
}

async function saveAll() {
  const id = programId.value
  if (!id) throw new Error('ต้องกรอกหน้า 1 และบันทึกก่อน จึงจะมี program id')

  // บันทึกข้อมูล Singleton ในตาราง Program หลัก
  await $fetch(`${API_BASE}/programs/${id}`, {
    method: 'PUT',
    body: {
      philosophy: form.value.philosophy || null,
      importance: form.value.importance || null,
      objectives: JSON.stringify(form.value.objectives.filter(o => o.code.trim() || o.desc.trim())),
      uniqueness: JSON.stringify(form.value.uniquenessList.filter(u => u.trim()))
    }
  })

  // บันทึก YLO Framework เป็น JSON Singleton
  await $fetch(`${API_BASE}/programs/${id}/elo-framework`, {
    method: 'PUT',
    body: {
      framework: JSON.stringify({
        telecom: form.value.yloTelecom.filter(y => y.year.trim() || y.desc.trim()),
        computer: form.value.yloComputer.filter(y => y.year.trim() || y.desc.trim()),
        instrument: form.value.yloInstrument.filter(y => y.year.trim() || y.desc.trim()),
        broadcast: form.value.yloBroadcast.filter(y => y.year.trim() || y.desc.trim())
      })
    }
  })

  // บันทึกแผนพัฒนาปรับปรุง (List)
  await replaceChildren(
    id, 'development-plans',
    form.value.devPlans
      .filter(p => p.plan.trim() || p.strategy.trim() || p.indicator.trim())
      .map((p, i) => ({ plan: p.plan || null, strategy: p.strategy || null, indicator: p.indicator || null, sort_order: i }))
  )
}

// ================= ระบบบันทึกข้อมูล =================
const isSavingDraft = ref(false)
const isSavingNext = ref(false)
const saveError = ref('')
const saveSuccess = ref('')

const saveDraft = async () => {
  isSavingDraft.value = true
  saveError.value = ''
  saveSuccess.value = ''
  try {
    await saveAll()
    saveSuccess.value = 'บันทึกข้อมูลหมวด 2 เรียบร้อยแล้ว'
    setTimeout(() => { saveSuccess.value = '' }, 3000)
  } catch (err: any) {
    console.error('Save draft failed', err)
    saveError.value = err?.data?.detail || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่'
  } finally {
    isSavingDraft.value = false
  }
}

const saveAndNext = async () => {
  isSavingNext.value = true
  saveError.value = ''
  try {
    await saveAll()
    router.push({ path: '/number3', query: { id: programId.value } })
  } catch (err: any) {
    console.error('Save and next failed', err)
    saveError.value = err?.data?.detail || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่'
  } finally {
    isSavingNext.value = false
  }
}

// ================= Sidebar Progress State =================
const doneState = ref({
  s2_1: false, s2_2: false, s2_3: false, s2_4: false, s2_5: false, s2_6: false, s2_7: false, s2_8: false, s2_9: false
})
const keyToAnchor = (key: string) => 'sec-2-' + key.replace('s2_', '')
const toggleDone = (key: keyof typeof doneState.value) => {
  doneState.value[key] = !doneState.value[key]
  if (import.meta.client) {
    localStorage.setItem(`done-${keyToAnchor(key)}`, doneState.value[key] ? '1' : '0')
    window.dispatchEvent(new Event('storage')) 
  }
}
onMounted(() => {
  if (!import.meta.client) return
  ;(Object.keys(doneState.value) as (keyof typeof doneState.value)[]).forEach(key => {
    doneState.value[key] = localStorage.getItem(`done-${keyToAnchor(key)}`) === '1'
  })
})
</script>

<template>
  <div class="page-shell">
    <form @submit.prevent class="w-full relative">
      
      <!-- 🌟 แจ้งเตือนสถานะเมื่อโหลดหรือ Error -->
      <div v-if="isLoading" class="absolute top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm flex items-center justify-center p-4 rounded-lg shadow-sm border border-gray-100">
        <div class="flex items-center gap-2 text-[var(--c-gold)] font-bold">
          <UIcon name="i-heroicons-arrow-path" class="w-5 h-5 animate-spin" /> กำลังดึงข้อมูล...
        </div>
      </div>

      <!-- Breadcrumb & Title -->
      <div class="crumb">
        <span>เล่มหลักสูตร</span> › <b>หมวดที่ 2</b>
        <span class="page-badge">หน้า 3 / 9</span>
      </div>
      <div class="doc-head">
        <div class="doc-eyebrow">หมวดที่ 2</div>
        <h1 class="doc-title">ข้อมูลเฉพาะของหลักสูตร</h1>
      </div>

      <!-- TOC Card (ซ่อนตอนอยู่ใน Focus Mode) -->
      <div v-if="!isFocused" class="toc-card">
        <div class="toc-label">หัวข้อในหน้านี้ — คลิกเพื่อเลือกกรอกทีละหัวข้อ</div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-[4px_18px]">
          <div class="toc-item" :class="{ 'filled': doneState.s2_1 }" @click="focusAnchor('sec-2-1')"><div class="toc-dot"></div><span class="toc-num">2.1</span><span class="lbl">ปรัชญาของหลักสูตร</span></div>
          <div class="toc-item" :class="{ 'filled': doneState.s2_2 }" @click="focusAnchor('sec-2-2')"><div class="toc-dot"></div><span class="toc-num">2.2</span><span class="lbl text-[#A8793B] font-medium"><UIcon name="i-heroicons-sparkles" class="w-3 h-3 mr-1"/>ความสำคัญของหลักสูตร</span></div>
          <div class="toc-item" :class="{ 'filled': doneState.s2_3 }" @click="focusAnchor('sec-2-3')"><div class="toc-dot"></div><span class="toc-num">2.3</span><span class="lbl text-[#A8793B] font-medium"><UIcon name="i-heroicons-sparkles" class="w-3 h-3 mr-1"/>วัตถุประสงค์ของหลักสูตร</span></div>
          <div class="toc-item" :class="{ 'filled': doneState.s2_4 }" @click="focusAnchor('sec-2-4')"><div class="toc-dot"></div><span class="toc-num">2.4</span><span class="lbl text-[#A8793B] font-medium"><UIcon name="i-heroicons-sparkles" class="w-3 h-3 mr-1"/>จุดเด่นเฉพาะของหลักสูตร</span></div>
          <div class="toc-item" :class="{ 'filled': doneState.s2_5 }" @click="focusAnchor('sec-2-5')"><div class="toc-dot"></div><span class="toc-num">2.5</span><span class="lbl text-[#A8793B] font-medium"><UIcon name="i-heroicons-sparkles" class="w-3 h-3 mr-1"/>ความคาดหวังผลลัพธ์ (YLO) - โทรคมนาคม</span></div>
          <div class="toc-item" :class="{ 'filled': doneState.s2_6 }" @click="focusAnchor('sec-2-6')"><div class="toc-dot"></div><span class="toc-num">2.6</span><span class="lbl text-[#A8793B] font-medium"><UIcon name="i-heroicons-sparkles" class="w-3 h-3 mr-1"/>ความคาดหวังผลลัพธ์ (YLO) - คอมพิวเตอร์</span></div>
          <div class="toc-item" :class="{ 'filled': doneState.s2_7 }" @click="focusAnchor('sec-2-7')"><div class="toc-dot"></div><span class="toc-num">2.7</span><span class="lbl text-[#A8793B] font-medium"><UIcon name="i-heroicons-sparkles" class="w-3 h-3 mr-1"/>ความคาดหวังผลลัพธ์ (YLO) - วัดและควบคุม</span></div>
          <div class="toc-item" :class="{ 'filled': doneState.s2_8 }" @click="focusAnchor('sec-2-8')"><div class="toc-dot"></div><span class="toc-num">2.8</span><span class="lbl text-[#A8793B] font-medium"><UIcon name="i-heroicons-sparkles" class="w-3 h-3 mr-1"/>ความคาดหวังผลลัพธ์ (YLO) - กระจายเสียงฯ</span></div>
          <div class="toc-item" :class="{ 'filled': doneState.s2_9 }" @click="focusAnchor('sec-2-9')"><div class="toc-dot"></div><span class="toc-num">2.9</span><span class="lbl text-[#A8793B] font-medium"><UIcon name="i-heroicons-sparkles" class="w-3 h-3 mr-1"/>แผนพัฒนาปรับปรุง</span></div>
        </div>
      </div>

      <!-- แถบกลับไปดูทั้งหมด / ตัวนับ (โชว์เฉพาะตอนโฟกัส) -->
      <FocusNav :is-focused="isFocused" :current-index="currentIndex" :total="steps.length" :steps="steps" @show-all="showAll" />

      <!-- Main Paper Card -->
      <div class="paper-card">
        
        <!-- ================= กลุ่ม 2.1 - 2.4 ================= -->
        <!-- 2.1 ปรัชญา -->
        <section class="topic-sec" id="sec-2-1" v-show="isVisible('sec-2-1')">
          <div class="sec-head">
            <div class="sec-number">2.1</div><h2 class="sec-title">ปรัชญาของหลักสูตร</h2>
            <button type="button" class="sec-check" :class="{ 'on': doneState.s2_1 }" @click="toggleDone('s2_1')">{{ doneState.s2_1 ? '✓ กรอกแล้ว' : 'ทำเครื่องหมายว่ากรอกแล้ว' }}</button>
          </div>
          <div class="sec-body">
            <div class="fs-grid full">
              <div class="fs-field"><textarea v-model="form.philosophy" class="field" placeholder="ระบุปรัชญา..."></textarea></div>
            </div>
          </div>
        </section>

        <!-- 2.2 ความสำคัญ -->
        <section class="topic-sec border-l-4 border-l-[#A8793B] pl-[20px] -ml-[24px] bg-[#FDFBF4]" id="sec-2-2" v-show="isVisible('sec-2-2')">
          <div class="sec-head">
            <div class="sec-number">2.2</div>
            <div class="flex-1 flex flex-col md:flex-row md:justify-between md:items-start gap-2">
              <div class="flex items-center gap-2">
                <h2 class="sec-title pt-1">ความสำคัญของหลักสูตร</h2>
                <span class="text-[10.5px] text-[#A8793B] bg-[#EEE0C6] px-[8px] py-[2px] rounded-full font-bold flex items-center gap-1"><UIcon name="i-heroicons-sparkles" class="w-3 h-3"/> AI Assisted</span>
              </div>
              <button type="button" class="sec-check" :class="{ 'on': doneState.s2_2 }" @click="toggleDone('s2_2')">{{ doneState.s2_2 ? '✓ กรอกแล้ว' : 'ทำเครื่องหมายว่ากรอกแล้ว' }}</button>
            </div>
          </div>
          <div class="sec-body md:pl-[56px] mt-4 md:mt-0">
            <div class="fs-grid full">
              <div class="fs-field">
                  <textarea v-model="form.importance" class="field" placeholder="ระบุความสำคัญ..."></textarea>
                  <button type="button" @click="handleAIGenerate('importance')" class="ai-btn"><UIcon name="i-heroicons-sparkles" class="w-4 h-4"/> AI ช่วยเขียนความสำคัญ</button>
              </div>
            </div>
          </div>
        </section>

        <!-- 2.3 วัตถุประสงค์ -->
        <section class="topic-sec border-l-4 border-l-[#A8793B] pl-[20px] -ml-[24px] bg-[#FDFBF4]" id="sec-2-3" v-show="isVisible('sec-2-3')">
          <div class="sec-head">
            <div class="sec-number">2.3</div>
            <div class="flex-1 flex flex-col md:flex-row md:justify-between md:items-start gap-2">
              <div class="flex items-center gap-2">
                <h2 class="sec-title pt-1">วัตถุประสงค์ของหลักสูตร</h2>
                <span class="text-[10.5px] text-[#A8793B] bg-[#EEE0C6] px-[8px] py-[2px] rounded-full font-bold flex items-center gap-1"><UIcon name="i-heroicons-sparkles" class="w-3 h-3"/> AI Assisted</span>
              </div>
              <button type="button" class="sec-check" :class="{ 'on': doneState.s2_3 }" @click="toggleDone('s2_3')">{{ doneState.s2_3 ? '✓ กรอกแล้ว' : 'ทำเครื่องหมายว่ากรอกแล้ว' }}</button>
            </div>
          </div>
          <div class="sec-body md:pl-[56px] mt-4 md:mt-0">
              <div class="slist-item" v-for="(obj, i) in form.objectives" :key="i">
                  <div class="slist-num">{{ i + 1 }}</div>
                  <div class="slist-fields fs-grid">
                      <div class="fs-field" style="grid-column: span 1;"><label>ข้อที่</label><input v-model="obj.code" type="text"></div>
                      <div class="fs-field full" style="grid-column: 1 / -1;"><label>รายละเอียด</label><textarea v-model="obj.desc" class="field" style="min-height:60px"></textarea></div>
                  </div>
                  <button type="button" class="slist-del" @click="removeObjective(i)">✕</button>
              </div>
              <button type="button" class="add-row" @click="addObjective()">+ เพิ่มรายการ</button>
              <button type="button" class="ai-btn ml-2" @click="handleAIGenerate('objectives')"><UIcon name="i-heroicons-sparkles" class="w-4 h-4"/> AI ช่วยร่างวัตถุประสงค์</button>
          </div>
        </section>

        <!-- 2.4 จุดเด่น -->
        <section class="topic-sec border-l-4 border-l-[#A8793B] pl-[20px] -ml-[24px] bg-[#FDFBF4]" id="sec-2-4" v-show="isVisible('sec-2-4')">
          <div class="sec-head">
            <div class="sec-number">2.4</div>
            <div class="flex-1 flex flex-col md:flex-row md:justify-between md:items-start gap-2">
              <div class="flex items-center gap-2">
                <h2 class="sec-title pt-1">จุดเด่นเฉพาะของหลักสูตร</h2>
                <span class="text-[10.5px] text-[#A8793B] bg-[#EEE0C6] px-[8px] py-[2px] rounded-full font-bold flex items-center gap-1"><UIcon name="i-heroicons-sparkles" class="w-3 h-3"/> AI Assisted</span>
              </div>
              <button type="button" class="sec-check" :class="{ 'on': doneState.s2_4 }" @click="toggleDone('s2_4')">{{ doneState.s2_4 ? '✓ กรอกแล้ว' : 'ทำเครื่องหมายว่ากรอกแล้ว' }}</button>
            </div>
          </div>
          <div class="sec-body md:pl-[56px] mt-4 md:mt-0">
            <div class="list-editor">
              <div class="list-row" v-for="(item, i) in form.uniquenessList" :key="i">
                <div class="list-num">{{ i + 1 }}</div>
                <input v-model="form.uniquenessList[i]" type="text" placeholder="ระบุจุดเด่น..." />
                <button type="button" class="row-del" @click="removeUniqueness(i)">✕</button>
              </div>
              <button type="button" class="add-row" @click="addUniqueness()">+ เพิ่มรายการ</button>
              <button type="button" class="ai-btn ml-2" @click="handleAIGenerate('uniqueness')"><UIcon name="i-heroicons-sparkles" class="w-4 h-4"/> AI ช่วยคิดจุดเด่น</button>
            </div>
          </div>
        </section>

        <!-- ================= กลุ่มที่แยกเดี่ยว (2.5 - 2.9) ================= -->
        <!-- 2.5 YLO โทรคมนาคม -->
        <section class="topic-sec border-l-4 border-l-[#A8793B] pl-[20px] -ml-[24px] bg-[#FDFBF4]" id="sec-2-5" v-show="isVisible('sec-2-5')">
          <div class="sec-head">
            <div class="sec-number">2.5</div>
            <div class="flex-1 flex flex-col md:flex-row md:justify-between md:items-start gap-2">
              <div class="flex items-center gap-2">
                <h2 class="sec-title pt-1">ความคาดหวังของผลลัพธ์การเรียนรู้ (YLO) — โทรคมนาคม</h2>
                <span class="text-[10.5px] text-[#A8793B] bg-[#EEE0C6] px-[8px] py-[2px] rounded-full font-bold flex items-center gap-1"><UIcon name="i-heroicons-sparkles" class="w-3 h-3"/> AI Assisted</span>
              </div>
              <button type="button" class="sec-check" :class="{ 'on': doneState.s2_5 }" @click="toggleDone('s2_5')">{{ doneState.s2_5 ? '✓ กรอกแล้ว' : 'ทำเครื่องหมายว่ากรอกแล้ว' }}</button>
            </div>
          </div>
          <div class="sec-body md:pl-[56px] mt-4 md:mt-0">
              <table class="builder bg-white">
                  <thead><tr><th style="width:120px">ชั้นปี</th><th>ความคาดหวังของผลลัพธ์การเรียนรู้</th><th style="width:40px"></th></tr></thead>
                  <tbody>
                      <tr v-for="(ylo, i) in form.yloTelecom" :key="i">
                          <td><input v-model="ylo.year" type="text" placeholder="ชั้นปีที่..."></td>
                          <td><input v-model="ylo.desc" type="text" placeholder="ผลลัพธ์การเรียนรู้..."></td>
                          <td><button type="button" class="table-del" @click="removeYlo('Telecom', i)">✕</button></td>
                      </tr>
                  </tbody>
              </table>
              <button type="button" class="add-row" @click="addYlo('Telecom')">+ เพิ่มชั้นปี</button>
              <button type="button" class="ai-btn ml-2" @click="handleAIGenerate('ylo_telecom')"><UIcon name="i-heroicons-sparkles" class="w-4 h-4"/> AI ช่วยสร้าง YLO</button>
          </div>
        </section>

        <!-- 2.6 YLO คอมพิวเตอร์ -->
        <section class="topic-sec border-l-4 border-l-[#A8793B] pl-[20px] -ml-[24px] bg-[#FDFBF4]" id="sec-2-6" v-show="isVisible('sec-2-6')">
          <div class="sec-head">
            <div class="sec-number">2.6</div>
            <div class="flex-1 flex flex-col md:flex-row md:justify-between md:items-start gap-2">
              <div class="flex items-center gap-2">
                <h2 class="sec-title pt-1">ความคาดหวังของผลลัพธ์การเรียนรู้ (YLO) — คอมพิวเตอร์</h2>
                <span class="text-[10.5px] text-[#A8793B] bg-[#EEE0C6] px-[8px] py-[2px] rounded-full font-bold flex items-center gap-1"><UIcon name="i-heroicons-sparkles" class="w-3 h-3"/> AI Assisted</span>
              </div>
              <button type="button" class="sec-check" :class="{ 'on': doneState.s2_6 }" @click="toggleDone('s2_6')">{{ doneState.s2_6 ? '✓ กรอกแล้ว' : 'ทำเครื่องหมายว่ากรอกแล้ว' }}</button>
            </div>
          </div>
          <div class="sec-body md:pl-[56px] mt-4 md:mt-0">
               <table class="builder bg-white">
                  <thead><tr><th style="width:120px">ชั้นปี</th><th>ความคาดหวังของผลลัพธ์การเรียนรู้</th><th style="width:40px"></th></tr></thead>
                  <tbody>
                      <tr v-for="(ylo, i) in form.yloComputer" :key="i">
                          <td><input v-model="ylo.year" type="text" placeholder="ชั้นปีที่..."></td>
                          <td><input v-model="ylo.desc" type="text" placeholder="ผลลัพธ์การเรียนรู้..."></td>
                          <td><button type="button" class="table-del" @click="removeYlo('Computer', i)">✕</button></td>
                      </tr>
                  </tbody>
              </table>
              <button type="button" class="add-row" @click="addYlo('Computer')">+ เพิ่มชั้นปี</button>
              <button type="button" class="ai-btn ml-2" @click="handleAIGenerate('ylo_computer')"><UIcon name="i-heroicons-sparkles" class="w-4 h-4"/> AI ช่วยสร้าง YLO</button>
          </div>
        </section>
        
        <!-- 2.7 YLO เครื่องมือวัดและควบคุม -->
        <section class="topic-sec border-l-4 border-l-[#A8793B] pl-[20px] -ml-[24px] bg-[#FDFBF4]" id="sec-2-7" v-show="isVisible('sec-2-7')">
          <div class="sec-head">
            <div class="sec-number">2.7</div>
            <div class="flex-1 flex flex-col md:flex-row md:justify-between md:items-start gap-2">
              <div class="flex items-center gap-2">
                <h2 class="sec-title pt-1">ความคาดหวังของผลลัพธ์การเรียนรู้ (YLO) — เครื่องมือวัดและควบคุม</h2>
                <span class="text-[10.5px] text-[#A8793B] bg-[#EEE0C6] px-[8px] py-[2px] rounded-full font-bold flex items-center gap-1"><UIcon name="i-heroicons-sparkles" class="w-3 h-3"/> AI Assisted</span>
              </div>
              <button type="button" class="sec-check" :class="{ 'on': doneState.s2_7 }" @click="toggleDone('s2_7')">{{ doneState.s2_7 ? '✓ กรอกแล้ว' : 'ทำเครื่องหมายว่ากรอกแล้ว' }}</button>
            </div>
          </div>
          <div class="sec-body md:pl-[56px] mt-4 md:mt-0">
               <table class="builder bg-white">
                  <thead><tr><th style="width:120px">ชั้นปี</th><th>ความคาดหวังของผลลัพธ์การเรียนรู้</th><th style="width:40px"></th></tr></thead>
                  <tbody>
                      <tr v-for="(ylo, i) in form.yloInstrument" :key="i">
                          <td><input v-model="ylo.year" type="text" placeholder="ชั้นปีที่..."></td>
                          <td><input v-model="ylo.desc" type="text" placeholder="ผลลัพธ์การเรียนรู้..."></td>
                          <td><button type="button" class="table-del" @click="removeYlo('Instrument', i)">✕</button></td>
                      </tr>
                  </tbody>
              </table>
              <button type="button" class="add-row" @click="addYlo('Instrument')">+ เพิ่มชั้นปี</button>
              <button type="button" class="ai-btn ml-2" @click="handleAIGenerate('ylo_instrument')"><UIcon name="i-heroicons-sparkles" class="w-4 h-4"/> AI ช่วยสร้าง YLO</button>
          </div>
        </section>

        <!-- 2.8 YLO กระจายเสียงฯ -->
        <section class="topic-sec border-l-4 border-l-[#A8793B] pl-[20px] -ml-[24px] bg-[#FDFBF4]" id="sec-2-8" v-show="isVisible('sec-2-8')">
          <div class="sec-head">
            <div class="sec-number">2.8</div>
            <div class="flex-1 flex flex-col md:flex-row md:justify-between md:items-start gap-2">
              <div class="flex items-center gap-2">
                <h2 class="sec-title pt-1">ความคาดหวังของผลลัพธ์การเรียนรู้ (YLO) — กระจายเสียงวิทยุและโทรทัศน์</h2>
                <span class="text-[10.5px] text-[#A8793B] bg-[#EEE0C6] px-[8px] py-[2px] rounded-full font-bold flex items-center gap-1"><UIcon name="i-heroicons-sparkles" class="w-3 h-3"/> AI Assisted</span>
              </div>
              <button type="button" class="sec-check" :class="{ 'on': doneState.s2_8 }" @click="toggleDone('s2_8')">{{ doneState.s2_8 ? '✓ กรอกแล้ว' : 'ทำเครื่องหมายว่ากรอกแล้ว' }}</button>
            </div>
          </div>
          <div class="sec-body md:pl-[56px] mt-4 md:mt-0">
               <table class="builder bg-white">
                  <thead><tr><th style="width:120px">ชั้นปี</th><th>ความคาดหวังของผลลัพธ์การเรียนรู้</th><th style="width:40px"></th></tr></thead>
                  <tbody>
                      <tr v-for="(ylo, i) in form.yloBroadcast" :key="i">
                          <td><input v-model="ylo.year" type="text" placeholder="ชั้นปีที่..."></td>
                          <td><input v-model="ylo.desc" type="text" placeholder="ผลลัพธ์การเรียนรู้..."></td>
                          <td><button type="button" class="table-del" @click="removeYlo('Broadcast', i)">✕</button></td>
                      </tr>
                  </tbody>
              </table>
              <button type="button" class="add-row" @click="addYlo('Broadcast')">+ เพิ่มชั้นปี</button>
              <button type="button" class="ai-btn ml-2" @click="handleAIGenerate('ylo_broadcast')"><UIcon name="i-heroicons-sparkles" class="w-4 h-4"/> AI ช่วยสร้าง YLO</button>
          </div>
        </section>

        <!-- 2.9 แผนพัฒนาปรับปรุง -->
        <section class="topic-sec border-l-4 border-l-[#A8793B] pl-[20px] -ml-[24px] bg-[#FDFBF4]" id="sec-2-9" v-show="isVisible('sec-2-9')">
          <div class="sec-head">
            <div class="sec-number">2.9</div>
            <div class="flex-1 flex flex-col md:flex-row md:justify-between md:items-start gap-2">
              <div class="flex items-center gap-2">
                <h2 class="sec-title pt-1">แผนพัฒนาปรับปรุง</h2>
                <span class="text-[10.5px] text-[#A8793B] bg-[#EEE0C6] px-[8px] py-[2px] rounded-full font-bold flex items-center gap-1"><UIcon name="i-heroicons-sparkles" class="w-3 h-3"/> AI Assisted</span>
              </div>
              <button type="button" class="sec-check" :class="{ 'on': doneState.s2_9 }" @click="toggleDone('s2_9')">{{ doneState.s2_9 ? '✓ กรอกแล้ว' : 'ทำเครื่องหมายว่ากรอกแล้ว' }}</button>
            </div>
          </div>
          <div class="sec-body md:pl-[56px] mt-4 md:mt-0">
               <table class="builder bg-white">
                  <thead><tr><th>แผนการพัฒนา/เปลี่ยนแปลง</th><th>กลยุทธ์</th><th>หลักฐาน/ตัวบ่งชี้</th><th style="width:40px"></th></tr></thead>
                  <tbody>
                      <tr v-for="(plan, i) in form.devPlans" :key="i">
                          <td><input v-model="plan.plan" type="text"></td>
                          <td><input v-model="plan.strategy" type="text"></td>
                          <td><input v-model="plan.indicator" type="text"></td>
                          <td><button type="button" class="table-del" @click="removeDevPlan(i)">✕</button></td>
                      </tr>
                  </tbody>
              </table>
              <button type="button" class="add-row" @click="addDevPlan()">+ เพิ่มแถว</button>
              <button type="button" class="ai-btn ml-2" @click="handleAIGenerate('dev_plan')"><UIcon name="i-heroicons-sparkles" class="w-4 h-4"/> AI ช่วยร่างแผนพัฒนา</button>
          </div>
        </section>

      </div>

      <!-- ปุ่มก่อนหน้า/ถัดไป ระหว่างหัวข้อย่อยภายในหมวดนี้ (โชว์เฉพาะตอนโฟกัส) -->
      <FocusFooter :is-focused="isFocused" :current-index="currentIndex" :steps="steps" @prev="prevStep" @next="nextStep" />

      <!-- Action Footer -->
      <div v-if="saveError" style="color:#9C4132; font-size:12.8px; margin-bottom:8px; text-align: right;">{{ saveError }}</div>
      <div v-if="saveSuccess" style="color:#2E7D32; font-size:12.8px; margin-bottom:8px; text-align: right;">{{ saveSuccess }}</div>

      <div class="page-footer">
        <button type="button" @click="router.push(`/number1?id=${programId || ''}`)" class="nav-btn">
          ← <span>ข้อมูลทั่วไป</span>
        </button>
        <div class="flex flex-col md:flex-row gap-3">
          <button type="button" @click="saveDraft()" :disabled="isSavingDraft || isSavingNext" class="nav-btn">
            <UIcon name="i-heroicons-document-text" class="w-4 h-4 mr-1" /> {{ isSavingDraft ? 'กำลังบันทึก...' : 'บันทึกฉบับร่าง' }}
          </button>
          <button type="button" @click="saveAndNext()" :disabled="isSavingNext || isSavingDraft" class="btn-brass force-white-btn" style="border:none;border-radius:8px;padding:10px 16px;font-size:13px;font-weight:600;display:flex;align-items:center;gap:8px;cursor:pointer;">
            <span style="color:#ffffff !important;">{{ isSavingNext ? 'กำลังบันทึก...' : 'ระบบการจัดการศึกษา' }}</span> <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

    </form>
  </div>
</template>
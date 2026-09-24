<!-- pages/number3.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getSteps } from '~/constants/toc'
const route = useRoute()
const router = useRouter()

const { isFocused, currentIndex, currentStep, isVisible, focusAnchor, next: nextStep, prev: prevStep, showAll, steps } = useFocusMode(getSteps('3'))

const config = useRuntimeConfig()
const API_BASE = (config.public.apiBase as string) || 'http://localhost:8000'

const programId = ref<string | null>(null)

// รายชื่อหัวข้อทั้ง 43 หัวข้อ
const sectionTitles = [
  "ระบบการจัดการศึกษา", "การจัดการศึกษาภาคฤดูร้อน", "การเทียบเคียงหน่วยกิตในระบบทวิภาค", "วัน-เวลาในการดำเนินการเรียนการสอน", "คุณสมบัติของผู้เข้าศึกษา",
  "ปัญหาของนักศึกษาแรกเข้า", "กลยุทธ์ในการดำเนินการเพื่อแก้ไขปัญหาของนักศึกษาแรกเข้า", "แผนการรับนักศึกษาและผู้สำเร็จการศึกษาในระยะ 5 ปี", "งบประมาณรายรับ", "งบประมาณรายจ่าย",
  "ระบบการศึกษา", "การเทียบโอนหน่วยกิต รายวิชาและการลงทะเบียนเรียนข้ามมหาวิทยาลัย", "โครงสร้างหลักสูตร", "รายวิชา — หมวดวิชาศึกษาทั่วไป ก. กลุ่มวิชาภาษา", "รายวิชา — หมวดวิชาศึกษาทั่วไป ข. กลุ่มวิชาบูรณาการ",
  "รายวิชา — หมวดวิชาศึกษาทั่วไป ค. กลุ่มวิชาสังคมศาสตร์และมนุษยศาสตร์", "รายวิชา — หมวดวิชาศึกษาทั่วไป ง. กลุ่มวิชาวิทยาศาสตร์และคณิตศาสตร์", "รายวิชา — หมวดวิชาศึกษาทั่วไป จ. กลุ่มวิชากีฬาและนันทนาการ", "รายวิชา — หมวดวิชาเฉพาะ ก. กลุ่มวิชาแกน", "รายวิชา — กลุ่มวิชาชีพ (บังคับเฉพาะแขนง) แขนงวิชาโทรคมนาคม",
  "รายวิชา — กลุ่มวิชาชีพ (บังคับเฉพาะแขนง) แขนงวิชาคอมพิวเตอร์", "รายวิชา — กลุ่มวิชาชีพ (บังคับเฉพาะแขนง) แขนงวิชาเครื่องมือวัดและควบคุม", "รายวิชา — กลุ่มวิชาชีพ (บังคับเฉพาะแขนง) แขนงวิชาการกระจายเสียงวิทยุและโทรทัศน์", "รายวิชา — กลุ่มวิชาชีพ (เลือกเฉพาะแขนง) ทั้ง 4 แขนงวิชา", "รายวิชา — ค. ประสบการณ์ภาคสนามและวิชาชีพ / ง. กลุ่มวิชาฝึกงาน",
  "รายวิชา — หมวดวิชาเลือกเสรี", "แผนการศึกษา — แขนงวิชาโทรคมนาคม", "แผนการศึกษา — แขนงวิชาคอมพิวเตอร์", "แผนการศึกษา — แขนงวิชาเครื่องมือวัดและควบคุม", "แผนการศึกษา — แขนงวิชาการกระจายเสียงวิทยุและโทรทัศน์",
  "คำอธิบายรายวิชา", "อาจารย์ผู้สอน", "องค์ประกอบเกี่ยวกับประสบการณ์ภาคสนาม", "มาตรฐานผลการเรียนรู้ของประสบการณ์ภาคสนาม", "ช่วงเวลา (ประสบการณ์ภาคสนาม)",
  "การจัดเวลาและตารางสอน (ประสบการณ์ภาคสนาม)", "ข้อกำหนดเกี่ยวกับการทำโครงงานหรืองานวิจัย", "คำอธิบายโดยย่อ (โครงงานหรืองานวิจัย)", "มาตรฐานผลการเรียนรู้ (โครงงานหรืองานวิจัย)", "ช่วงเวลา (โครงงานหรืองานวิจัย)",
  "จำนวนหน่วยกิต (โครงงานหรืองานวิจัย)", "การเตรียมการ (โครงงานหรืองานวิจัย)", "กระบวนการประเมินผล (โครงงานหรืองานวิจัย)"
]

// ================= State ข้อมูลฟอร์ม =================
const form = ref<any>({
  id: null,
  sections: Array(43).fill(''),
  s3_4: { sem1: '', sem2: '', summer: '' },
  s3_5: [''], s3_6: [''], s3_7: [''], s3_34: [''], s3_35: [''], s3_36: [''],
  s3_8: [{ year: 'ชั้นปีที่ 1', y65: '120', y66: '120', y67: '120', y68: '120', y69: '120' }],
  s3_9: [{ detail: 'งบประมาณรายได้', y65: '4,032,000', y66: '4,112,640', y67: '4,194,893', y68: '4,278,790', y69: '4,364,367' }],
  s3_10: [{ category: 'ก. งบดำเนินการ', y65: '', y66: '', y67: '', y68: '', y69: '' }],
  s3_13: [{ group: '1) หมวดวิชาศึกษาทั่วไป', credits: '30' }],
  subjects: Array(12).fill(null).map(() => [{ code: '', credit: '', nameTh: '', nameEn: '', note: '' }]),
  s3_27: [{ sem: 'ปีที่ 1 / ภาค 1', code: '', name: '', credit: '' }],
  s3_28: [{ sem: 'ปีที่ 1 / ภาค 1', code: '', name: '', credit: '' }],
  s3_29: [{ sem: 'ปีที่ 1 / ภาค 1', code: '', name: '', credit: '' }],
  s3_30: [{ sem: 'ปีที่ 1 / ภาค 1', code: '', name: '', credit: '' }],
  s3_31: [{ code: '', credit: '', nameTh: '', nameEn: '', prereq: '', descTh: '', descEn: '' }],
  s3_32: [{ name: '', position: '', degree: '', research: '', loadNow: '', loadNew: '' }]
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
    try {
      const topics: any = await $fetch(`${API_BASE}/programs/${programId.value}/learning-topics/`)
      if (topics && topics.length > 0) {
        topics.forEach((t: any) => {
          // 🌟 1. ดักไว้ก่อนเลยว่า ถ้าไม่ใช่หมวด 3 ให้ข้ามไปเลย! ป้องกันการดึง 4.12 มาใส่
          if (!t.topic_no || !t.topic_no.startsWith('3.')) return;

          const idx = parseInt(t.topic_no.split('.')[1]) - 1
          if (idx >= 0 && idx < 43) {
            if (t.content && t.content.startsWith('[')) {
              try {
                const parsed = JSON.parse(t.content)
                if (idx === 3) {
                  form.value.s3_4 = parsed[0] || { sem1: '', sem2: '', summer: '' }
                } else if ([4, 5, 6, 33, 34, 35].includes(idx)) {
                  form.value[`s3_${idx+1}`] = parsed
                } else if ([7, 8, 9, 12, 26, 27, 28, 29, 30, 31].includes(idx)) {
                  form.value[`s3_${idx+1}`] = parsed
                } else if (idx >= 13 && idx <= 24) {
                  form.value.subjects[idx - 13] = parsed
                }
              } catch (e) {
                form.value.sections[idx] = t.content
              }
            } else {
              form.value.sections[idx] = t.content || ''
            }
          }
        })
      }
    } catch (err: any) {
      if (err?.response?.status !== 404) console.error('Failed to load learning topics', err)
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

async function replaceLearningTopics() {
  const topicsPayload: any[] = []
  
  for (let i = 0; i < 43; i++) {
    const topicNo = `3.${i + 1}`
    let content = ''

    if (i === 3) {
      content = JSON.stringify([form.value.s3_4])
    } else if ([4, 5, 6, 33, 34, 35].includes(i)) {
      content = JSON.stringify(form.value[`s3_${i+1}`].filter((v: string) => v.trim()))
    } else if ([7, 8, 9, 12, 26, 27, 28, 29, 30, 31].includes(i)) {
      content = JSON.stringify(form.value[`s3_${i+1}`])
    } else if (i >= 13 && i <= 24) {
      content = JSON.stringify(form.value.subjects[i - 13])
    } else {
      content = form.value.sections[i]
    }

    if (content.trim() && content !== '[]') {
      topicsPayload.push({
        topic_no: topicNo,
        title: sectionTitles[i],
        content: content,
        sort_order: i
      })
    }
  }

  try {
    const existing: any[] = await $fetch(`${API_BASE}/programs/${programId.value}/learning-topics/`)
    if (existing && existing.length > 0) {
      // 🌟 จุดที่ต้องแก้: กรอง (filter) ลบเฉพาะข้อที่ขึ้นต้นด้วย "3." เพื่อไม่ให้กระทบ 4.12
      const topicsToDelete = existing.filter((e: any) => e.topic_no && e.topic_no.startsWith('3.'))
      
      await Promise.all(
        topicsToDelete.map((e: any) => $fetch(`${API_BASE}/programs/${programId.value}/learning-topics/${e.id}`, { method: 'DELETE' }))
      )
    }
  } catch (e) {}

  for (const item of topicsPayload) {
    await $fetch(`${API_BASE}/programs/${programId.value}/learning-topics/`, { method: 'POST', body: item })
  }
}

const saveAll = async () => {
  if (!programId.value) return
  await replaceLearningTopics()
}

const saveDraft = async () => { 
  isSavingDraft.value = true
  saveError.value = ''
  saveSuccess.value = ''
  try {
    await saveAll()
    saveSuccess.value = 'บันทึกข้อมูลหมวด 3 เรียบร้อยแล้ว'
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
    router.push({ path: '/number4', query: { id: programId.value } })
  } catch (err: any) {
    console.error('Save failed', err)
    saveError.value = err?.data?.detail || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล'
  } finally {
    isSavingNext.value = false 
  }
}

// ================= AI Integration =================
const handleAIGenerate = (section: string, payload?: any) => {
  console.log('Trigger AI Generation for:', section, payload)
  alert(`กำลังเรียกใช้ AI สำหรับหมวด: ${section}\nข้อมูลอ้างอิง: ${payload || 'ไม่มี'}\n(รอ Backend เชื่อมต่อ API)`)
}

// ================= Helper Functions =================
const addList = (key: string) => { form.value[key].push('') }
const removeList = (key: string, idx: number) => { form.value[key].splice(idx, 1); if (form.value[key].length === 0) form.value[key].push('') }

const addTable = (key: string, emptyObj: any) => { form.value[key].push({...emptyObj}) }
const removeTable = (key: string, idx: number, emptyObj: any) => { form.value[key].splice(idx,1); if(form.value[key].length === 0) form.value[key].push({...emptyObj}) }

const addSubject = (idx: number) => { form.value.subjects[idx].push({ code: '', credit: '', nameTh: '', nameEn: '', note: '' }) }
const removeSubject = (idx: number, itemIdx: number) => { form.value.subjects[idx].splice(itemIdx, 1); if(form.value.subjects[idx].length === 0) form.value.subjects[idx].push({ code: '', credit: '', nameTh: '', nameEn: '', note: '' }) }

const addS3_31 = () => { form.value.s3_31.push({ code: '', credit: '', nameTh: '', nameEn: '', prereq: '', descTh: '', descEn: '' }) }
const removeS3_31 = (idx: number) => { form.value.s3_31.splice(idx, 1); if(form.value.s3_31.length === 0) form.value.s3_31.push({ code: '', credit: '', nameTh: '', nameEn: '', prereq: '', descTh: '', descEn: '' }) }

const addS3_32 = () => { form.value.s3_32.push({ name: '', position: '', degree: '', research: '', loadNow: '', loadNew: '' }) }
const removeS3_32 = (idx: number) => { form.value.s3_32.splice(idx, 1); if(form.value.s3_32.length === 0) form.value.s3_32.push({ name: '', position: '', degree: '', research: '', loadNow: '', loadNew: '' }) }

const doneState = ref<Record<number, boolean>>({})
const keyToAnchor = (i: number) => 'sec-3-' + (i + 1)
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

      <!-- Breadcrumb & Title -->
      <div class="crumb">
        <span>เล่มหลักสูตร</span> › <b class="text-[#1B2A4A] font-semibold">หมวดที่ 3</b>
        <span class="page-badge">หน้า 4 / 9</span>
      </div>
      <div class="doc-head">
        <div class="doc-eyebrow">หมวดที่ 3</div>
        <h1 class="doc-title">ระบบการจัดการศึกษา การดำเนินการ และโครงสร้างของหลักสูตร</h1>
      </div>

      <!-- 🎯 TOC Card แบบ List (แยก 43 ข้อ ให้เล็งกดง่ายๆ) -->
      <div v-if="!isFocused" class="toc-card">
        <div class="toc-label">หัวข้อในหน้านี้ — คลิกเพื่อเลือกกรอกทีละหัวข้อ (รวม 43 หัวข้อ)</div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[4px_18px] max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
          <div v-for="(title, i) in sectionTitles" :key="i" class="toc-item" :class="{ 'filled': doneState[i] }" @click="focusAnchor(`sec-3-${i+1}`)">
            <div class="toc-dot"></div>
            <span class="toc-num">3.{{ i + 1 }}</span>
            <span class="lbl">
              {{ title }}
              <span v-if="i===30" class="text-[10.5px] text-[#A8793B] bg-[#EEE0C6] px-[8px] py-[2px] rounded-full font-bold inline-flex items-center gap-1 ml-2"><UIcon name="i-heroicons-sparkles" class="w-3 h-3"/> AI Assisted</span>
            </span>
          </div>
        </div>
      </div>

      <!-- Focus Navigation -->
      <FocusNav :is-focused="isFocused" :current-index="currentIndex" :total="steps.length" :steps="steps" @show-all="showAll" />

      <!-- Main Paper Card -->
      <div class="paper-card">
        
        <section v-for="(title, i) in sectionTitles" :key="i" :id="`sec-3-${i+1}`" v-show="isVisible(`sec-3-${i+1}`)" :class="['topic-sec', i===30 ? 'border-l-4 border-l-[#A8793B] pl-[20px] -ml-[24px] bg-[#FDFBF4]' : '']">
          
          <div class="sec-head">
            <div class="sec-number">3.{{ i + 1 }}</div>
            <div class="flex-1 flex flex-col md:flex-row md:justify-between md:items-start gap-2">
              <div class="flex items-center gap-2">
                <h2 class="sec-title pt-1">{{ title }}</h2>
                <span v-if="i===30" class="text-[10.5px] text-[#A8793B] bg-[#EEE0C6] px-[8px] py-[2px] rounded-full font-bold flex items-center gap-1"><UIcon name="i-heroicons-sparkles" class="w-3 h-3"/> AI Assisted</span>
              </div>
              <button type="button" class="sec-check" :class="{ 'on': doneState[i] }" @click="toggleDone(i)">
                {{ doneState[i] ? '✓ กรอกแล้ว' : 'ทำเครื่องหมายว่ากรอกแล้ว' }}
              </button>
            </div>
          </div>

          <div :class="['sec-body', i===30 ? 'md:pl-[56px] mt-4 md:mt-0' : '']">
            
            <!-- 3.4 วัน-เวลา -->
            <template v-if="i === 3">
              <div class="fs-grid">
                <div class="fs-field"><label>ภาคการศึกษาที่ 1</label><input v-model="form.s3_4.sem1" type="text" /></div>
                <div class="fs-field"><label>ภาคการศึกษาที่ 2</label><input v-model="form.s3_4.sem2" type="text" /></div>
                <div class="fs-field"><label>ภาคการศึกษาฤดูร้อน</label><input v-model="form.s3_4.summer" type="text" /></div>
              </div>
            </template>

            <!-- 3.5, 3.6, 3.7, 3.34, 3.35, 3.36 (List) -->
            <template v-else-if="[4, 5, 6, 33, 34, 35].includes(i)">
              <div class="list-editor">
                <div class="list-row" v-for="(item, idx) in form[`s3_${i+1}`]" :key="idx">
                  <div class="list-num">{{ idx + 1 }}</div>
                  <input v-model="form[`s3_${i+1}`][idx]" type="text" />
                  <button type="button" class="row-del" @click="removeList(`s3_${i+1}`, idx)">✕</button>
                </div>
                <button type="button" class="add-row" @click="addList(`s3_${i+1}`)">+ เพิ่มรายการ</button>
              </div>
            </template>

            <!-- 3.8 แผนการรับนักศึกษา -->
            <template v-else-if="i === 7">
              <table class="builder bg-white">
                <thead><tr><th>ระดับชั้นปี</th><th>2565</th><th>2566</th><th>2567</th><th>2568</th><th>2569</th><th style="width:40px"></th></tr></thead>
                <tbody>
                  <tr v-for="(row, idx) in form.s3_8" :key="idx">
                    <td><input v-model="row.year" type="text"></td><td><input v-model="row.y65" type="text"></td><td><input v-model="row.y66" type="text"></td>
                    <td><input v-model="row.y67" type="text"></td><td><input v-model="row.y68" type="text"></td><td><input v-model="row.y69" type="text"></td>
                    <td><button type="button" class="table-del" @click="removeTable('s3_8', idx, {year:'',y65:'',y66:'',y67:'',y68:'',y69:''})">✕</button></td>
                  </tr>
                </tbody>
              </table>
              <button type="button" class="add-row" @click="addTable('s3_8', {year:'',y65:'',y66:'',y67:'',y68:'',y69:''})">+ เพิ่มแถว</button>
            </template>

            <!-- 3.9 งบประมาณรายรับ -->
            <template v-else-if="i === 8">
              <table class="builder bg-white">
                <thead><tr><th>รายละเอียดรายรับ</th><th>2565</th><th>2566</th><th>2567</th><th>2568</th><th>2569</th><th style="width:40px"></th></tr></thead>
                <tbody>
                  <tr v-for="(row, idx) in form.s3_9" :key="idx">
                    <td><input v-model="row.detail" type="text"></td><td><input v-model="row.y65" type="text"></td><td><input v-model="row.y66" type="text"></td>
                    <td><input v-model="row.y67" type="text"></td><td><input v-model="row.y68" type="text"></td><td><input v-model="row.y69" type="text"></td>
                    <td><button type="button" class="table-del" @click="removeTable('s3_9', idx, {detail:'',y65:'',y66:'',y67:'',y68:'',y69:''})">✕</button></td>
                  </tr>
                </tbody>
              </table>
              <button type="button" class="add-row" @click="addTable('s3_9', {detail:'',y65:'',y66:'',y67:'',y68:'',y69:''})">+ เพิ่มแถว</button>
            </template>

            <!-- 3.10 งบประมาณรายจ่าย -->
            <template v-else-if="i === 9">
              <table class="builder bg-white">
                <thead><tr><th>หมวดเงิน</th><th>2565</th><th>2566</th><th>2567</th><th>2568</th><th>2569</th><th style="width:40px"></th></tr></thead>
                <tbody>
                  <tr v-for="(row, idx) in form.s3_10" :key="idx">
                    <td><input v-model="row.category" type="text"></td><td><input v-model="row.y65" type="text"></td><td><input v-model="row.y66" type="text"></td>
                    <td><input v-model="row.y67" type="text"></td><td><input v-model="row.y68" type="text"></td><td><input v-model="row.y69" type="text"></td>
                    <td><button type="button" class="table-del" @click="removeTable('s3_10', idx, {category:'',y65:'',y66:'',y67:'',y68:'',y69:''})">✕</button></td>
                  </tr>
                </tbody>
              </table>
              <button type="button" class="add-row" @click="addTable('s3_10', {category:'',y65:'',y66:'',y67:'',y68:'',y69:''})">+ เพิ่มแถว</button>
            </template>

            <!-- 3.13 โครงสร้างหลักสูตร -->
            <template v-else-if="i === 12">
              <table class="builder bg-white">
                <thead><tr><th>หมวดวิชา / กลุ่มวิชา</th><th>หน่วยกิต</th><th style="width:40px"></th></tr></thead>
                <tbody>
                  <tr v-for="(row, idx) in form.s3_13" :key="idx">
                    <td><input v-model="row.group" type="text"></td><td><input v-model="row.credits" type="text"></td>
                    <td><button type="button" class="table-del" @click="removeTable('s3_13', idx, {group:'',credits:''})">✕</button></td>
                  </tr>
                </tbody>
              </table>
              <button type="button" class="add-row" @click="addTable('s3_13', {group:'',credits:''})">+ เพิ่มแถว</button>
            </template>

            <!-- 3.14 - 3.25 รายวิชาในหมวดต่างๆ -->
            <template v-else-if="i >= 13 && i <= 24">
              <div v-for="(subj, itemIdx) in form.subjects[i-13]" :key="itemIdx" class="slist-item">
                <div class="slist-num">{{ itemIdx + 1 }}</div>
                <div class="slist-fields fs-grid">
                  <div class="fs-field"><label>รหัสวิชา</label><input v-model="subj.code" type="text" /></div>
                  <div class="fs-field"><label>หน่วยกิต</label><input v-model="subj.credit" type="text" /></div>
                  <div class="fs-field"><label>ชื่อวิชา <span class="lang-tag">ภาษาไทย</span></label><input v-model="subj.nameTh" type="text" /></div>
                  <div class="fs-field"><label>Subject Name <span class="lang-tag">English</span></label><input v-model="subj.nameEn" type="text" /></div>
                  <div class="fs-field" style="grid-column: 1 / -1;"><label>หมายเหตุ</label><input v-model="subj.note" type="text" /></div>
                </div>
                <button type="button" class="slist-del" @click="removeSubject(i-13, itemIdx)">✕</button>
              </div>
              <button type="button" class="add-row" @click="addSubject(i-13)">+ เพิ่มรายวิชา</button>
            </template>

            <!-- 3.27 - 3.30 แผนการศึกษา -->
            <template v-else-if="i >= 26 && i <= 29">
              <table class="builder bg-white">
                <thead><tr><th>ปีที่/ภาคการศึกษา</th><th>รหัสวิชา</th><th>ชื่อวิชา</th><th>หน่วยกิต</th><th style="width:40px"></th></tr></thead>
                <tbody>
                  <tr v-for="(row, idx) in form[`s3_${i+1}`]" :key="idx">
                    <td><input v-model="row.sem" type="text"></td><td><input v-model="row.code" type="text"></td>
                    <td><input v-model="row.name" type="text"></td><td><input v-model="row.credit" type="text"></td>
                    <td><button type="button" class="table-del" @click="removeTable(`s3_${i+1}`, idx, {sem:'',code:'',name:'',credit:''})">✕</button></td>
                  </tr>
                </tbody>
              </table>
              <button type="button" class="add-row" @click="addTable(`s3_${i+1}`, {sem:'',code:'',name:'',credit:''})">+ เพิ่มวิชา</button>
            </template>

            <!-- 3.31 คำอธิบายรายวิชา (มีปุ่ม AI) -->
            <template v-else-if="i === 30">
              <div v-for="(item, idx) in form.s3_31" :key="idx" class="slist-item !bg-white">
                <div class="slist-num">{{ idx + 1 }}</div>
                <div class="slist-fields fs-grid">
                  <div class="fs-field"><label>รหัสวิชา</label><input v-model="item.code" type="text" class="!bg-[#FEFDFA]" /></div>
                  <div class="fs-field"><label>หน่วยกิต</label><input v-model="item.credit" type="text" class="!bg-[#FEFDFA]" /></div>
                  <div class="fs-field"><label>ชื่อวิชา <span class="lang-tag">ภาษาไทย</span></label><input v-model="item.nameTh" type="text" class="!bg-[#FEFDFA]" /></div>
                  <div class="fs-field"><label>Subject Name <span class="lang-tag">English</span></label><input v-model="item.nameEn" type="text" class="!bg-[#FEFDFA]" /></div>
                  <div class="fs-field" style="grid-column: 1 / -1;"><label>วิชาบังคับก่อน</label><input v-model="item.prereq" type="text" class="!bg-[#FEFDFA]" /></div>
                  <div class="fs-field" style="grid-column: 1 / -1;"><label>คำอธิบายรายวิชา (ไทย)</label><textarea v-model="item.descTh" class="field !bg-[#FEFDFA]"></textarea></div>
                  <div class="fs-field" style="grid-column: 1 / -1;"><label>Course Description (English)</label><textarea v-model="item.descEn" class="field !bg-[#FEFDFA]"></textarea></div>
                  <div class="fs-field" style="grid-column: 1 / -1;">
                    <button type="button" @click="handleAIGenerate('course_description', item.nameTh)" class="ai-btn"><UIcon name="i-heroicons-sparkles" class="w-4 h-4"/> AI ช่วยร่างคำอธิบายวิชานี้</button>
                  </div>
                </div>
                <button type="button" class="slist-del" @click="removeS3_31(idx)">✕</button>
              </div>
              <button type="button" class="add-row" @click="addS3_31()">+ เพิ่มคำอธิบายรายวิชา</button>
            </template>

            <!-- 3.32 อาจารย์ผู้สอน -->
            <template v-else-if="i === 31">
              <div v-for="(item, idx) in form.s3_32" :key="idx" class="slist-item">
                <div class="slist-num">{{ idx + 1 }}</div>
                <div class="slist-fields fs-grid">
                  <div class="fs-field"><label>ชื่อ-นามสกุล</label><input v-model="item.name" type="text" /></div>
                  <div class="fs-field"><label>ตำแหน่งทางวิชาการ</label><input v-model="item.position" type="text" /></div>
                  <div class="fs-field" style="grid-column: 1 / -1;"><label>คุณวุฒิ (สาขาวิชา) — สถาบัน/ประเทศ — ปี พ.ศ.</label><textarea v-model="item.degree" class="field" style="min-height: 60px;"></textarea></div>
                  <div class="fs-field" style="grid-column: 1 / -1;"><label>ผลงานทางวิชาการ</label><input v-model="item.research" type="text" /></div>
                  <div class="fs-field"><label>ภาระสอนเดิม (ชม./สัปดาห์)</label><input v-model="item.loadNow" type="text" /></div>
                  <div class="fs-field"><label>ภาระสอนใหม่ (ชม./สัปดาห์)</label><input v-model="item.loadNew" type="text" /></div>
                </div>
                <button type="button" class="slist-del" @click="removeS3_32(idx)">✕</button>
              </div>
              <button type="button" class="add-row" @click="addS3_32()">+ เพิ่มอาจารย์ผู้สอน</button>
            </template>

            <!-- ข้ออื่นๆ (Textarea) -->
            <template v-else>
              <div class="fs-grid full">
                <div class="fs-field">
                  <textarea v-model="form.sections[i]" class="field" :placeholder="`ระบุข้อมูล ${title}...`"></textarea>
                </div>
              </div>
            </template>

          </div>
        </section>

      </div>

      <FocusFooter :is-focused="isFocused" :current-index="currentIndex" :steps="steps" @prev="prevStep" @next="nextStep" />

      <!-- Action Footer -->
      <div v-if="saveError" style="color:#9C4132; font-size:12.8px; margin-bottom:8px; text-align: right;">{{ saveError }}</div>
      <div v-if="saveSuccess" style="color:#2E7D32; font-size:12.8px; margin-bottom:8px; text-align: right;">{{ saveSuccess }}</div>

      <div class="page-footer">
        <button type="button" @click="router.push(`/number2?id=${programId || ''}`)" class="nav-btn">
          ← <span>ข้อมูลเฉพาะของหลักสูตร</span>
        </button>
        <div class="flex flex-col md:flex-row gap-3">
          <button type="button" @click="saveDraft()" :disabled="isSavingDraft || isSavingNext" class="nav-btn">
            <UIcon name="i-heroicons-document-text" class="w-4 h-4 mr-1" /> {{ isSavingDraft ? 'กำลังบันทึก...' : 'บันทึกฉบับร่าง' }}
          </button>
          <button type="button" @click="saveAndNext()" :disabled="isSavingNext || isSavingDraft" class="btn-brass force-white-btn" style="border:none;border-radius:8px;padding:10px 16px;font-size:13px;font-weight:600;display:flex;align-items:center;gap:8px;cursor:pointer;">
            <span style="color:#ffffff !important;">{{ isSavingNext ? 'กำลังบันทึก...' : 'ผลการเรียนรู้ กลยุทธ์การสอน' }}</span> <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

    </form>
  </div>
</template>
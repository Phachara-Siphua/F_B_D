<!-- pages/appendix/b.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getSteps } from '~/constants/toc'
const route = useRoute()
const router = useRouter()

// ===== Focus mode =====
const { isFocused, currentIndex, currentStep, isVisible, focusAnchor, next: nextStep, prev: prevStep, showAll, steps } = useFocusMode(getSteps('app-b'))

const programId = ref<string | null>(null)

// รายชื่อหัวข้อในภาคผนวก ข.
const sectionTitles = [
  "รายละเอียดการกำหนดรหัสวิชาของหลักสูตร (โครงสร้างรหัสวิชา 9 หลัก)",
  "การระบุชื่อปริญญาในใบรับรองผลการศึกษา (Transcript)"
]

// ================= State ข้อมูลฟอร์ม =================
const form = ref<any>({
  id: null,
  sB_1: [
    { digit: '1-2', val: '03', meaning: 'วิทยาลัยเทคโนโลยีอุตสาหกรรม' },
    { digit: '3-4', val: '05', meaning: 'ภาควิชาเทคโนโลยีวิศวกรรมอิเล็กทรอนิกส์' },
    { digit: '5', val: '1 / 2 / 3', meaning: 'สาขาวิชา: 1=เทคโนโลยีวิศวกรรมอิเล็กทรอนิกส์ (EnET), 2=เทคโนโลยีวิศวกรรมอิเล็กทรอนิกส์ (ECT/EIT/ETT), 3=เทคโนโลยีวิศวกรรมอิเล็กทรอนิกส์ประยุกต์ (MEEE)' },
    { digit: '6', val: '3', meaning: 'ระดับปริญญาตรี' },
    { digit: '7', val: '1,5,7 / 2,6,8 / 3,9 / 4', meaning: 'ประเภทวิชา: 1,5,7=ทฤษฎี, 2,6,8=ปฏิบัติ, 3,9=งานประลอง, 4=สหกิจศึกษา/ฝึกงาน' },
    { digit: '8-9', val: '00-99', meaning: 'ลำดับรายวิชา' }
  ],
  sB_2: [
    { branch: 'โทรคมนาคม', fullTh: 'วิศวกรรมศาสตรบัณฑิต สาขาวิชาเทคโนโลยีวิศวกรรมอิเล็กทรอนิกส์ (โทรคมนาคม)', abbrTh: 'วศ.บ. สาขาวิชาเทคโนโลยีวิศวกรรมอิเล็กทรอนิกส์ (โทรคมนาคม)', fullEn: 'Bachelor of Engineering Program in Electronics Engineering Technology (Telecommunication)', abbrEn: 'B.Eng in Electronics Engineering Technology (Telecommunication)' },
    { branch: 'เครื่องมือวัดและควบคุม', fullTh: 'วิศวกรรมศาสตรบัณฑิต สาขาวิชาเทคโนโลยีวิศวกรรมอิเล็กทรอนิกส์ (เครื่องมือวัดและควบคุม)', abbrTh: 'วศ.บ. สาขาวิชาเทคโนโลยีวิศวกรรมอิเล็กทรอนิกส์ (เครื่องมือวัดและควบคุม)', fullEn: 'Bachelor of Engineering Program in Electronics Engineering Technology (Instrumentation and Control)', abbrEn: 'B.Eng in Electronics Engineering Technology (Instrumentation and Control)' },
    { branch: 'คอมพิวเตอร์', fullTh: 'วิศวกรรมศาสตรบัณฑิต สาขาวิชาเทคโนโลยีวิศวกรรมอิเล็กทรอนิกส์ (คอมพิวเตอร์)', abbrTh: 'วศ.บ. สาขาวิชาเทคโนโลยีวิศวกรรมอิเล็กทรอนิกส์ (คอมพิวเตอร์)', fullEn: 'Bachelor of Engineering Program in Electronics Engineering Technology (Computer)', abbrEn: 'B.Eng in Electronics Engineering Technology (Computer)' },
    { branch: 'การกระจายเสียงวิทยุและโทรทัศน์', fullTh: 'วิศวกรรมศาสตรบัณฑิต สาขาวิชาเทคโนโลยีวิศวกรรมอิเล็กทรอนิกส์ (การกระจายเสียงวิทยุและโทรทัศน์)', abbrTh: 'วศ.บ. สาขาวิชาเทคโนโลยีวิศวกรรมอิเล็กทรอนิกส์ (การกระจายเสียงวิทยุและโทรทัศน์)', fullEn: 'Bachelor of Engineering Program in Electronics Engineering Technology (Broadcast)', abbrEn: 'B.Eng in Electronics Engineering Technology (Broadcast)' }
  ]
})

// ================= Helper Functions =================
const addTable = () => { form.value.sB_1.push({ digit: '', val: '', meaning: '' }) }
const removeTable = (idx: number) => {
  form.value.sB_1.splice(idx, 1)
  if (form.value.sB_1.length === 0) form.value.sB_1.push({ digit: '', val: '', meaning: '' })
}

const addList = () => { form.value.sB_2.push({ branch: '', fullTh: '', abbrTh: '', fullEn: '', abbrEn: '' }) }
const removeList = (idx: number) => {
  form.value.sB_2.splice(idx, 1)
  if (form.value.sB_2.length === 0) form.value.sB_2.push({ branch: '', fullTh: '', abbrTh: '', fullEn: '', abbrEn: '' })
}

const doneState = ref<Record<number, boolean>>({})
const keyToAnchor = (i: number) => 'sec-app-b-' + (i + 1)
const toggleDone = (index: number) => { 
  doneState.value[index] = !doneState.value[index]
  if (import.meta.client) {
    localStorage.setItem(`done-${keyToAnchor(index)}`, doneState.value[index] ? '1' : '0')
    window.dispatchEvent(new Event('storage')) 
  }
}

onMounted(() => { 
  if (route.query.id) { programId.value = route.query.id as string; form.value.id = route.query.id as string } 
  if (!import.meta.client) return
  ;(Object.keys(sectionTitles) as unknown as number[]).forEach((i) => {
    doneState.value[i] = localStorage.getItem(`done-${keyToAnchor(i)}`) === '1'
  })
})

const isSavingDraft = ref(false); const isSavingNext = ref(false)
const saveDraft = async () => { isSavingDraft.value = true; await new Promise(r => setTimeout(r, 1000)); isSavingDraft.value = false; }
const saveAndNext = async () => { isSavingNext.value = true; await new Promise(r => setTimeout(r, 1000)); isSavingNext.value = false; router.push({ path: '/appendix/c', query: { id: programId.value } }) }
</script>

<template>
  <div class="page-shell">
    <form @submit.prevent class="w-full">
      <div class="crumb"><span>เล่มหลักสูตร</span> › <b>ภาคผนวก</b> › <b class="text-[#1B2A4A] font-semibold">ภาคผนวก ข.</b></div>
      <div class="doc-head"><div class="doc-eyebrow">ภาคผนวก ข.</div><h1 class="doc-title">รายละเอียดรหัสวิชา และชื่อปริญญา</h1></div>

      <div v-if="!isFocused" class="toc-card">
        <div class="toc-label">หัวข้อในหน้านี้ — คลิกเพื่อเลือกกรอกทีละหัวข้อ</div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-[4px_18px]">
          <div v-for="(title, i) in sectionTitles" :key="i" class="toc-item" :class="{ 'filled': doneState[i] }" @click="focusAnchor(`sec-app-b-${i+1}`)">
            <div class="toc-dot"></div><span class="toc-num">ข.{{ i + 1 }}</span><span class="lbl">{{ title.split(' (')[0] }}</span>
          </div>
        </div>
      </div>

      <FocusNav :is-focused="isFocused" :current-index="currentIndex" :total="steps.length" :steps="steps" @show-all="showAll" />

      <div class="paper-card">
        <!-- ข.1 ตารางรหัสวิชา -->
        <section class="topic-sec" id="sec-app-b-1" v-show="isVisible('sec-app-b-1')">
          <div class="sec-head">
            <div class="sec-number text-[#1B2A4A]">ข.1</div>
            <div class="flex-1 flex flex-col md:flex-row md:justify-between md:items-start gap-2">
              <h2 class="sec-title pt-1">{{ sectionTitles[0] }}</h2>
              <button type="button" class="sec-check" :class="{ 'on': doneState[0] }" @click="toggleDone(0)">{{ doneState[0] ? '✓ กรอกแล้ว' : 'ทำเครื่องหมายว่ากรอกแล้ว' }}</button>
            </div>
          </div>
          <div class="sec-body mt-4">
            <table class="builder">
              <thead><tr><th style="width: 120px;">หลักที่</th><th style="width: 150px;">ค่าตัวเลข</th><th>ความหมาย</th><th style="width: 40px;"></th></tr></thead>
              <tbody>
                <tr v-for="(row, idx) in form.sB_1" :key="idx">
                  <td><input v-model="row.digit" type="text" placeholder="เช่น 1-2"></td>
                  <td><input v-model="row.val" type="text" placeholder="เช่น 03"></td>
                  <td><input v-model="row.meaning" type="text" placeholder="ระบุความหมาย"></td>
                  <td><button type="button" class="table-del" @click="removeTable(idx)">✕</button></td>
                </tr>
              </tbody>
            </table>
            <button type="button" class="add-row mt-2" @click="addTable()">+ เพิ่มแถว</button>
          </div>
        </section>

        <!-- ข.2 ชื่อปริญญา (Structured List) -->
        <section class="topic-sec" id="sec-app-b-2" v-show="isVisible('sec-app-b-2')">
          <div class="sec-head">
            <div class="sec-number text-[#1B2A4A]">ข.2</div>
            <div class="flex-1 flex flex-col md:flex-row md:justify-between md:items-start gap-2">
              <h2 class="sec-title pt-1">{{ sectionTitles[1] }}</h2>
              <button type="button" class="sec-check" :class="{ 'on': doneState[1] }" @click="toggleDone(1)">{{ doneState[1] ? '✓ กรอกแล้ว' : 'ทำเครื่องหมายว่ากรอกแล้ว' }}</button>
            </div>
          </div>
          <div class="sec-body mt-4">
            <div v-for="(item, idx) in form.sB_2" :key="idx" class="slist-item">
              <div class="slist-num">{{ idx + 1 }}</div>
              <div class="slist-fields fs-grid full">
                <div class="fs-field"><label>แขนงวิชา</label><input v-model="item.branch" type="text" placeholder="เช่น โทรคมนาคม" /></div>
                <div class="fs-field"><label>ชื่อเต็มภาษาไทย</label><input v-model="item.fullTh" type="text" placeholder="เช่น วิศวกรรมศาสตรบัณฑิต..." /></div>
                <div class="fs-field"><label>ชื่อย่อภาษาไทย</label><input v-model="item.abbrTh" type="text" placeholder="เช่น วศ.บ...." /></div>
                <div class="fs-field"><label>ชื่อเต็มภาษาอังกฤษ</label><input v-model="item.fullEn" type="text" placeholder="เช่น Bachelor of Engineering..." /></div>
                <div class="fs-field"><label>ชื่อย่อภาษาอังกฤษ</label><input v-model="item.abbrEn" type="text" placeholder="เช่น B.Eng..." /></div>
              </div>
              <button type="button" class="slist-del" @click="removeList(idx)">✕</button>
            </div>
            <button type="button" class="add-row" @click="addList()">+ เพิ่มรายชื่อปริญญา</button>
          </div>
        </section>
      </div>

      <FocusFooter :is-focused="isFocused" :current-index="currentIndex" :steps="steps" @prev="prevStep" @next="nextStep" />

      <div class="page-footer">
        <button type="button" @click="router.push(`/appendix/a?id=${programId || ''}`)" class="nav-btn">← <span>ภาคผนวก ก. แผนภูมิความต่อเนื่องฯ</span></button>
        <div class="flex flex-col md:flex-row gap-3">
          <button type="button" @click="saveDraft()" :disabled="isSavingDraft" class="nav-btn"><UIcon name="i-heroicons-document-text" class="w-4 h-4 mr-1" /> {{ isSavingDraft ? 'กำลังบันทึก...' : 'บันทึกฉบับร่าง' }}</button>
          <button type="button" @click="saveAndNext()" :disabled="isSavingNext" class="btn-brass force-white-btn" style="border:none;border-radius:8px;padding:10px 16px;font-size:13px;font-weight:600;display:flex;align-items:center;gap:8px;cursor:pointer;">
            <span style="color:#ffffff !important;">{{ isSavingNext ? 'กำลังบันทึก...' : 'ภาคผนวก ค. คำสั่งแต่งตั้ง' }}</span> <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </form>
  </div>
</template>


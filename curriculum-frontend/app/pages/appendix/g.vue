<!-- pages/appendix/g.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getSteps } from '~/constants/toc'
const route = useRoute()
const router = useRouter()

// ===== Focus mode =====
const { isFocused, currentIndex, currentStep, isVisible, focusAnchor, next: nextStep, prev: prevStep, showAll, steps } = useFocusMode(getSteps('app-g'))

const programId = ref<string | null>(null)

// รายชื่อหัวข้อในภาคผนวก ช.
const sectionTitles = [
  "คำชี้แจง",
  "ตารางเปรียบเทียบรายวิชากับองค์ความรู้ตามมาตรฐานคุณวุฒิ"
]

// ================= State ข้อมูลฟอร์ม =================
const form = ref<any>({
  id: null,
  sG_1: 'แสดงความสอดคล้องระหว่างรายวิชาในหลักสูตรกับองค์ความรู้ตามมาตรฐานคุณวุฒิระดับอุดมศึกษาแห่งชาติ สาขาวิศวกรรมศาสตร์',
  sG_2: [
    { subject: '040203111 คณิตศาสตร์วิศวกรรม 1', knowledge: 'ความรู้พื้นฐานทางคณิตศาสตร์และวิทยาศาสตร์' },
    { subject: '030413100 การวิเคราะห์วงจรไฟฟ้า 1', knowledge: 'ความรู้พื้นฐานทางวิศวกรรมไฟฟ้าและอิเล็กทรอนิกส์' }
  ]
})

// ================= Helper Functions =================
const addTable = () => { form.value.sG_2.push({ subject: '', knowledge: '' }) }
const removeTable = (idx: number) => {
  form.value.sG_2.splice(idx, 1)
  if (form.value.sG_2.length === 0) form.value.sG_2.push({ subject: '', knowledge: '' })
}

const doneState = ref<Record<number, boolean>>({})
const keyToAnchor = (i: number) => 'sec-app-g-' + (i + 1)
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
const saveAndNext = async () => { isSavingNext.value = true; await new Promise(r => setTimeout(r, 1000)); isSavingNext.value = false; router.push({ path: '/appendix/h', query: { id: programId.value } }) }
</script>

<template>
  <div class="page-shell">
    <form @submit.prevent class="w-full">
      <div class="crumb"><span>เล่มหลักสูตร</span> › <b>ภาคผนวก</b> › <b class="text-[#1B2A4A] font-semibold">ภาคผนวก ช.</b></div>
      <div class="doc-head"><div class="doc-eyebrow">ภาคผนวก ช.</div><h1 class="doc-title">ตารางเปรียบเทียบรายวิชาในหลักสูตรกับองค์ความรู้ตามมาตรฐานคุณวุฒิ</h1></div>

      <div v-if="!isFocused" class="toc-card">
        <div class="toc-label">หัวข้อในหน้านี้ — คลิกเพื่อเลือกกรอกทีละหัวข้อ</div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-[4px_18px]">
          <div v-for="(title, i) in sectionTitles" :key="i" class="toc-item" :class="{ 'filled': doneState[i] }" @click="focusAnchor(`sec-app-g-${i+1}`)">
            <div class="toc-dot"></div><span class="toc-num">ช.{{ i + 1 }}</span><span class="lbl">{{ title }}</span>
          </div>
        </div>
      </div>

      <FocusNav :is-focused="isFocused" :current-index="currentIndex" :total="steps.length" :steps="steps" @show-all="showAll" />

      <div class="paper-card">
        <section v-for="(title, i) in sectionTitles" :key="i" :id="`sec-app-g-${i+1}`" v-show="isVisible(`sec-app-g-${i+1}`)" class="topic-sec">
          <div class="sec-head">
            <div class="sec-number text-[#1B2A4A]">ช.{{ i + 1 }}</div>
            <div class="flex-1 flex flex-col md:flex-row md:justify-between md:items-start gap-2">
              <h2 class="sec-title pt-1">{{ title }}</h2>
              <button type="button" class="sec-check" :class="{ 'on': doneState[i] }" @click="toggleDone(i)">{{ doneState[i] ? '✓ กรอกแล้ว' : 'ทำเครื่องหมายว่ากรอกแล้ว' }}</button>
            </div>
          </div>
          <div class="sec-body mt-4">
            <template v-if="i === 0">
              <div class="fs-grid full">
                <div class="fs-field"><textarea v-model="form.sG_1" class="field" placeholder="ระบุคำชี้แจง..." style="min-height: 80px;"></textarea></div>
              </div>
            </template>
            <template v-else-if="i === 1">
              <table class="builder">
                <thead><tr><th style="width: 40%;">รหัส-ชื่อวิชา</th><th>องค์ความรู้ตามมาตรฐานคุณวุฒิที่สอดคล้อง</th><th style="width: 40px;"></th></tr></thead>
                <tbody>
                  <tr v-for="(row, idx) in form.sG_2" :key="idx">
                    <td><input v-model="row.subject" type="text" placeholder="ระบุรหัสและชื่อวิชา..."></td>
                    <td><input v-model="row.knowledge" type="text" placeholder="ระบุองค์ความรู้ที่สอดคล้อง..."></td>
                    <td><button type="button" class="table-del" @click="removeTable(idx)">✕</button></td>
                  </tr>
                </tbody>
              </table>
              <button type="button" class="add-row mt-2" @click="addTable()">+ เพิ่มแถว</button>
            </template>
          </div>
        </section>
      </div>

      <FocusFooter :is-focused="isFocused" :current-index="currentIndex" :steps="steps" @prev="prevStep" @next="nextStep" />

      <div class="page-footer">
        <button type="button" @click="router.push(`/appendix/f?id=${programId || ''}`)" class="nav-btn">← <span>ภาคผนวก ฉ. รายละเอียดปรับปรุงฯ</span></button>
        <div class="flex flex-col md:flex-row gap-3">
          <button type="button" @click="saveDraft()" :disabled="isSavingDraft" class="nav-btn"><UIcon name="i-heroicons-document-text" class="w-4 h-4 mr-1" /> {{ isSavingDraft ? 'กำลังบันทึก...' : 'บันทึกฉบับร่าง' }}</button>
          <button type="button" @click="saveAndNext()" :disabled="isSavingNext" class="btn-brass force-white-btn" style="border:none;border-radius:8px;padding:10px 16px;font-size:13px;font-weight:600;display:flex;align-items:center;gap:8px;cursor:pointer;">
            <span style="color:#ffffff !important;">{{ isSavingNext ? 'กำลังบันทึก...' : 'ภาคผนวก ซ. องค์ความรู้สภาวิศวกร' }}</span> <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </form>
  </div>
</template>


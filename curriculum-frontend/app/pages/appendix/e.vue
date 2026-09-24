<!-- pages/appendix/e.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getSteps } from '~/constants/toc'
const route = useRoute()
const router = useRouter()

// ===== Focus mode =====
const { isFocused, currentIndex, currentStep, isVisible, focusAnchor, next: nextStep, prev: prevStep, showAll, steps } = useFocusMode(getSteps('app-e'))

const programId = ref<string | null>(null)

// รายชื่อหัวข้อในภาคผนวก จ.
const sectionTitles = [
  "ผลงานทางวิชาการของอาจารย์ประจำหลักสูตร",
  "ผลงานทางวิชาการของอาจารย์ผู้สอนและอื่น ๆ"
]

// ================= State ข้อมูลฟอร์ม =================
const form = ref<any>({
  id: null,
  sE_1: [{ name: '', work: '', year: '' }],
  sE_2: [{ name: '', work: '', year: '' }]
})

// ================= Helper Functions =================
const addList = (key: string) => { form.value[key].push({ name: '', work: '', year: '' }) }
const removeList = (key: string, idx: number) => {
  form.value[key].splice(idx, 1)
  if (form.value[key].length === 0) form.value[key].push({ name: '', work: '', year: '' })
}

const doneState = ref<Record<number, boolean>>({})
const keyToAnchor = (i: number) => 'sec-app-e-' + (i + 1)
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
const saveAndNext = async () => { isSavingNext.value = true; await new Promise(r => setTimeout(r, 1000)); isSavingNext.value = false; router.push({ path: '/appendix/f', query: { id: programId.value } }) }
</script>

<template>
  <div class="page-shell">
    <form @submit.prevent class="w-full">
      <div class="crumb"><span>เล่มหลักสูตร</span> › <b>ภาคผนวก</b> › <b class="text-[#1B2A4A] font-semibold">ภาคผนวก จ.</b></div>
      <div class="doc-head"><div class="doc-eyebrow">ภาคผนวก จ.</div><h1 class="doc-title">ผลงานทางวิชาการของอาจารย์</h1></div>

      <div v-if="!isFocused" class="toc-card">
        <div class="toc-label">หัวข้อในหน้านี้ — คลิกเพื่อเลือกกรอกทีละหัวข้อ</div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-[4px_18px]">
          <div v-for="(title, i) in sectionTitles" :key="i" class="toc-item" :class="{ 'filled': doneState[i] }" @click="focusAnchor(`sec-app-e-${i+1}`)">
            <div class="toc-dot"></div><span class="toc-num">จ.{{ i + 1 }}</span><span class="lbl">{{ title }}</span>
          </div>
        </div>
      </div>

      <FocusNav :is-focused="isFocused" :current-index="currentIndex" :total="steps.length" :steps="steps" @show-all="showAll" />

      <div class="paper-card">
        <!-- จ.1 ผลงานอาจารย์ประจำหลักสูตร -->
        <section class="topic-sec" id="sec-app-e-1" v-show="isVisible('sec-app-e-1')">
          <div class="sec-head">
            <div class="sec-number text-[#1B2A4A]">จ.1</div>
            <div class="flex-1 flex flex-col md:flex-row md:justify-between md:items-start gap-2">
              <h2 class="sec-title pt-1">{{ sectionTitles[0] }}</h2>
              <button type="button" class="sec-check" :class="{ 'on': doneState[0] }" @click="toggleDone(0)">{{ doneState[0] ? '✓ กรอกแล้ว' : 'ทำเครื่องหมายว่ากรอกแล้ว' }}</button>
            </div>
          </div>
          <div class="sec-body mt-4">
            <div v-for="(item, idx) in form.sE_1" :key="idx" class="slist-item">
              <div class="slist-num">{{ idx + 1 }}</div>
              <div class="slist-fields fs-grid">
                <div class="fs-field"><label>ชื่ออาจารย์</label><input v-model="item.name" type="text" placeholder="ระบุชื่ออาจารย์" /></div>
                <div class="fs-field"><label>ปีที่เผยแพร่</label><input v-model="item.year" type="text" placeholder="เช่น 2565" /></div>
                <div class="fs-field" style="grid-column: 1 / -1;"><label>ผลงานทางวิชาการ</label><textarea v-model="item.work" class="field" style="min-height: 80px;" placeholder="ระบุรายละเอียดผลงานวิชาการ การค้นคว้าวิจัย หรือตำรา"></textarea></div>
              </div>
              <button type="button" class="slist-del" @click="removeList('sE_1', idx)">✕</button>
            </div>
            <button type="button" class="add-row" @click="addList('sE_1')">+ เพิ่มผลงาน</button>
          </div>
        </section>

        <!-- จ.2 ผลงานอาจารย์ผู้สอนและอื่นๆ -->
        <section class="topic-sec" id="sec-app-e-2" v-show="isVisible('sec-app-e-2')">
          <div class="sec-head">
            <div class="sec-number text-[#1B2A4A]">จ.2</div>
            <div class="flex-1 flex flex-col md:flex-row md:justify-between md:items-start gap-2">
              <h2 class="sec-title pt-1">{{ sectionTitles[1] }}</h2>
              <button type="button" class="sec-check" :class="{ 'on': doneState[1] }" @click="toggleDone(1)">{{ doneState[1] ? '✓ กรอกแล้ว' : 'ทำเครื่องหมายว่ากรอกแล้ว' }}</button>
            </div>
          </div>
          <div class="sec-body mt-4">
            <div v-for="(item, idx) in form.sE_2" :key="idx" class="slist-item">
              <div class="slist-num">{{ idx + 1 }}</div>
              <div class="slist-fields fs-grid">
                <div class="fs-field"><label>ชื่ออาจารย์</label><input v-model="item.name" type="text" placeholder="ระบุชื่ออาจารย์" /></div>
                <div class="fs-field"><label>ปีที่เผยแพร่</label><input v-model="item.year" type="text" placeholder="เช่น 2565" /></div>
                <div class="fs-field" style="grid-column: 1 / -1;"><label>ผลงานทางวิชาการ</label><textarea v-model="item.work" class="field" style="min-height: 80px;" placeholder="ระบุรายละเอียดผลงานวิชาการ การค้นคว้าวิจัย หรือตำรา"></textarea></div>
              </div>
              <button type="button" class="slist-del" @click="removeList('sE_2', idx)">✕</button>
            </div>
            <button type="button" class="add-row" @click="addList('sE_2')">+ เพิ่มผลงาน</button>
          </div>
        </section>
      </div>

      <FocusFooter :is-focused="isFocused" :current-index="currentIndex" :steps="steps" @prev="prevStep" @next="nextStep" />

      <div class="page-footer">
        <button type="button" @click="router.push(`/appendix/d?id=${programId || ''}`)" class="nav-btn">← <span>ภาคผนวก ง. ระเบียบมหาวิทยาลัยฯ</span></button>
        <div class="flex flex-col md:flex-row gap-3">
          <button type="button" @click="saveDraft()" :disabled="isSavingDraft" class="nav-btn"><UIcon name="i-heroicons-document-text" class="w-4 h-4 mr-1" /> {{ isSavingDraft ? 'กำลังบันทึก...' : 'บันทึกฉบับร่าง' }}</button>
          <button type="button" @click="saveAndNext()" :disabled="isSavingNext" class="btn-brass force-white-btn" style="border:none;border-radius:8px;padding:10px 16px;font-size:13px;font-weight:600;display:flex;align-items:center;gap:8px;cursor:pointer;">
            <span style="color:#ffffff !important;">{{ isSavingNext ? 'กำลังบันทึก...' : 'ภาคผนวก ฉ. รายละเอียดปรับปรุงฯ' }}</span> <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </form>
  </div>
</template>


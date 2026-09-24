// app/composables/useFocusMode.ts
//
// พอร์ตพฤติกรรม "focus mode" จาก curriculum-builder_v2.html (state.focusedSub / goToSub / stepItem)
// มาใช้กับ Nuxt: ใช้ route.hash แทน state.focusedSub เพื่อให้ deep-link / กด back ของเบราว์เซอร์ทำงานได้ด้วย
//
// แนวคิดเรื่อง "รวมหลายข้อในหน้าเดียว": ปกติ 1 หัวข้อย่อย = 1 การ์ดที่โฟกัส (step)
// แต่บางหัวข้อเล็กๆ ที่เกี่ยวข้องกัน (เช่น 1.1-1.5) อยากให้โผล่มาด้วยกันเป็น step เดียว
// จึงกำหนดเป็น "กลุ่มของ anchor" (string[]) ต่อ 1 step แทนที่จะเป็น anchor เดี่ยว

export interface FocusStep {
  /** id ของทุก <section> ที่จะโชว์พร้อมกันเมื่อ step นี้ถูกเลือก (ปกติมี 1 ตัว บางกลุ่มมีหลายตัว) */
  anchors: string[]
  /** label สั้นๆ ไว้โชว์ในปุ่มก่อนหน้า/ถัดไป */
  label: string
}

export function useFocusMode(steps: FocusStep[] | (() => FocusStep[])) {
  const route = useRoute()
  const router = useRouter()

  const stepsList = computed(() => (typeof steps === 'function' ? steps() : steps))

  /** anchor ที่อยู่ใน hash ปัจจุบัน (ไม่มี # นำหน้า) */
  const hashAnchor = computed(() => route.hash?.replace(/^#/, '') || '')

  /** index ของ step ที่ถูกโฟกัสอยู่ -1 = ไม่โฟกัส (โหมดดูภาพรวมทั้งหมด) */
  const currentIndex = computed(() => {
    if (!hashAnchor.value) return -1
    return stepsList.value.findIndex(s => s.anchors.includes(hashAnchor.value))
  })

  const isFocused = computed(() => currentIndex.value >= 0)
  const currentStep = computed(() => (isFocused.value ? stepsList.value[currentIndex.value] : null))
  const total = computed(() => stepsList.value.length)

  /** ใช้ผูกกับ v-show ของแต่ละ <section id="..."> ในหน้า */
  function isVisible(anchor: string) {
    if (!isFocused.value) return true
    return currentStep.value?.anchors.includes(anchor) ?? true
  }

  function scrollToAnchorInPage(anchor: string) {
    nextTick(() => {
      const el = document.getElementById(anchor)
      if (!el) return
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      el.classList.add('pulse-bg')
      setTimeout(() => el.classList.remove('pulse-bg'), 1200)
      document.getElementById('main-scroll')?.scrollTo({ top: 0 })
    })
  }

  /** ไปยัง step ที่มี anchor นี้อยู่ (ใช้ตอนคลิกจาก Sidebar หรือคลิกหัวข้อใน TOC การ์ดในหน้า) */
  function focusAnchor(anchor: string) {
    router.replace({ hash: '#' + anchor })
    scrollToAnchorInPage(anchor)
  }

  function goToStep(index: number) {
    const step = stepsList.value[index]
    if (!step) return
    router.replace({ hash: '#' + step.anchors[0] })
    document.getElementById('main-scroll')?.scrollTo({ top: 0 })
  }

  function next() { if (currentIndex.value < total.value - 1) goToStep(currentIndex.value + 1) }
  function prev() { if (currentIndex.value > 0) goToStep(currentIndex.value - 1) }
  function showAll() {
    router.replace({ hash: '' })
    document.getElementById('main-scroll')?.scrollTo({ top: 0 })
  }

  return { steps: stepsList, currentIndex, currentStep, isFocused, total, isVisible, focusAnchor, goToStep, next, prev, showAll }
}
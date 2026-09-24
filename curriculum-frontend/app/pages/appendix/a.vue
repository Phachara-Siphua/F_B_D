<!-- pages/appendix/a.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getSteps } from '~/constants/toc'
import { VueFlow, useVueFlow, Handle, Position, MarkerType, ConnectionMode } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import '@vue-flow/minimap/dist/style.css'

const config = useRuntimeConfig()
const API_BASE = config.public.apiBase as string

const route = useRoute()
const router = useRouter()
const { isFocused, currentIndex, currentStep, isVisible, focusAnchor, next: nextStep, prev: prevStep, showAll, steps } = useFocusMode(getSteps('app-a'))

const programId = ref<string | null>(null)
const sectionTitles = [
  "แผนภูมิความต่อเนื่อง — แขนงวิชาโทรคมนาคม (EnET-T)",
  "แผนภูมิความต่อเนื่อง — แขนงวิชาคอมพิวเตอร์ (EnET-C)",
  "แผนภูมิความต่อเนื่อง — แขนงวิชาเครื่องมือวัดและควบคุม (EnET-I)",
  "แผนภูมิความต่อเนื่อง — แขนงวิชาการกระจายเสียงวิทยุและโทรทัศน์ (EnET-B)"
]

const doneState = ref<Record<number, boolean>>({})
const keyToAnchor = (i: number) => 'sec-app-a-' + (i + 1)
const toggleDone = (index: number) => { 
  doneState.value[index] = !doneState.value[index]
  if (import.meta.client) {
    localStorage.setItem(`done-${keyToAnchor(index)}`, doneState.value[index] ? '1' : '0')
    window.dispatchEvent(new Event('storage')) 
  }
}

// ================= Vue Flow Base Data =================
const CAT_COLOR = { gened:'#E0E0E0', basic:'#B0BEC5', core:'#4DD0E1', elective:'#00BCD4', field:'#E0E0E0' }
const CAT_LABEL = { gened:'หมวดศึกษาทั่วไป', basic:'กลุ่มวิชาแกน', core:'กลุ่มวิชาชีพ-บังคับเฉพาะแขนง', elective:'กลุ่มวิชาชีพ-เลือกเฉพาะแขนง/เลือกเสรี', field:'ประสบการณ์ภาคสนาม/สหกิจศึกษา' }

const FLOW_COLS_8 = [
  {label:'ภาคการศึกษาที่ 1'}, {label:'ภาคการศึกษาที่ 2'},
  {label:'ภาคการศึกษาที่ 3'}, {label:'ภาคการศึกษาที่ 4'},
  {label:'ภาคการศึกษาที่ 5'}, {label:'ภาคการศึกษาที่ 6'},
  {label:'ภาคการศึกษาที่ 7'}, {label:'ภาคการศึกษาที่ 8'},
]

const FLOWMAPS: Record<number, any> = {
  0: { // แขนงวิชาโทรคมนาคม (EnET-T)
    nodes: [
      {id:'t1',col:0,row:0,code:'030103300',name:'Engineering Drawing',cat:'core', credits: '3(2-2-5)'},
      {id:'t2',col:0,row:1,code:'040113001',name:'Chemistry for Engineers',cat:'basic', credits: '3(3-0-6)'},
      {id:'t4',col:0,row:3,code:'040203111',name:'Engineering Mathematics I',cat:'basic', credits: '3(3-0-6)'},
      {id:'t10',col:1,row:1,code:'030413100',name:'Electric Circuit Analysis I',cat:'core', credits: '3(3-0-6)'},
      {id:'t12',col:1,row:3,code:'030513900',name:'Computer Programming',cat:'core', credits: '3(2-2-5)'},
      {id:'t21',col:2,row:5,code:'030513120',name:'Signal and System',cat:'core', credits: '3(3-0-6)'},
      {id:'t23',col:3,row:0,code:'030413145',name:'Electromagnetic Fields',cat:'core', credits: '3(3-0-6)'},
      {id:'t25',col:3,row:2,code:'030513123',name:'Data Communication & Network',cat:'core', credits: '3(3-0-6)'},
      {id:'t27',col:3,row:4,code:'030513902',name:'Linear Control System',cat:'core', credits: '3(2-2-5)'},
      {id:'t29',col:4,row:0,code:'030513140',name:'Commu. Network & Trans. Line',cat:'core', credits: '3(3-0-6)'},
      {id:'t33_2',col:4,row:5,code:'030513343',name:'Computer Network System',cat:'core', credits: '3(2-2-5)'},
      {id:'t38',col:5,row:1,code:'030513xxx',name:'Telecom. Elective Course III',cat:'elective', credits: '3(x-x-x)'},
      {id:'t41',col:7,row:0,code:'030513260',name:'Co-operative Education',cat:'field', credits: '6(540hours)'},
    ],
    edges: [['t10','t21'],['t21','t25'],['t23','t29'],['t25','t33_2']]
  },
  1: { // แขนงวิชาคอมพิวเตอร์ (EnET-C)
    nodes: [
      {id:'c1',col:0,row:0,code:'030103300',name:'Engineering Drawing',cat:'core', credits: '3(2-2-5)'},
      {id:'c2',col:0,row:1,code:'030513900',name:'Computer Programming',cat:'basic', credits: '3(2-2-5)'},
      {id:'c6',col:1,row:0,code:'030413100',name:'Electric Circuit Analysis I',cat:'basic', credits: '3(3-0-6)'},
      {id:'c7',col:1,row:1,code:'030513122',name:'Discrete Mathematics',cat:'core', credits: '3(3-0-6)'},
      {id:'c12',col:2,row:0,code:'030513334',name:'Digital Circuit and Logic Design',cat:'basic', credits: '3(2-2-5)'},
      {id:'c13',col:2,row:1,code:'030513335',name:'Microcontroller Systems',cat:'core', credits: '3(2-2-5)'},
      {id:'c16',col:3,row:0,code:'030513127',name:'Computer Architecture',cat:'core', credits: '3(3-0-6)'},
    ],
    edges: [['c6','c12'],['c12','c13'],['c13','c16']]
  },
  2: { // แขนงวิชาเครื่องมือวัดและควบคุม (EnET-I)
    nodes: [
      {id:'i1',col:0,row:0,code:'030103300',name:'Engineering Drawing',cat:'core', credits: '3(2-2-5)'},
      {id:'i2',col:0,row:1,code:'040113001',name:'Chemistry for Engineers',cat:'basic', credits: '3(3-0-6)'},
      {id:'i7',col:1,row:1,code:'030413100',name:'Electric Circuit Analysis I',cat:'basic', credits: '3(3-0-6)'},
      {id:'i8',col:1,row:2,code:'030513120',name:'Signal and System',cat:'core', credits: '3(3-0-6)'},
      {id:'i13',col:2,row:1,code:'030513331',name:'Industrial Sensor and Measurement',cat:'core', credits: '3(2-2-5)'},
      {id:'i18',col:3,row:1,code:'030513332',name:'Electronic Circuits for Inst.',cat:'core', credits: '3(2-2-5)'},
      {id:'i21',col:3,row:2,code:'030513911',name:'Embedded System for Inst.',cat:'core', credits: '3(2-2-5)'},
    ],
    edges: [['i7','i8'],['i7','i18'],['i8','i21'],['i13','i18']]
  },
  3: { // แขนงวิชาการกระจายเสียงวิทยุและโทรทัศน์ (EnET-B)
    nodes: [
      {id:'b1',col:0,row:0,code:'030103300',name:'Engineering Drawing',cat:'core', credits: '3(2-2-5)'},
      {id:'b7',col:1,row:0,code:'030413100',name:'Electric Circuit Analysis I',cat:'basic', credits: '3(3-0-6)'},
      {id:'b13',col:2,row:0,code:'030513330',name:'Television and Video Control System',cat:'core', credits: '3(2-2-5)'},
      {id:'b14',col:2,row:1,code:'030513334',name:'Digital Circuit and Logic Design',cat:'basic', credits: '3(2-2-5)'},
      {id:'b17',col:3,row:0,code:'030513141',name:'Radio and Television Engineering',cat:'core', credits: '3(3-0-6)'},
      {id:'b22',col:4,row:0,code:'030513148',name:'Digital Television System',cat:'core', credits: '3(3-0-6)'},
    ],
    edges: [['b7','b17'],['b14','b13'],['b17','b22']]
  }
}

const vueFlowData = ref(
  [0, 1, 2, 3].map(branchIndex => {
    const fm = FLOWMAPS[branchIndex] || { nodes: [], edges: [] };
    const headerNodes = FLOW_COLS_8.map((col, idx) => ({
      id: `header-${branchIndex}-${idx}`, type: 'semesterHeader',
      position: { x: idx * 260, y: 0 }, data: { label: col.label }, draggable: false, selectable: false
    }));
    const nodes = [
      ...headerNodes,
      ...fm.nodes.map((n: any) => ({
        id: n.id, type: 'customCourse', position: { x: n.col * 260, y: n.row * 100 + 100 },
        data: { name: n.name, code: n.code, cat: n.cat, credits: n.credits || '3(3-0-6)' }
      }))
    ];
    const edges = fm.edges.map((e: any) => ({
      id: `e-${e[0]}-${e[1]}`, source: e[0], target: e[1], 
      sourceHandle: 'right', targetHandle: 'left', animated: true,
      style: { stroke: '#9C7853', strokeWidth: 2.5 }, 
      markerEnd: { type: MarkerType.ArrowClosed, color: '#9C7853' } 
    }));
    return { nodes, edges };
  })
)

const MOCK_COURSES = [
  { code: '030103300', name: 'Engineering Drawing', cat: 'core', credits: '3(2-2-5)' },
  { code: '040113001', name: 'Chemistry for Engineers', cat: 'basic', credits: '3(3-0-6)' },
  { code: '040203111', name: 'Engineering Mathematics I', cat: 'basic', credits: '3(3-0-6)' },
  { code: '030413100', name: 'Electric Circuit Analysis I', cat: 'core', credits: '3(3-0-6)' },
  { code: '030513900', name: 'Computer Programming', cat: 'core', credits: '3(2-2-5)' },
  { code: '030513120', name: 'Signal and System', cat: 'core', credits: '3(3-0-6)' },
  { code: '030513122', name: 'Discrete Mathematics', cat: 'core', credits: '3(3-0-6)' },
  { code: '030513334', name: 'Digital Circuit and Logic Design', cat: 'basic', credits: '3(2-2-5)' },
  { code: '030513904', name: 'Cybersecurity', cat: 'elective', credits: '3(2-2-5)' },
  { code: '030513260', name: 'Co-operative Education', cat: 'field', credits: '6(540 hours)' }
]
const selectedCourses = ref(['', '', '', ''])

const addCourseNode = (branchIndex: number) => {
  const selectedCode = selectedCourses.value[branchIndex]
  if (!selectedCode) return alert('Please select a course to add')
  const courseInfo = MOCK_COURSES.find(c => c.code === selectedCode)
  if (!courseInfo) return

  const existingNodesInCol0 = vueFlowData.value[branchIndex].nodes.filter(n => n.position.x === 0 && n.type !== 'semesterHeader')
  let newY = 100
  if (existingNodesInCol0.length > 0) {
    const maxY = Math.max(...existingNodesInCol0.map(n => n.position.y))
    newY = maxY + 100 
  }

  const newNode = {
    id: `node_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    type: 'customCourse', position: { x: 0, y: newY }, 
    data: { name: courseInfo.name, code: courseInfo.code, cat: courseInfo.cat, credits: courseInfo.credits }
  }
  vueFlowData.value[branchIndex].nodes = [...vueFlowData.value[branchIndex].nodes, newNode]
}

const removeNode = (branchIndex: number, nodeId: string) => {
  vueFlowData.value[branchIndex].nodes = vueFlowData.value[branchIndex].nodes.filter(n => n.id !== nodeId)
  vueFlowData.value[branchIndex].edges = vueFlowData.value[branchIndex].edges.filter(e => e.source !== nodeId && e.target !== nodeId)
}

const onConnectEdge = (params: any, branchIndex: number) => {
  let src = params.source
  let tgt = params.target

  if (params.sourceHandle === 'target' && params.targetHandle === 'source') {
    src = params.target
    tgt = params.source
  } else if (params.sourceHandle === params.targetHandle) { return; }

  const edges = vueFlowData.value[branchIndex].edges
  const isDuplicate = edges.some(e => e.source === src && e.target === tgt)
  const isSelfLoop = src === tgt
  if (isDuplicate || isSelfLoop) return

  const newEdge = {
    id: `e-${src}-${params.sourceHandle}-${tgt}-${params.targetHandle}-${Date.now()}`,
    source: src, target: tgt,
    sourceHandle: params.sourceHandle, targetHandle: params.targetHandle,
    animated: true,
    style: { stroke: '#9C7853', strokeWidth: 2.5 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#9C7853' } 
  }
  vueFlowData.value[branchIndex].edges = [...edges, newEdge]
}

const onEdgeDoubleClick = (event: any, branchIndex: number) => {
  const edgeId = event.edge.id
  vueFlowData.value[branchIndex].edges = vueFlowData.value[branchIndex].edges.filter(e => e.id !== edgeId)
}

const draggedNodeInitialPos = ref<Record<string, {x: number, y: number}>>({})
const onNodeDragStart = (event: any) => { draggedNodeInitialPos.value[event.node.id] = { ...event.node.position } }
const onNodeDragStop = (event: any, branchIndex: number) => {
  const draggedNode = event.node
  const nodes = vueFlowData.value[branchIndex].nodes
  if (draggedNode.position.y < 100) {
    if (draggedNodeInitialPos.value[draggedNode.id]) draggedNode.position = { ...draggedNodeInitialPos.value[draggedNode.id] } 
    delete draggedNodeInitialPos.value[draggedNode.id]; return
  }
  const isOverlapping = nodes.some(n => n.id !== draggedNode.id && n.position.x === draggedNode.position.x && n.position.y === draggedNode.position.y)
  if (isOverlapping && draggedNodeInitialPos.value[draggedNode.id]) {
    draggedNode.position = { ...draggedNodeInitialPos.value[draggedNode.id] }
  }
  delete draggedNodeInitialPos.value[draggedNode.id]
}


// =======================================================
// 🌟 โซนเตรียมโครงสร้างให้ Backend (Save/Load Flow Maps) 
// =======================================================

const isLoading = ref(false)

// 1. ฟังก์ชันจัดฟอร์แมตข้อมูลเตรียมส่งให้ Backend
function buildFlowPayload() {
  // แพ็กข้อมูลทั้ง 4 แขนง (ขจัด Header ทิ้งไปก่อนส่ง)
  const branchesPayload = vueFlowData.value.map((branch, index) => {
    return {
      branch_index: index, // 0=T, 1=C, 2=I, 3=B
      nodes: branch.nodes.filter(n => n.type !== 'semesterHeader'), // Backend ไม่ต้องเก็บ Header
      edges: branch.edges
    }
  })
  return branchesPayload
}

// 2. ฟังก์ชันสมมติโหลดข้อมูลจาก Backend
async function loadFlowMaps(id: string | number) {
  isLoading.value = true
  try {
    // 💡 [สำหรับ Backend]: นำคอมเมนต์ออกเพื่อดึงข้อมูล Flow จาก API จริง
    // const response: any = await $fetch(`${API_BASE}/programs/${id}/flow-maps`)
    
    /* 
    if (response && response.branches) {
      // เอา Header ยัดกลับเข้าไปด้วย
      vueFlowData.value = response.branches.map((branch: any, i: number) => {
        const headerNodes = FLOW_COLS_8.map((col, idx) => ({
          id: `header-${i}-${idx}`, type: 'semesterHeader',
          position: { x: idx * 260, y: 0 }, data: { label: col.label }, draggable: false, selectable: false
        }));
        return {
          nodes: [...headerNodes, ...branch.nodes],
          edges: branch.edges
        }
      })
    } 
    */
  } catch (err) {
    console.error('Failed to load flow maps', err)
  } finally {
    isLoading.value = false
  }
}

// 3. ฟังก์ชันสมมติบันทึกข้อมูลลง Backend
async function saveFlowMaps(id: string | number) {
  const payload = buildFlowPayload()
  
  console.log("📤 [Backend Payload Prepared]:", JSON.stringify(payload, null, 2))
  
  // 💡 [สำหรับ Backend]: นำคอมเมนต์ออกเพื่อยิง PUT อัปเดตข้อมูล
  // await $fetch(`${API_BASE}/programs/${id}/flow-maps`, {
  //   method: 'PUT',
  //   body: { branches: payload }
  // })
}

// ================= ระบบบันทึก (ปรับให้ผูกกับ Backend) =================
const isSavingDraft = ref(false)
const isSavingNext = ref(false)

const saveDraft = async () => { 
  isSavingDraft.value = true; 
  try {
    if (programId.value) {
      await saveFlowMaps(programId.value) // เรียกฟังก์ชันบันทึก Flow
    }
    await new Promise(r => setTimeout(r, 600)); // จำลองดีเลย์
  } catch (err) {
    console.error(err)
  }
  isSavingDraft.value = false; 
}

const saveAndNext = async () => { 
  isSavingNext.value = true; 
  try {
    if (programId.value) {
      await saveFlowMaps(programId.value)
    }
    await new Promise(r => setTimeout(r, 600)); 
    router.push({ path: '/appendix/b', query: { id: programId.value } }) 
  } catch (err) {
    console.error(err)
  }
  isSavingNext.value = false; 
}

onMounted(() => { 
  if (route.query.id) { 
    programId.value = route.query.id as string 
    // loadFlowMaps(programId.value) // เรียกโหลดข้อมูลเมื่อเปิดหน้า
  }
  if (!import.meta.client) return
  ;(Object.keys(sectionTitles) as unknown as number[]).forEach((i) => {
    doneState.value[i] = localStorage.getItem(`done-sec-app-a-${i+1}`) === '1'
  })
})
</script>

<template>
  <div class="page-shell">
    <form @submit.prevent class="w-full">
      <div class="crumb"><span>เล่มหลักสูตร</span> › <b>ภาคผนวก</b> › <b class="text-[var(--c-primary)] font-semibold">ภาคผนวก ก.</b></div>
      <div class="doc-head"><div class="doc-eyebrow">ภาคผนวก ก.</div><h1 class="doc-title">แผนภูมิแสดงความต่อเนื่องของหลักสูตร</h1></div>

      <div v-if="!isFocused" class="toc-card">
        <div class="toc-label">หัวข้อในหน้านี้ — คลิกเพื่อเลือกกรอกทีละหัวข้อ</div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-[4px_18px]">
          <div v-for="(title, i) in sectionTitles" :key="i" class="toc-item" :class="{ 'filled': doneState[i] }" @click="focusAnchor(`sec-app-a-${i+1}`)">
            <div class="toc-dot"></div><span class="toc-num">ก.{{ i + 1 }}</span><span class="lbl">{{ title.replace('แผนภูมิความต่อเนื่อง — ', '') }}</span>
          </div>
        </div>
      </div>

      <FocusNav :is-focused="isFocused" :current-index="currentIndex" :total="steps.length" :steps="steps" @show-all="showAll" />

      <div class="paper-card">
        <!-- Loop สร้างทั้ง 4 แขนงวิชา -->
        <section v-for="(title, i) in sectionTitles" :key="i" :id="`sec-app-a-${i+1}`" v-show="isVisible(`sec-app-a-${i+1}`)" class="topic-sec">
          <div class="sec-head">
            <div class="sec-number text-[var(--c-primary)]">ก.{{ i + 1 }}</div>
            <div class="flex-1 flex flex-col md:flex-row md:justify-between md:items-start gap-2">
              <h2 class="sec-title pt-1">{{ title }}</h2>
              <button type="button" class="sec-check" :class="{ 'on': doneState[i] }" @click="toggleDone(i)">{{ doneState[i] ? '✓ กรอกแล้ว' : 'ทำเครื่องหมายว่ากรอกแล้ว' }}</button>
            </div>
          </div>

          <div class="sec-body mt-4 px-0 md:px-0">
            <!-- 🌟 ตัวควบคุมการเพิ่มรายวิชา -->
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#F8F5F0] p-4 rounded-xl border border-[var(--c-border)] mb-4 gap-4">
              <div class="flex-1 w-full">
                <label class="block text-[13px] text-[var(--c-gold)] font-bold mb-1">เลือกรายวิชาที่มีในหลักสูตร (จากหมวด 3) เพื่อนำมาวางในแผนภูมิ</label>
                <div class="flex gap-2">
                  <select v-model="selectedCourses[i]" class="flex-1 !py-2 !text-[14px]">
                    <option value="" disabled>-- Select a course to add --</option>
                    <option v-for="c in MOCK_COURSES" :key="c.code" :value="c.code">[{{ c.code }}] {{ c.name }}</option>
                  </select>
                  <button type="button" @click="addCourseNode(i)" class="add-node-btn">
                    <UIcon name="i-heroicons-plus" class="w-5 h-5" /> เพิ่มลงตาราง
                  </button>
                </div>
              </div>
            </div>

            <div class="flow-legend mb-3 pl-2 flex gap-4 flex-wrap">
              <div v-for="(color, cat) in CAT_COLOR" :key="cat" class="it flex items-center gap-2 text-[14px] text-gray-600">
                <div class="sw w-3 h-3 rounded-[3px]" :style="{ background: color }"></div>{{ CAT_LABEL[cat] }}
              </div>
            </div>

            <!-- 🌟 กระดาน Vue Flow (Loose Mode ทำให้ลากจุดไหนไปจุดไหนก็ได้) -->
            <div class="vue-flow-container relative">
              <!-- Loading Overlay ถ้าข้อมูลจริงจาก Backend กำลังโหลด -->
              <div v-if="isLoading" class="absolute inset-0 bg-white/50 backdrop-blur-sm z-50 flex items-center justify-center font-bold text-gray-500">
                กำลังโหลดข้อมูล...
              </div>

              <VueFlow 
                :id="`vf-branch-${i}`"
                v-model:nodes="vueFlowData[i].nodes" 
                v-model:edges="vueFlowData[i].edges" 
                :default-viewport="{ zoom: 0.85 }" 
                :min-zoom="0.2" :max-zoom="2" 
                :snap-to-grid="true"
                :snap-grid="[260, 100]"
                :connection-mode="ConnectionMode.Loose" 
                @connect="onConnectEdge($event, i)"
                @edge-double-click="onEdgeDoubleClick($event, i)"
                @node-drag-start="onNodeDragStart"
                @node-drag-stop="onNodeDragStop($event, i)"
                fit-view-on-init
              >
                <Background pattern-color="#DCD7C9" :gap="20" />
                <MiniMap pannable zoomable />
                <Controls />

                <!-- หัวตาราง -->
                <template #node-semesterHeader="props">
                  <div class="header-node">{{ props.data.label }}</div>
                </template>

                <!-- 🌟 Custom Node กล่องรายวิชา (มีจุดเชื่อม 4 ทิศทาง) -->
                <template #node-customCourse="props">
                  <div class="pdf-node">
                    
                    <!-- 🌟 ใส่ Handle ครบทั้ง 4 ด้าน เพื่อการโยงเส้นที่อิสระ 100% -->
                    <Handle id="top" type="source" :position="Position.Top" class="custom-handle top" />
                    <Handle id="left" type="source" :position="Position.Left" class="custom-handle left" />
                    <Handle id="right" type="source" :position="Position.Right" class="custom-handle right" />
                    <Handle id="bottom" type="source" :position="Position.Bottom" class="custom-handle bottom" />
                    
                    <div class="pdf-node-top" :data-cat="props.data.cat">
                      <input v-model="props.data.code" class="nodrag node-input code" placeholder="รหัสวิชา" />
                      <input v-model="props.data.credits" class="nodrag node-input credits" placeholder="หน่วยกิต" />
                    </div>
                    <div class="pdf-node-bot">
                      <input v-model="props.data.name" class="nodrag node-input name" placeholder="ชื่อวิชา" />
                    </div>

                    <button type="button" class="del-btn" @click.stop="removeNode(i, props.id)"><UIcon name="i-heroicons-trash" class="w-4 h-4" /></button>
                  </div>
                </template>
              </VueFlow>
            </div>
            
            <p class="text-[var(--fs-hint)] text-[var(--c-text-muted)] mt-3 text-center">
              <UIcon name="i-heroicons-light-bulb" class="w-4 h-4 mr-1 inline text-[var(--c-gold)]"/>
              <b>คำแนะนำ:</b> ลากจัดเรียงกล่องได้ตามอิสระ | <b>ลากเส้นได้จากทั้ง 4 ทิศทาง</b> | <b>ดับเบิ้ลคลิก</b> ที่เส้นลูกศรเพื่อ <b>ลบเส้น</b> ทิ้ง
            </p>

          </div>
        </section>
      </div>

      <FocusFooter :is-focused="isFocused" :current-index="currentIndex" :steps="steps" @prev="prevStep" @next="nextStep" />

      <div class="page-footer">
        <button type="button" @click="router.push(`/number8?id=${programId || ''}`)" class="nav-btn">← <span>การประเมินและปรับปรุงฯ</span></button>
        <div class="flex flex-col md:flex-row gap-3">
          <!-- 🌟 เมื่อกดปุ่ม ระบบจะ console.log ข้อมูล JSON สำหรับ Backend ให้ดู -->
          <button type="button" @click="saveDraft()" :disabled="isSavingDraft" class="nav-btn"><UIcon name="i-heroicons-document-text" class="w-4 h-4 mr-1" /> {{ isSavingDraft ? 'กำลังบันทึก...' : 'บันทึกฉบับร่าง' }}</button>
          <button type="button" @click="saveAndNext()" :disabled="isSavingNext" class="btn-brass force-white-btn" style="border:none;border-radius:8px;padding:10px 16px;font-size:13px;font-weight:600;display:flex;align-items:center;gap:8px;cursor:pointer;">
            <span style="color:#ffffff !important;">{{ isSavingNext ? 'กำลังบันทึก...' : 'ภาคผนวก ข. รหัสวิชา/ปริญญา' }}</span> <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<style scoped>
.add-node-btn {
  background: var(--c-primary);
  color: #fff;
  padding: 6px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s;
  height: 42px;
  white-space: nowrap;
}
.add-node-btn:hover { background: var(--c-primary-hover); }

/* พื้นที่สำหรับใส่ Vue Flow */
.vue-flow-container {
  height: 750px;
  width: 100%;
  border: 1px solid var(--c-border);
  border-radius: 12px;
  background-color: #ffffff; 
  overflow: hidden;
  box-shadow: inset 0 2px 10px rgba(0,0,0,0.03);
}

/* Custom Node: หัวตาราง (ภาคการศึกษา) */
.header-node {
  font-family: 'Sarabun', sans-serif;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--c-text-muted);
  text-align: center;
  width: 220px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--c-border);
}

/* Custom Node: กล่องรายวิชา ถอดแบบจาก PDF */
.pdf-node {
  background: #ffffff;
  border: 1.5px solid #2D2D2D; 
  border-radius: 0px; 
  width: 220px;
  font-family: 'Sarabun', sans-serif;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
  transition: box-shadow 0.2s, transform 0.1s;
  position: relative;
}
.pdf-node:active {
  box-shadow: 0 8px 20px rgba(0,0,0,0.15);
  transform: scale(1.02);
  z-index: 10;
}

.pdf-node-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 6px;
  font-size: 12px;
  font-weight: 700;
  border-bottom: 1.5px solid #2D2D2D;
}
.pdf-node-top[data-cat="gened"] { background: #FFFFFF; color: #2D2D2D; } 
.pdf-node-top[data-cat="basic"] { background: #FFFFFF; color: #2D2D2D; } 
.pdf-node-top[data-cat="core"] { background: #00BCD4; color: #000000; } 
.pdf-node-top[data-cat="elective"] { background: #00BCD4; color: #000000; } 
.pdf-node-top[data-cat="field"] { background: #FFFFFF; color: #2D2D2D; } 

.pdf-node-bot {
  padding: 8px;
  text-align: center;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.node-input {
  background: transparent;
  border: none !important;
  box-shadow: none !important;
  padding: 2px !important;
  text-align: center;
  outline: none;
}
.node-input:focus { background: rgba(255,255,255,0.8) !important; border-radius: 4px !important; }
.node-input.code { width: 55%; font-weight: 700; font-size: 12px; color: inherit !important; text-align: left;}
.node-input.credits { width: 40%; font-size: 11.5px; color: inherit !important; text-align: right;}
.node-input.name { width: 100%; font-size: 13px; font-weight: 500; color: #2D2D2D !important; line-height: 1.2; }

/* ปุ่มถังขยะสำหรับลบ */
.del-btn {
  position: absolute;
  top: -12px;
  right: -12px;
  width: 26px;
  height: 26px;
  background: #fff;
  border: 1px solid var(--c-danger);
  color: var(--c-danger);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;
}
.del-btn:hover { background: var(--c-danger); color: #fff; }
.pdf-node:hover .del-btn { opacity: 1; }

/* 🌟 Handle ทั้ง 4 ทิศทาง (ซ้าย ขวา บน ล่าง) */
.custom-handle {
  width: 12px !important;
  height: 12px !important;
  background: var(--c-gold) !important;
  border-radius: 50% !important;
  border: 2px solid #fff !important;
  box-shadow: 0 1px 4px rgba(0,0,0,0.2) !important;
  opacity: 0; transition: opacity 0.2s;
}
.pdf-node:hover .custom-handle { opacity: 1; }

/* จัดตำแหน่ง Handle ให้อยู่กึ่งกลางขอบของแต่ละด้าน */
.custom-handle.left { left: -6px; top: 50%; }
.custom-handle.right { right: -6px; top: 50%; }
.custom-handle.top { top: -6px; left: 50%; }
.custom-handle.bottom { bottom: -6px; left: 50%; }

/* ทำให้เส้นที่โยงอยู่สามารถกดได้ง่ายขึ้น */
:deep(.vue-flow__edge-path) {
  cursor: pointer;
}
:deep(.vue-flow__edge:hover .vue-flow__edge-path) {
  stroke: var(--c-danger) !important; 
  stroke-width: 3.5px !important;
}
</style>
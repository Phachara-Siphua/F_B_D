<!-- components/Sidebar.vue -->
<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import { TOC, TOTAL_SUBS, getSteps } from '~/constants/toc'
import { useRoute, useRouter } from '#app'

const route = useRoute()
const router = useRouter()

// 🌟 1. ล็อก ID ไว้ในหน่วยความจำ ไม่ให้หายเด็ดขาด
const lockedProgramId = ref('')

// คอยจับตาดู URL ถ้ามี id โผล่มา ให้จำไว้ทันที
watch(() => route.query.id, (newId) => {
  if (newId && typeof newId === 'string' && !newId.startsWith('new_')) {
    lockedProgramId.value = newId
  }
}, { immediate: true })

/** กลุ่มที่กางอยู่ */
const openKeys = ref<Set<string>>(new Set())

/** หา group ที่ตรงกับ route ปัจจุบัน */
const activeKey = computed(() => TOC.find(g => g.to === route.path)?.key ?? '')

/** กางกลุ่มของหน้าปัจจุบันอัตโนมัติ */
watch(activeKey, k => { if (k) openKeys.value.add(k) }, { immediate: true })

const isOpen = (key: string) => openKeys.value.has(key)

function toggleGroup(key: string, to: string) {
  if (isOpen(key) && activeKey.value === key) {
    openKeys.value.delete(key)
  } else {
    openKeys.value.add(key)
    if (route.path !== to) {
      // 🌟 2. แนบ id ที่ล็อกไว้ไปด้วยเสมอ
      router.push({ path: to, query: { id: lockedProgramId.value } })
    }
  }
  openKeys.value = new Set(openKeys.value)
}

function scrollToAnchor(anchor: string) {
  const el = document.getElementById(anchor)
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  el.classList.add('pulse-bg')
  setTimeout(() => el.classList.remove('pulse-bg'), 1200)
}

async function goToStep(to: string, anchor: string) {
  // 🌟 3. แนบ id ไปทุกครั้งที่คลิกหัวข้อย่อย
  const target = { path: to, query: { id: lockedProgramId.value }, hash: '#' + anchor }

  if (route.path !== to) {
    await router.push(target)
    setTimeout(() => scrollToAnchor(anchor), 150)
  } else if (route.hash !== '#' + anchor) {
    await router.replace(target)
    setTimeout(() => scrollToAnchor(anchor), 60)
  } else {
    scrollToAnchor(anchor)
  }
}

/* ---- ความคืบหน้า ---- */
const doneAnchors = ref<Set<string>>(new Set())

function refreshDone() {
  if (!import.meta.client) return
  const s = new Set<string>()
  TOC.forEach(g => g.subs.forEach(sub => {
    if (localStorage.getItem(`done-${sub.anchor}`) === '1') s.add(sub.anchor)
  }))
  doneAnchors.value = s
}

onMounted(() => {
  refreshDone()
  window.addEventListener('storage', refreshDone)
})
onUnmounted(() => {
  if (import.meta.client) window.removeEventListener('storage', refreshDone)
})
watch(() => route.path, () => setTimeout(refreshDone, 200))

const doneCount = computed(() => doneAnchors.value.size)
const groupDone = (key: string) => {
  const g = TOC.find(x => x.key === key)
  if (!g) return 0
  return g.subs.filter(s => doneAnchors.value.has(s.anchor)).length
}
</script>

<template>
  <aside class="sidebar custom-scrollbar">
    
    <!-- ความคืบหน้าโดยรวม -->
    <div class="progress-wrap">
      <div class="lab">
        <span>ความคืบหน้าโดยรวม</span>
        <span>{{ doneCount }}/{{ TOTAL_SUBS }} หัวข้อ</span>
      </div>
      <div class="progress-track">
        <div class="progress-fill" :style="{ width: Math.round((doneCount / TOTAL_SUBS) * 100) + '%' }"></div>
      </div>
    </div>

    <template v-for="(g, gi) in TOC" :key="g.key">
      <!-- คั่นหัวข้อ "ภาคผนวก" ก่อนกลุ่มภาคผนวกกลุ่มแรก -->
      <div v-if="g.appendix && !TOC[gi - 1]?.appendix" class="appendix-label">ภาคผนวก</div>

      <div
        class="comp-group"
        :class="{ active: activeKey === g.key, open: isOpen(g.key), done: groupDone(g.key) === g.subs.length }"
      >
        <div class="comp-head" @click="toggleGroup(g.key, g.to)">
          <div class="comp-no">{{ g.badge }}</div>
          <div class="comp-title">{{ g.title }}</div>
          <div class="comp-page-tag">{{ groupDone(g.key) }}/{{ g.subs.length }}</div>
          <div class="chev"></div>
        </div>

        <div class="sub-list" :style="{ maxHeight: isOpen(g.key) ? (getSteps(g.key).length * 40 + 60) + 'px' : '0px' }">
          <div
            v-for="step in getSteps(g.key)"
            :key="step.anchors[0]"
            class="sub-item"
            :class="{ filled: step.anchors.every(a => doneAnchors.has(a)) }"
            @click.stop="goToStep(g.to, step.anchors[0])"
          >
            <div class="sub-dot"></div>
            <span class="sub-num">{{ step.numRange ? step.numRange : ' ' }}</span>
            <span class="lbl">{{ step.label }}</span>
          </div>

          <!-- 🌟 4. ผูกลิงก์ภาพรวมเข้ากับ ID ที่ล็อกไว้ -->
          <NuxtLink :to="{ path: g.to, query: { id: lockedProgramId } }" class="sub-item overview-link" @click.stop>
            <div class="sub-dot" style="background: transparent"></div>
            <span class="sub-num"> </span>
            <span class="lbl">☰ ดูภาพรวมทั้งหมดของหมวดนี้</span>
          </NuxtLink>
        </div>
      </div>
    </template>

  </aside>
</template>

<style scoped>
/* ==========================================
   🎨 KMUTNB Theme สำหรับ Sidebar
========================================== */
.sidebar {
  width: 320px; flex: none; 
  background: #2D2D2D; 
  color: #DCD7C9; 
  overflow-y: auto; padding: 14px 0 30px; 
  border-right: 1px solid rgba(255,255,255,.05);
}

.progress-wrap { padding: 4px 18px 16px; border-bottom: 1px solid rgba(255,255,255,.06); margin-bottom: 8px; }
.progress-wrap .lab { display: flex; justify-content: space-between; font-size: 12.5px; color: #9A9A9A; margin-bottom: 7px; }
.progress-track { height: 6px; border-radius: 4px; background: rgba(0,0,0,.25); overflow: hidden; }
.progress-fill { height: 100%; background: linear-gradient(90deg, #9C7853, #D9B679); border-radius: 4px; transition: width .4s ease; }

.comp-group { border-bottom: 1px solid rgba(255,255,255,.06); }
.comp-head { display: flex; align-items: center; gap: 12px; padding: 14px 18px; cursor: pointer; user-select: none; transition: background 0.2s; }
.comp-head:hover { background: rgba(255,255,255,.03); }

.comp-no {
  width: 26px; height: 26px; flex: none; border-radius: 50%; border: 1.5px solid rgba(255,255,255,.15);
  display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700;
  color: #DCD7C9; font-family: 'Noto Serif Thai', serif; transition: all 0.2s;
}
.comp-group.done .comp-no { background: #2E7D32; border-color: #2E7D32; color: #fff; }
.comp-group.active .comp-no { background: #9C7853; border-color: #9C7853; color: #fff; }

.comp-title { flex: 1; font-size: 16px; line-height: 1.4; color: #EFEFEF; }
.comp-group.active .comp-title { color: #fff; font-weight: 700; }

.comp-page-tag {
  font-size: 11px; color: #9A9A9A; flex: none; font-weight: 600;
  background: rgba(0,0,0,.2); padding: 3px 10px; border-radius: 20px; transition: all 0.2s;
}
.comp-group.active .comp-page-tag { color: #F8F5F0; background: #9C7853; }

.chev {
  width: 8px; height: 8px; flex: none;
  border-right: 2px solid #737373; border-bottom: 2px solid #737373;
  transform: rotate(45deg); transition: transform .2s ease; margin-left: 2px;
}
.comp-group.open .chev { transform: rotate(-135deg); border-color: #9A9A9A; }

.sub-list { overflow: hidden; transition: max-height .3s ease-in-out; }
.sub-item {
  display: flex; align-items: center; gap: 10px; padding: 9px 18px 9px 48px;
  font-size: 13.5px; cursor: pointer; color: #e0e0e0;
  text-decoration: none; transition: background 0.2s;
}
.sub-item:hover { background: rgba(255,255,255,.03); color: #EFEFEF; }
.sub-item.filled .sub-dot { background: #2E7D32; }
.sub-dot { width: 7px; height: 7px; border-radius: 50%; background: #555555; flex: none; }
.sub-num { font-size: 11.5px; color: #e0e0e0; flex: none; font-family: 'Noto Serif Thai', serif; min-width: 32px; font-weight: 600; }
.sub-item .lbl { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.overview-link { opacity: .7; font-weight: 500; }
.overview-link:hover { opacity: 1; }

.appendix-label {
  padding: 18px 18px 6px; font-size: 12px; letter-spacing: .08em; font-weight: 700;
  color: #737373; text-transform: uppercase;
}
</style>
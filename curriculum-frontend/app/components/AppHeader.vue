<!-- components/AppHeader.vue -->
<script setup lang="ts">
const route = useRoute()

withDefaults(defineProps<{
  programTitle?: string
  programSubtitle?: string
}>(), {
  programTitle: 'AI-Powered Curriculum Management System',
  programSubtitle: 'ระบบบริหารจัดการการจัดทำ เล่มหลักสูตรด้วย ปัญญาประดิษฐ์'
})
</script>

<template>
  <header class="app-header">
    <!-- 🌟 เปลี่ยนเป็น NuxtLink ให้กดกลับหน้าแรกได้ (to="/") -->
    <NuxtLink to="/" class="mark hover:scale-105 transition-transform duration-200" title="กลับหน้าแรก">C</NuxtLink>
    
    <div class="titles">
      <b>{{ programTitle }}</b>
      <span>{{ programSubtitle }}</span>
    </div>
    
    <div class="flex-1"></div>
    
    <template v-if="route.path !== '/'">
      <div class="save-state hidden md:flex">
        <span class="dot"></span> บันทึกอัตโนมัติแล้ว
      </div>
      <button type="button" class="btn btn-ghost hidden md:flex">
        <UIcon name="i-heroicons-eye" class="w-4 h-4" /> ดูตัวอย่างเล่ม
      </button>
      <button type="button" class="btn btn-brass">
        <UIcon name="i-heroicons-arrow-down-tray" class="w-4 h-4" /> ส่งออกเป็น Word
      </button>
    </template>
    
  </header>
</template>

<style scoped>
/* ==========================================
   🎨 KMUTNB Theme สำหรับ Header
========================================== */
.app-header {
  height: 68px; 
  flex: none; display: flex; align-items: center; gap: 18px;
  padding: 0 24px; 
  background: #9C7853; 
  border-bottom: 1px solid rgba(255,255,255,.05);
  box-shadow: 0 2px 8px rgba(0,0,0,.15); 
  z-index: 20;
}

/* โลโก้ตัว C */
.mark {
  width: 44px; 
  height: 44px; 
  border: 2.5px solid #2D2D2D; 
  background: rgba(45, 45, 45, 0.15); 
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-family: 'Noto Serif Thai', serif; 
  font-weight: 700; 
  font-size: 22px; 
  color: #F8F5F0; 
  flex: none;
  cursor: pointer;
  text-decoration: none;
}

.titles { display: flex; flex-direction: column; line-height: 1.3; overflow: hidden; }
.titles b {
  font-size: 16px; font-weight: 600; white-space: nowrap; text-overflow: ellipsis; overflow: hidden;
  color: #ffffff !important; letter-spacing: 0.02em;
}
.titles span {
  font-size: 13px; color: #ffffff !important; opacity: 0.9; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

.save-state { font-size: 13.5px; color: #EFEFEF !important; align-items: center; gap: 8px; font-weight: 500; margin-right: 12px; }
.save-state .dot {
  width: 8px; height: 8px; border-radius: 50%; background: #4CAF50;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.2);
}

.btn {
  border: none; border-radius: 8px; padding: 10px 18px; font-size: 14.5px; font-weight: 600;
  display: inline-flex; align-items: center; gap: 8px; transition: all .15s ease;
  cursor: pointer;
}
.btn:active { transform: translateY(1px); }

.btn-ghost { background: rgba(255,255,255,.05); color: #F8F5F0 !important; border: 1px solid rgba(255,255,255,.2); }
.btn-ghost:hover { background: rgba(255,255,255,.15); color: #fff !important; }

.btn-brass { background: #2D2D2D; color: #ffffff !important; }
.btn-brass:hover { background: #1A1A1A; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3); }
</style>
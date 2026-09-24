<!-- layouts/default.vue -->
<script setup lang="ts">
// Nuxt จะรู้จัก useRoute() เองอัตโนมัติ
const route = useRoute()
</script>

<template>
  <div class="shell">
    <AppHeader />

    <div class="body-row">
      <!-- ซ่อน Sidebar ถ้า URL เป็นหน้าแรกสุด ('/') -->
      <Sidebar v-if="route.path !== '/'" />

      <!-- เพิ่ม class จัดหน้าให้สวยงามเมื่อไม่มี Sidebar -->
      <main id="main-scroll" class="main custom-scrollbar" :class="{ 'no-sidebar-mode': route.path === '/' }">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
.shell { display: flex; flex-direction: column; height: 100vh; }
.body-row { flex: 1; display: flex; min-height: 0; }
.main { flex: 1; overflow-y: auto; padding: 34px 26px 90px; scroll-behavior: smooth; }

/* 🌟 แก้ไขตรงนี้: เอา display: flex และ center ออก เพื่อให้เนื้อหาไล่จากบนลงล่างตามปกติ */
.main.no-sidebar-mode {
  padding: 0;
  display: block; 
  background-color: #F3EFE4; 
}

.main::-webkit-scrollbar { width: 10px; }
.main::-webkit-scrollbar-thumb { background: rgba(27,42,74,.18); border-radius: 5px; }
</style>
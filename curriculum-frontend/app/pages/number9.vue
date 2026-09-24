<script setup lang="ts">
import { ref } from 'vue'

const form = ref({
  stdGrad: '',
  stdStudent: '',
  stdFaculty: '',
  teachingQuality: '',
  learningSupport: '',
  kpis: '',
  qualityPlan: '',
  riskMgmt: '',
  complaints: '',
  dataReview: '',
  communication: ''
})
</script>

<template>
  <UForm :state="form" class="p-4 md:p-8">
    <UCard class="w-full shadow-md" :ui="{ root: 'bg-white', header: 'bg-blue-950 p-4' }">
      <template #header>
        <p class="text-white font-semibold text-lg">
          องค์ประกอบที่ 8-9: การประกันคุณภาพและการพัฒนาหลักสูตร
        </p>
      </template>

      <div class="space-y-6">
        <UDivider label="องค์ประกอบที่ 8: การประกันคุณภาพหลักสูตร" class="mb-4 text-blue-950 font-bold" />
        
        <UFormField label="การกำกับมาตรฐาน (บัณฑิต)" :ui="{ label: 'text-blue-950 font-bold text-base' }">
          <UTextarea v-model="form.stdGrad" placeholder="ระบุมาตรฐานและการควบคุมคุณภาพบัณฑิต" :rows="2" class="w-full bg-gray-50" />
        </UFormField>

        <UFormField label="การกำกับมาตรฐาน (นักศึกษา)" :ui="{ label: 'text-blue-950 font-bold text-base' }">
          <UTextarea v-model="form.stdStudent" placeholder="ระบุมาตรฐานและการควบคุมคุณภาพนักศึกษา" :rows="2" class="w-full bg-gray-50" />
        </UFormField>

        <UFormField label="การกำกับมาตรฐาน (อาจารย์)" :ui="{ label: 'text-blue-950 font-bold text-base' }">
          <UTextarea v-model="form.stdFaculty" placeholder="ระบุมาตรฐานและการควบคุมคุณภาพอาจารย์" :rows="2" class="w-full bg-gray-50" />
        </UFormField>

        <UFormField label="ตัวบ่งชี้ผลการดำเนินงาน (KPIs)" :ui="{ label: 'text-blue-950 font-bold text-base' }">
          <UTextarea v-model="form.kpis" placeholder="ระบุ KPIs เช่น อัตราการสำเร็จการศึกษา อัตราการมีงานทำ ฯลฯ" :rows="3" class="w-full bg-gray-50" />
        </UFormField>

        <UDivider label="องค์ประกอบที่ 9: ระบบและกลไกในการพัฒนาหลักสูตร" class="mt-8 mb-4 text-blue-950 font-bold" />

        <UFormField label="การวางแผนคุณภาพและการควบคุมคุณภาพ" :ui="{ label: 'text-blue-950 font-bold text-base' }">
          <UTextarea v-model="form.qualityPlan" placeholder="ระบุแผนและการควบคุมคุณภาพหลักสูตร" :rows="3" class="w-full bg-gray-50" />
        </UFormField>

        <UFormField label="การบริหารความเสี่ยง" :ui="{ label: 'text-blue-950 font-bold text-base' }">
          <UTextarea v-model="form.riskMgmt" placeholder="ระบุความเสี่ยงที่อาจเกิดขึ้นและแนวทางบริหารจัดการ" :rows="3" class="w-full bg-gray-50" />
        </UFormField>

        <div class="mt-8 flex">
          <UButton class="bg-yellow-500 hover:bg-yellow-600 text-blue-950 px-6 py-2 text-base font-bold">บันทึกข้อมูลและส่งออก</UButton>
        </div>
      </div>
    </UCard>
  </UForm>
</template>
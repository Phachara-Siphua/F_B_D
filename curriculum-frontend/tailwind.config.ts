// tailwind.config.ts
import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#1a2744',       // สีกรมท่าหลัก (AppHeader, Sidebar, Header Card)
          navylight: '#243360',  // สีกรมท่าสว่าง (Hover หรือพื้นหลังย่อย)
          gold: '#c8a84b',       // สีทองหลัก (ปุ่มสำคัญ, Badge, Text เน้น)
          goldlight: '#e8c96a',  // สีทองสว่าง (Hover)
          cream: '#faf8f4',      // สีพื้นหลังฟอร์มที่ดูสบายตา
          border: '#d8d2c6',     // สีเส้นขอบ
        }
      },
      fontFamily: {
        sans: ['Sarabun', 'IBM Plex Sans Thai', 'sans-serif'], // ตั้งค่าฟอนต์หลัก
      }
    }
  }
}
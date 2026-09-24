// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/ui'],
  css: ['~/assets/css/main.css'],
  ui:{
    colorMode:false
  },
  runtimeConfig: {
     public: {
       apiBase: 'http://localhost:8000' // or your deployed API URL
     }
   },
})

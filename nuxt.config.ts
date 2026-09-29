// Public Firebase web config; .env overrides it with the emulator project.
export default defineNuxtConfig({
  compatibilityDate: '2026-09-01',
  devtools: { enabled: false },
  css: ['~/assets/styles/main.scss'],

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      title: 'Project Vita',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
        { name: 'theme-color', content: '#5c3d21' },
        { name: 'description', content: "Project Vita's student-run food stall notice board." },
      ],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    },
  },

  runtimeConfig: {
    public: {
      firebase: {
        apiKey: 'AIzaSyD036Lki5xBuXnKAIeQw2C_CN32jpYr13s',
        authDomain: 'vita-35822.firebaseapp.com',
        projectId: 'vita-35822',
        storageBucket: 'vita-35822.firebasestorage.app',
        appId: '1:254392075217:web:68d618d28fb858cd5e16f0',
      },
      useEmulators: false,
    },
  },

  $development: {
    nitro: { plugins: ['~~/server/dev/seed-emulator.ts'] },
  },

  routeRules: {
    '/admin/**': { ssr: false },
    '/pos/**': { ssr: false },
    '/wall': { redirect: '/#wall' },
    '/stalls/**': { redirect: '/stall/**' },
  },
})

// Overridden by NUXT_PUBLIC_FIREBASE_* (apphosting.yaml, .env).
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
        apiKey: '',
        authDomain: '',
        projectId: 'demo-vita',
        storageBucket: '',
        appId: '',
      },
      useEmulators: false,
    },
  },

  routeRules: {
    '/admin/**': { ssr: false },
    '/pos/**': { ssr: false },
    '/wall': { redirect: '/#wall' },
    '/stalls/**': { redirect: '/stall/**' },
  },
})

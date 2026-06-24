// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  srcDir: 'app/',

  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxt/image',
  ],

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE ?? 'http://localhost:1337/api',
    },
  },

  tailwindcss: {
    cssPath: '~/assets/css/main.css',
    configPath: '~/../../tailwind.config.ts',
  },

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      title: 'Mandaditoz — Directorio de Etzatlán',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: 'Encuentra negocios y servicios locales en Etzatlán, Jalisco. Gratis para todos.',
        },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,700&family=Inter:wght@400;500;600&display=swap',
        },
      ],
    },
  },

  devtools: { enabled: true },
})

// https://nuxt.com/docs/api/configuration/nuxt-config
const isMobile = process.env.NUXT_MOBILE === '1'

export default defineNuxtConfig({
  srcDir: 'app/',
  serverDir: 'server/',
  ssr: !isMobile,
  nitro: isMobile
    ? { preset: 'static', prerender: { crawlLinks: false, routes: ['/'] } }
    : undefined,
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxt/image',
    '@nuxtjs/sitemap',
  ],

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE ?? 'http://localhost:1337/api',
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL ?? 'https://mandaditoz.com',
      clarityId: process.env.NUXT_PUBLIC_CLARITY_ID ?? '',
    },
  },

  site: {
    url: process.env.NUXT_PUBLIC_SITE_URL ?? 'https://mandaditoz.com',
    name: 'Mandaditoz',
  },

  sitemap: {
    sources: ['/api/__sitemap__/urls'],
    exclude: [
      '/negocios/**',
      '/login',
      '/reset-password',
      '/mis-negocios',
      '/cuenta/**',
    ],
    defaults: {
      changefreq: 'weekly',
      priority: 0.7,
    },
  },

  tailwindcss: {
    cssPath: '~/assets/css/main.css',
    configPath: '~/../../tailwind.config.ts',
  },

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      title: 'Mandaditoz — Directorio de negocios locales',
      htmlAttrs: { lang: 'es-MX' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: 'Encuentra negocios y servicios locales de tu municipio en Jalisco. Gratis para todos.',
        },

        // Open Graph (Facebook, WhatsApp, LinkedIn, Telegram)
        { property: 'og:site_name', content: 'Mandaditoz' },
        { property: 'og:type', content: 'website' },
        { property: 'og:title', content: 'Mandaditoz — Directorio de negocios locales' },
        { property: 'og:description', content: 'Encuentra negocios y servicios locales de tu municipio en Jalisco. Gratis para todos.' },
        { property: 'og:image', content: 'https://mandaditoz.com/og-default.jpg' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:image:alt', content: 'Mandaditoz — Directorio de negocios locales' },
        { property: 'og:locale', content: 'es_MX' },
        { property: 'og:url', content: 'https://mandaditoz.com' },

        // Twitter / X
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Mandaditoz — Directorio de negocios locales' },
        { name: 'twitter:description', content: 'Encuentra negocios y servicios locales de tu municipio en Jalisco.' },
        { name: 'twitter:image', content: 'https://mandaditoz.com/og-default.jpg' },
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

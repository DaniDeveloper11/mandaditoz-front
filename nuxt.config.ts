// https://nuxt.com/docs/api/configuration/nuxt-config
const isMobile = process.env.NUXT_MOBILE === '1'

export default defineNuxtConfig({
  srcDir: 'app/',
  serverDir: 'server/',
  ssr: !isMobile,
  nitro: isMobile
    ? { preset: 'static', prerender: { crawlLinks: false, routes: ['/'] } }
    : undefined,
  // Solo afecta a `npm run dev`: deja abrir el servidor local por un túnel de
  // ngrok (para probar en un iPhone real). El punto inicial acepta cualquier subdominio.
  vite: {
    server: { allowedHosts: ['.ngrok-free.app'] },
  },

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
      // Client ID "Aplicación web" de Google Cloud. Vacío = sin botón de Google:
      // el formulario de correo sigue funcionando solo.
      googleClientId: process.env.NUXT_PUBLIC_GOOGLE_CLIENT_ID ?? '',
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
      // Búsqueda con filtros: duplica /[city] y /[city]/[categoria], que son
      // las versiones indexables. La página lleva noindex.
      '/list',
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

        // Open Graph (Facebook, WhatsApp, LinkedIn, Telegram).
        // og:url y og:image dependen de la ruta: van en app.vue.
        { property: 'og:site_name', content: 'Mandaditoz' },
        { property: 'og:type', content: 'website' },
        { property: 'og:title', content: 'Mandaditoz — Directorio de negocios locales' },
        { property: 'og:description', content: 'Encuentra negocios y servicios locales de tu municipio en Jalisco. Gratis para todos.' },
        { property: 'og:locale', content: 'es_MX' },

        // Twitter / X: sin title/description/image fijos. X usa los og:* cuando
        // faltan, y unos fijos aquí se quedaban con el texto del home en las
        // páginas que solo definen og:title (municipio, categoría, eventos).
        { name: 'twitter:card', content: 'summary_large_image' },

        // iOS "Agregar a inicio" (ver /instalar): nombre bajo el ícono y abrir sin barra de Safari.
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-title', content: 'Mandaditoz' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
        { name: 'theme-color', content: '#1D5A8A' },
      ],
      link: [
        // Favicon: SVG para navegadores modernos (cambia con modo oscuro), .ico de respaldo
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'icon', href: '/favicon.ico', sizes: '32x32' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/site.webmanifest' },
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

<script setup>
// Defaults de vista previa (WhatsApp/Facebook) que dependen de la ruta.
// Viven aquí y no en nuxt.config porque ahí son fijos: og:url apuntaba siempre
// al home, y Facebook trataba /contacto o /terminos como si fueran la portada.
// Las páginas que comparten otra imagen deben pisar también width/height/alt
// (o mandarlos en null), si no se quedan los de og-default.jpg.
const route = useRoute()
const siteUrl = String(useRuntimeConfig().public.siteUrl ?? '').replace(/\/$/, '')

useSeoMeta({
  ogUrl: () => (route.path === '/' ? siteUrl : `${siteUrl}${route.path}`),
  ogImage: `${siteUrl}/og-default.jpg`,
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogImageType: 'image/jpeg',
  ogImageAlt: 'Mandaditoz — Directorio de negocios locales',
})
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

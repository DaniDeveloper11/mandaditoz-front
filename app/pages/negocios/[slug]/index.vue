<script setup>
import { businessUrl } from '~/utils/urls'

/**
 * Ruta legacy /negocios/[slug]. El server middleware
 * `legacy-business-redirect.js` intercepta ANTES de renderizar y hace 301 a
 * /[city]/[slug]. Este componente solo se muestra si el middleware no logró
 * resolver (Strapi caído o negocio inexistente) — hace fallback client-side.
 */
definePageMeta({ layout: 'landing' })

const route = useRoute()
const router = useRouter()
const slug = computed(() => route.params.slug)
const { negocio, pending, error } = useNegocio(slug)

watchEffect(() => {
  if (import.meta.client && negocio.value) {
    router.replace(businessUrl(negocio.value))
  }
})
</script>

<template>
  <div class="min-h-96 flex items-center justify-center">
    <div v-if="pending" class="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
    <div v-else-if="error || !negocio" class="text-center px-6 py-12">
      <p class="font-display font-black text-2xl text-brand-text">Negocio no encontrado</p>
      <a href="/list" class="btn-primary mt-4 inline-block">Ver directorio</a>
    </div>
  </div>
</template>

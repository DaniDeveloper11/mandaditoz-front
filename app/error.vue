<script setup>
/**
 * Página de error de Nuxt. Existe para que los `createError({ statusCode: 404 })`
 * de las rutas dinámicas se vean como el resto del sitio: sin ella, Nuxt muestra
 * su pantalla de error por defecto, sin marca.
 *
 * Nuxt monta este componente FUERA del layout, así que la cabecera y el pie no
 * están disponibles aquí — de ahí que la salida sea un enlace normal al inicio.
 *
 * El 503 es la pantalla de fuera de servicio: las páginas lo lanzan cuando Strapi
 * no responde, en lugar de un 404 que haría a Google desindexarlas. Mientras está
 * abierta, revisa la API cada 30 s y recarga sola cuando vuelve.
 */
import { MapPinOff, CloudOff, RotateCw } from '@lucide/vue'

const props = defineProps({
  error: { type: Object, default: () => ({}) },
})

const statusCode = computed(() => Number(props.error?.statusCode) || 500)
const isNotFound = computed(() => statusCode.value === 404)
const isFueraDeServicio = computed(() => statusCode.value === 503)

const titulo = computed(() => {
  if (isNotFound.value) return 'No encontramos esta página'
  if (isFueraDeServicio.value) return 'Volvemos en unos minutos'
  return 'Algo salió mal'
})

const detalle = computed(() => {
  if (isNotFound.value) return 'La dirección no existe o el negocio que buscas ya no está publicado.'
  if (isFueraDeServicio.value) {
    return 'Nuestro servicio no está respondiendo en este momento. Esta página se recargará sola en cuanto vuelva.'
  }
  return 'Tuvimos un problema al cargar esta página. Inténtalo de nuevo en un momento.'
})

useHead({
  title: computed(() => `${titulo.value} | Mandaditoz`),
  // Un 404 nunca debe indexarse, aunque Google llegue a él desde un enlace viejo.
  meta: [{ name: 'robots', content: 'noindex, follow' }],
})

// Retry-After le dice a Google (y a Cloudflare) que la caída es temporal.
if (import.meta.server && isFueraDeServicio.value) {
  const event = useRequestEvent()
  event?.node.res.setHeader('Retry-After', '300')
}

function reintentar() {
  window.location.reload()
}

// Consulta mínima a la API: si responde, el backend volvió y se recarga la página.
// No se usa `/_health` con `no-cors`: una respuesta opaca no distingue un 204 de
// un 502 del proxy de Railway.
const apiBase = useRuntimeConfig().public.apiBase
let timer = null

onMounted(() => {
  if (!isFueraDeServicio.value) return
  timer = setInterval(async () => {
    try {
      await $fetch(`${apiBase}/cities`, {
        query: { 'fields[0]': 'slug', 'pagination[pageSize]': 1 },
      })
      reintentar()
    } catch (_) {
      // Sigue caído: se vuelve a intentar en el siguiente ciclo.
    }
  }, 30_000)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div class="min-h-screen bg-white flex items-center justify-center px-6 py-16">
    <div class="text-center max-w-md">
      <CloudOff v-if="isFueraDeServicio" class="mx-auto size-12 text-brand-primary" />
      <MapPinOff v-else class="mx-auto size-12 text-brand-primary" />

      <p
        v-if="!isFueraDeServicio"
        class="mt-6 font-display font-black text-5xl text-brand-primary"
      >
        {{ statusCode }}
      </p>

      <h1 class="mt-2 font-display font-black text-2xl text-brand-text" :class="{ 'mt-6': isFueraDeServicio }">
        {{ titulo }}
      </h1>

      <p class="mt-3 text-brand-text-soft">
        {{ detalle }}
      </p>

      <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
        <template v-if="isFueraDeServicio">
          <button type="button" class="btn-primary inline-flex items-center gap-2" @click="reintentar">
            <RotateCw class="size-4" />
            Reintentar
          </button>
        </template>
        <template v-else>
          <a href="/" class="btn-primary">Ir al inicio</a>
          <a href="/list" class="btn-secondary">Ver el directorio</a>
        </template>
      </div>
    </div>
  </div>
</template>

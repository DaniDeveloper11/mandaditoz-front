<script setup>
/**
 * Página de error de Nuxt. Existe para que los `createError({ statusCode: 404 })`
 * de las rutas dinámicas se vean como el resto del sitio: sin ella, Nuxt muestra
 * su pantalla de error por defecto, sin marca.
 *
 * Nuxt monta este componente FUERA del layout, así que la cabecera y el pie no
 * están disponibles aquí — de ahí que la salida sea un enlace normal al inicio.
 */
import { MapPinOff } from '@lucide/vue'

const props = defineProps({
  error: { type: Object, default: () => ({}) },
})

const isNotFound = computed(() => Number(props.error?.statusCode) === 404)

const titulo = computed(() =>
  isNotFound.value ? 'No encontramos esta página' : 'Algo salió mal'
)

const detalle = computed(() =>
  isNotFound.value
    ? 'La dirección no existe o el negocio que buscas ya no está publicado.'
    : 'Tuvimos un problema al cargar esta página. Inténtalo de nuevo en un momento.'
)

useHead({
  title: computed(() => `${titulo.value} | Mandaditoz`),
  // Un 404 nunca debe indexarse, aunque Google llegue a él desde un enlace viejo.
  meta: [{ name: 'robots', content: 'noindex, follow' }],
})
</script>

<template>
  <div class="min-h-screen bg-white flex items-center justify-center px-6 py-16">
    <div class="text-center max-w-md">
      <MapPinOff class="mx-auto size-12 text-brand-primary" />

      <p class="mt-6 font-display font-black text-5xl text-brand-primary">
        {{ error?.statusCode ?? 500 }}
      </p>

      <h1 class="mt-2 font-display font-black text-2xl text-brand-text">
        {{ titulo }}
      </h1>

      <p class="mt-3 text-brand-text-soft">
        {{ detalle }}
      </p>

      <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
        <a href="/" class="btn-primary">Ir al inicio</a>
        <a href="/list" class="btn-secondary">Ver el directorio</a>
      </div>
    </div>
  </div>
</template>

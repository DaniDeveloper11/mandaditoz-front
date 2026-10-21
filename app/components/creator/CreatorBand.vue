<script setup>
import { Mic, ArrowRight } from '@lucide/vue'
import { creatorsUrl } from '~/utils/urls'

/**
 * Banda de voces del municipio, para las home (municipio y global).
 *
 * Se monta siempre pero NO renderiza nada si el municipio todavía no tiene
 * voces publicadas: una sección con el título puesto y cero tarjetas se lee
 * como que el sitio está roto. Mismo criterio —y mismo motivo— que EventBand.
 */
const props = defineProps({
  citySlug: { type: String, required: true },
  titulo: { type: String, default: 'Voces del municipio' },
  subtitulo: { type: String, default: null },
  limite: { type: Number, default: 3 },
  // La home global y la del municipio viven sobre fondos distintos.
  fondo: { type: String, default: 'bg-white' },
})

const { creadores, pending } = useCreadores(computed(() => ({
  citySlug: props.citySlug,
  pagina: 1,
  porPagina: props.limite,
})))

const hay = computed(() => creadores.value.length > 0)
</script>

<template>
  <section v-if="hay || pending" :class="['px-6 md:px-12 py-12', fondo]">
    <div class="max-w-6xl mx-auto">
      <div class="flex items-end justify-between mb-8 gap-3 flex-wrap">
        <div>
          <h2 class="font-display font-black text-2xl md:text-3xl text-brand-text flex items-center gap-2">
            <Mic class="w-6 h-6 text-brand-primary shrink-0" />
            {{ titulo }}
          </h2>
          <p v-if="subtitulo" class="text-brand-azulgris text-sm mt-2">{{ subtitulo }}</p>
        </div>
        <a
          :href="creatorsUrl(citySlug)"
          class="text-brand-primary text-sm font-semibold hover:underline inline-flex items-center gap-1 whitespace-nowrap"
        >
          Ver todas las voces
          <ArrowRight class="w-4 h-4" />
        </a>
      </div>

      <div v-if="pending && !hay" class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div v-for="i in limite" :key="i" class="bg-slate-100 animate-pulse rounded-2xl h-52" />
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CreatorCard
          v-for="c in creadores"
          :key="c.id"
          :creador="c"
          :city-slug="citySlug"
        />
      </div>
    </div>
  </section>
</template>

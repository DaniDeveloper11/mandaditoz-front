<script setup>
import { MapPin } from '@lucide/vue'
import { getKindConfig, vigenciaTexto } from '~/utils/eventos'
import { placaFecha } from '~/utils/fechas'
import { eventUrl } from '~/utils/urls'

/**
 * Versión mínima de la tarjeta de evento: una línea con placa de fecha, título y
 * lugar. Se usa donde la cartelera acompaña a otro contenido y no puede empujarlo
 * hacia abajo — la home, debajo del destacado.
 *
 * A propósito sin portada ni resumen: mide ~70px contra los ~300px de EventCard.
 * La versión completa vive en EventCard y manda en /[city]/eventos.
 */
const props = defineProps({
  evento: { type: Object, required: true },
  citySlug: { type: String, default: null },
})

const placa = computed(() => placaFecha(props.evento.startAt, props.evento.endAt))
const icono = computed(() => getKindConfig(props.evento.kind).icon)
const fecha = computed(() => vigenciaTexto(props.evento))
const href = computed(() => eventUrl(props.evento, props.citySlug ?? undefined))
</script>

<template>
  <a
    :href="href"
    class="flex items-center gap-3 rounded-xl bg-white border border-gray-100 p-3 shadow-sm hover:shadow-md transition-shadow group"
  >
    <div class="w-12 shrink-0 rounded-lg bg-slate-50 border border-gray-100 py-1.5 text-center leading-none">
      <template v-if="placa">
        <p class="font-display font-black text-brand-text text-base">{{ placa.dia }}</p>
        <p class="text-[9px] font-semibold uppercase tracking-wide text-brand-azulgris mt-1 truncate px-0.5">
          {{ placa.mes.slice(0, 3) }}
        </p>
      </template>
      <component v-else :is="icono" class="w-4 h-4 mx-auto text-brand-azulgris" />
    </div>

    <div class="min-w-0 flex-1">
      <p class="font-semibold text-brand-text text-sm leading-snug line-clamp-1 group-hover:text-brand-primary transition-colors">
        {{ evento.title }}
      </p>
      <p v-if="evento.venueName" class="text-brand-azulgris text-xs mt-0.5 flex items-center gap-1 min-w-0">
        <MapPin class="w-3 h-3 shrink-0" />
        <span class="truncate">{{ evento.venueName }}</span>
      </p>
      <p v-else class="text-brand-azulgris text-xs mt-0.5 truncate">{{ fecha }}</p>
    </div>
  </a>
</template>

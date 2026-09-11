<script setup>
import { CalendarDays, MapPin, ArrowRight } from '@lucide/vue'
import { getKindConfig, vigenciaTexto } from '~/utils/eventos'
import { placaFecha } from '~/utils/fechas'
import { eventUrl, eventsUrl, citySegmentFor } from '~/utils/urls'

/**
 * "Próximos eventos aquí" en la ficha de un negocio: la cartelera del municipio
 * en la que ese negocio participa como sede, organizador o puesto.
 *
 * No renderiza nada si no hay eventos — que es el caso de casi todos los
 * negocios del directorio.
 */
const props = defineProps({
  negocio: { type: Object, required: true },
})

const slug = computed(() => props.negocio?.slug ?? null)
const { eventos } = useEventosDeNegocio(slug)

const citySlug = computed(() => citySegmentFor(props.negocio))

// Se arma aquí y no en el template: placaFecha() y vigenciaTexto() crearían
// formatters por cada fila en cada re-render.
const filas = computed(() => eventos.value.map(ev => ({
  ev,
  href: eventUrl(ev, citySlug.value),
  placa: placaFecha(ev.startAt, ev.endAt),
  fecha: vigenciaTexto(ev),
  icono: getKindConfig(ev.kind).icon,
})))
</script>

<template>
  <div v-if="eventos.length" class="bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
    <div class="flex items-center justify-between mb-4 gap-3 flex-wrap">
      <h2 class="font-display font-black text-lg sm:text-xl text-brand-text flex items-center gap-2">
        <CalendarDays class="w-5 h-5 text-brand-primary shrink-0" />
        Próximos eventos aquí
      </h2>
      <a
        :href="eventsUrl(citySlug)"
        class="text-brand-azulgris text-sm font-medium hover:text-brand-text transition-colors whitespace-nowrap"
      >
        Ver la cartelera →
      </a>
    </div>

    <ul class="flex flex-col divide-y divide-gray-100">
      <li v-for="fila in filas" :key="fila.ev.id">
        <a :href="fila.href" class="flex items-start gap-4 py-3 group">
          <!-- Placa de fecha: el ancla visual de la fila, sin depender de que el
               municipio haya subido un cartel. -->
          <div class="w-14 shrink-0 rounded-xl bg-slate-50 border border-gray-100 py-2 text-center leading-none">
            <template v-if="fila.placa">
              <p class="font-display font-black text-brand-text text-lg">{{ fila.placa.dia }}</p>
              <p class="text-[10px] font-semibold uppercase tracking-wide text-brand-azulgris mt-1 px-1 truncate">
                {{ fila.placa.mes.slice(0, 3) }}
              </p>
            </template>
            <component v-else :is="fila.icono" class="w-5 h-5 mx-auto text-brand-azulgris" />
          </div>

          <div class="min-w-0 flex-1">
            <p class="font-semibold text-brand-text text-sm leading-snug group-hover:text-brand-primary transition-colors">
              {{ fila.ev.title }}
            </p>
            <p class="text-brand-azulgris text-xs mt-1">{{ fila.fecha }}</p>
            <p v-if="fila.ev.venueName" class="text-brand-azulgris text-xs mt-0.5 flex items-center gap-1 min-w-0">
              <MapPin class="w-3 h-3 shrink-0" />
              <span class="truncate">{{ fila.ev.venueName }}</span>
            </p>
          </div>

          <ArrowRight class="w-4 h-4 text-gray-300 shrink-0 mt-1 group-hover:text-brand-primary transition-colors" />
        </a>
      </li>
    </ul>
  </div>
</template>

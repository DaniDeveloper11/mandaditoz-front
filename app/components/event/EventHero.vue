<script setup>
import { Pin, CalendarDays, MapPin, Ticket, Users, ArrowRight, Store } from '@lucide/vue'
import { getKindConfig, getEventCategoryLabel, vigenciaTexto } from '~/utils/eventos'
import { diasDeDuracion, formatoHora, placaFecha } from '~/utils/fechas'
import { eventUrl } from '~/utils/urls'

/**
 * Bloque protagonista de la cartelera: la publicación que el municipio fijó
 * arriba. Lo elige la página (el primer destacado de la página 1), no este
 * componente.
 *
 * Cada dato que muestra sale de un campo real de city-post y su bloque
 * desaparece si viene vacío: nada de rellenar el diseño con texto inventado.
 */
const props = defineProps({
  evento: { type: Object, required: true },
  citySlug: { type: String, default: null },
})

const kindConfig = computed(() => getKindConfig(props.evento.kind))
const esAviso = computed(() => props.evento.kind === 'aviso')

const categoriaLabel = computed(() => {
  const ev = props.evento
  return ev.eventCategory === 'otro' ? null : getEventCategoryLabel(ev.eventCategory)
})

const fecha = computed(() => vigenciaTexto(props.evento))
const dias = computed(() => (esAviso.value ? null : diasDeDuracion(props.evento.startAt, props.evento.endAt)))

// Subtítulo del recuadro de fechas: la duración cuando son varios días, la hora
// de arranque cuando es uno solo. Sin inventar nada si no hay ni lo uno ni lo otro.
const detalleFecha = computed(() => {
  const ev = props.evento
  if (esAviso.value) return null
  if (dias.value && dias.value > 1) return `${dias.value} días de actividades`
  return ev.allDay ? null : `A partir de las ${formatoHora(ev.startAt)}`
})

const portada = computed(() => {
  const img = props.evento.coverImage
  return img?.formats?.large?.url ?? img?.formats?.medium?.url ?? img?.url ?? null
})

const placa = computed(() => placaFecha(props.evento.startAt, props.evento.endAt))

const texto = computed(() => props.evento.summary || props.evento.description || null)

const organiza = computed(() => {
  const ev = props.evento
  if (ev.organizerName) return ev.organizerName
  if (ev.businesses.length) return ev.businesses.map(b => b.name).join(', ')
  return null
})

// Un evento regional (visibleInAllCities) sale en la cartelera de cualquier
// municipio, así que el destacado de /etzatlan/eventos puede ser de San Juanito.
// Llamarlo "del municipio" ahí sería mentira; se dice de dónde es.
const esDeOtroMunicipio = computed(() => {
  const propio = props.evento.city?.slug
  return !!(props.citySlug && propio && propio !== props.citySlug)
})
const etiquetaFijado = computed(() =>
  esDeOtroMunicipio.value
    ? `Destacado en la región · ${props.evento.city?.name}`
    : 'Publicación destacada del municipio',
)

const href = computed(() => eventUrl(props.evento, props.citySlug ?? undefined))
const ctaLabel = computed(() => (esAviso.value ? 'Ver el aviso completo' : 'Ver programa completo'))
</script>

<template>
  <section class="rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-100">
    <header class="flex items-center justify-between gap-3 px-5 py-2.5 bg-slate-50 border-b border-gray-100">
      <span class="inline-flex items-center gap-2 text-xs font-semibold text-brand-text">
        <Pin class="w-3.5 h-3.5 text-brand-primary" />
        {{ etiquetaFijado }}
      </span>
      <span class="text-[11px] font-semibold uppercase tracking-wider text-brand-azulgris shrink-0">
        {{ kindConfig.label }}
      </span>
    </header>

    <div class="grid grid-cols-1 md:grid-cols-2">
      <!-- Portada -->
      <a :href="href" class="relative block bg-slate-100 aspect-[4/3] md:aspect-auto md:min-h-[320px] group">
        <img
          v-if="portada"
          :src="portada"
          :alt="evento.coverImage?.alternativeText || evento.title"
          class="absolute inset-0 w-full h-full object-cover"
        />
        <!-- Sin portada el bloque no se queda hueco: una placa tipo calendario
             toma su lugar. Muestra día y mes sueltos, no la frase completa, que
             ya se lee en el recuadro de fechas de al lado. -->
        <div
          v-else
          class="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-brand-bg-dark text-white text-center px-6"
        >
          <component :is="kindConfig.icon" class="w-8 h-8 opacity-70 mb-1" />
          <template v-if="placa">
            <p class="font-display font-black text-5xl md:text-6xl leading-none">{{ placa.dia }}</p>
            <p class="text-sm font-semibold uppercase tracking-[0.2em] opacity-80">{{ placa.mes }}</p>
          </template>
          <p v-else class="font-display font-black text-2xl leading-tight">{{ fecha }}</p>
        </div>

        <span
          v-if="categoriaLabel"
          :class="['absolute left-4 top-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shadow-sm', kindConfig.badgeStyle]"
        >
          <component :is="kindConfig.icon" class="w-3.5 h-3.5" />
          {{ categoriaLabel }}
        </span>
      </a>

      <!-- Contenido -->
      <div class="p-6 md:p-8 flex flex-col gap-4">
        <div v-if="categoriaLabel || evento.priceText" class="flex items-center gap-2 flex-wrap text-xs">
          <span v-if="categoriaLabel" class="font-semibold text-brand-primary">{{ categoriaLabel }}</span>
          <span v-if="categoriaLabel && evento.priceText" class="text-gray-300">·</span>
          <span v-if="evento.priceText" class="inline-flex items-center gap-1 text-brand-azulgris">
            <Ticket class="w-3.5 h-3.5" />
            {{ evento.priceText }}
          </span>
        </div>

        <h2 class="font-display font-black text-2xl md:text-3xl text-brand-text leading-tight">
          <a :href="href" class="hover:text-brand-primary transition-colors">{{ evento.title }}</a>
        </h2>

        <p v-if="texto" class="text-brand-text text-sm leading-relaxed line-clamp-4">
          {{ texto }}
        </p>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div v-if="fecha" class="rounded-xl bg-slate-50 p-4 flex items-start gap-3">
            <CalendarDays class="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
            <div class="min-w-0">
              <p class="text-brand-azulgris text-[11px] font-semibold uppercase tracking-wide">
                {{ esAviso ? 'Vigencia' : 'Fechas de celebración' }}
              </p>
              <p class="text-brand-text text-sm font-bold mt-0.5 leading-snug">{{ fecha }}</p>
              <p v-if="detalleFecha" class="text-brand-azulgris text-xs mt-0.5">{{ detalleFecha }}</p>
            </div>
          </div>

          <div v-if="evento.venueName || evento.venueAddress" class="rounded-xl bg-slate-50 p-4 flex items-start gap-3">
            <MapPin class="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
            <div class="min-w-0">
              <p class="text-brand-azulgris text-[11px] font-semibold uppercase tracking-wide">Punto de encuentro</p>
              <p v-if="evento.venueName" class="text-brand-text text-sm font-bold mt-0.5 leading-snug">
                {{ evento.venueName }}
              </p>
              <p v-if="evento.venueAddress" class="text-brand-azulgris text-xs mt-0.5">{{ evento.venueAddress }}</p>
            </div>
          </div>
        </div>

        <div class="flex items-end justify-between gap-4 flex-wrap mt-auto pt-1">
          <p v-if="organiza" class="text-brand-azulgris text-xs inline-flex items-center gap-1.5 min-w-0">
            <component :is="evento.organizerName ? Users : Store" class="w-3.5 h-3.5 shrink-0" />
            <span class="truncate"><span class="font-semibold">Organiza:</span> {{ organiza }}</span>
          </p>
          <a :href="href" class="btn-primary inline-flex items-center gap-2 ml-auto">
            {{ ctaLabel }}
            <ArrowRight class="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  </section>
</template>

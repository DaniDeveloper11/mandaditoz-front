<script setup>
import { CalendarDays, ArrowRight } from '@lucide/vue'
import { eventsUrl } from '~/utils/urls'

/**
 * Banda de próximos eventos, para las home (municipio y global).
 *
 * Se monta siempre pero NO renderiza nada si el municipio no tiene cartelera:
 * una sección con el título puesto y cero tarjetas se lee como que el sitio está
 * roto. La cartelera es contenido que llega de a poco, así que el estado normal
 * de un municipio nuevo es justamente "todavía no hay".
 */
const props = defineProps({
  citySlug: { type: String, required: true },
  titulo: { type: String, default: 'Qué pasa en tu municipio' },
  subtitulo: { type: String, default: null },
  limite: { type: Number, default: 3 },
  // La home global y la del municipio viven sobre fondos distintos.
  fondo: { type: String, default: 'bg-white' },
  // Encabeza la banda con el bloque protagonista, como la cartelera.
  conDestacado: { type: Boolean, default: false },
  // Las tarjetas de abajo en su versión mínima (una línea). Para cuando la banda
  // acompaña a otro contenido y no debe empujarlo fuera de la pantalla.
  compacto: { type: Boolean, default: false },
})

// Con hero se pide uno más para que abajo sigan quedando `limite` tarjetas y la
// fila no se vea coja.
const { eventos, pending } = useEventos(computed(() => ({
  citySlug: props.citySlug,
  pasados: false,
  pagina: 1,
  porPagina: props.conDestacado ? props.limite + 1 : props.limite,
})))

// Mismo criterio que /[city]/eventos: el primero, y solo si el municipio lo fijó
// con isFeatured. El sort del composable ya lo pone al frente.
const destacado = computed(() => {
  if (!props.conDestacado) return null
  const primero = eventos.value[0]
  return primero?.isFeatured ? primero : null
})

const tarjetas = computed(() => {
  const resto = destacado.value ? eventos.value.slice(1) : eventos.value
  return resto.slice(0, props.limite)
})

const hay = computed(() => eventos.value.length > 0)
</script>

<template>
  <section v-if="hay || pending" :class="['px-6 md:px-12 py-12', fondo]">
    <div class="max-w-6xl mx-auto">
      <div class="flex items-end justify-between mb-8 gap-3 flex-wrap">
        <div>
          <h2 class="font-display font-black text-2xl md:text-3xl text-brand-text flex items-center gap-2">
            <CalendarDays class="w-6 h-6 text-brand-primary shrink-0" />
            {{ titulo }}
          </h2>
          <p v-if="subtitulo" class="text-brand-azulgris text-sm mt-2">{{ subtitulo }}</p>
        </div>
        <a
          :href="eventsUrl(citySlug)"
          class="text-brand-primary text-sm font-semibold hover:underline inline-flex items-center gap-1 whitespace-nowrap"
        >
          Ver toda la cartelera
          <ArrowRight class="w-4 h-4" />
        </a>
      </div>

      <div v-if="pending && !hay" class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          v-for="i in limite"
          :key="i"
          :class="['bg-slate-100 animate-pulse', compacto ? 'rounded-xl h-[70px]' : 'rounded-2xl h-64']"
        />
      </div>

      <template v-else>
        <EventHero
          v-if="destacado"
          :evento="destacado"
          :city-slug="citySlug"
          class="mb-6"
        />

        <div
          v-if="tarjetas.length"
          :class="['grid grid-cols-1 md:grid-cols-3', compacto ? 'gap-3' : 'gap-4']"
        >
          <!-- v-if/v-else y no <component :is="'EventCard'">: el transform de
               auto-import de Nuxt resuelve los componentes por nombre en tiempo
               de compilación, así que un :is con string no se resuelve y no
               renderiza nada, sin error. -->
          <template v-for="ev in tarjetas" :key="ev.id">
            <EventMiniCard v-if="compacto" :evento="ev" :city-slug="citySlug" />
            <EventCard v-else :evento="ev" :city-slug="citySlug" />
          </template>
        </div>
      </template>
    </div>
  </section>
</template>

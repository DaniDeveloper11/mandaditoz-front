<script setup>
import { Star, BadgeCheck, MapPin, ArrowRight } from '@lucide/vue'
import { businessUrl } from '~/utils/urls'

/**
 * "Negocios similares" al pie de la ficha: misma categoría y municipio.
 *
 * Sirve a quien no encontró lo que buscaba en este negocio y le da a cada
 * ficha enlaces internos hacia sus vecinos. No renderiza nada con menos de
 * dos resultados: un bloque con una sola tarjeta se lee como relleno.
 */
const props = defineProps({
  negocio: { type: Object, required: true },
})

const { negocios, categoria, ciudad } = useNegociosSimilares(() => props.negocio)

const categoriaUrl = computed(() =>
  categoria.value && ciudad.value ? `/${ciudad.value}/${categoria.value}` : null,
)

const titulo = computed(() => {
  const cat = props.negocio?.category?.name
  const city = props.negocio?.visibleInAllCities ? null : props.negocio?.city?.name
  if (cat && city) return `Más de ${cat} en ${city}`
  if (cat) return `Más de ${cat}`
  return 'Negocios similares'
})

function logoUrl(n) {
  return n.logo?.formats?.thumbnail?.url ?? n.logo?.url ?? null
}
</script>

<template>
  <section v-if="negocios.length >= 2" class="bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
    <div class="flex items-center justify-between mb-4 gap-3 flex-wrap">
      <h2 class="font-display font-black text-lg sm:text-xl text-brand-text">{{ titulo }}</h2>
      <a
        v-if="categoriaUrl"
        :href="categoriaUrl"
        class="text-brand-azulgris text-sm font-medium hover:text-brand-text transition-colors whitespace-nowrap"
      >
        Ver todos →
      </a>
    </div>

    <ul class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <li v-for="n in negocios" :key="n.id">
        <a
          :href="businessUrl(n)"
          class="group flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:border-brand-primary/30 hover:bg-slate-50 transition-colors h-full"
        >
          <div class="w-12 h-12 rounded-xl bg-slate-700 overflow-hidden flex items-center justify-center text-white font-bold text-lg shrink-0">
            <img
              v-if="logoUrl(n)"
              :src="logoUrl(n)"
              :alt="n.name"
              loading="lazy"
              class="w-full h-full object-cover"
            />
            <span v-else aria-hidden="true">{{ (n.name ?? '?').charAt(0) }}</span>
          </div>

          <div class="min-w-0 flex-1">
            <p class="font-semibold text-brand-text text-sm leading-snug flex items-center gap-1 group-hover:text-brand-primary transition-colors">
              <span class="truncate">{{ n.name }}</span>
              <BadgeCheck v-if="n.isVerified" class="w-3.5 h-3.5 text-brand-primary shrink-0" aria-label="Verificado" />
            </p>
            <p v-if="n.shortDescription" class="text-brand-azulgris text-xs mt-0.5 line-clamp-1">
              {{ n.shortDescription }}
            </p>
            <div class="flex items-center gap-3 mt-1 text-xs text-brand-azulgris">
              <span v-if="n.ratingCount" class="inline-flex items-center gap-1">
                <Star class="w-3 h-3 text-amber-400 fill-amber-400" />
                <span class="font-semibold text-brand-text">{{ n.ratingAverage.toFixed(1) }}</span>
                ({{ n.ratingCount }})
              </span>
              <span v-if="n.neighborhood" class="inline-flex items-center gap-1 min-w-0">
                <MapPin class="w-3 h-3 shrink-0" />
                <span class="truncate">{{ n.neighborhood }}</span>
              </span>
            </div>
          </div>

          <ArrowRight class="w-4 h-4 text-gray-300 shrink-0 mt-1 group-hover:text-brand-primary transition-colors" />
        </a>
      </li>
    </ul>
  </section>
</template>

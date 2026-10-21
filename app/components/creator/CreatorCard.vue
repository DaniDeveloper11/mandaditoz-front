<script setup>
import { MapPin, Users } from '@lucide/vue'
import { getCreatorTypeConfig, arrobaDe, temasDe } from '~/utils/creadores'
import { creatorUrl } from '~/utils/urls'

const props = defineProps({
  creador: { type: Object, required: true },
  // Municipio desde el que se está navegando: mantiene los enlaces dentro de la
  // misma sección. Si no viene, creatorUrl cae a la URL canónica.
  citySlug: { type: String, default: null },
})

const tipo = computed(() => getCreatorTypeConfig(props.creador.creatorType))
const arroba = computed(() => arrobaDe(props.creador))
const temas = computed(() => temasDe(props.creador).slice(0, 3))
const foto = computed(() => {
  const img = props.creador.avatar
  return img?.formats?.thumbnail?.url ?? img?.formats?.small?.url ?? img?.url ?? null
})
const href = computed(() => creatorUrl(props.creador, props.citySlug ?? undefined))
// De dónde es, como se lee: el municipio, o "toda la región" si es regional.
const procedencia = computed(() =>
  props.creador.regionName
  || (props.creador.visibleInAllCities ? 'Toda la región' : props.creador.city?.name)
  || null,
)
</script>

<template>
  <a
    :href="href"
    class="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden p-5 gap-3"
  >
    <div class="flex items-start gap-4">
      <img
        v-if="foto"
        :src="foto"
        :alt="creador.avatar?.alternativeText || creador.name"
        loading="lazy"
        class="w-16 h-16 rounded-full object-cover shrink-0 ring-1 ring-gray-200"
      />
      <div
        v-else
        class="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center shrink-0 ring-1 ring-gray-200"
      >
        <component :is="tipo.icon" class="w-6 h-6 text-brand-azulgris" />
      </div>

      <div class="min-w-0 flex-1">
        <h3 class="font-display font-bold text-brand-text text-lg leading-tight truncate">
          {{ creador.name }}
        </h3>
        <p v-if="arroba" class="text-brand-azulgris text-sm truncate">{{ arroba }}</p>
        <span
          :class="['inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold mt-1.5', tipo.badgeStyle]"
        >
          <component :is="tipo.icon" class="w-3 h-3" />
          {{ tipo.label }}
        </span>
      </div>
    </div>

    <p v-if="creador.tagline" class="text-brand-text text-sm leading-relaxed line-clamp-2">
      {{ creador.tagline }}
    </p>

    <div v-if="temas.length" class="flex flex-wrap gap-1.5">
      <span
        v-for="tema in temas"
        :key="tema"
        class="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600"
      >
        {{ tema }}
      </span>
    </div>

    <div class="flex items-center gap-3 flex-wrap mt-auto pt-1 text-brand-azulgris text-xs">
      <span v-if="procedencia" class="inline-flex items-center gap-1 min-w-0">
        <MapPin class="w-3.5 h-3.5 shrink-0" />
        <span class="truncate">{{ procedencia }}</span>
      </span>
      <span v-if="creador.audienceText" class="inline-flex items-center gap-1">
        <Users class="w-3.5 h-3.5 shrink-0" />
        {{ creador.audienceText }}
      </span>
    </div>

    <!-- `enlazar: false` obligatorio: la tarjeta entera ya es un <a> y anidar
         anclas es HTML inválido —el navegador cierra la externa y el resto de la
         tarjeta deja de ser clicable—. Aquí los logos solo anuncian dónde
         publica; los enlaces reales viven en la ficha. -->
    <CreatorSocialLinks
      :links="creador.socialLinks"
      variante="iconos"
      :enlazar="false"
    />
  </a>
</template>

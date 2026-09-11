<script setup>
import { CalendarDays, MapPin, Ticket, Store } from '@lucide/vue'
import { getKindConfig, getEventCategoryLabel, vigenciaTexto } from '~/utils/eventos'
import { eventUrl } from '~/utils/urls'

const props = defineProps({
  evento: { type: Object, required: true },
  // Municipio desde el que se está navegando: mantiene los enlaces dentro de la
  // misma cartelera. Si no viene, eventUrl cae a la URL canónica del evento.
  citySlug: { type: String, default: null },
  // Lo decide la página (sabe si está pintando el historial), no un new Date()
  // aquí dentro: así el HTML del servidor y el del cliente no pueden diferir.
  pasado: { type: Boolean, default: false },
})

const kindConfig = computed(() => getKindConfig(props.evento.kind))
const categoriaLabel = computed(() => {
  const label = getEventCategoryLabel(props.evento.eventCategory)
  // "Otro" no le dice nada a nadie: se omite.
  return props.evento.eventCategory === 'otro' ? null : label
})
const fecha = computed(() => vigenciaTexto(props.evento))
const portada = computed(() => {
  const img = props.evento.coverImage
  return img?.formats?.medium?.url ?? img?.formats?.small?.url ?? img?.url ?? null
})
const href = computed(() => eventUrl(props.evento, props.citySlug ?? undefined))
</script>

<template>
  <a
    :href="href"
    :class="[
      'bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden',
      pasado ? 'opacity-75 hover:opacity-100' : '',
    ]"
  >
    <div v-if="portada" class="aspect-[16/9] bg-slate-100 shrink-0">
      <img
        :src="portada"
        :alt="evento.coverImage?.alternativeText || evento.title"
        loading="lazy"
        class="w-full h-full object-cover"
      />
    </div>

    <div class="p-5 flex flex-col gap-2 flex-1">
      <div class="flex items-center gap-2 flex-wrap">
        <span :class="['inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold', kindConfig.badgeStyle]">
          <component :is="kindConfig.icon" class="w-3 h-3" />
          {{ kindConfig.label }}
        </span>
        <span v-if="categoriaLabel" class="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
          {{ categoriaLabel }}
        </span>
        <span v-if="pasado" class="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">
          Ya terminó
        </span>
      </div>

      <div v-if="fecha" class="flex items-center gap-1.5 text-brand-primary text-sm font-semibold">
        <CalendarDays class="w-4 h-4 shrink-0" />
        <span>{{ fecha }}</span>
      </div>

      <h3 class="font-display font-bold text-brand-text text-lg leading-tight">
        {{ evento.title }}
      </h3>

      <p v-if="evento.summary" class="text-brand-text text-sm leading-relaxed line-clamp-2">
        {{ evento.summary }}
      </p>

      <div class="flex items-center gap-3 flex-wrap mt-auto pt-1 text-brand-azulgris text-xs">
        <span v-if="evento.venueName" class="inline-flex items-center gap-1 min-w-0">
          <MapPin class="w-3.5 h-3.5 shrink-0" />
          <span class="truncate">{{ evento.venueName }}</span>
        </span>
        <span v-if="evento.priceText" class="inline-flex items-center gap-1">
          <Ticket class="w-3.5 h-3.5 shrink-0" />
          {{ evento.priceText }}
        </span>
        <span v-if="evento.businesses.length" class="inline-flex items-center gap-1">
          <Store class="w-3.5 h-3.5 shrink-0" />
          {{ evento.businesses.length }}
          {{ evento.businesses.length === 1 ? 'negocio' : 'negocios' }}
        </span>
      </div>
    </div>
  </a>
</template>

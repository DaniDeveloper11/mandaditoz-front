<script setup>
import { Share2 } from '@lucide/vue'
import { getSocialLabel, ordenarRedes } from '~/utils/creadores'

/**
 * Enlaces a redes de una voz.
 *
 * Los SVG de marca van inline y no por @lucide/vue a propósito: Lucide no trae
 * logos de marca (son iconos de trazo genéricos), y para un creador la red es
 * el dato principal de la ficha — un icono genérico repetido cuatro veces no
 * distingue TikTok de YouTube de un vistazo. Es el mismo criterio, y los mismos
 * paths, que ya usa BusinessDetailPage.vue.
 */
const props = defineProps({
  links: { type: Array, default: () => [] },
  // `chips` para la ficha (icono + nombre), `iconos` para la tarjeta, donde el
  // texto no cabe.
  variante: { type: String, default: 'chips' },
  // Con `false` se pinta como <span> en vez de <a>. Es lo que necesita
  // CreatorCard: la tarjeta entera ya es un <a>, y anidar anclas es HTML
  // inválido — el navegador cierra la externa y el resto de la tarjeta deja de
  // ser clicable.
  enlazar: { type: Boolean, default: true },
})

const etiqueta = computed(() => (props.enlazar ? 'a' : 'span'))
</script>

<template>
  <div v-if="links.length" class="flex flex-wrap gap-2">
    <component
      :is="etiqueta"
      v-for="link in ordenarRedes(links)"
      :key="link.id ?? link.url"
      :href="enlazar ? link.url : undefined"
      :target="enlazar ? '_blank' : undefined"
      :rel="enlazar ? 'noopener noreferrer' : undefined"
      :title="getSocialLabel(link.platform)"
      :aria-label="enlazar ? getSocialLabel(link.platform) : undefined"
      :class="[
        'inline-flex items-center border border-gray-200 text-brand-text transition-colors',
        enlazar ? 'hover:bg-gray-50' : '',
        variante === 'iconos'
          ? 'justify-center w-8 h-8 rounded-lg'
          : 'gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold',
      ]"
    >
      <svg v-if="link.platform === 'facebook'" class="w-4 h-4 text-[#1877F2]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073c0 6.02 4.388 11.01 10.125 11.927v-8.437H7.078v-3.49h3.047V9.412c0-3.017 1.792-4.687 4.533-4.687 1.313 0 2.686.235 2.686.235v2.97h-1.514c-1.49 0-1.955.93-1.955 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.083 24 18.092 24 12.073z"/>
      </svg>
      <svg v-else-if="link.platform === 'instagram'" class="w-4 h-4 text-[#E4405F]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
      </svg>
      <svg v-else-if="link.platform === 'tiktok'" class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.1z"/>
      </svg>
      <svg v-else-if="link.platform === 'youtube'" class="w-4 h-4 text-[#FF0000]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
      <Share2 v-else class="w-4 h-4 text-brand-azulgris" />
      <span v-if="variante !== 'iconos'">{{ getSocialLabel(link.platform) }}</span>
    </component>
  </div>
</template>

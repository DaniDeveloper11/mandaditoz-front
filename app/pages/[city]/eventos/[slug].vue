<script setup>
import {
  CalendarDays, MapPin, Ticket, Phone, ExternalLink, Store,
  Users, ArrowLeft, AlertCircle,
} from '@lucide/vue'
import { mapCityPost } from '~/utils/strapi'
import { FALLBACK_CITY_SLUG, businessUrl, eventUrl } from '~/utils/urls'
import { buildBreadcrumbJsonLd, buildEventJsonLd, serializeJsonLd } from '~/utils/seo'
import { getKindConfig, getEventCategoryLabel, vigenciaTexto } from '~/utils/eventos'
import { formatoHora, esPasado } from '~/utils/fechas'

definePageMeta({ layout: 'landing' })

const route = useRoute()
const config = useRuntimeConfig()
const siteUrl = String(config.public?.siteUrl ?? '').replace(/\/$/, '')
const apiBase = config.public.apiBase

const citySlug = computed(() => String(route.params.city ?? '').toLowerCase())
const slug = computed(() => String(route.params.slug ?? '').toLowerCase())

// La resolución vive en la página y no en un composable para poder lanzar el 404
// durante el render del servidor, igual que hace el dispatcher [city]/[slug].vue.
// El controller de city-post ya oculta draft y archived: si no hay resultado, el
// evento no existe para el público.
//
// El municipio de la URL se pide en la misma llamada. Sin eso, un evento
// regional haría que /municipioinventado/eventos/[slug] respondiera 200 — el
// mismo soft-404 que ya evitan el listado y [city]/index.vue —, y además da el
// nombre correcto para el breadcrumb cuando se llega desde otro municipio.
const { data: raw } = await useAsyncData(
  computed(() => `evento|${citySlug.value}|${slug.value}`),
  async () => {
    const [postRes, cityRes] = await Promise.all([
      $fetch(`${apiBase}/city-posts`, {
        query: {
          'filters[slug][$eq]': slug.value,
          'populate[city]': true,
          'populate[coverImage]': true,
          'populate[gallery]': true,
          'populate[geo]': true,
          'populate[seo][populate][ogImage]': true,
          'populate[businesses][fields][0]': 'name',
          'populate[businesses][fields][1]': 'slug',
          'populate[businesses][fields][2]': 'shortDescription',
          'populate[businesses][fields][3]': 'visibleInAllCities',
          'populate[businesses][populate][city][fields][0]': 'name',
          'populate[businesses][populate][city][fields][1]': 'slug',
          'pagination[pageSize]': 1,
        },
      }).catch(() => null),
      citySlug.value !== FALLBACK_CITY_SLUG
        ? $fetch(`${apiBase}/cities`, {
            query: {
              'filters[slug][$eq]': citySlug.value,
              'fields[0]': 'name',
              'fields[1]': 'slug',
              'pagination[pageSize]': 1,
            },
          }).catch(() => null)
        : Promise.resolve(null),
    ])
    return {
      post: postRes?.data?.[0] ?? null,
      urlCity: cityRes?.data?.[0] ?? null,
    }
  },
)

const evento = computed(() => mapCityPost(raw.value?.post ?? null))
const urlCity = computed(() => raw.value?.urlCity ?? null)

// Un evento de Etzatlán no se sirve bajo /san-juanito/eventos/...: sería la
// misma página en dos URLs. Los regionales (visibleInAllCities) sí aparecen en
// la cartelera de cualquier municipio que exista, así que ahí no se bloquea.
const cityCoincide = computed(() => {
  const ev = evento.value
  if (!ev) return false
  if (citySlug.value !== FALLBACK_CITY_SLUG && !urlCity.value) return false
  if (ev.visibleInAllCities) return true
  if (citySlug.value === FALLBACK_CITY_SLUG) return false
  return ev.city?.slug === citySlug.value
})

if (!evento.value || !cityCoincide.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Evento no encontrado',
    fatal: true,
  })
}

const kindConfig = computed(() => getKindConfig(evento.value.kind))
const categoriaLabel = computed(() => {
  const ev = evento.value
  return ev.eventCategory === 'otro' ? null : getEventCategoryLabel(ev.eventCategory)
})
const fecha = computed(() => vigenciaTexto(evento.value))
const terminado = computed(() => esPasado(evento.value.endAt))
const esCartel = computed(() => evento.value.kind === 'cartel')

// Dos nombres distintos a propósito: el municipio del evento es el que va en los
// datos estructurados y en el texto ("Noche de mariachi en Etzatlán"), mientras
// que el de navegación es el de la URL — un evento regional puede estar
// abriéndose desde San Juanito o desde /jalisco, y el breadcrumb debe nombrar
// el lugar al que en realidad enlaza.
const cityName = computed(() => evento.value.city?.name ?? citySlug.value)
const navCityName = computed(() => {
  if (citySlug.value === FALLBACK_CITY_SLUG) return 'Jalisco'
  return urlCity.value?.name ?? cityName.value
})

// La hora solo se repite aparte cuando el rango ya no la muestra (evento de
// varios días) y el municipio no lo marcó como de día completo.
const horaSuelta = computed(() => {
  const ev = evento.value
  if (ev.allDay || ev.kind === 'aviso') return null
  return fecha.value.startsWith('Del ') ? formatoHora(ev.startAt) : null
})

const lugar = computed(() => {
  const ev = evento.value
  return [ev.venueName, ev.venueAddress].filter(Boolean).join(' · ')
})

const tieneContacto = computed(() => {
  const ev = evento.value
  return !!(ev.organizerName || ev.contactPhone || ev.externalUrl || ev.ticketUrl)
})

// SEO --------------------------------------------------------------
// Canónica SIN override de ciudad: un evento regional visible en tres carteleras
// apunta siempre a la misma URL y no cuenta como contenido triplicado.
const pageUrl = computed(() => `${siteUrl}${eventUrl(evento.value)}`)

const seoTitle = computed(() => {
  const ev = evento.value
  if (ev.seo?.metaTitle) return ev.seo.metaTitle
  return `${ev.title} — ${cityName.value}, Jalisco | Mandaditoz`
})

const seoDescription = computed(() => {
  const ev = evento.value
  return ev.seo?.metaDescription
    || ev.summary
    || `${ev.title} en ${cityName.value}, Jalisco. ${fecha.value}.`
})

const ogImage = computed(() => {
  const ev = evento.value
  return ev.seo?.ogImage?.url || ev.coverImage?.url || `${siteUrl}/og-default.jpg`
})

useSeoMeta({
  title: () => seoTitle.value,
  description: () => seoDescription.value,
  ogType: 'article',
  ogTitle: () => seoTitle.value,
  ogDescription: () => seoDescription.value,
  ogUrl: () => pageUrl.value,
  ogImage: () => ogImage.value,
  twitterCard: 'summary_large_image',
})

const jsonLdScripts = computed(() => {
  const scripts = [{
    type: 'application/ld+json',
    innerHTML: serializeJsonLd(buildBreadcrumbJsonLd([
      { name: 'Inicio', url: `${siteUrl}/` },
      { name: navCityName.value, url: `${siteUrl}/${citySlug.value}` },
      { name: 'Eventos', url: `${siteUrl}/${citySlug.value}/eventos` },
      { name: evento.value.title, url: pageUrl.value },
    ])),
  }]

  // Devuelve null para kind = 'aviso': marcar un comunicado como Event sería
  // spam de datos estructurados.
  const eventLd = buildEventJsonLd(evento.value, { siteUrl, pageUrl: pageUrl.value })
  if (eventLd) {
    scripts.push({ type: 'application/ld+json', innerHTML: serializeJsonLd(eventLd) })
  }

  return scripts
})

useHead(() => ({
  link: [{ rel: 'canonical', href: pageUrl.value }],
  script: jsonLdScripts.value,
}))
</script>

<template>
  <div>
    <!-- Breadcrumb -->
    <div class="bg-white border-b border-gray-100 px-6 md:px-12 py-3">
      <div class="max-w-5xl mx-auto">
        <nav class="flex items-center gap-2 text-sm flex-wrap">
          <a href="/" class="text-brand-primary hover:underline">Inicio</a>
          <span class="text-gray-400">›</span>
          <a :href="`/${citySlug}`" class="text-brand-primary hover:underline">{{ navCityName }}</a>
          <span class="text-gray-400">›</span>
          <a :href="`/${citySlug}/eventos`" class="text-brand-primary hover:underline">Eventos</a>
          <span class="text-gray-400">›</span>
          <span class="text-brand-text font-medium truncate max-w-[16rem]">{{ evento.title }}</span>
        </nav>
      </div>
    </div>

    <div class="bg-slate-50 px-6 md:px-12 py-8">
      <div class="max-w-5xl mx-auto flex flex-col gap-6">

        <!-- Ya terminó -->
        <div
          v-if="terminado"
          class="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4"
        >
          <AlertCircle class="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div class="min-w-0">
            <p class="font-semibold text-amber-900 text-sm">
              {{ evento.kind === 'aviso' ? 'Este aviso ya no está vigente' : 'Este evento ya terminó' }}
            </p>
            <p class="text-amber-800 text-sm mt-0.5">
              Se conserva como referencia.
              <a :href="`/${citySlug}/eventos`" class="font-semibold underline">Ver la cartelera vigente de {{ navCityName }}</a>.
            </p>
          </div>
        </div>

        <!-- Cartel: la imagen ES el contenido, va completa y sin recortar -->
        <div
          v-if="esCartel && evento.coverImage?.url"
          class="rounded-2xl overflow-hidden bg-white shadow-sm"
        >
          <img
            :src="evento.coverImage.url"
            :alt="evento.coverImage.alternativeText || evento.title"
            class="w-full h-auto block"
          />
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          <!-- Columna principal -->
          <div class="lg:col-span-2 flex flex-col gap-6">
            <div class="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
              <div class="flex items-center gap-2 flex-wrap mb-4">
                <span :class="['inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold', kindConfig.badgeStyle]">
                  <component :is="kindConfig.icon" class="w-3.5 h-3.5" />
                  {{ kindConfig.label }}
                </span>
                <span v-if="categoriaLabel" class="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                  {{ categoriaLabel }}
                </span>
                <span v-if="evento.visibleInAllCities" class="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                  Regional
                </span>
              </div>

              <h1 class="font-display font-black text-3xl md:text-4xl text-brand-text leading-tight">
                {{ evento.title }}
              </h1>

              <p v-if="evento.summary" class="text-brand-text text-base mt-4 leading-relaxed">
                {{ evento.summary }}
              </p>

              <!-- El richtext del backend es markdown y el proyecto no tiene
                   librería para renderizarlo. Se muestra como texto plano
                   respetando saltos de línea, igual que la descripción de un
                   negocio. Nada de v-html. -->
              <p
                v-if="evento.description"
                class="text-brand-text text-sm mt-5 leading-relaxed whitespace-pre-line"
              >{{ evento.description }}</p>
            </div>

            <!-- Portada (cuando no es cartel) -->
            <div
              v-if="!esCartel && evento.coverImage?.url"
              class="rounded-2xl overflow-hidden bg-white shadow-sm"
            >
              <img
                :src="evento.coverImage.url"
                :alt="evento.coverImage.alternativeText || evento.title"
                class="w-full h-auto block"
              />
            </div>

            <!-- Galería -->
            <div v-if="evento.gallery.length" class="bg-white rounded-2xl p-6 shadow-sm">
              <h2 class="font-display font-black text-xl text-brand-text mb-4">Galería</h2>
              <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                <a
                  v-for="img in evento.gallery"
                  :key="img.id"
                  :href="img.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="block rounded-xl overflow-hidden bg-slate-100 aspect-square"
                >
                  <img
                    :src="img.formats?.small?.url ?? img.url"
                    :alt="img.alternativeText || evento.title"
                    loading="lazy"
                    class="w-full h-full object-cover hover:scale-105 transition-transform"
                  />
                </a>
              </div>
            </div>

            <!-- Negocios ligados -->
            <div v-if="evento.businesses.length" class="bg-white rounded-2xl p-6 shadow-sm">
              <h2 class="font-display font-black text-xl text-brand-text flex items-center gap-2">
                <Users class="w-5 h-5 text-brand-primary" />
                {{ evento.businesses.length === 1 ? 'Negocio participante' : 'Negocios participantes' }}
              </h2>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                <a
                  v-for="biz in evento.businesses"
                  :key="biz.id"
                  :href="businessUrl(biz)"
                  class="flex items-start gap-3 rounded-xl border border-gray-100 p-4 hover:bg-slate-50 transition-colors"
                >
                  <div class="w-10 h-10 rounded-xl bg-brand-bg-dark text-white font-bold flex items-center justify-center shrink-0">
                    {{ biz.name.charAt(0) }}
                  </div>
                  <div class="min-w-0">
                    <p class="font-semibold text-brand-text text-sm leading-tight">{{ biz.name }}</p>
                    <p v-if="biz.city?.name" class="text-brand-azulgris text-xs mt-0.5">{{ biz.city.name }}</p>
                  </div>
                </a>
              </div>
            </div>

            <!-- Mapa -->
            <div v-if="evento.mapEmbedUrl" class="rounded-2xl overflow-hidden bg-white shadow-sm">
              <iframe
                :src="evento.mapEmbedUrl"
                class="w-full h-[360px] block border-0"
                loading="lazy"
                referrerpolicy="no-referrer-when-downgrade"
                allowfullscreen
                :title="`Mapa de ${evento.title}`"
              />
            </div>
          </div>

          <!-- Sidebar -->
          <aside class="flex flex-col gap-4 lg:sticky lg:top-6">
            <div class="bg-white rounded-2xl p-6 shadow-sm flex flex-col gap-4">
              <div v-if="fecha" class="flex items-start gap-3">
                <CalendarDays class="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
                <div class="min-w-0">
                  <p class="text-brand-azulgris text-xs font-semibold uppercase tracking-wide">Cuándo</p>
                  <p class="text-brand-text text-sm font-semibold mt-0.5">{{ fecha }}</p>
                  <p v-if="horaSuelta" class="text-brand-azulgris text-sm">A partir de las {{ horaSuelta }}</p>
                </div>
              </div>

              <div v-if="lugar" class="flex items-start gap-3">
                <MapPin class="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
                <div class="min-w-0">
                  <p class="text-brand-azulgris text-xs font-semibold uppercase tracking-wide">Dónde</p>
                  <p class="text-brand-text text-sm mt-0.5">{{ lugar }}</p>
                </div>
              </div>

              <div v-if="evento.priceText" class="flex items-start gap-3">
                <Ticket class="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
                <div class="min-w-0">
                  <p class="text-brand-azulgris text-xs font-semibold uppercase tracking-wide">Costo</p>
                  <p class="text-brand-text text-sm mt-0.5">{{ evento.priceText }}</p>
                </div>
              </div>

              <div v-if="tieneContacto" class="border-t border-gray-100 pt-4 flex flex-col gap-3">
                <div v-if="evento.organizerName" class="flex items-start gap-3">
                  <Store class="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
                  <div class="min-w-0">
                    <p class="text-brand-azulgris text-xs font-semibold uppercase tracking-wide">Organiza</p>
                    <p class="text-brand-text text-sm mt-0.5">{{ evento.organizerName }}</p>
                  </div>
                </div>

                <a
                  v-if="evento.contactPhone"
                  :href="`tel:${evento.contactPhone}`"
                  class="inline-flex items-center gap-2 text-brand-primary text-sm font-semibold hover:underline"
                >
                  <Phone class="w-4 h-4" />
                  {{ evento.contactPhone }}
                </a>

                <a
                  v-if="evento.ticketUrl"
                  :href="evento.ticketUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="btn-primary text-center"
                >
                  Comprar boletos
                </a>

                <a
                  v-if="evento.externalUrl"
                  :href="evento.externalUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-2 text-brand-primary text-sm font-semibold hover:underline"
                >
                  <ExternalLink class="w-4 h-4" />
                  Más información
                </a>
              </div>
            </div>

            <a
              :href="`/${citySlug}/eventos`"
              class="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-brand-text hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft class="w-4 h-4" />
              Todos los eventos de {{ navCityName }}
            </a>
          </aside>

        </div>
      </div>
    </div>
  </div>
</template>

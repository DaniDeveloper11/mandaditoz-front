<script setup>
import { MapPin, Users, Globe, Mail, Phone, Tag, ArrowLeft } from '@lucide/vue'
import { mapCreator } from '~/utils/strapi'
import { FALLBACK_CITY_SLUG, creatorUrl, creatorsUrl } from '~/utils/urls'
import { buildBreadcrumbJsonLd, serializeJsonLd } from '~/utils/seo'
import { getCreatorTypeConfig, arrobaDe, temasDe, ordenarRedes } from '~/utils/creadores'
import { POPULATE_FICHA } from '~/composables/useCreadores'

definePageMeta({ layout: 'landing' })

const route = useRoute()
const config = useRuntimeConfig()
const siteUrl = String(config.public?.siteUrl ?? '').replace(/\/$/, '')
const apiBase = config.public.apiBase

const citySlug = computed(() => String(route.params.city ?? '').toLowerCase())
const slug = computed(() => String(route.params.slug ?? '').toLowerCase())

// La resolución vive en la página y no en un composable para poder lanzar el 404
// durante el render del servidor, igual que [city]/eventos/[slug].vue. El
// controller de creator ya oculta draft y archived: si no hay resultado, la voz
// no existe para el público.
//
// El municipio de la URL se pide en la misma llamada: sin eso, una voz regional
// haría que /municipioinventado/voces/[slug] respondiera 200 —el mismo soft-404
// que ya evitan el listado y [city]/index.vue— y además da el nombre correcto
// para el breadcrumb cuando se llega desde otro municipio.
const { data: raw } = await useAsyncData(
  computed(() => `voz|${citySlug.value}|${slug.value}`),
  async () => {
    const [creatorRes, cityRes] = await Promise.all([
      $fetch(`${apiBase}/creators`, {
        query: {
          'filters[slug][$eq]': slug.value,
          ...POPULATE_FICHA,
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
      creator: creatorRes?.data?.[0] ?? null,
      urlCity: cityRes?.data?.[0] ?? null,
    }
  },
)

const creador = computed(() => mapCreator(raw.value?.creator ?? null))
const urlCity = computed(() => raw.value?.urlCity ?? null)

// Una voz de Etzatlán no se sirve bajo /san-juanito/voces/...: sería la misma
// página en dos URLs. Las regionales (visibleInAllCities) sí aparecen en la
// sección de cualquier municipio que exista, así que ahí no se bloquea.
const cityCoincide = computed(() => {
  const c = creador.value
  if (!c) return false
  if (citySlug.value !== FALLBACK_CITY_SLUG && !urlCity.value) return false
  if (c.visibleInAllCities) return true
  if (citySlug.value === FALLBACK_CITY_SLUG) return false
  return c.city?.slug === citySlug.value
})

if (!creador.value || !cityCoincide.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Voz no encontrada',
    fatal: true,
  })
}

const tipo = computed(() => getCreatorTypeConfig(creador.value.creatorType))
const arroba = computed(() => arrobaDe(creador.value))
const temas = computed(() => temasDe(creador.value))
const redes = computed(() => ordenarRedes(creador.value.socialLinks))

// Dos nombres distintos a propósito, igual que en la ficha de evento: el
// municipio de la voz es el que va en el texto y en los datos estructurados,
// mientras que el de navegación es el de la URL — una voz regional puede
// abrirse desde San Juanito o desde /jalisco, y el breadcrumb debe nombrar el
// lugar al que en realidad enlaza.
const cityName = computed(() => creador.value.city?.name ?? citySlug.value)
const navCityName = computed(() => {
  if (citySlug.value === FALLBACK_CITY_SLUG) return 'Jalisco'
  return urlCity.value?.name ?? cityName.value
})

const procedencia = computed(() =>
  creador.value.regionName
  || (creador.value.visibleInAllCities ? 'Toda la región' : creador.value.city?.name)
  || null,
)

const avatar = computed(() => {
  const img = creador.value.avatar
  return img?.formats?.small?.url ?? img?.url ?? null
})
const portada = computed(() => {
  const img = creador.value.coverImage
  return img?.formats?.large?.url ?? img?.formats?.medium?.url ?? img?.url ?? null
})

// SEO --------------------------------------------------------------
// CANÓNICA: creatorUrl sin override. Una voz regional se ve en la sección de
// varios municipios, y sin esto entraría a Google como contenido duplicado.
const pageUrl = computed(() => `${siteUrl}${creatorUrl(creador.value)}`)

const seoTitle = computed(() => {
  const c = creador.value
  return c.seo?.metaTitle || `${c.name} — ${tipo.value.label} de ${cityName.value} | Mandaditoz`
})

const seoDescription = computed(() => {
  const c = creador.value
  return c.seo?.metaDescription
    || c.tagline
    || (c.bio ? String(c.bio).slice(0, 160) : `${c.name}, ${tipo.value.label.toLowerCase()} de ${cityName.value}, Jalisco.`)
})

const ogImage = computed(() => {
  const c = creador.value
  return c.seo?.ogImage?.url || c.coverImage?.url || c.avatar?.url || `${siteUrl}/og-default.jpg`
})

useSeoMeta({
  title: () => seoTitle.value,
  description: () => seoDescription.value,
  ogType: 'profile',
  ogTitle: () => seoTitle.value,
  ogDescription: () => seoDescription.value,
  ogUrl: () => pageUrl.value,
  ogImage: () => ogImage.value,
  twitterCard: 'summary_large_image',
})

const jsonLdScripts = computed(() => {
  const c = creador.value
  const scripts = [{
    type: 'application/ld+json',
    innerHTML: serializeJsonLd(buildBreadcrumbJsonLd([
      { name: 'Inicio', url: `${siteUrl}/` },
      { name: navCityName.value, url: `${siteUrl}/${citySlug.value}` },
      { name: 'Voces', url: `${siteUrl}/${citySlug.value}/voces` },
      { name: c.name, url: pageUrl.value },
    ])),
  }]

  // Person y no Organization: un medio local podría ser lo segundo, pero el
  // schema no distingue persona de marca y equivocarse hacia Person es lo
  // inocuo — sameAs, name y description significan lo mismo en ambos.
  scripts.push({
    type: 'application/ld+json',
    innerHTML: serializeJsonLd({
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: c.name,
      url: pageUrl.value,
      ...(c.avatar?.url ? { image: c.avatar.url } : {}),
      ...(c.tagline || c.bio ? { description: c.tagline || c.bio } : {}),
      ...(c.city?.name ? { homeLocation: { '@type': 'Place', name: `${c.city.name}, Jalisco, México` } } : {}),
      // sameAs es justo para lo que existe: los perfiles de la misma persona en
      // otras plataformas.
      ...(redes.value.length || c.website
        ? { sameAs: [...redes.value.map(r => r.url), ...(c.website ? [c.website] : [])] }
        : {}),
    }),
  })

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
          <a :href="creatorsUrl(citySlug)" class="text-brand-primary hover:underline">Voces</a>
          <span class="text-gray-400">›</span>
          <span class="text-brand-text font-medium truncate max-w-[16rem]">{{ creador.name }}</span>
        </nav>
      </div>
    </div>

    <div class="bg-slate-50 px-6 md:px-12 py-8">
      <div class="max-w-5xl mx-auto flex flex-col gap-6">

        <!-- Encabezado -->
        <div class="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div v-if="portada" class="aspect-[3/1] bg-slate-100">
            <img
              :src="portada"
              :alt="creador.coverImage?.alternativeText || creador.name"
              class="w-full h-full object-cover"
            />
          </div>

          <div class="p-6 md:p-8 flex flex-col sm:flex-row gap-5">
            <img
              v-if="avatar"
              :src="avatar"
              :alt="creador.avatar?.alternativeText || creador.name"
              :class="[
                'w-24 h-24 rounded-full object-cover shrink-0 ring-4 ring-white',
                portada ? '-mt-16 sm:-mt-20 shadow-md' : 'ring-1 ring-gray-200',
              ]"
            />
            <div
              v-else
              class="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center shrink-0 ring-1 ring-gray-200"
            >
              <component :is="tipo.icon" class="w-9 h-9 text-brand-azulgris" />
            </div>

            <div class="min-w-0 flex-1">
              <span :class="['inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold', tipo.badgeStyle]">
                <component :is="tipo.icon" class="w-3 h-3" />
                {{ tipo.label }}
              </span>

              <h1 class="font-display font-black text-3xl md:text-4xl text-brand-text leading-tight mt-2">
                {{ creador.name }}
              </h1>
              <p v-if="arroba" class="text-brand-azulgris text-base mt-0.5">{{ arroba }}</p>

              <p v-if="creador.tagline" class="text-brand-text text-base mt-3 leading-relaxed">
                {{ creador.tagline }}
              </p>

              <div class="flex items-center gap-4 flex-wrap mt-4 text-brand-azulgris text-sm">
                <span v-if="procedencia" class="inline-flex items-center gap-1.5">
                  <MapPin class="w-4 h-4 shrink-0" />
                  {{ procedencia }}
                </span>
                <span v-if="creador.audienceText" class="inline-flex items-center gap-1.5">
                  <Users class="w-4 h-4 shrink-0" />
                  {{ creador.audienceText }}
                </span>
              </div>

              <CreatorSocialLinks :links="creador.socialLinks" class="mt-5" />
            </div>
          </div>
        </div>

        <!-- Bio -->
        <div v-if="creador.bio" class="bg-white rounded-2xl shadow-sm p-6 md:p-8">
          <h2 class="font-display font-black text-xl text-brand-text mb-3">Sobre {{ creador.name }}</h2>
          <p class="text-brand-text text-sm md:text-base leading-relaxed whitespace-pre-line">{{ creador.bio }}</p>
        </div>

        <!-- Temas -->
        <div v-if="temas.length" class="bg-white rounded-2xl shadow-sm p-6 md:p-8">
          <h2 class="font-display font-black text-xl text-brand-text mb-3 flex items-center gap-2">
            <Tag class="w-5 h-5 text-brand-primary" />
            Qué cubre
          </h2>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="tema in temas"
              :key="tema"
              class="px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-700"
            >
              {{ tema }}
            </span>
          </div>
        </div>

        <!-- Galería -->
        <div v-if="creador.gallery.length" class="bg-white rounded-2xl shadow-sm p-6 md:p-8">
          <h2 class="font-display font-black text-xl text-brand-text mb-4">Su trabajo</h2>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
            <img
              v-for="img in creador.gallery"
              :key="img.id"
              :src="img.formats?.medium?.url || img.formats?.small?.url || img.url"
              :alt="img.alternativeText || creador.name"
              loading="lazy"
              class="w-full aspect-square object-cover rounded-xl bg-slate-100"
            />
          </div>
        </div>

        <!-- Contacto -->
        <div
          v-if="creador.website || creador.contactEmail || creador.contactPhone"
          class="bg-white rounded-2xl shadow-sm p-6 md:p-8"
        >
          <h2 class="font-display font-black text-xl text-brand-text mb-4">Contacto</h2>
          <div class="flex flex-col gap-3">
            <a
              v-if="creador.website"
              :href="creador.website"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 text-brand-primary text-sm font-semibold hover:underline"
            >
              <Globe class="w-4 h-4 shrink-0" />
              {{ creador.website }}
            </a>
            <a
              v-if="creador.contactEmail"
              :href="`mailto:${creador.contactEmail}`"
              class="inline-flex items-center gap-2 text-brand-primary text-sm font-semibold hover:underline"
            >
              <Mail class="w-4 h-4 shrink-0" />
              {{ creador.contactEmail }}
            </a>
            <a
              v-if="creador.contactPhone"
              :href="`tel:${creador.contactPhone}`"
              class="inline-flex items-center gap-2 text-brand-primary text-sm font-semibold hover:underline"
            >
              <Phone class="w-4 h-4 shrink-0" />
              {{ creador.contactPhone }}
            </a>
          </div>
        </div>

        <!-- Volver -->
        <a
          :href="creatorsUrl(citySlug)"
          class="inline-flex items-center gap-1.5 text-brand-primary text-sm font-semibold hover:underline"
        >
          <ArrowLeft class="w-4 h-4" />
          Ver todas las voces de {{ navCityName }}
        </a>

      </div>
    </div>
  </div>
</template>

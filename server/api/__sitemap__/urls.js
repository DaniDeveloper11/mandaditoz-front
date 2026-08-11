/**
 * Dynamic sitemap source: emite todas las URLs de negocios publicados
 * consumiendo Strapi. Se consume desde nuxt.config.ts:
 *   sitemap: { sources: ['/api/__sitemap__/urls'] }
 *
 * Formato: /[city-slug]/[business-slug]. Negocios sin ciudad o con
 * visibleInAllCities caen al slug reservado "jalisco".
 */

const FALLBACK_CITY_SLUG = 'jalisco'

export default defineEventHandler(async () => {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase

  const urls = []

  try {
    let page = 1
    const pageSize = 100
    for (;;) {
      const res = await $fetch(`${apiBase}/businesses`, {
        query: {
          'filters[businessStatus][$eq]': 'published',
          'fields[0]': 'slug',
          'fields[1]': 'updatedAt',
          'fields[2]': 'visibleInAllCities',
          'populate[city][fields][0]': 'slug',
          'pagination[page]': page,
          'pagination[pageSize]': pageSize,
        },
      })

      const items = res?.data ?? []
      for (const b of items) {
        if (!b?.slug) continue
        const citySlug = b.visibleInAllCities
          ? FALLBACK_CITY_SLUG
          : (b.city?.slug || FALLBACK_CITY_SLUG)
        urls.push({
          loc: `/${citySlug}/${b.slug}`,
          lastmod: b.updatedAt ?? undefined,
          changefreq: 'weekly',
          priority: 0.8,
        })
      }

      const pageCount = res?.meta?.pagination?.pageCount ?? 1
      if (page >= pageCount || items.length === 0) break
      page += 1
    }
  } catch (err) {
    console.error('[sitemap] failed to fetch businesses:', err?.message ?? err)
  }

  return urls
})

/**
 * Dynamic sitemap source. Emite:
 *   - /[city]                        (una por ciudad activa)
 *   - /[city]/[categoria]            (por combinación con al menos 1 negocio)
 *   - /[city]/[business-slug]        (todos los negocios publicados)
 *
 * Se consume desde nuxt.config.ts:
 *   sitemap: { sources: ['/api/__sitemap__/urls'] }
 */

const FALLBACK_CITY_SLUG = 'jalisco'

async function fetchAllPages(apiBase, endpoint, extraQuery = {}) {
  const out = []
  let page = 1
  const pageSize = 100
  for (;;) {
    const res = await $fetch(`${apiBase}${endpoint}`, {
      query: {
        ...extraQuery,
        'pagination[page]': page,
        'pagination[pageSize]': pageSize,
      },
    })
    const items = res?.data ?? []
    out.push(...items)
    const pageCount = res?.meta?.pagination?.pageCount ?? 1
    if (page >= pageCount || items.length === 0) break
    page += 1
  }
  return out
}

export default defineEventHandler(async () => {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase

  const urls = []

  try {
    // Ciudades activas → landing por municipio.
    const cities = await fetchAllPages(apiBase, '/cities', {
      'filters[isActive][$eq]': true,
      'fields[0]': 'slug',
      'fields[1]': 'updatedAt',
    })
    for (const c of cities) {
      if (c?.slug) {
        urls.push({
          loc: `/${c.slug}`,
          lastmod: c.updatedAt ?? undefined,
          changefreq: 'daily',
          priority: 0.9,
        })
      }
    }

    // Combinaciones ciudad × categoría con al menos un negocio publicado.
    // Estrategia: por cada ciudad, pedir categorías que tengan negocios ahí.
    for (const c of cities) {
      if (!c?.slug) continue
      const cats = await fetchAllPages(apiBase, '/categories', {
        'filters[isActive][$eq]': true,
        'filters[businesses][city][slug][$eq]': c.slug,
        'fields[0]': 'slug',
      })
      for (const cat of cats) {
        if (cat?.slug) {
          urls.push({
            loc: `/${c.slug}/${cat.slug}`,
            changefreq: 'weekly',
            priority: 0.85,
          })
        }
      }
    }

    // Fichas individuales de negocios.
    const businesses = await fetchAllPages(apiBase, '/businesses', {
      'filters[businessStatus][$eq]': 'published',
      'fields[0]': 'slug',
      'fields[1]': 'updatedAt',
      'fields[2]': 'visibleInAllCities',
      'populate[city][fields][0]': 'slug',
    })
    for (const b of businesses) {
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
  } catch (err) {
    console.error('[sitemap] failed to fetch:', err?.message ?? err)
  }

  return urls
})

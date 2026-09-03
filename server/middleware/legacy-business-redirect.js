/**
 * Redirige 301 desde la URL legacy /negocios/[slug] hacia la canónica
 * /[city-slug]/[slug]. Preserva SEO de URLs viejas ya indexadas por Google
 * y evita duplicate content. Los sub-paths (/edit, /estado) se ignoran.
 */

const FALLBACK_CITY_SLUG = 'jalisco'
const RESERVED_SLUGS = new Set(['nuevo', 'publicar'])

export default defineEventHandler(async (event) => {
  const url = getRequestURL(event)
  const match = url.pathname.match(/^\/negocios\/([^\/]+)\/?$/)
  if (!match) return
  const slug = match[1]
  if (RESERVED_SLUGS.has(slug)) return

  const config = useRuntimeConfig()
  try {
    const res = await $fetch(`${config.public.apiBase}/businesses`, {
      query: {
        'filters[slug][$eq]': slug,
        'fields[0]': 'slug',
        'fields[1]': 'visibleInAllCities',
        'populate[city][fields][0]': 'slug',
        'pagination[pageSize]': 1,
      },
    })
    const biz = res?.data?.[0]
    // La API respondió y el negocio no existe: 404 de verdad. Antes se dejaba
    // pasar a la página, que pintaba "Negocio no encontrado" con status 200 y
    // Google lo indexaba como página válida.
    if (!biz) {
      throw createError({ statusCode: 404, statusMessage: 'Negocio no encontrado' })
    }

    const citySlug = biz.visibleInAllCities
      ? FALLBACK_CITY_SLUG
      : (biz.city?.slug || FALLBACK_CITY_SLUG)
    const target = `/${citySlug}/${biz.slug}${url.search ?? ''}`
    return sendRedirect(event, target, 301)
  } catch (err) {
    // El 404 de arriba tiene que propagarse; solo se tragan los fallos de red
    // o de Strapi, donde asumir "no existe" sería convertir una caída en 404s.
    if (err?.statusCode === 404) throw err
    console.error('[legacy-redirect] failed for slug', slug, err?.message ?? err)
  }
})

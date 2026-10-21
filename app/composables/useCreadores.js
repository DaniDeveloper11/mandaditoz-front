import { mapCreator } from '~/utils/strapi'
import { FALLBACK_CITY_SLUG } from '~/utils/urls'

export const VOCES_PAGE_SIZE = 24

/**
 * Populate acotado: la lista solo necesita lo que pintan la tarjeta y
 * creatorUrl(). La galería y la portada pesan y son cosa de la ficha.
 */
const POPULATE_LISTA = {
  'populate[city][fields][0]': 'name',
  'populate[city][fields][1]': 'slug',
  'populate[avatar]': true,
  'populate[socialLinks]': true,
}

/** La ficha sí trae todo. */
export const POPULATE_FICHA = {
  'populate[city][fields][0]': 'name',
  'populate[city][fields][1]': 'slug',
  'populate[avatar]': true,
  'populate[coverImage]': true,
  'populate[gallery]': true,
  'populate[socialLinks]': true,
  'populate[seo][populate][ogImage]': true,
}

/**
 * Query del directorio de voces de un municipio.
 *
 * `creatorStatus` NO se manda: el controller de creator lo fuerza a 'published'
 * pisando lo que venga del cliente, así que mandarlo solo agrega ruido. Mismo
 * criterio que queryEventos con postStatus.
 *
 * A diferencia de la cartelera aquí no hay vigencia: una voz no caduca. El
 * orden es el que fija el admin y luego alfabético, que para veinte fichas es
 * más útil que la fecha de alta.
 */
export function queryCreadores({ citySlug, tipo = null, pagina = 1, porPagina = VOCES_PAGE_SIZE, soloConteo = false }) {
  const ciudad = String(citySlug ?? '').toLowerCase()

  // `jalisco` es el slug reservado de los negocios sin ciudad, no un municipio:
  // su directorio son las voces regionales. Mismo criterio que useEventos.js.
  const filtroCiudad = ciudad === FALLBACK_CITY_SLUG
    ? { 'filters[visibleInAllCities][$eq]': true }
    : {
        'filters[$and][0][$or][0][city][slug][$eq]': ciudad,
        'filters[$and][0][$or][1][visibleInAllCities][$eq]': true,
      }

  return {
    ...filtroCiudad,
    ...(tipo ? { 'filters[creatorType][$eq]': tipo } : {}),
    sort: 'isFeatured:desc,featuredOrder:asc,name:asc',
    // El conteo solo mira meta.pagination.total: pedir los datos sería desperdicio.
    ...(soloConteo ? {} : POPULATE_LISTA),
    'pagination[page]': soloConteo ? 1 : pagina,
    'pagination[pageSize]': soloConteo ? 1 : porPagina,
  }
}

/**
 * Directorio paginado de voces de un municipio.
 *
 * Vive en un composable y no dentro de la página porque lo reusan la banda de la
 * home del municipio (CreatorBand) y la propia sección.
 */
export function useCreadores(filtros) {
  const config = useRuntimeConfig()
  const base = config.public.apiBase

  const key = computed(() => {
    const f = toValue(filtros)
    return `voces|city:${f.citySlug ?? ''}|tipo:${f.tipo ?? ''}|p:${f.pagina ?? 1}|n:${f.porPagina ?? VOCES_PAGE_SIZE}`
  })

  const query = computed(() => queryCreadores(toValue(filtros)))

  const { data, pending, error, refresh } = useFetch(`${base}/creators`, {
    key,
    query,
    headers: { 'Content-Type': 'application/json' },
  })

  const creadores = computed(() => (data.value?.data ?? []).map(mapCreator).filter(Boolean))
  const paginacion = computed(() => data.value?.meta?.pagination ?? null)

  return { creadores, paginacion, pending, error, refresh }
}

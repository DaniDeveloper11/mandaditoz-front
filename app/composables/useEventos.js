import { mapCityPost } from '~/utils/strapi'
import { FALLBACK_CITY_SLUG } from '~/utils/urls'

export const EVENTOS_PAGE_SIZE = 24

/**
 * Populate acotado a propósito: `populate[businesses]` sin `fields` devuelve el
 * negocio COMPLETO —descripción, mapEmbedUrl, todo— por cada evento de la lista.
 * Aquí solo hacen falta los campos que necesita businessUrl().
 */
const POPULATE = {
  'populate[city][fields][0]': 'name',
  'populate[city][fields][1]': 'slug',
  'populate[coverImage]': true,
  'populate[businesses][fields][0]': 'name',
  'populate[businesses][fields][1]': 'slug',
  'populate[businesses][fields][2]': 'visibleInAllCities',
  'populate[businesses][populate][city][fields][0]': 'name',
  'populate[businesses][populate][city][fields][1]': 'slug',
}

/**
 * Query de la cartelera de un municipio.
 *
 * `postStatus` NO se manda: el controller de city-post lo fuerza a 'published'
 * pisando lo que venga del cliente, así que mandarlo solo agrega ruido.
 *
 * El `ahora` se calcula aquí dentro y NO entra en la key del fetch, igual que en
 * useNegocios.js: `new Date()` no es una dependencia reactiva —el computed no se
 * re-evalúa solo y useFetch no entra en bucle— y si el timestamp formara parte
 * de la key, cada request sería un cache miss.
 */
export function queryEventos({ citySlug, pasados = false, pagina = 1, porPagina = EVENTOS_PAGE_SIZE, soloConteo = false }) {
  const ahora = new Date().toISOString()
  const ciudad = String(citySlug ?? '').toLowerCase()

  // `jalisco` es el slug reservado de los negocios sin ciudad, no un municipio:
  // su cartelera son los eventos regionales. Mismo criterio que [city]/index.vue.
  const filtroCiudad = ciudad === FALLBACK_CITY_SLUG
    ? { 'filters[visibleInAllCities][$eq]': true }
    : {
        'filters[$and][0][$or][0][city][slug][$eq]': ciudad,
        'filters[$and][0][$or][1][visibleInAllCities][$eq]': true,
      }

  return {
    ...filtroCiudad,
    // Vigente = una sola condición indexable. El lifecycle del backend garantiza
    // que endAt nunca es nulo justamente para que esto funcione.
    ...(pasados
      ? { 'filters[endAt][$lt]': ahora }
      : { 'filters[endAt][$gte]': ahora }),
    sort: pasados
      ? 'startAt:desc'
      : 'isFeatured:desc,featuredOrder:asc,startAt:asc',
    // El conteo solo mira meta.pagination.total: pedir los datos sería desperdicio.
    ...(soloConteo ? {} : POPULATE),
    'pagination[page]': soloConteo ? 1 : pagina,
    'pagination[pageSize]': soloConteo ? 1 : porPagina,
  }
}

/**
 * Cartelera paginada de un municipio.
 *
 * Vive en un composable y no dentro de la página porque la Fase 3 lo reusa en la
 * banda de la home del municipio y en el bloque "Próximos eventos aquí" de la
 * ficha de negocio.
 */
export function useEventos(filtros) {
  const config = useRuntimeConfig()
  const base = config.public.apiBase

  const key = computed(() => {
    const f = toValue(filtros)
    return `eventos|city:${f.citySlug ?? ''}|pasados:${!!f.pasados}|p:${f.pagina ?? 1}|n:${f.porPagina ?? EVENTOS_PAGE_SIZE}`
  })

  const query = computed(() => queryEventos(toValue(filtros)))

  const { data, pending, error, refresh } = useFetch(`${base}/city-posts`, {
    key,
    query,
    headers: { 'Content-Type': 'application/json' },
  })

  const eventos = computed(() => (data.value?.data ?? []).map(mapCityPost).filter(Boolean))
  const paginacion = computed(() => data.value?.meta?.pagination ?? null)

  return { eventos, paginacion, pending, error, refresh }
}

/**
 * Eventos vigentes en los que participa un negocio.
 *
 * Va al revés de lo que parecería natural: NO se populan desde el negocio
 * (`/api/businesses?populate=events`), porque `business.events` es
 * `private: true` en el backend a propósito — ese populate esquivaría el
 * controller de city-post, que es el único que fuerza `postStatus=published`, y
 * filtraría los borradores del municipio. Se consulta la cartelera filtrando por
 * el negocio, que sí pasa por el controller.
 */
export function useEventosDeNegocio(slug, { limite = 3 } = {}) {
  const config = useRuntimeConfig()
  const base = config.public.apiBase

  const key = computed(() => `eventos-negocio|${toValue(slug) ?? ''}|n:${limite}`)

  const query = computed(() => ({
    'filters[businesses][slug][$eq]': toValue(slug) ?? '',
    'filters[endAt][$gte]': new Date().toISOString(),
    sort: 'startAt:asc',
    ...POPULATE,
    'pagination[pageSize]': limite,
  }))

  const { data, pending, error } = useFetch(`${base}/city-posts`, {
    key,
    query,
    headers: { 'Content-Type': 'application/json' },
    // Sin slug no hay nada que preguntar.
    immediate: !!toValue(slug),
  })

  const eventos = computed(() => (data.value?.data ?? []).map(mapCityPost).filter(Boolean))

  return { eventos, pending, error }
}

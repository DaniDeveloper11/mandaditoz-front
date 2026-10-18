import { mapNegocio } from '~/utils/strapi'
import { condicionesAbiertoAhora } from '~/utils/horario'

const SORT_MAP = {
  // `relevance` lo entiende el controller del backend, no Strapi: con `q`
  // ordena por la puntuacion de la busqueda (ver utils/business-search.js).
  relevancia: 'relevance',
  rating:    'ratingAverage:desc',
  nombre:    'name:asc',
  recientes: 'createdAt:desc',
  populares: 'viewCount:desc',
}

export function useNegocios(filtros) {
  const config = useRuntimeConfig()
  const base   = config.public.apiBase
  const cityStore = useCityStore()

  const key = computed(() => {
    const f = toValue(filtros)
    const ciudad = f.ciudad ?? cityStore.activeCitySlug
    return `negocios|cat:${f.categoria ?? ''}|q:${f.query ?? ''}|city:${ciudad ?? ''}|nb:${f.colonia ?? ''}|price:${f.priceLevel ?? ''}|feat:${!!f.isFeatured}|ver:${!!f.soloVerificados}|abiertos:${!!f.abiertosAhora}|ord:${f.orden}|p:${f.pagina}`
  })

  const query = computed(() => {
    const f = toValue(filtros)
    const ciudad = f.ciudad ?? cityStore.activeCitySlug

    const andGroups = []
    if (ciudad) {
      andGroups.push({
        '$or': [
          { city: { slug: { '$eq': ciudad } } },
          { visibleInAllCities: { '$eq': true } },
        ],
      })
    }
    if (f.categoria) {
      andGroups.push({
        '$or': [
          { category:            { slug: { '$eq': f.categoria } } },
          { secondaryCategories: { slug: { '$eq': f.categoria } } },
        ],
      })
    }
    // La busqueda de texto la resuelve el backend con `q` (sin acentos, por
    // palabras, en nombre, descripcion, categorias, etiquetas, colonia y menu).
    // Ver backend/src/utils/business-search.js.
    const q = f.query?.trim()

    if (f.isFeatured) {
      // Destacado = la decision permanente del admin (isFeatured) O una
      // promocion con fecha aun vigente (featuredUntil). Son independientes:
      // el flag manda aunque la fecha ya haya pasado, y una fecha futura
      // destaca aunque el flag este apagado.
      //
      // El "ahora" se calcula aqui dentro: `new Date()` no es una dependencia
      // reactiva, asi que el computed no se re-evalua solo y useFetch nunca
      // entra en bucle. Va como STRING: un Date pasaria por el flatten de
      // abajo como objeto y el filtro se perderia en silencio.
      andGroups.push({
        '$or': [
          { isFeatured:    { '$eq': true } },
          { featuredUntil: { '$gt': new Date().toISOString() } },
        ],
      })
    }

    if (f.abiertosAhora) {
      // Abierto ahora = alguna franja de `hours` cubre este instante. Igual que
      // arriba con featuredUntil, el "ahora" se calcula aqui dentro y no es una
      // dependencia reactiva: el computed no se re-evalua solo, asi que la lista
      // queda congelada en la hora en que se cargo la pagina en vez de refetchear
      // en bucle. Las excepciones por feriado no entran en el filtro; de eso se
      // encarga la badge Abierto/Cerrado de cada tarjeta.
      andGroups.push({ '$or': condicionesAbiertoAhora() })
    }

    const andParams = {}
    andGroups.forEach((group, i) => {
      group['$or'].forEach((cond, j) => {
        const flatten = (obj, path) => {
          for (const [k, v] of Object.entries(obj)) {
            const next = `${path}[${k}]`
            if (v && typeof v === 'object' && !Array.isArray(v)) flatten(v, next)
            else andParams[next] = v
          }
        }
        flatten(cond, `filters[$and][${i}][$or][${j}]`)
      })
    })

    // En los carruseles/listados de destacados manda la posicion manual
    // (featuredOrder: 1 = primero). Postgres deja los NULL al final con asc,
    // asi que los que no tienen numero caen despues, ordenados por rating.
    const baseSort = SORT_MAP[f.orden] ?? SORT_MAP.rating
    const sort = f.isFeatured && baseSort === SORT_MAP.rating
      ? `featuredOrder:asc,${SORT_MAP.rating}`
      : baseSort

    return {
      ...andParams,
      ...(q                 && { q }),
      ...(f.colonia        && { 'filters[neighborhood][slug][$eq]': f.colonia }),
      ...(f.priceLevel      && { 'filters[priceLevel][$eq]': f.priceLevel }),
      ...(f.soloVerificados && { 'filters[isVerified][$eq]': true }),
      'filters[businessStatus][$eq]': 'published',
      'filters[archivedAt][$null]': true,
      sort,
      'populate[category]': true,
      'populate[secondaryCategories]': true,
      'populate[city]': true,
      'populate[neighborhood]': true,
      'populate[tags]': true,
      'populate[geo]': true,
      'populate[address]': true,
      'populate[logo]': true,
      'populate[coverPhoto]': true,
      'populate[hours]': true,
      'populate[phones]': true,
      'pagination[page]':     f.pagina    ?? 1,
      'pagination[pageSize]': f.porPagina ?? 12,
    }
  })

  const { data, pending, error, refresh } = useFetch(`${base}/businesses`, {
    key,
    query,
    headers: { 'Content-Type': 'application/json' },
  })

  const negocios   = computed(() => data.value?.data?.map(mapNegocio) ?? [])
  const paginacion = computed(() => data.value?.meta?.pagination ?? null)

  return { negocios, paginacion, pending, error, refresh }
}

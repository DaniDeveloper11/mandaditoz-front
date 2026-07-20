import { mapCategoria } from '~/utils/strapi'

/**
 * Trae categorías activas. Por defecto solo raíces (depth=0).
 * Opciones:
 *  - `limit`            (number) tamaño de página. Default 100.
 *  - `allDepths`        (bool)   si true, no restringe por depth. Default false.
 *  - `includeChildren`  (bool)   si true, popula hijas. Default false.
 *  - `ciudad`           (string|true) filtra categorías que tengan al menos un
 *                       negocio en esa ciudad. Pasar `true` usa la ciudad activa
 *                       del store (reactivo: refetch al cambiar de ciudad).
 */
export function useCategorias(options = {}) {
  // Retrocompatibilidad: si se pasa un número se interpreta como limit + todas las profundidades.
  const opts = typeof options === 'number' ? { limit: options, allDepths: true } : options
  const limit = opts.limit ?? 100
  const allDepths = opts.allDepths ?? false
  const includeChildren = opts.includeChildren ?? false
  const filtroCiudad = opts.ciudad ?? null

  const config = useRuntimeConfig()
  const base = config.public.apiBase
  const cityStore = useCityStore()

  const ciudadSlug = computed(() => {
    if (filtroCiudad === true) return cityStore.activeCitySlug
    if (typeof filtroCiudad === 'string' && filtroCiudad) return filtroCiudad
    return null
  })

  const key = computed(() =>
    `categorias|city:${ciudadSlug.value ?? ''}|depth:${allDepths ? 'all' : '0'}|ch:${includeChildren ? '1' : '0'}|lim:${limit}`,
  )

  const query = computed(() => ({
    'filters[isActive][$eq]': true,
    ...(!allDepths && { 'filters[depth][$eq]': 0 }),
    ...(includeChildren && { 'populate[children]': true }),
    ...(ciudadSlug.value && { 'filters[businesses][city][slug][$eq]': ciudadSlug.value }),
    sort: 'order:asc,name:asc',
    'pagination[pageSize]': limit,
  }))

  const { data, pending, error, refresh } = useFetch(`${base}/categories`, {
    key,
    query,
    headers: { 'Content-Type': 'application/json' },
  })

  const categorias = computed(() => data.value?.data?.map(mapCategoria) ?? [])

  return { categorias, pending, error, refresh }
}

/** Trae solo categorías destacadas (isFeatured=true) para landing. */
export function useCategoriasDestacadas(limit = 8) {
  const { get } = useApi()

  const { data, pending, error } = get('/categories', {
    'filters[isActive][$eq]': true,
    'filters[isFeatured][$eq]': true,
    sort: 'order:asc',
    'pagination[pageSize]': limit,
  })

  const categorias = computed(() => data.value?.data?.map(mapCategoria) ?? [])

  return { categorias, pending, error }
}

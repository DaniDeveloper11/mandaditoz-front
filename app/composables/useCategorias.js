import { mapCategoria } from '~/utils/strapi'

/**
 * Trae categorías activas. Por defecto solo raíces (depth=0).
 * Pasar `{ includeChildren: true, allDepths: true }` para el árbol completo con hijas populadas.
 */
export function useCategorias(options = {}) {
  // Retrocompatibilidad: si se pasa un número se interpreta como limit + todas las profundidades.
  const opts = typeof options === 'number' ? { limit: options, allDepths: true } : options
  const limit = opts.limit ?? 100
  const allDepths = opts.allDepths ?? false
  const includeChildren = opts.includeChildren ?? false

  const { get } = useApi()

  const query = {
    'filters[isActive][$eq]': true,
    ...(!allDepths && { 'filters[depth][$eq]': 0 }),
    ...(includeChildren && { 'populate[children]': true }),
    sort: 'order:asc,name:asc',
    'pagination[pageSize]': limit,
  }

  const { data, pending, error } = get('/categories', query)

  const categorias = computed(() => data.value?.data?.map(mapCategoria) ?? [])

  return { categorias, pending, error }
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

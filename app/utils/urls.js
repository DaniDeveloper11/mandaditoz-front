/**
 * Slug reservado para negocios sin ciudad asignada o con visibleInAllCities=true.
 * Se usa como segmento en la URL: /jalisco/nombre-del-negocio
 */
export const FALLBACK_CITY_SLUG = 'jalisco'

/**
 * Rutas top-level estáticas que NO deben tratarse como slug de ciudad.
 * Si una ciudad de Strapi tuviera uno de estos slugs por accidente, la
 * validación en /[city]/[slug].vue devolvería 404 y no rompería la ruta estática.
 */
export const RESERVED_TOP_LEVEL_PATHS = new Set([
  'about', 'categorias', 'contacto', 'cuenta', 'how-to-work',
  'list', 'login', 'mis-negocios', 'negocios', 'privacidad',
  'reclamar', 'reset-password', 'terminos', FALLBACK_CITY_SLUG,
])

/**
 * Devuelve el segmento de ciudad que debe aparecer en la URL de un negocio.
 * Los negocios sin city o con visibleInAllCities caen al slug reservado.
 */
export function citySegmentFor(negocio) {
  if (!negocio) return FALLBACK_CITY_SLUG
  if (negocio.visibleInAllCities) return FALLBACK_CITY_SLUG
  return negocio.city?.slug || FALLBACK_CITY_SLUG
}

/**
 * URL canónica de un negocio: /[city]/[slug]
 * Reemplaza el viejo /negocios/[slug].
 */
export function businessUrl(negocio) {
  if (!negocio?.slug) return '/'
  return `/${citySegmentFor(negocio)}/${negocio.slug}`
}

/**
 * Valida un destino de navegación interno antes de mandarlo a navigateTo.
 *
 * Solo se acepta una ruta del propio sitio: sin esto,
 * /login?redirect=https://sitio.malo saca al usuario fuera de Mandaditoz desde
 * un enlace que parece nuestro, que es como funciona el phishing por open
 * redirect. Se rechaza `//host` y `/\host` porque los navegadores las tratan
 * como absolutas aunque empiecen con barra.
 *
 * Gemela de safeRedirectPath en backend/src/utils/redirect.js: el valor viaja
 * por el body del registro y luego de vuelta en el `?to=` del 302, así que se
 * valida en las dos puntas.
 */
export function safeRedirectPath(value) {
  const path = String(value ?? '').trim()
  if (!path.startsWith('/')) return null
  if (path.startsWith('//') || path.startsWith('/\\')) return null
  if (path.length > 255) return null
  return path
}

export function businessEditUrl(negocio) {
  if (!negocio?.slug) return '/'
  return `/negocios/${negocio.slug}/edit`
}

export function businessStatusUrl(negocio) {
  if (!negocio?.slug) return '/'
  return `/negocios/${negocio.slug}/estado`
}

export function businessMenuUrl(negocio) {
  if (!negocio?.slug) return '/'
  return `/negocios/${negocio.slug}/menu`
}

/**
 * Builders de JSON-LD (schema.org) para páginas de negocio y para la cartelera
 * del municipio. Se inyecta vía useHead({ script: [...] }) para que Google
 * muestre rich results (estrellas, horario, dirección, fecha) en los resultados
 * de búsqueda.
 */
import { isoConOffset } from '~/utils/fechas'
import { businessUrl } from '~/utils/urls'

const DAY_TO_SCHEMA = {
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
  sun: 'Sunday',
}

const PRICE_LEVEL_TO_RANGE = {
  1: '$',
  2: '$$',
  3: '$$$',
  4: '$$$$',
  budget: '$',
  moderate: '$$',
  expensive: '$$$',
  luxury: '$$$$',
}

// Mapeo de categoría → tipo específico de schema.org. Los que no matchean caen a "LocalBusiness".
const CATEGORY_TO_SCHEMA_TYPE = {
  restaurantes: 'Restaurant',
  restaurante: 'Restaurant',
  comida: 'Restaurant',
  taqueria: 'Restaurant',
  taquerias: 'Restaurant',
  cafeterias: 'CafeOrCoffeeShop',
  cafeteria: 'CafeOrCoffeeShop',
  cafe: 'CafeOrCoffeeShop',
  bares: 'BarOrPub',
  bar: 'BarOrPub',
  // Slugs de comida que existen en la base viva y antes caían a LocalBusiness.
  // Sin un tipo Restaurant/Food* schema.org ignora `hasMenu`.
  tacos: 'Restaurant',
  mariscos: 'Restaurant',
  birria: 'Restaurant',
  carne: 'Restaurant',
  carnitas: 'Restaurant',
  pollo: 'Restaurant',
  rosticeria: 'Restaurant',
  lonche: 'Restaurant',
  botanas: 'Restaurant',
  ensalada: 'Restaurant',
  sushi: 'Restaurant',
  tamales: 'Restaurant',
  'comida-y-bebidas': 'Restaurant',
  pizza: 'FastFoodRestaurant',
  alas: 'FastFoodRestaurant',
  hamburguesas: 'FastFoodRestaurant',
  panaderias: 'Bakery',
  tortillerias: 'Bakery',
  deposito: 'LiquorStore',
  tiendas: 'Store',
  tienda: 'Store',
  abarrotes: 'GroceryStore',
  farmacias: 'Pharmacy',
  farmacia: 'Pharmacy',
  hoteles: 'LodgingBusiness',
  hotel: 'LodgingBusiness',
  medicos: 'MedicalBusiness',
  salud: 'MedicalBusiness',
  belleza: 'BeautySalon',
  estetica: 'BeautySalon',
  automotriz: 'AutoRepair',
  mecanica: 'AutoRepair',
}

function normalizePhone(number) {
  if (!number) return null
  const cleaned = String(number).replace(/[^\d+]/g, '')
  return cleaned || null
}

function normalizeTime(t) {
  if (!t) return null
  // Strapi puede devolver "08:00:00.000" o "08:00" — schema.org quiere HH:MM
  return String(t).slice(0, 5)
}

export function buildBusinessJsonLd(n, { siteUrl, pageUrl }) {
  if (!n) return null

  const schemaType = CATEGORY_TO_SCHEMA_TYPE[n.category?.slug?.toLowerCase()] ?? 'LocalBusiness'

  const images = [
    n.coverPhoto?.url,
    n.logo?.url,
    ...(n.photos ?? []).map(p => p?.url),
  ].filter(Boolean)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': schemaType,
    '@id': pageUrl,
    name: n.name,
    url: pageUrl,
  }

  const desc = n.shortDescription || n.description
  if (desc) jsonLd.description = desc
  if (images.length) jsonLd.image = images

  const streetAddress = n.address || n.addressRaw?.rawText
  if (streetAddress || n.city?.name) {
    jsonLd.address = {
      '@type': 'PostalAddress',
      ...(streetAddress && { streetAddress }),
      ...(n.city?.name && { addressLocality: n.city.name }),
      addressRegion: 'Jalisco',
      ...(n.neighborhood?.postalCode && { postalCode: n.neighborhood.postalCode }),
      addressCountry: 'MX',
    }
  }

  if (n.geo?.lat != null && n.geo?.lng != null) {
    jsonLd.geo = {
      '@type': 'GeoCoordinates',
      latitude: n.geo.lat,
      longitude: n.geo.lng,
    }
  }

  const primaryPhone = n.phones?.find(p => p.isPrimary) ?? n.phones?.[0]
  const tel = normalizePhone(primaryPhone?.number)
  if (tel) jsonLd.telephone = tel

  if (n.email) jsonLd.email = n.email

  const opening = []
  for (const h of (n.hours ?? [])) {
    if (h.isClosed) continue
    const day = DAY_TO_SCHEMA[h.dayOfWeek]
    if (!day) continue
    if (h.is24Hours) {
      opening.push({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: day,
        opens: '00:00',
        closes: '23:59',
      })
      continue
    }
    const opens = normalizeTime(h.openTime)
    const closes = normalizeTime(h.closeTime)
    if (opens && closes) {
      opening.push({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: day,
        opens,
        closes,
      })
    }
  }
  if (opening.length) jsonLd.openingHoursSpecification = opening

  if ((n.ratingCount ?? 0) > 0) {
    jsonLd.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: Number(n.ratingAverage ?? 0).toFixed(1),
      reviewCount: n.ratingCount,
      bestRating: 5,
      worstRating: 1,
    }
  }

  const priceRange = PRICE_LEVEL_TO_RANGE[n.priceLevel]
  if (priceRange) jsonLd.priceRange = priceRange

  const sameAs = (n.socialLinks ?? []).map(s => s?.url).filter(Boolean)
  if (n.website) sameAs.push(n.website)
  if (sameAs.length) jsonLd.sameAs = sameAs

  const menu = buildMenuJsonLd(n, schemaType)
  if (menu) jsonLd.hasMenu = menu

  return jsonLd
}

// schema.org solo reconoce `hasMenu` en establecimientos de comida.
const TYPES_WITH_MENU = new Set([
  'Restaurant',
  'FastFoodRestaurant',
  'CafeOrCoffeeShop',
  'BarOrPub',
  'Bakery',
])

/** Menú estructurado → schema.org Menu / MenuSection / MenuItem. */
function buildMenuJsonLd(n, schemaType) {
  if (!TYPES_WITH_MENU.has(schemaType)) return null

  const sections = (n.menuSections ?? [])
    .filter(s => s.items?.length > 0)
    .map(s => ({
      '@type': 'MenuSection',
      name: s.name,
      ...(s.description && { description: s.description }),
      hasMenuItem: s.items.map(item => ({
        '@type': 'MenuItem',
        name: item.name,
        ...(item.description && { description: item.description }),
        offers: {
          '@type': 'Offer',
          price: Number(item.price ?? 0).toFixed(2),
          priceCurrency: 'MXN',
          availability: item.isAvailable
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
        },
      })),
    }))

  if (!sections.length) return null

  return {
    '@type': 'Menu',
    name: `Menú de ${n.name}`,
    hasMenuSection: sections,
  }
}

// -----------------------------------------------------------------------------
// Cartelera del municipio (city-post)
// -----------------------------------------------------------------------------

/**
 * Intenta sacar un precio numérico del texto libre de `priceText`.
 * Devuelve string (schema.org lo quiere así) o null si no es interpretable.
 */
function parsePrecioEvento(texto) {
  if (!texto) return null
  const t = String(texto).trim()
  if (/(libre|gratis|gratuit[ao]|sin costo|sin cover)/i.test(t)) return '0'
  const m = t.match(/\d+(?:[.,]\d{1,2})?/)
  if (!m) return null
  const n = Number(m[0].replace(',', '.'))
  return Number.isFinite(n) ? String(n) : null
}

/**
 * JSON-LD de schema.org para un evento de la cartelera.
 *
 * Devuelve null cuando `kind` es 'aviso': un corte de agua no es un evento, y
 * marcarlo como `Event` para robar rich results es justo lo que las políticas de
 * datos estructurados de Google clasifican como spam. Un aviso lleva solo el
 * breadcrumb.
 *
 * `location` es obligatorio para que Google muestre el rich result, así que se
 * resuelve en cascada —lugar declarado → negocio sede → el municipio— y siempre
 * sale un Place.
 */
export function buildEventJsonLd(post, { siteUrl, pageUrl }) {
  if (!post) return null
  if (post.kind === 'aviso') return null
  if (!post.startAt) return null

  const sede = post.businesses?.[0] ?? null

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    '@id': pageUrl,
    name: post.title,
    url: pageUrl,
    startDate: isoConOffset(post.startAt, { soloFecha: post.allDay }),
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
  }

  if (post.endAt) {
    jsonLd.endDate = isoConOffset(post.endAt, { soloFecha: post.allDay })
  }

  const desc = post.summary || post.description
  if (desc) jsonLd.description = desc

  const images = [post.coverImage?.url, ...(post.gallery ?? []).map(g => g?.url)].filter(Boolean)
  if (images.length) jsonLd.image = images

  // Lugar: lo que declaró el municipio, o el negocio sede, o el municipio mismo.
  const lugarNombre = post.venueName || sede?.name || post.city?.name
  const place = { '@type': 'Place', name: lugarNombre || 'Jalisco' }

  const streetAddress = post.venueAddress
  place.address = {
    '@type': 'PostalAddress',
    ...(streetAddress && { streetAddress }),
    ...(post.city?.name && { addressLocality: post.city.name }),
    addressRegion: 'Jalisco',
    addressCountry: 'MX',
  }

  if (post.geo?.lat != null && post.geo?.lng != null) {
    place.geo = {
      '@type': 'GeoCoordinates',
      latitude: post.geo.lat,
      longitude: post.geo.lng,
    }
  }
  jsonLd.location = place

  const organizador = post.organizerName || sede?.name
  if (organizador) {
    jsonLd.organizer = {
      '@type': 'Organization',
      name: organizador,
      ...(sede?.slug && !post.organizerName && { url: `${siteUrl}${businessUrl(sede)}` }),
    }
  }

  // Solo si el precio es interpretable. "Cooperación voluntaria" no se convierte
  // en un número inventado: se omite `offers` y ya.
  const price = parsePrecioEvento(post.priceText)
  if (price != null || post.ticketUrl) {
    jsonLd.offers = {
      '@type': 'Offer',
      availability: 'https://schema.org/InStock',
      url: post.ticketUrl || pageUrl,
      ...(price != null && { price, priceCurrency: 'MXN' }),
    }
  }

  return jsonLd
}

export function buildBreadcrumbJsonLd(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

/**
 * Serializa JSON-LD escapando "</" para que no rompa el <script> del HTML
 * si un campo de texto llegara a contener un cierre de tag.
 */
export function serializeJsonLd(obj) {
  return JSON.stringify(obj).replace(/</g, '\\u003c')
}

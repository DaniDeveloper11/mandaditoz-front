/**
 * Builders de JSON-LD (schema.org) para páginas de negocio.
 * Se inyecta vía useHead({ script: [...] }) para que Google muestre rich results
 * (estrellas, horario, dirección) en los resultados de búsqueda.
 */

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

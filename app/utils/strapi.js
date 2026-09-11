const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

function timeToMinutes(t) {
  if (!t) return null
  const [h, m] = String(t).split(':').map(Number)
  return (Number.isFinite(h) ? h : 0) * 60 + (Number.isFinite(m) ? m : 0)
}

function todayDate() {
  return new Date()
}

function findTodayException(hourExceptions, date) {
  if (!hourExceptions?.length) return null
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const iso = `${y}-${m}-${d}`
  return hourExceptions.find(e => e.date === iso) || null
}

function isCurrentTimeInRange(hour, now) {
  if (hour.is24Hours) return true
  if (hour.isClosed) return false
  const cur = now.getHours() * 60 + now.getMinutes()
  const open = timeToMinutes(hour.openTime)
  const close = timeToMinutes(hour.closeTime)
  if (open == null || close == null) return false
  if (hour.crossesMidnight) return cur >= open || cur < close
  return cur >= open && cur < close
}

/**
 * Devuelve true/false/null (desconocido).
 * Reglas:
 *  - Si hoy hay una excepción (festivo, cierre especial), ésta prevalece.
 *  - Si no hay filas para hoy, retorna null.
 *  - Si todas las filas del día son isClosed, retorna false.
 *  - Si alguna franja (soportando is24Hours y crossesMidnight) contiene la hora actual, retorna true.
 */
export function computeIsOpen(hours, hourExceptions = []) {
  if (!hours?.length && !hourExceptions?.length) return null
  const now = todayDate()

  const exception = findTodayException(hourExceptions, now)
  if (exception) return isCurrentTimeInRange(exception, now)

  if (!hours?.length) return null
  const todayKey = DAY_KEYS[now.getDay()]
  const today = hours.filter(h => h.dayOfWeek === todayKey)
  if (!today.length) return null
  if (today.every(h => h.isClosed)) return false
  return today.some(h => isCurrentTimeInRange(h, now))
}

function formatAddress(a) {
  if (!a) return ''
  if (a.street) {
    const line1 = a.exteriorNumber ? `${a.street} ${a.exteriorNumber}` : a.street
    return line1
  }
  return a.rawText || ''
}

// -----------------------------------------------------------------------------
// Mappers (Strapi 5 — todas las respuestas son planas, sin .attributes ni .data)
// -----------------------------------------------------------------------------

function getMediaBase() {
  try {
    const config = useRuntimeConfig()
    return String(config.public?.apiBase ?? '').replace(/\/api\/?$/, '')
  } catch {
    return ''
  }
}

function absolutizeUrl(url, base) {
  if (!url || typeof url !== 'string') return url
  if (url.startsWith('/')) return `${base}${url}`
  return url
}

function absolutizeFormats(formats, base) {
  if (!formats || typeof formats !== 'object') return formats
  const out = {}
  for (const [k, v] of Object.entries(formats)) {
    out[k] = v && typeof v === 'object' ? { ...v, url: absolutizeUrl(v.url, base) } : v
  }
  return out
}

export function mapMedia(item) {
  if (!item) return null
  const base = getMediaBase()
  return {
    id: item.id,
    documentId: item.documentId,
    url: absolutizeUrl(item.url, base),
    name: item.name,
    alternativeText: item.alternativeText,
    width: item.width,
    height: item.height,
    mime: item.mime,
    ext: item.ext,
    size: item.size,
    formats: absolutizeFormats(item.formats, base),
  }
}

export function mapTag(item) {
  if (!item) return null
  return {
    id: item.id,
    documentId: item.documentId,
    name: item.name,
    slug: item.slug,
    icon: item.icon,
    description: item.description,
    businessCount: item.businessCount ?? 0,
  }
}

export function mapCity(item) {
  if (!item) return null
  return {
    id: item.id,
    documentId: item.documentId,
    name: item.name,
    slug: item.slug,
    center: item.center ?? null,
    businessCount: item.businessCount ?? 0,
    blogUrl: item.blogUrl ?? null,
    bloggerName: item.bloggerName ?? null,
    bloggerBio: item.bloggerBio ?? null,
    bloggerAvatar: item.bloggerAvatar ? mapMedia(item.bloggerAvatar) : null,
  }
}

export function mapNeighborhood(item) {
  if (!item) return null
  return {
    id: item.id,
    documentId: item.documentId,
    name: item.name,
    slug: item.slug,
    postalCode: item.postalCode,
  }
}

export function mapCategoria(item) {
  if (!item) return null
  return {
    id: item.id,
    documentId: item.documentId,
    name: item.name,
    slug: item.slug,
    description: item.description,
    icon: item.icon,
    color: item.color,
    order: item.order ?? 0,
    depth: item.depth ?? 0,
    path: item.path,
    isActive: item.isActive ?? true,
    isFeatured: !!item.isFeatured,
    isOrderable: !!item.isOrderable,
    businessCount: item.businessCount ?? 0,
    totalBusinessCount: item.totalBusinessCount ?? 0,
    parent: item.parent ? mapCategoria(item.parent) : null,
    children: (item.children ?? []).map(mapCategoria),
  }
}

export function mapHorario(item) {
  if (!item) return null
  return {
    id: item.id,
    documentId: item.documentId,
    dayOfWeek: item.dayOfWeek,
    openTime: item.openTime,
    closeTime: item.closeTime,
    isClosed: !!item.isClosed,
    is24Hours: !!item.is24Hours,
    crossesMidnight: !!item.crossesMidnight,
    sortOrder: item.sortOrder ?? 0,
    note: item.note,
  }
}

export function mapHourException(item) {
  if (!item) return null
  return {
    id: item.id,
    documentId: item.documentId,
    date: item.date,
    isClosed: !!item.isClosed,
    openTime: item.openTime,
    closeTime: item.closeTime,
    crossesMidnight: !!item.crossesMidnight,
    reason: item.reason,
  }
}

export function mapReviewAuthor(user) {
  if (!user) return null
  return {
    id: user.id,
    documentId: user.documentId,
    username: user.username,
    displayName: user.displayName ?? user.username,
    avatar: user.avatar ? mapMedia(user.avatar) : null,
  }
}

export function mapReviewResponse(item) {
  if (!item) return null
  return {
    text: item.text,
    respondedAt: item.respondedAt,
    respondedBy: item.respondedBy ? mapReviewAuthor(item.respondedBy) : null,
  }
}

export function mapReview(item) {
  if (!item) return null
  return {
    id: item.id,
    documentId: item.documentId,
    rating: item.rating,
    title: item.title,
    comment: item.comment,
    visitDate: item.visitDate,
    helpfulCount: item.helpfulCount ?? 0,
    editedAt: item.editedAt,
    createdAt: item.createdAt,
    author: mapReviewAuthor(item.author),
    guestName: item.guestName ?? null,
    response: mapReviewResponse(item.response),
    photos: (item.photos ?? []).map(mapMedia).filter(Boolean),
  }
}

export function mapPhoto(item) {
  if (!item) return null
  const file = item.file ? mapMedia(item.file) : null
  return {
    id: item.id,
    documentId: item.documentId,
    url: file?.url ?? null,
    alternativeText: item.caption ?? file?.alternativeText,
    order: item.order ?? 0,
  }
}

/**
 * Platillo del menú estructurado. El precio se normaliza a número aquí;
 * el formateo de moneda vive en el componente.
 * Los platillos agotados (isAvailable: false) NO se filtran: se muestran
 * marcados, porque saber que se acabó la birria es información útil.
 */
export function mapMenuItem(item) {
  if (!item) return null
  if (item.archivedAt) return null
  return {
    id: item.id,
    documentId: item.documentId,
    name: item.name,
    description: item.description ?? null,
    price: Number(item.price ?? 0),
    photo: item.photo ? mapMedia(item.photo) : null,
    isAvailable: item.isAvailable !== false,
    isFeatured: !!item.isFeatured,
    order: item.order ?? 0,
  }
}

/**
 * Sección del menú. Devuelve null si está archivada, o si está inactiva y no
 * se pidió incluirlas (el panel del dueño sí las necesita para reactivarlas).
 * El orden se resuelve en JS: el populate anidado de Strapi no garantiza
 * el orden de los hijos.
 */
export function mapMenuSection(section, { includeInactive = false } = {}) {
  if (!section) return null
  if (section.archivedAt) return null
  if (!includeInactive && section.isActive === false) return null

  const items = (section.items ?? [])
    .map(mapMenuItem)
    .filter(Boolean)
    .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name, 'es'))

  return {
    id: section.id,
    documentId: section.documentId,
    name: section.name,
    description: section.description ?? null,
    order: section.order ?? 0,
    isActive: section.isActive !== false,
    items,
  }
}

/**
 * Negocio ligado a un evento de la cartelera.
 *
 * A propósito NO se usa mapNegocio(): el populate de city-post viene acotado con
 * `fields` (sin horarios, sin fotos, sin reseñas), así que mapNegocio devolvería
 * un objeto con casi todo en null y aparentaría tener datos que nadie pidió.
 * Estos cuatro campos son justo los que necesita businessUrl().
 */
function mapNegocioLigero(item) {
  if (!item) return null
  return {
    id: item.id,
    documentId: item.documentId,
    name: item.name,
    slug: item.slug,
    city: item.city ? mapCity(item.city) : null,
    visibleInAllCities: !!item.visibleInAllCities,
  }
}

function mapSeo(item) {
  if (!item) return null
  return {
    metaTitle: item.metaTitle ?? null,
    metaDescription: item.metaDescription ?? null,
    keywords: item.keywords ?? null,
    canonicalUrl: item.canonicalUrl ?? null,
    ogImage: item.ogImage ? mapMedia(item.ogImage) : null,
  }
}

/**
 * Evento o aviso de la cartelera del municipio (content-type `city-post`).
 *
 * Ojo con el nombre: `business-event` en el backend es analítica de tráfico y no
 * tiene nada que ver con esto.
 *
 * La API solo devuelve posts con postStatus = 'published' (lo fuerza el
 * controller), así que aquí no hay que filtrar por estado.
 */
export function mapCityPost(item) {
  if (!item) return null
  return {
    id: item.id,
    documentId: item.documentId,
    title: item.title,
    slug: item.slug,
    kind: item.kind ?? 'evento',
    eventCategory: item.eventCategory ?? null,
    summary: item.summary ?? null,
    description: item.description ?? null,
    // Strapi manda `null`, no `[]`, cuando una media múltiple está vacía.
    coverImage: item.coverImage ? mapMedia(item.coverImage) : null,
    gallery: (item.gallery ?? []).map(mapMedia).filter(Boolean),
    startAt: item.startAt,
    // El lifecycle del backend garantiza que nunca es nulo: toda la UI filtra
    // la vigencia con una sola condición (endAt >= now).
    endAt: item.endAt,
    allDay: !!item.allDay,
    venueName: item.venueName ?? null,
    venueAddress: item.venueAddress ?? null,
    geo: item.geo ?? null,
    mapEmbedUrl: item.mapEmbedUrl ?? null,
    businesses: (item.businesses ?? []).map(mapNegocioLigero).filter(Boolean),
    organizerName: item.organizerName ?? null,
    contactPhone: item.contactPhone ?? null,
    externalUrl: item.externalUrl ?? null,
    ticketUrl: item.ticketUrl ?? null,
    priceText: item.priceText ?? null,
    city: item.city ? mapCity(item.city) : null,
    visibleInAllCities: !!item.visibleInAllCities,
    isFeatured: !!item.isFeatured,
    featuredOrder: item.featuredOrder ?? null,
    seo: mapSeo(item.seo),
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }
}

export function mapNegocio(item) {
  if (!item) return null
  const hours = (item.hours ?? []).map(mapHorario).filter(Boolean)
  const hourExceptions = (item.hourExceptions ?? []).map(mapHourException).filter(Boolean)

  const base = getMediaBase()
  const logo = item.logo ? mapMedia(item.logo) : (item.logoUrl ? { url: absolutizeUrl(item.logoUrl, base) } : null)
  const coverPhoto = item.coverPhoto ? mapMedia(item.coverPhoto) : (item.coverPhotoUrl ? { url: absolutizeUrl(item.coverPhotoUrl, base) } : null)
  const menuPdf = item.menuPdf ? mapMedia(item.menuPdf) : null
  const menuImages = (item.menuImages ?? []).map(mapMedia).filter(Boolean)
  const menuSections = (item.menuSections ?? [])
    // Explícito a propósito: .map(mapMenuSection) le pasaría el índice como
    // segundo argumento, que ahora son las opciones del mapper.
    .map(section => mapMenuSection(section))
    .filter(Boolean)
    .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name, 'es'))

  return {
    id: item.id,
    documentId: item.documentId,
    name: item.name,
    slug: item.slug,
    description: item.description,
    shortDescription: item.shortDescription,
    address: formatAddress(item.address),
    addressRaw: item.address,
    geo: item.geo ?? null,
    mapEmbedUrl: item.mapEmbedUrl,
    hoursText: item.hoursText,
    phones: (item.phones ?? []).map(p => ({
      id: p.id,
      number: p.number,
      label: p.label,
      hasWhatsapp: !!p.hasWhatsapp,
      isPrimary: !!p.isPrimary,
    })),
    email: item.email,
    website: item.website,
    menuUrl: item.menuUrl,
    videoUrl: item.videoUrl,
    priceLevel: item.priceLevel,
    paymentMethods: item.paymentMethods ?? [],
    amenities: item.amenities ?? [],
    socialLinks: (item.socialLinks ?? []).map(s => ({
      id: s.id,
      platform: s.platform,
      url: s.url,
    })),
    isVerified: !!item.isVerified,
    isFeatured: !!item.isFeatured,
    visibleInAllCities: !!item.visibleInAllCities,
    businessStatus: item.businessStatus,
    ownershipStatus: item.ownershipStatus ?? 'unclaimed',
    viewCount: item.viewCount ?? 0,
    ratingAverage: Number(item.ratingAverage ?? 0),
    ratingCount: item.ratingCount ?? 0,
    reviewCount: item.reviewCount ?? 0,
    isOpen: import.meta.client ? computeIsOpen(hours, hourExceptions) : null,
    category: item.category ? mapCategoria(item.category) : null,
    secondaryCategories: (item.secondaryCategories ?? []).map(mapCategoria).filter(Boolean),
    tags: (item.tags ?? []).map(mapTag).filter(Boolean),
    city: item.city ? mapCity(item.city) : null,
    neighborhood: item.neighborhood ? mapNeighborhood(item.neighborhood) : null,
    hours,
    hourExceptions,
    photos: (item.photos ?? []).map(mapPhoto).filter(Boolean),
    reviews: (item.reviews ?? []).map(mapReview).filter(Boolean),
    logo,
    coverPhoto,
    menuPdf,
    menuImages,
    menuSections,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }
}

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
    url: absolutizeUrl(item.url, base),
    alternativeText: item.alternativeText,
    width: item.width,
    height: item.height,
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
    businessCount: item.businessCount ?? 0,
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

export function mapNegocio(item) {
  if (!item) return null
  const hours = (item.hours ?? []).map(mapHorario).filter(Boolean)
  const hourExceptions = (item.hourExceptions ?? []).map(mapHourException).filter(Boolean)

  const base = getMediaBase()
  const logo = item.logo ? mapMedia(item.logo) : (item.logoUrl ? { url: absolutizeUrl(item.logoUrl, base) } : null)
  const coverPhoto = item.coverPhoto ? mapMedia(item.coverPhoto) : (item.coverPhotoUrl ? { url: absolutizeUrl(item.coverPhotoUrl, base) } : null)

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
    businessStatus: item.businessStatus,
    ownershipStatus: item.ownershipStatus ?? 'unclaimed',
    viewCount: item.viewCount ?? 0,
    ratingAverage: Number(item.ratingAverage ?? 0),
    ratingCount: item.ratingCount ?? 0,
    reviewCount: item.reviewCount ?? 0,
    isOpen: computeIsOpen(hours, hourExceptions),
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
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }
}

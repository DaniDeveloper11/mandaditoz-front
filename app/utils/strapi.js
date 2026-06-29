const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

function computeIsOpen(hours) {
  if (!hours?.length) return null
  const now = new Date()
  const todayKey = DAY_KEYS[now.getDay()]
  const today = hours.find(h => h.dayOfWeek === todayKey)
  if (!today || today.isClosed) return false
  if (today.is24Hours) return true
  const cur = now.getHours() * 60 + now.getMinutes()
  const [oh, om] = today.openTime?.split(':') ?? [0, 0]
  const [ch, cm] = today.closeTime?.split(':') ?? [0, 0]
  return cur >= parseInt(oh) * 60 + parseInt(om) &&
         cur <  parseInt(ch) * 60 + parseInt(cm)
}

function formatAddress(a) {
  if (!a) return ''
  return [a.street, a.exteriorNumber && `#${a.exteriorNumber}`, a.neighborhood, a.city]
    .filter(Boolean).join(', ')
}

export function mapNegocio(item) {
  const a = item.attributes ?? item
  const hours = (a.hours?.data ?? a.hours ?? []).map(mapHorario)
  return {
    id: item.id,
    documentId: item.documentId,
    name: a.name,
    slug: a.slug,
    description: a.description,
    shortDescription: a.shortDescription,
    address: formatAddress(a.address),
    addressRaw: a.address,
    phones: (a.phones ?? []).map(p => ({
      number: p.number,
      label: p.label,
      hasWhatsapp: p.hasWhatsapp ?? false,
    })),
    email: a.email,
    website: a.website,
    socialLinks: a.socialLinks ?? [],
    isVerified: a.isVerified ?? false,
    isFeatured: a.isFeatured ?? false,
    ownershipStatus: a.ownershipStatus ?? 'unclaimed',
    viewCount: a.viewCount ?? 0,
    ratingAverage: a.ratingAverage ?? 0,
    ratingCount: a.ratingCount ?? 0,
    isOpen: computeIsOpen(hours),
    category: a.category?.data ? mapCategoria(a.category.data) : (a.category ?? null),
    secondaryCategories: (a.secondaryCategories?.data ?? a.secondaryCategories ?? []).map(c => mapCategoria(c)),
    hours,
    tags: a.tags ?? [],
    photos: (a.photos?.data ?? a.photos ?? []).map(mapPhoto),
    reviews: (a.reviews?.data ?? a.reviews ?? []).map(mapReview),
    logo: a.logo?.data ? mapMedia(a.logo.data) : null,
    coverPhoto: a.coverPhoto?.data ? mapMedia(a.coverPhoto.data) : null,
  }
}

export function mapCategoria(item) {
  const a = item.attributes ?? item
  return {
    id: item.id,
    name: a.name,
    slug: a.slug,
    description: a.description,
    icon: a.icon,
    color: a.color,
    order: a.order ?? 0,
    isActive: a.isActive ?? true,
  }
}

export function mapHorario(item) {
  const a = item.attributes ?? item
  return {
    dayOfWeek: a.dayOfWeek,
    openTime: a.openTime,
    closeTime: a.closeTime,
    isClosed: a.isClosed ?? false,
    is24Hours: a.is24Hours ?? false,
  }
}

export function mapReview(item) {
  const a = item.attributes ?? item
  return {
    id: item.id,
    rating: a.rating,
    title: a.title,
    comment: a.comment,
    visitDate: a.visitDate,
    helpfulCount: a.helpfulCount ?? 0,
  }
}

export function mapPhoto(item) {
  const a = item.attributes ?? item
  const file = a.file?.data ? mapMedia(a.file.data) : null
  return {
    id: item.id,
    url: file?.url ?? null,
    alternativeText: a.caption ?? file?.alternativeText,
    order: a.order ?? 0,
  }
}

export function mapMedia(item) {
  const a = item.attributes ?? item
  return {
    url: a.url,
    alternativeText: a.alternativeText,
    width: a.width,
    height: a.height,
    formats: a.formats,
  }
}

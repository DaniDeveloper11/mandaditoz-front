export function mapNegocio(item) {
  const a = item.attributes ?? item
  return {
    id: item.id,
    documentId: item.documentId,
    nombre: a.nombre,
    slug: a.slug,
    descripcion: a.descripcion,
    descripcionCorta: a.descripcionCorta,
    direccion: a.direccion,
    telefono: a.telefono,
    whatsapp: a.whatsapp,
    email: a.email,
    sitioWeb: a.sitioWeb,
    verificado: a.verificado ?? false,
    abierto: a.abierto ?? false,
    rating: a.rating ?? 0,
    totalResenas: a.totalResenas ?? 0,
    categoria: a.categoria?.data ? mapCategoria(a.categoria.data) : (a.categoria ?? null),
    horarios: (a.horarios?.data ?? a.horarios ?? []).map(mapHorario),
    tags: a.tags ?? [],
    fotos: (a.fotos?.data ?? a.fotos ?? []).map(mapMedia),
    logo: a.logo?.data ? mapMedia(a.logo.data) : null,
  }
}

export function mapCategoria(item) {
  const a = item.attributes ?? item
  return {
    id: item.id,
    nombre: a.nombre,
    slug: a.slug,
    icono: a.icono,
    totalNegocios: a.totalNegocios ?? 0,
  }
}

export function mapHorario(item) {
  const a = item.attributes ?? item
  return {
    dia: a.dia,
    abre: a.abre,
    cierra: a.cierra,
    cerrado: a.cerrado ?? false,
  }
}

export function mapMedia(item) {
  const a = item.attributes ?? item
  const base = useRuntimeConfig().public.apiBase?.replace('/api', '') ?? ''
  const url = a.url?.startsWith('http') ? a.url : `${base}${a.url}`
  return {
    url,
    alternativeText: a.alternativeText,
    width: a.width,
    height: a.height,
    formats: a.formats,
  }
}

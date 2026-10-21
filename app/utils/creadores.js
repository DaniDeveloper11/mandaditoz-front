import {
  Sparkles, Camera, Video, Mic, Music, PenLine, Newspaper, Palette,
  UtensilsCrossed, Users,
} from '@lucide/vue'

/**
 * Mapas de presentación de las voces del municipio (content-type `creator`).
 * Mismo papel que KIND_CONFIG en eventos.js: solo etiquetas, iconos y clases —
 * cero lógica de negocio. Los importan la tarjeta y la ficha para que el texto
 * de una etiqueta no se escriba en dos lugares.
 */

/** Los 10 valores del enum creatorType del backend. */
export const CREATOR_TYPE_CONFIG = {
  influencer: {
    label: 'Influencer',
    plural: 'Influencers',
    icon: Sparkles,
    badgeStyle: 'bg-fuchsia-100 text-fuchsia-700',
  },
  fotografo: {
    label: 'Fotografía',
    plural: 'Fotografía',
    icon: Camera,
    badgeStyle: 'bg-sky-100 text-sky-700',
  },
  videografo: {
    label: 'Video',
    plural: 'Video',
    icon: Video,
    badgeStyle: 'bg-indigo-100 text-indigo-700',
  },
  podcast: {
    label: 'Podcast',
    plural: 'Podcasts',
    icon: Mic,
    badgeStyle: 'bg-orange-100 text-orange-700',
  },
  musico: {
    label: 'Música',
    plural: 'Música',
    icon: Music,
    badgeStyle: 'bg-rose-100 text-rose-700',
  },
  cronista: {
    label: 'Cronista',
    plural: 'Cronistas',
    icon: PenLine,
    badgeStyle: 'bg-amber-100 text-amber-800',
  },
  medio_local: {
    label: 'Medio local',
    plural: 'Medios locales',
    icon: Newspaper,
    badgeStyle: 'bg-slate-200 text-slate-700',
  },
  artista: {
    label: 'Artista',
    plural: 'Artistas',
    icon: Palette,
    badgeStyle: 'bg-purple-100 text-purple-700',
  },
  gastronomia: {
    label: 'Gastronomía',
    plural: 'Gastronomía',
    icon: UtensilsCrossed,
    badgeStyle: 'bg-lime-100 text-lime-800',
  },
  otro: {
    label: 'Creador',
    plural: 'Otros',
    icon: Users,
    badgeStyle: 'bg-gray-100 text-gray-600',
  },
}

const CREATOR_TYPE_FALLBACK = CREATOR_TYPE_CONFIG.otro

export function getCreatorTypeConfig(tipo) {
  return CREATOR_TYPE_CONFIG[tipo] ?? CREATOR_TYPE_FALLBACK
}

/**
 * Orden fijo de los filtros por tipo. Se declara a mano y NO se deriva de
 * Object.keys: el orden del enum del backend es el que se le ocurrió a quien
 * escribió el schema, no un orden de lectura.
 */
export const CREATOR_TYPE_ORDER = [
  'influencer', 'fotografo', 'videografo', 'podcast',
  'musico', 'artista', 'gastronomia', 'cronista', 'medio_local', 'otro',
]

/**
 * Nombre visible de cada plataforma. El enum viene del componente
 * business.social-link, que la ficha de negocio ya usa.
 */
export const SOCIAL_PLATFORM_LABELS = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  twitter: 'X',
  linkedin: 'LinkedIn',
  pinterest: 'Pinterest',
  snapchat: 'Snapchat',
  telegram: 'Telegram',
  whatsapp: 'WhatsApp',
}

export function getSocialLabel(platform) {
  return SOCIAL_PLATFORM_LABELS[platform] ?? platform
}

/**
 * Orden en el que se pintan las redes de una voz: primero donde de verdad
 * publican. Una que no esté en la lista va al final, sin desaparecer.
 */
const SOCIAL_ORDER = ['tiktok', 'instagram', 'youtube', 'facebook', 'twitter', 'telegram', 'whatsapp']

export function ordenarRedes(links) {
  return [...(links ?? [])].sort((a, b) => {
    const ia = SOCIAL_ORDER.indexOf(a.platform)
    const ib = SOCIAL_ORDER.indexOf(b.platform)
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib)
  })
}

/**
 * `coversTopics` se captura como texto separado por comas porque nadie va a
 * mantener una taxonomía de temas para veinte personas. Aquí se parte para
 * pintarlo como chips; los vacíos se descartan.
 */
export function temasDe(creador) {
  return String(creador?.coversTopics ?? '')
    .split(',')
    .map(t => t.trim())
    .filter(Boolean)
}

/** El arroba se guarda sin @ y se muestra con @. */
export function arrobaDe(creador) {
  const handle = String(creador?.handle ?? '').trim().replace(/^@+/, '')
  return handle ? `@${handle}` : null
}

import { CalendarDays, Megaphone, ImageIcon } from '@lucide/vue'
import { rangoFecha, formatoFecha } from '~/utils/fechas'

/**
 * Mapas de presentación de la cartelera (city-post). Mismo papel que
 * CATEGORIA_CONFIG en categorias.js: solo etiquetas, iconos y clases — cero
 * lógica de negocio. Los importan la tarjeta y la ficha para que el texto de
 * una etiqueta no se escriba en dos lugares.
 */

export const KIND_CONFIG = {
  evento: {
    label: 'Evento',
    icon: CalendarDays,
    badgeStyle: 'bg-blue-100 text-blue-700',
  },
  aviso: {
    label: 'Aviso',
    icon: Megaphone,
    badgeStyle: 'bg-amber-100 text-amber-800',
  },
  cartel: {
    label: 'Cartelera',
    icon: ImageIcon,
    badgeStyle: 'bg-purple-100 text-purple-700',
  },
}

const KIND_FALLBACK = KIND_CONFIG.evento

export function getKindConfig(kind) {
  return KIND_CONFIG[kind] ?? KIND_FALLBACK
}

/** Los 9 valores del enum eventCategory del backend, en texto legible. */
export const EVENT_CATEGORY_LABELS = {
  fiesta_patronal: 'Fiesta patronal',
  cultural: 'Cultural',
  deportivo: 'Deportivo',
  feria: 'Feria',
  civico: 'Cívico',
  religioso: 'Religioso',
  infantil: 'Infantil',
  servicio_publico: 'Servicio público',
  otro: 'Otro',
}

export function getEventCategoryLabel(valor) {
  return EVENT_CATEGORY_LABELS[valor] ?? null
}

/**
 * Cómo se anuncia la vigencia según el tipo.
 *
 * Un aviso no "ocurre" en una fecha: vale hasta una fecha. Mostrarle a alguien
 * "Del 13 de septiembre al 13 de octubre" para un corte de agua sugiere que el
 * corte dura un mes, cuando el 13 de octubre es solo cuando el aviso caduca.
 */
export function vigenciaTexto(evento) {
  if (!evento) return ''
  if (evento.kind === 'aviso') {
    return evento.endAt
      ? `Vigente hasta el ${formatoFecha(evento.endAt)}`
      : formatoFecha(evento.startAt)
  }
  return rangoFecha(evento.startAt, evento.endAt, evento.allDay)
}

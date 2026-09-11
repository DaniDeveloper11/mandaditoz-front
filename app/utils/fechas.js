/**
 * Formateo de fechas para la cartelera del municipio (city-post).
 *
 * La zona horaria va EXPLÍCITA por la misma razón que documenta horario.js:
 * esto también corre en SSR, donde el reloj del servidor va en UTC. El caso no
 * es teórico — `noche-de-mariachi` se guarda como 2026-09-22T02:00:00.000Z, que
 * en Jalisco es el 21 de septiembre a las 20:00. Sin `timeZone` la cartelera
 * anunciaría el evento un día después del que es.
 *
 * A propósito NO hay "Hoy" / "Mañana": dependerían del instante del render y el
 * HTML del servidor podría no coincidir con el del cliente al hidratar.
 */
const TZ = 'America/Mexico_City'

const FMT_PARTES = new Intl.DateTimeFormat('en-US', {
  timeZone: TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
  timeZoneName: 'longOffset',
})

const FMT_DIA_MES = new Intl.DateTimeFormat('es-MX', {
  timeZone: TZ,
  day: 'numeric',
  month: 'long',
})

const FMT_DIA = new Intl.DateTimeFormat('es-MX', {
  timeZone: TZ,
  day: 'numeric',
})

const FMT_HORA = new Intl.DateTimeFormat('es-MX', {
  timeZone: TZ,
  hour: 'numeric',
  minute: '2-digit',
})

/** Acepta Date, string ISO o null. Devuelve Date válido o null. */
export function aFecha(valor) {
  if (!valor) return null
  const d = valor instanceof Date ? valor : new Date(valor)
  return Number.isNaN(d.getTime()) ? null : d
}

/**
 * Componentes de la fecha ya trasladados a Jalisco, más el offset en la forma
 * que quiere schema.org ("-06:00"). El offset se DERIVA de Intl en vez de
 * escribirse a mano: hoy Jalisco es -06:00 todo el año (México eliminó el
 * horario de verano en 2022), pero si eso cambiara, esto no habría que tocarlo.
 */
function partesLocales(date) {
  const p = {}
  for (const parte of FMT_PARTES.formatToParts(date)) p[parte.type] = parte.value
  // "GMT-06:00" → "-06:00". En UTC, Intl devuelve "GMT" a secas.
  const bruto = String(p.timeZoneName ?? '').replace('GMT', '')
  return { ...p, offset: bruto || '+00:00' }
}

/** True si las dos fechas caen en el mismo día natural en Jalisco. */
export function esMismoDia(a, b) {
  const fa = aFecha(a)
  const fb = aFecha(b)
  if (!fa || !fb) return false
  const pa = partesLocales(fa)
  const pb = partesLocales(fb)
  return pa.year === pb.year && pa.month === pb.month && pa.day === pb.day
}

/** True si la vigencia ya terminó. `endAt` nunca es nulo: lo garantiza el lifecycle. */
export function esPasado(endAt, ahora = new Date()) {
  const fin = aFecha(endAt)
  if (!fin) return false
  return fin.getTime() < ahora.getTime()
}

/** "21 de septiembre" (+ ", 8:00 p.m." si se pide la hora). */
export function formatoFecha(valor, { conHora = false } = {}) {
  const d = aFecha(valor)
  if (!d) return ''
  const dia = FMT_DIA_MES.format(d)
  return conHora ? `${dia}, ${FMT_HORA.format(d)}` : dia
}

/** Solo la hora: "8:00 p.m.". */
export function formatoHora(valor) {
  const d = aFecha(valor)
  return d ? FMT_HORA.format(d) : ''
}

/**
 * Rango legible entre inicio y fin.
 *   mismo día            → "21 de septiembre, 8:00 p.m."
 *   mismo mes            → "Del 1 al 11 de octubre"
 *   meses distintos      → "Del 28 de octubre al 2 de noviembre"
 *
 * Un evento de un día cae siempre en la primera rama: el lifecycle rellena
 * `endAt` con el final del día local del inicio, no con otra fecha.
 */
export function rangoFecha(startAt, endAt, allDay = false) {
  const inicio = aFecha(startAt)
  if (!inicio) return ''
  const fin = aFecha(endAt)

  if (!fin || esMismoDia(inicio, fin)) {
    return formatoFecha(inicio, { conHora: !allDay })
  }

  const pi = partesLocales(inicio)
  const pf = partesLocales(fin)
  const mismoMes = pi.year === pf.year && pi.month === pf.month

  return mismoMes
    ? `Del ${FMT_DIA.format(inicio)} al ${FMT_DIA_MES.format(fin)}`
    : `Del ${FMT_DIA_MES.format(inicio)} al ${FMT_DIA_MES.format(fin)}`
}

const FMT_MES = new Intl.DateTimeFormat('es-MX', { timeZone: TZ, month: 'long' })

/**
 * Día(s) y mes sueltos, para pintar una placa tipo calendario: { dia, mes }.
 * `dia` colapsa el rango cuando abarca varios días del mismo mes ("1–11").
 */
export function placaFecha(startAt, endAt) {
  const inicio = aFecha(startAt)
  if (!inicio) return null
  const fin = aFecha(endAt)
  const pi = partesLocales(inicio)

  let dia = String(Number(pi.day))
  if (fin && !esMismoDia(inicio, fin)) {
    const pf = partesLocales(fin)
    // Si cruza de mes, la placa solo puede con el día de inicio; el rango
    // completo ya se lee en el recuadro de fechas.
    if (pi.year === pf.year && pi.month === pf.month) {
      dia = `${Number(pi.day)}–${Number(pf.day)}`
    }
  }

  return { dia, mes: FMT_MES.format(inicio) }
}

/**
 * Cuántos días naturales abarca el evento, contando el primero y el último:
 * del 1 al 11 de octubre son 11 días, no 10.
 *
 * Se cuenta sobre el día local, no sobre la diferencia en horas: un evento de
 * 20:00 a 02:00 cruza la medianoche pero para quien lo lee es una sola noche…
 * salvo que el lifecycle ya le haya puesto el fin del día local, que es el caso
 * normal. Devuelve null si no hay rango que contar.
 */
export function diasDeDuracion(startAt, endAt) {
  const inicio = aFecha(startAt)
  const fin = aFecha(endAt)
  if (!inicio || !fin) return null

  const pi = partesLocales(inicio)
  const pf = partesLocales(fin)
  const diaInicio = Date.UTC(Number(pi.year), Number(pi.month) - 1, Number(pi.day))
  const diaFin = Date.UTC(Number(pf.year), Number(pf.month) - 1, Number(pf.day))

  const dias = Math.round((diaFin - diaInicio) / 86400000) + 1
  return dias > 0 ? dias : null
}

/**
 * La fecha en el formato que pide schema.org: con offset local explícito
 * ("2026-09-21T20:00:00-06:00"), o solo la fecha cuando el evento es de día
 * completo. Google marca como error un `startDate` sin zona horaria.
 */
export function isoConOffset(valor, { soloFecha = false } = {}) {
  const d = aFecha(valor)
  if (!d) return null
  const p = partesLocales(d)
  const fecha = `${p.year}-${p.month}-${p.day}`
  if (soloFecha) return fecha
  return `${fecha}T${p.hour}:${p.minute}:${p.second}${p.offset}`
}

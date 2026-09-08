// Zona horaria del directorio: todos los negocios son de Jalisco. Se fija
// explícita porque este cálculo también corre en SSR, donde el reloj del
// servidor va en UTC y a partir de las 18:00 locales ya sería otro día
// (y por tanto otro horario de atención).
const TZ = 'America/Mexico_City'

// Mismo orden que Date#getDay(), con las claves del enum dayOfWeek de Strapi.
const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

const FORMATTER = new Intl.DateTimeFormat('en-US', {
  timeZone: TZ,
  weekday: 'short',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
})

/**
 * Día y hora actuales en Jalisco, en el formato que usa Strapi:
 * `day`/`prevDay` como claves del enum dayOfWeek y `time` como "HH:mm:ss".
 */
export function momentoLocal(date = new Date()) {
  const parts = {}
  for (const p of FORMATTER.formatToParts(date)) parts[p.type] = p.value

  const i = DAY_KEYS.indexOf(parts.weekday.toLowerCase())
  return {
    day: DAY_KEYS[i],
    prevDay: DAY_KEYS[(i + 6) % 7],
    time: `${parts.hour}:${parts.minute}:${parts.second}`,
  }
}

/**
 * Ramas de un `$or` de Strapi que dejan pasar a los negocios abiertos en este
 * momento. Cada rama filtra la relación `hours`, y Strapi exige que sea una
 * misma fila la que cumpla todas las condiciones de la rama, así que el día y
 * la hora nunca se cruzan entre franjas distintas.
 *
 * No mira las excepciones (`hourExceptions`): un negocio cerrado hoy por
 * feriado puede colarse en la lista, pero la badge de la tarjeta —que sí las
 * considera— lo marcará como cerrado.
 */
export function condicionesAbiertoAhora(ahora = momentoLocal()) {
  const { day, prevDay, time } = ahora
  return [
    // Abierto las 24 horas hoy.
    { hours: { dayOfWeek: { '$eq': day }, is24Hours: { '$eq': true } } },
    // Franja normal de hoy: ya abrió y todavía no cierra.
    {
      hours: {
        dayOfWeek:       { '$eq': day },
        isClosed:        { '$eq': false },
        crossesMidnight: { '$eq': false },
        openTime:        { '$lte': time },
        closeTime:       { '$gt': time },
      },
    },
    // Franja de hoy que cierra de madrugada: basta con que ya haya abierto.
    {
      hours: {
        dayOfWeek:       { '$eq': day },
        isClosed:        { '$eq': false },
        crossesMidnight: { '$eq': true },
        openTime:        { '$lte': time },
      },
    },
    // Franja de ayer que cruza la medianoche y aún no llega a su hora de cierre.
    {
      hours: {
        dayOfWeek:       { '$eq': prevDay },
        isClosed:        { '$eq': false },
        crossesMidnight: { '$eq': true },
        closeTime:       { '$gt': time },
      },
    },
  ]
}

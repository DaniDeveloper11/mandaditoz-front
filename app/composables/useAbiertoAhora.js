import { computeIsOpen } from '~/utils/strapi'

/**
 * "¿Está abierto ahora?" para las badges de las tarjetas y la ficha.
 *
 * Devuelve `undefined` (todavía no se sabe) en el servidor y durante la
 * hidratación, y true/false/null después. El HTML del servidor lo cachea
 * Cloudflare, así que un "Abierto" calculado ahí podía servirse horas después;
 * y calcularlo en el cliente desde el primer render (como hacía mapNegocio con
 * `import.meta.client`) daba un hydration mismatch por cada tarjeta.
 *
 * En las navegaciones ya en el cliente `listo` es true desde el inicio y la
 * badge sale en el primer render.
 */
export function useAbiertoAhora() {
  const listo = useState('abierto-ahora:listo', () => false)
  if (import.meta.client && !listo.value) {
    onNuxtReady(() => { listo.value = true })
  }
  return (negocio) => {
    if (!listo.value || !negocio) return undefined
    return computeIsOpen(negocio.hours ?? [], negocio.hourExceptions ?? [])
  }
}

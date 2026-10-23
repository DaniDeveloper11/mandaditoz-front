/**
 * Timeout para las consultas que hace el SSR.
 *
 * Cuando Strapi se cae en Railway, no rechaza la conexión: el proxy tarda ~15 s
 * en devolver 502 por CADA consulta. Las páginas que encadenan varias tardaban
 * más de un minuto y Cloudflare cortaba con su propio 502 antes de que la
 * página pudiera lanzar el 503 de fuera de servicio (ver `error.vue`).
 *
 * Solo en servidor: en el navegador hay subidas de imágenes que pueden tardar más.
 * `globalThis.$fetch` es compartido entre requests en Nitro, de ahí la marca para
 * envolverlo una sola vez.
 */
const TIMEOUT_MS = 8000

export default defineNuxtPlugin(() => {
  if (globalThis.__mandaditozFetchTimeout) return
  globalThis.$fetch = globalThis.$fetch.create({ timeout: TIMEOUT_MS })
  globalThis.__mandaditozFetchTimeout = true
})

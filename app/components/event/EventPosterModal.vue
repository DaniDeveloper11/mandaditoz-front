<script setup>
import { ref, onMounted } from 'vue'
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { X, CalendarDays, MapPin, ArrowRight } from '@lucide/vue'
import { mapCityPost } from '~/utils/strapi'
import { queryEventos } from '~/composables/useEventos'
import { vigenciaTexto } from '~/utils/eventos'
import { eventUrl } from '~/utils/urls'

/**
 * Cartel del evento destacado del municipio, a pantalla completa y una sola vez.
 *
 * Tres decisiones que conviene no deshacer sin querer:
 *
 * 1. Todo ocurre en onMounted y con $fetch, NO con useFetch. El modal no debe
 *    existir en el HTML del servidor: esa respuesta la cachea Cloudflare y el
 *    cartel quedaría congelado para todos, o peor, se serviría ya "visto".
 *
 * 2. La marca de visto lleva el documentId del cartel, no un booleano. Con un
 *    booleano, el municipio publica el cartel del año siguiente y no lo ve nadie.
 *
 * 3. Va en localStorage y no en cookie, a diferencia de city:active y
 *    city:onboarded: esos los necesita el SSR, este no, y una cookie viajaría en
 *    cada request del sitio sin que nadie la lea del lado del servidor.
 */
const props = defineProps({
  citySlug: { type: String, required: true },
})

const STORAGE_KEY = 'evento:modal:visto'
// La lista se poda porque es un registro de "ya no molestar", no un historial.
const MAX_RECORDADOS = 30

const config = useRuntimeConfig()
const cityStore = useCityStore()

const evento = ref(null)
const abierto = ref(false)

// mapCityPost() absolutiza las URLs de media llamando a useRuntimeConfig() por
// dentro, y aquí se invoca DESPUÉS de un await dentro de onMounted, donde el
// contexto de Nuxt ya puede no estar disponible: en ese caso mapMedia cae a su
// catch, devuelve la ruta relativa (/uploads/...) y la imagen apunta al servidor
// de Nuxt en vez de al de Strapi. Se resuelve aquí con la base capturada en
// setup. Es idempotente: si mapCityPost sí pudo, la URL ya es absoluta.
const mediaBase = String(config.public.apiBase ?? '').replace(/\/api\/?$/, '')
const portada = computed(() => {
  const url = evento.value?.coverImage?.url
  if (!url) return null
  return url.startsWith('/') ? `${mediaBase}${url}` : url
})

// localStorage revienta en modo privado de algunos navegadores y cuando la cuota
// está llena. Un cartel promocional no es motivo para tumbar la home, así que
// todo acceso va protegido y falla hacia "no mostrar".
function leerVistos() {
  try {
    const lista = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    return Array.isArray(lista) ? lista : []
  } catch {
    return []
  }
}

function marcarVisto(id) {
  try {
    const lista = leerVistos().filter(x => x !== id)
    lista.push(id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lista.slice(-MAX_RECORDADOS)))
  } catch { /* sin localStorage el cartel se repetirá; es el mal menor */ }
}

onMounted(async () => {
  // El layout ya abre CityPickerModal cuando el visitante no ha elegido
  // municipio. Dos modales encimados en la primera visita es peor que retrasar
  // el cartel a la siguiente página: se salta este cargado completo.
  if (!cityStore.isOnboarded) return

  const res = await $fetch(`${config.public.apiBase}/city-posts`, {
    query: queryEventos({ citySlug: props.citySlug, pasados: false, pagina: 1, porPagina: 1 }),
  }).catch(() => null)

  const post = mapCityPost(res?.data?.[0] ?? null)

  // Solo el destacado del municipio, y solo si subieron el cartel: un modal a
  // pantalla completa sin imagen no tiene nada que mostrar.
  if (!post?.isFeatured || !post.coverImage?.url) return
  if (leerVistos().includes(post.documentId)) return

  evento.value = post
  abierto.value = true
  // Se marca al abrir y no al cerrar: si el visitante cierra la pestaña de
  // golpe, no queremos que el mismo cartel lo reciba en la siguiente visita.
  marcarVisto(post.documentId)
})

const fecha = computed(() => (evento.value ? vigenciaTexto(evento.value) : ''))
const href = computed(() => (evento.value ? eventUrl(evento.value, props.citySlug) : '/'))

function cerrar() {
  abierto.value = false
}
</script>

<template>
  <TransitionRoot as="template" :show="abierto && !!evento">
    <Dialog as="div" class="relative z-50" @close="cerrar">
      <TransitionChild
        as="template"
        enter="ease-out duration-200"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in duration-150"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-brand-bg-dark/80 backdrop-blur-sm" />
      </TransitionChild>

      <div class="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto">
        <TransitionChild
          as="template"
          enter="ease-out duration-200"
          enter-from="opacity-0 translate-y-4 scale-95"
          enter-to="opacity-100 translate-y-0 scale-100"
          leave="ease-in duration-150"
          leave-from="opacity-100 translate-y-0 scale-100"
          leave-to="opacity-0 translate-y-2 scale-95"
        >
          <DialogPanel
            v-if="evento"
            class="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
          >
            <button
              type="button"
              class="absolute right-3 top-3 z-10 inline-flex items-center justify-center w-9 h-9 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
              @click="cerrar"
            >
              <span class="sr-only">Cerrar</span>
              <X class="w-5 h-5" />
            </button>

            <!-- El cartel manda: object-contain para no recortarlo, que es justo
                 lo que distingue a un cartel de una foto de portada. -->
            <a :href="href" class="block bg-slate-100 shrink-0">
              <img
                :src="portada"
                :alt="evento.coverImage.alternativeText || evento.title"
                class="w-full max-h-[62vh] object-contain"
              />
            </a>

            <div class="p-5 md:p-6 flex flex-col gap-3 overflow-y-auto">
              <DialogTitle class="font-display font-black text-xl md:text-2xl text-brand-text leading-tight">
                {{ evento.title }}
              </DialogTitle>

              <div class="flex flex-col gap-1.5">
                <p v-if="fecha" class="text-brand-primary text-sm font-semibold flex items-center gap-1.5">
                  <CalendarDays class="w-4 h-4 shrink-0" />
                  {{ fecha }}
                </p>
                <p v-if="evento.venueName" class="text-brand-azulgris text-sm flex items-center gap-1.5 min-w-0">
                  <MapPin class="w-4 h-4 shrink-0" />
                  <span class="truncate">{{ evento.venueName }}</span>
                </p>
              </div>

              <div class="flex items-center gap-3 mt-1">
                <a :href="href" class="btn-primary inline-flex items-center gap-2 flex-1 justify-center">
                  Ver programa completo
                  <ArrowRight class="w-4 h-4" />
                </a>
                <button
                  type="button"
                  class="px-4 py-2 rounded-xl text-sm font-semibold text-brand-azulgris hover:text-brand-text hover:bg-gray-50 transition-colors"
                  @click="cerrar"
                >
                  Ahora no
                </button>
              </div>
            </div>
          </DialogPanel>
        </TransitionChild>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

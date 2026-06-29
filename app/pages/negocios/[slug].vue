<script setup>
import { ChevronLeft, Star, MapPin, Share2, Phone, Check, Clock, Image as ImageIcon, Map, X } from '@lucide/vue'
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'

definePageMeta({ layout: 'landing' })

const route = useRoute()
const router = useRouter()
const slug = computed(() => route.params.slug)
const { negocio, pending, error } = useNegocio(slug)

const activeTab = ref('informacion')

const tabs = [
  { id: 'informacion', label: 'Información' },
  { id: 'resenas',     label: 'Reseñas' },
  { id: 'fotos',       label: 'Fotos' },
]

const DAY_LABELS = { mon: 'Lunes', tue: 'Martes', wed: 'Miércoles', thu: 'Jueves', fri: 'Viernes', sat: 'Sábado', sun: 'Domingo' }
const DAY_ORDER  = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
const DAY_KEYS   = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
const todayKey   = DAY_KEYS[new Date().getDay()]

const sortedHours = computed(() =>
  [...(negocio.value?.hours ?? [])].sort((a, b) =>
    DAY_ORDER.indexOf(a.dayOfWeek) - DAY_ORDER.indexOf(b.dayOfWeek)
  )
)

function formatTime(t) {
  if (!t) return ''
  const [h, m] = t.split(':')
  const hour = parseInt(h)
  return `${hour > 12 ? hour - 12 : hour || 12}:${m} ${hour >= 12 ? 'pm' : 'am'}`
}

useSeoMeta({
  title: () => negocio.value ? `${negocio.value.name} — Etzatlán, Jalisco | Mandaditoz` : 'Cargando...',
  description: () => negocio.value?.shortDescription ?? negocio.value?.description,
})

const { isLoggedIn, user } = useAuthStore()
const { submitClaim} = useClaim()

// Reclamar negocio
const showClaimModal = ref(false)
const claimForm = ref({ nombre: '', rol: 'owner', telefono: '', mensaje: '' })
const claimSending = ref(false)
const claimSent = ref(false)
const claimError = ref(null)

const ROLES = [
  { value: 'owner',    label: 'Dueño' },
  { value: 'manager',  label: 'Gerente' },
  { value: 'employee', label: 'Empleado' },
  { value: 'other',    label: 'Otro' },
]

function handleClaim() {
  if (!isLoggedIn) {
    router.push(`/login?redirect=${route.fullPath}`)
    return
  }
  claimForm.value = { nombre: user.value?.username ?? '', rol: 'owner', telefono: '', mensaje: '' }
  claimSent.value = false
  claimError.value = null
  showClaimModal.value = true
}

async function submitClaimForm() {
  claimSending.value = true
  claimError.value = null
  try {
    await submitClaim({
      businessDocumentId: negocio.value.documentId,
      claimantName: claimForm.value.nombre,
      claimantRole: claimForm.value.rol,
      claimantPhone: claimForm.value.telefono,
      notes: claimForm.value.mensaje,
    })
    claimSent.value = true
  } catch {
    claimError.value = 'Ocurrió un error al enviar la solicitud. Intenta de nuevo.'
  } finally {
    claimSending.value = false
  }
}

</script>

<template>
  <div>

    <!-- Loading -->
    <div v-if="pending" class="flex items-center justify-center min-h-96">
      <div class="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
    </div>

    <!-- Error -->
    <div v-else-if="error || !negocio" class="flex flex-col items-center justify-center min-h-96 gap-4 text-center px-6">
      <p class="font-display font-black text-2xl text-brand-text">Negocio no encontrado</p>
      <p class="text-brand-azulgris text-sm">No pudimos encontrar el negocio que buscas.</p>
      <a href="/list" class="btn-primary">Ver directorio</a>
    </div>

    <!-- Content -->
    <template v-else>

      <!-- Breadcrumb -->
      <div class="bg-white border-b border-gray-100 px-6 md:px-12 py-3">
        <div class="max-w-6xl mx-auto">
          <nav class="flex items-center gap-2 text-sm">
            <a href="/" class="text-brand-primary hover:underline">Inicio</a>
            <span class="text-gray-400">›</span>
            <a href="/list" class="text-brand-primary hover:underline">{{ negocio.category?.name ?? 'Directorio' }}</a>
            <span class="text-gray-400">›</span>
            <span class="text-brand-text font-medium">{{ negocio.name }}</span>
          </nav>
        </div>
      </div>

      <!-- Hero -->
      <div class="relative overflow-hidden bg-brand-bg-dark px-6 md:px-12 py-8">

        <!-- Cover photo background -->
        <img
          v-if="negocio.coverPhoto?.url"
          :src="negocio.coverPhoto.url"
          :alt="negocio.coverPhoto.alternativeText ?? negocio.name"
          class="absolute inset-0 w-full h-full object-cover opacity-20"
        />

        <!-- Decorative network pattern -->
        <svg
          class="absolute right-0 top-0 h-full w-72 text-white/10 pointer-events-none"
          viewBox="0 0 280 240" fill="none" xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true" preserveAspectRatio="xMidYMid slice"
        >
          <circle cx="240" cy="40"  r="14" stroke="currentColor" stroke-width="2" />
          <circle cx="160" cy="100" r="14" stroke="currentColor" stroke-width="2" />
          <circle cx="240" cy="160" r="14" stroke="currentColor" stroke-width="2" />
          <circle cx="80"  cy="160" r="14" stroke="currentColor" stroke-width="2" />
          <circle cx="200" cy="220" r="14" stroke="currentColor" stroke-width="2" />
          <circle cx="240" cy="40"  r="5"  fill="currentColor" />
          <circle cx="160" cy="100" r="5"  fill="currentColor" />
          <circle cx="240" cy="160" r="5"  fill="currentColor" />
          <circle cx="80"  cy="160" r="5"  fill="currentColor" />
          <circle cx="200" cy="220" r="5"  fill="currentColor" />
          <line x1="240" y1="54"  x2="160" y2="86"  stroke="currentColor" stroke-width="1.5" />
          <line x1="160" y1="114" x2="240" y2="146" stroke="currentColor" stroke-width="1.5" />
          <line x1="160" y1="114" x2="80"  y2="146" stroke="currentColor" stroke-width="1.5" />
          <line x1="240" y1="174" x2="200" y2="206" stroke="currentColor" stroke-width="1.5" />
          <line x1="80"  y1="174" x2="200" y2="206" stroke="currentColor" stroke-width="1.5" />
        </svg>

        <div class="relative max-w-6xl mx-auto">

          <a href="/list" class="inline-flex items-center gap-1 text-white/60 text-sm hover:text-white transition-colors mb-6">
            <ChevronLeft class="w-4 h-4" />
            Volver a resultados
          </a>

          <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">

            <div class="flex items-start gap-5">
              <div class="w-20 h-20 rounded-2xl bg-slate-700 overflow-hidden flex items-center justify-center text-white font-bold text-3xl shrink-0">
                <img
                  v-if="negocio.logo?.url"
                  :src="negocio.logo.url"
                  :alt="negocio.logo.alternativeText ?? negocio.name"
                  class="w-full h-full object-cover"
                />
                <span v-else>{{ (negocio.name ?? '?').charAt(0) }}</span>
              </div>
              <div>
                <div class="flex items-center gap-3 flex-wrap">
                  <h1 class="font-display font-black text-3xl md:text-4xl text-white leading-tight">{{ negocio.name ?? 'Sin nombre' }}</h1>
                  <span v-if="negocio.isVerified" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/20 bg-white/10 text-white text-xs font-medium">
                    <Check class="w-3 h-3" />
                    Verificado
                  </span>
                </div>

                <div class="flex items-center gap-2 mt-2.5 flex-wrap">
                  <span
                    v-if="negocio.category"
                    class="text-xs font-medium px-2.5 py-0.5 rounded-full"
                    :class="negocio.category.color ? '' : 'bg-blue-900/70 text-blue-300'"
                    :style="negocio.category.color ? { backgroundColor: negocio.category.color + '40', color: negocio.category.color } : {}"
                  >
                    {{ negocio.category.name }}
                  </span>
                  <span
                    v-if="negocio.isOpen !== null && negocio.isOpen !== undefined"
                    :class="[
                      'inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full',
                      negocio.isOpen ? 'bg-emerald-900/60 text-emerald-400' : 'bg-red-900/60 text-red-400',
                    ]"
                  >
                    <span :class="['w-1.5 h-1.5 rounded-full', negocio.isOpen ? 'bg-emerald-400' : 'bg-red-400']" />
                    {{ negocio.isOpen ? 'Abierto ahora' : 'Cerrado' }}
                  </span>
                </div>

                <div class="flex items-center gap-3 mt-3 flex-wrap">
                  <div class="flex items-center gap-1.5">
                    <div class="flex gap-0.5">
                      <Star
                        v-for="i in 5"
                        :key="i"
                        :class="['w-4 h-4', i <= Math.round(negocio.ratingAverage ?? 0) ? 'text-amber-400 fill-amber-400' : 'text-gray-600 fill-gray-600']"
                      />
                    </div>
                    <span class="text-amber-400 font-black text-2xl leading-none ml-1">{{ (negocio.ratingAverage ?? 0).toFixed(1) }}</span>
                    <span class="text-white/50 text-sm">{{ negocio.ratingCount ?? 0 }} reseñas</span>
                  </div>
                  <span class="text-white/20 select-none">|</span>
                  <div class="flex items-center gap-1.5 text-white/60 text-sm">
                    <MapPin class="w-4 h-4 shrink-0" />
                    <span>{{ negocio.address || 'Dirección no disponible' }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-3 shrink-0">
              <button class="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/20 bg-white/10 text-white text-sm font-semibold hover:bg-white/20 transition-colors">
                <Share2 class="w-4 h-4" />
                Compartir
              </button>
              <a
                v-if="negocio.phone"
                :href="`tel:${negocio.phone}`"
                class="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition-colors"
              >
                <Phone class="w-4 h-4" />
                Llamar
              </a>
            </div>

          </div>
        </div>
      </div>

      <!-- Tab bar -->
      <div class="bg-white border-b border-gray-200 px-6 md:px-12">
        <div class="max-w-6xl mx-auto flex gap-8">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'py-4 text-sm font-semibold border-b-2 transition-colors',
              activeTab === tab.id
                ? 'border-brand-primary text-brand-primary'
                : 'border-transparent text-brand-azulgris hover:text-brand-text',
            ]"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>

      <!-- Tab content -->
      <div class="bg-slate-100 px-6 md:px-12 py-8">
        <div class="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6 items-start">

          <!-- Main column -->
          <div class="flex-1 min-w-0 space-y-5">

            <template v-if="activeTab === 'informacion'">

              <!-- Sobre el negocio -->
              <div class="bg-white rounded-2xl p-6 shadow-sm">
                <h2 class="font-display font-black text-xl text-brand-text mb-3">Sobre el negocio</h2>
                <p class="text-brand-text text-sm leading-relaxed">{{ negocio.description ?? 'Sin descripción disponible.' }}</p>
                <div v-if="negocio.tags.length" class="flex flex-wrap gap-2 mt-4">
                  <span
                    v-for="tag in negocio.tags"
                    :key="tag"
                    class="text-xs font-medium px-3 py-1 rounded-full border border-gray-200 text-brand-text bg-gray-50"
                  >
                    {{ tag }}
                  </span>
                </div>
              </div>

              <!-- Fotos -->
              <div class="bg-white rounded-2xl p-6 shadow-sm">
                <div class="flex items-center justify-between mb-4">
                  <h2 class="font-display font-black text-xl text-brand-text">Fotos</h2>
                  <button @click="activeTab = 'fotos'" class="text-brand-azulgris text-sm font-medium hover:text-brand-text transition-colors">Ver todas →</button>
                </div>
                <div class="grid grid-cols-2 gap-2 h-64">
                  <div class="bg-brand-bg-dark rounded-xl overflow-hidden">
                    <img v-if="negocio.photos[0]?.url" :src="negocio.photos[0].url" :alt="negocio.photos[0].alternativeText" class="w-full h-full object-cover" />
                    <div v-else class="w-full h-full flex items-center justify-center">
                      <ImageIcon class="w-8 h-8 text-white/20" />
                    </div>
                  </div>
                  <div class="grid grid-cols-2 grid-rows-2 gap-2">
                    <div v-for="idx in 3" :key="idx" class="bg-brand-bg-dark rounded-xl overflow-hidden">
                      <img v-if="negocio.photos[idx]?.url" :src="negocio.photos[idx].url" class="w-full h-full object-cover" />
                      <div v-else class="w-full h-full flex items-center justify-center">
                        <ImageIcon class="w-5 h-5 text-white/20" />
                      </div>
                    </div>
                    <div v-if="negocio.photos.length > 4" class="bg-gray-200 rounded-xl flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors" @click="activeTab = 'fotos'">
                      <span class="font-bold text-brand-text text-lg">+{{ negocio.photos.length - 4 }}</span>
                    </div>
                    <div v-else class="bg-brand-bg-dark rounded-xl flex items-center justify-center">
                      <ImageIcon class="w-5 h-5 text-white/20" />
                    </div>
                  </div>
                </div>
              </div>

            </template>

            <!-- Reseñas tab -->
            <template v-if="activeTab === 'resenas'">
              <div class="bg-white rounded-2xl p-6 shadow-sm">
                <div class="flex items-center justify-between mb-6">
                  <h2 class="font-display font-black text-xl text-brand-text">Reseñas</h2>
                  <button class="bg-brand-bg-dark hover:opacity-90 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-opacity">
                    Escribir reseña
                  </button>
                </div>

                <div v-if="negocio.reviews.length">
                  <!-- Rating summary -->
                  <div class="flex items-start gap-8 mb-8">
                    <div class="text-center shrink-0">
                      <div class="font-display font-black text-5xl text-brand-text leading-none">{{ (negocio.ratingAverage ?? 0).toFixed(1) }}</div>
                      <div class="flex gap-0.5 justify-center mt-2">
                        <Star v-for="i in 5" :key="i" :class="['w-4 h-4', i <= Math.round(negocio.ratingAverage ?? 0) ? 'text-amber-400 fill-amber-400' : 'text-gray-300 fill-gray-300']" />
                      </div>
                      <p class="text-brand-azulgris text-xs mt-1">{{ negocio.ratingCount ?? 0 }} reseñas</p>
                    </div>
                  </div>

                  <!-- Individual reviews -->
                  <div class="divide-y divide-gray-100">
                    <div v-for="review in negocio.reviews" :key="review.id" class="py-5 first:pt-0 last:pb-0">
                      <div class="flex items-start justify-between gap-4">
                        <div class="flex items-center gap-3">
                          <div class="w-9 h-9 rounded-lg bg-slate-700 flex items-center justify-center text-white font-bold text-sm shrink-0">
                            {{ review.title?.charAt(0) ?? '?' }}
                          </div>
                          <div>
                            <p class="font-semibold text-brand-text text-sm leading-tight">{{ review.title ?? 'Reseña' }}</p>
                            <p class="text-brand-azulgris text-xs mt-0.5">{{ review.visitDate }}</p>
                          </div>
                        </div>
                        <div class="flex gap-0.5 shrink-0">
                          <Star
                            v-for="i in 5"
                            :key="i"
                            :class="['w-3.5 h-3.5', i <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300 fill-gray-300']"
                          />
                        </div>
                      </div>
                      <p class="text-brand-text text-sm leading-relaxed mt-3">{{ review.comment }}</p>
                    </div>
                  </div>
                </div>

                <div v-else class="text-center py-12 text-brand-azulgris text-sm">
                  Aún no hay reseñas para este negocio.
                </div>
              </div>
            </template>

            <!-- Fotos tab -->
            <template v-if="activeTab === 'fotos'">
              <div class="bg-white rounded-2xl p-6 shadow-sm">
                <h2 class="font-display font-black text-xl text-brand-text mb-4">Fotos</h2>
                <div v-if="negocio.photos.length" class="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div v-for="foto in negocio.photos" :key="foto.url" class="aspect-square rounded-xl overflow-hidden bg-brand-bg-dark">
                    <img v-if="foto.url" :src="foto.url" :alt="foto.alternativeText" class="w-full h-full object-cover" />
                  </div>
                </div>
                <div v-else class="text-center py-12 text-brand-azulgris text-sm">
                  Aún no hay fotos para este negocio.
                </div>
              </div>
            </template>

          </div>

          <!-- Sidebar -->
          <div class="w-full lg:w-80 shrink-0 space-y-4">

            <!-- Contact card -->
            <div class="bg-brand-bg-dark rounded-2xl overflow-hidden shadow-sm">
              <div class="p-5">
                <p class="text-white/40 text-xs font-semibold tracking-widest uppercase mb-1">Información de contacto</p>
                <h3 class="font-display font-black text-xl text-white mb-5">{{ negocio.name }}</h3>

                <div v-if="negocio.phone" class="flex gap-3 mb-4">
                  <div class="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                    <Phone class="w-4 h-4 text-white/60" />
                  </div>
                  <div>
                    <p class="text-white/40 text-xs mb-0.5">Teléfono</p>
                    <p class="text-white text-sm font-medium">{{ negocio.phone }}</p>
                  </div>
                </div>

                <div v-if="negocio.address" class="flex gap-3 mb-4">
                  <div class="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                    <MapPin class="w-4 h-4 text-white/60" />
                  </div>
                  <div>
                    <p class="text-white/40 text-xs mb-0.5">Dirección</p>
                    <p class="text-white text-sm font-medium leading-snug">{{ negocio.address }}</p>
                  </div>
                </div>

                <div v-if="sortedHours.length" class="flex gap-3">
                  <div class="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Clock class="w-4 h-4 text-white/60" />
                  </div>
                  <div class="flex-1">
                    <p class="text-white/40 text-xs mb-2">Horario</p>
                    <div class="space-y-1.5">
                      <div
                        v-for="row in sortedHours"
                        :key="row.dayOfWeek"
                        class="flex justify-between text-xs"
                      >
                        <span :class="row.dayOfWeek === todayKey ? 'text-brand-primary font-semibold' : 'text-white/55'">
                          {{ DAY_LABELS[row.dayOfWeek] }}
                        </span>
                        <span :class="row.dayOfWeek === todayKey ? 'text-brand-primary font-semibold' : 'text-white/55'">
                          {{ row.isClosed ? 'Cerrado' : row.is24Hours ? '24 horas' : `${formatTime(row.openTime)} – ${formatTime(row.closeTime)}` }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="px-5 pb-5 space-y-2">
                <a
                  v-if="negocio.phone"
                  :href="`tel:${negocio.phone}`"
                  class="w-full flex items-center justify-center gap-2 bg-slate-600 hover:bg-slate-500 text-white text-sm font-semibold py-3 rounded-xl transition-colors"
                >
                  <Phone class="w-4 h-4" />
                  Llamar ahora
                </a>
                <a
                  v-if="negocio.whatsapp"
                  :href="`https://wa.me/${negocio.whatsapp.replace(/\D/g, '')}`"
                  target="_blank"
                  rel="noopener"
                  class="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-3 rounded-xl transition-colors"
                >
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp
                </a>
                <button class="w-full flex items-center justify-center gap-2 border border-white/20 text-white text-sm font-semibold py-3 rounded-xl hover:bg-white/10 transition-colors">
                  <Map class="w-4 h-4" />
                  Ver en el mapa
                </button>
              </div>
            </div>

            <!-- Claim card -->
            <div class="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
              <p class="font-semibold text-brand-text text-sm mb-1">¿Es tu negocio?</p>
              <p class="text-brand-azulgris text-xs leading-relaxed mb-3">
                Reclamarlo te permite actualizar los datos, responder reseñas y acceder a estadísticas.
              </p>
              <button @click="handleClaim" class="text-brand-primary text-sm font-semibold hover:underline">
                Reclamar este negocio →
              </button>
            </div>

          </div>
        </div>
      </div>

    </template>

    <!-- Modal: Reclamar negocio -->
    <TransitionRoot appear :show="showClaimModal" as="template">
      <Dialog as="div" class="relative z-50" @close="showClaimModal = false">

        <TransitionChild
          as="template"
          enter="ease-out duration-200" enter-from="opacity-0" enter-to="opacity-100"
          leave="ease-in duration-150" leave-from="opacity-100" leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
        </TransitionChild>

        <div class="fixed inset-0 flex items-center justify-center p-4">
          <TransitionChild
            as="template"
            enter="ease-out duration-200" enter-from="opacity-0 scale-95" enter-to="opacity-100 scale-100"
            leave="ease-in duration-150" leave-from="opacity-100 scale-100" leave-to="opacity-0 scale-95"
          >
            <DialogPanel class="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">

              <!-- Header -->
              <div class="flex items-start justify-between px-6 pt-6 pb-4">
                <div>
                  <DialogTitle class="font-display font-black text-xl text-brand-text">Reclamar negocio</DialogTitle>
                  <p class="text-brand-azulgris text-xs mt-1">{{ negocio?.name }}</p>
                </div>
                <button @click="showClaimModal = false" class="text-brand-azulgris hover:text-brand-text transition-colors mt-0.5">
                  <X class="w-5 h-5" />
                </button>
              </div>

              <!-- Éxito -->
              <div v-if="claimSent" class="px-6 pb-8 pt-2 text-center">
                <div class="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                  <Check class="w-7 h-7 text-emerald-600" />
                </div>
                <p class="font-semibold text-brand-text mb-1">¡Solicitud enviada!</p>
                <p class="text-brand-azulgris text-sm">Revisaremos tu solicitud y nos pondremos en contacto contigo en breve.</p>
                <button @click="showClaimModal = false" class="mt-6 btn-primary w-full">Cerrar</button>
              </div>

              <!-- Formulario -->
              <form v-else @submit.prevent="submitClaimForm" class="px-6 pb-6 space-y-4">
                <div>
                  <label class="block text-xs font-semibold text-brand-text mb-1.5">Nombre completo</label>
                  <input
                    v-model="claimForm.nombre"
                    type="text"
                    required
                    placeholder="Tu nombre"
                    class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-brand-text placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition"
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-brand-text mb-1.5">Tu relación con el negocio</label>
                  <select
                    v-model="claimForm.rol"
                    required
                    class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition bg-white"
                  >
                    <option v-for="r in ROLES" :key="r.value" :value="r.value">{{ r.label }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-semibold text-brand-text mb-1.5">Teléfono de contacto</label>
                  <input
                    v-model="claimForm.telefono"
                    type="tel"
                    required
                    placeholder="+52 33 1234 5678"
                    class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-brand-text placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition"
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-brand-text mb-1.5">Notas <span class="text-brand-azulgris font-normal">(opcional)</span></label>
                  <textarea
                    v-model="claimForm.mensaje"
                    rows="3"
                    placeholder="Cuéntanos cómo podemos verificar que eres el propietario…"
                    class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-brand-text placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition resize-none"
                  />
                </div>
                <p v-if="claimError" class="text-red-500 text-xs">{{ claimError }}</p>
                <button
                  type="submit"
                  :disabled="claimSending"
                  class="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <span v-if="claimSending" class="inline-flex items-center gap-2">
                    <span class="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Enviando…
                  </span>
                  <span v-else>Enviar solicitud</span>
                </button>
              </form>

            </DialogPanel>
          </TransitionChild>
        </div>

      </Dialog>
    </TransitionRoot>

  </div>
</template>

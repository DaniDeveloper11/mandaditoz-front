<script setup>
import {
  Plus, Pencil, ExternalLink, Star, Eye, MapPin, Store, Sparkles,
  AlertCircle, ChevronRight,
} from '@lucide/vue'
import { getCategoriaConfig } from '~/utils/categorias'

definePageMeta({ layout: 'landing' })

const router = useRouter()
const { isLoggedIn, user } = useAuthStore()
const cityStore = useCityStore()

if (import.meta.client && !isLoggedIn) {
  router.replace('/login?redirect=/mis-negocios')
}

const { negocios, publishedCount, publishedLimit, canPublishMore, pending, error, refresh } = useMisNegocios()

const stats = computed(() => {
  const total = negocios.value.length
  const drafts = negocios.value.filter(n => n.businessStatus !== 'published').length
  const totalViews = negocios.value.reduce((sum, n) => sum + (n.viewCount ?? 0), 0)
  return { total, drafts, totalViews }
})

function statusMeta(status) {
  switch (status) {
    case 'published':      return { label: 'Publicado',       dot: 'bg-emerald-500', pill: 'bg-emerald-100 text-emerald-700' }
    case 'pending_review': return { label: 'En revisión',     dot: 'bg-amber-500',   pill: 'bg-amber-100 text-amber-700'   }
    case 'suspended':      return { label: 'Suspendido',      dot: 'bg-red-500',     pill: 'bg-red-100 text-red-700'       }
    default:               return { label: 'Borrador',        dot: 'bg-gray-400',    pill: 'bg-gray-100 text-gray-600'     }
  }
}

function coverStyle(negocio) {
  const color = negocio.category?.color
  return color ? { backgroundColor: color } : {}
}
function accentBarStyle(negocio) {
  const color = negocio.category?.color
  return color ? { backgroundColor: color } : {}
}
function categoryBadgeStyle(negocio) {
  const color = negocio.category?.color
  return color ? { backgroundColor: color + '26', color } : {}
}

useSeoMeta({ title: 'Mis negocios | Mandaditoz' })
</script>

<template>
  <div class="min-h-screen bg-slate-100 py-10 px-4 md:px-8">
    <div class="max-w-5xl mx-auto">

      <!-- Encabezado -->
      <div class="flex items-start justify-between gap-4 flex-wrap mb-8">
        <div>
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-bold tracking-widest uppercase mb-3">
            <Store class="w-3.5 h-3.5" />
            Panel de negocios
          </div>
          <h1 class="font-display font-black text-3xl md:text-4xl text-brand-text">
            Hola, {{ user?.displayName || user?.username || 'dueño' }}
          </h1>
          <p class="text-brand-azulgris text-sm mt-2">
            Gestiona todos tus negocios desde un solo lugar.
          </p>
        </div>

        <NuxtLink
          to="/negocios/nuevo"
          class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-primary text-white text-sm font-bold hover:opacity-90 transition-opacity shrink-0"
        >
          <Plus class="w-4 h-4" />
          Nuevo negocio
        </NuxtLink>
      </div>

      <!-- Loading -->
      <div v-if="pending" class="flex items-center justify-center py-24">
        <div class="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
      </div>

      <!-- Error -->
      <div
        v-else-if="error"
        class="flex items-start gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm"
      >
        <AlertCircle class="w-4 h-4 shrink-0 mt-0.5" />
        <div class="flex-1">
          <p class="font-semibold">No pudimos cargar tus negocios.</p>
          <button @click="refresh" class="text-red-700 underline text-xs mt-1">Reintentar</button>
        </div>
      </div>

      <!-- Empty -->
      <div
        v-else-if="!negocios.length"
        class="bg-white rounded-3xl shadow-sm p-10 text-center"
      >
        <div class="w-16 h-16 rounded-2xl bg-brand-primary/10 flex items-center justify-center mx-auto mb-5">
          <Sparkles class="w-7 h-7 text-brand-primary" />
        </div>
        <h2 class="font-display font-black text-2xl text-brand-text mb-2">Aún no tienes negocios</h2>
        <p class="text-brand-azulgris text-sm max-w-md mx-auto mb-6">
          Registra tu primer negocio para aparecer en el directorio de {{ cityStore.activeCityName }} y llegar a más clientes.
        </p>
        <NuxtLink
          to="/negocios/nuevo"
          class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-primary text-white text-sm font-bold hover:opacity-90 transition-opacity"
        >
          <Plus class="w-4 h-4" />
          Crear mi primer negocio
        </NuxtLink>
      </div>

      <!-- Contenido -->
      <template v-else>

        <!-- Stats -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div class="bg-white rounded-2xl p-5 border border-gray-100">
            <p class="text-brand-azulgris text-xs font-semibold tracking-widest uppercase">Total</p>
            <p class="font-display font-black text-3xl text-brand-text mt-1">{{ stats.total }}</p>
          </div>
          <div
            class="bg-white rounded-2xl p-5 border"
            :class="canPublishMore ? 'border-gray-100' : 'border-amber-300 bg-amber-50'"
          >
            <p
              class="text-xs font-semibold tracking-widest uppercase"
              :class="canPublishMore ? 'text-emerald-600' : 'text-amber-700'"
            >Publicados</p>
            <p class="font-display font-black text-3xl text-brand-text mt-1">
              {{ publishedCount }}<span class="text-gray-300 text-xl"> / {{ publishedLimit }}</span>
            </p>
          </div>
          <div class="bg-white rounded-2xl p-5 border border-gray-100">
            <p class="text-gray-500 text-xs font-semibold tracking-widest uppercase">Borradores</p>
            <p class="font-display font-black text-3xl text-brand-text mt-1">{{ stats.drafts }}</p>
          </div>
          <div class="bg-white rounded-2xl p-5 border border-gray-100">
            <p class="text-amber-600 text-xs font-semibold tracking-widest uppercase">Vistas totales</p>
            <p class="font-display font-black text-3xl text-brand-text mt-1">{{ stats.totalViews }}</p>
          </div>
        </div>

        <!-- Banner límite -->
        <div
          v-if="!canPublishMore"
          class="mb-6 flex items-start gap-3 px-4 py-3 rounded-2xl bg-amber-50 border border-amber-200"
        >
          <AlertCircle class="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div class="flex-1 text-sm">
            <p class="font-semibold text-amber-800">Has alcanzado el límite de {{ publishedLimit }} negocios publicados.</p>
            <p class="text-amber-700 mt-0.5">Podrás publicar uno nuevo cuando cambies otro a borrador o lo archives. Puedes seguir creando negocios en modo borrador sin límite.</p>
          </div>
        </div>

        <!-- Grid de negocios -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="negocio in negocios"
            :key="negocio.documentId"
            class="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col group hover:shadow-md transition-shadow"
          >

            <!-- Cover -->
            <div
              class="relative h-28 overflow-hidden"
              :class="[
                negocio.category?.color
                  ? ''
                  : getCategoriaConfig(negocio.category?.slug).accentColor,
                !negocio.category ? 'bg-brand-bg-dark' : '',
              ]"
              :style="coverStyle(negocio)"
            >
              <!-- Foto de cover (si existe) por encima del color -->
              <img
                v-if="negocio.coverPhoto?.url"
                :src="negocio.coverPhoto.url"
                :alt="negocio.name"
                class="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-multiply"
              />

              <!-- Overlay decorativo si no hay cover -->
              <div
                v-if="!negocio.coverPhoto?.url"
                class="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-black/20 pointer-events-none"
              />

              <!-- Badge de estado -->
              <div class="absolute top-3 right-3">
                <span
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold shadow-sm backdrop-blur-sm bg-white/95"
                  :class="statusMeta(negocio.businessStatus).pill"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :class="statusMeta(negocio.businessStatus).dot" />
                  {{ statusMeta(negocio.businessStatus).label }}
                </span>
              </div>

              <!-- Accent bar inferior -->
              <div
                class="absolute bottom-0 left-0 w-full h-1.5"
                :class="negocio.category?.color ? '' : getCategoriaConfig(negocio.category?.slug).accentColor"
                :style="accentBarStyle(negocio)"
              />
            </div>

            <!-- Body -->
            <div class="px-5 pt-4 pb-5 flex flex-col flex-1">

              <!-- Logo + nombre -->
              <div class="flex items-start gap-3 -mt-12 relative z-10">
                <div class="w-14 h-14 rounded-2xl bg-white border-2 border-white shadow overflow-hidden flex items-center justify-center text-brand-text font-bold text-xl shrink-0">
                  <img
                    v-if="negocio.logo?.url"
                    :src="negocio.logo.url"
                    :alt="negocio.name"
                    class="w-full h-full object-cover"
                  />
                  <span v-else class="bg-brand-bg-dark w-full h-full flex items-center justify-center text-white">
                    {{ (negocio.name ?? '?').charAt(0).toUpperCase() }}
                  </span>
                </div>
                <div class="flex-1 min-w-0 pt-1.5">
                  <h3 class="font-display font-black text-lg text-brand-text leading-tight truncate">{{ negocio.name }}</h3>
                  <span
                    v-if="negocio.category?.name"
                    class="inline-flex items-center gap-1.5 mt-2 px-2 py-0.5 rounded-full text-[11px] font-semibold"
                    :class="negocio.category.color ? '' : getCategoriaConfig(negocio.category.slug).badgeStyle"
                    :style="categoryBadgeStyle(negocio)"
                  >
                    {{ negocio.category.name }}
                  </span>
                </div>
              </div>

              <!-- Meta -->
              <div class="flex items-center gap-4 mt-4 text-xs text-brand-azulgris">
                <div class="flex items-center gap-1">
                  <Star class="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span class="font-semibold text-brand-text">{{ (negocio.ratingAverage ?? 0).toFixed(1) }}</span>
                  <span>({{ negocio.ratingCount ?? 0 }})</span>
                </div>
                <div class="flex items-center gap-1">
                  <Eye class="w-3.5 h-3.5" />
                  <span>{{ negocio.viewCount ?? 0 }} vistas</span>
                </div>
              </div>

              <div v-if="negocio.address" class="flex items-start gap-1.5 mt-2 text-xs text-brand-azulgris">
                <MapPin class="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span class="line-clamp-1">{{ negocio.address }}</span>
              </div>

              <!-- Actions -->
              <div class="flex items-center gap-2 mt-5 pt-4 border-t border-gray-100">
                <NuxtLink
                  :to="`/negocios/${negocio.slug}/edit`"
                  class="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-brand-bg-dark text-white text-xs font-bold hover:opacity-90 transition-opacity"
                >
                  <Pencil class="w-3.5 h-3.5" />
                  Editar
                </NuxtLink>
                <a
                  :href="`/negocios/${negocio.slug}`"
                  target="_blank"
                  rel="noopener"
                  class="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-brand-text text-xs font-semibold hover:bg-gray-50 transition-colors"
                >
                  <ExternalLink class="w-3.5 h-3.5" />
                  Ver
                </a>
              </div>
            </div>
          </div>

          <!-- Tile: crear otro negocio -->
          <NuxtLink
            to="/negocios/nuevo"
            class="rounded-2xl border-2 border-dashed border-gray-200 bg-white/50 hover:bg-white hover:border-brand-primary transition-colors flex flex-col items-center justify-center text-center gap-3 py-14 group"
          >
            <div class="w-12 h-12 rounded-xl bg-brand-primary/10 text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-colors flex items-center justify-center">
              <Plus class="w-6 h-6" />
            </div>
            <div>
              <p class="font-semibold text-brand-text text-sm">Registrar otro negocio</p>
              <p class="text-brand-azulgris text-xs mt-0.5 flex items-center justify-center gap-1">
                Empezar wizard <ChevronRight class="w-3 h-3" />
              </p>
            </div>
          </NuxtLink>
        </div>

      </template>

    </div>
  </div>
</template>

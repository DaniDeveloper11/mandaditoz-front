<script setup>
import {
  CheckCircle2, Clock3, FileEdit, ArrowRight, Home, Eye,
  Pencil, ListChecks, AlertTriangle, Sparkles, Loader2,
} from '@lucide/vue'

definePageMeta({ layout: 'landing' })

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const { isLoggedIn, user } = auth

const slug = computed(() => route.params.slug)
const { negocio, pending, error } = useNegocio(slug, { includeDrafts: true })

onMounted(() => {
  if (!isLoggedIn) router.replace(`/login?redirect=/negocios/${slug.value}/estado`)
})

const status = computed(() => negocio.value?.businessStatus ?? null)

const STATE_META = {
  draft: {
    icon: FileEdit,
    iconBg: 'bg-slate-100',
    iconColor: 'text-slate-600',
    badge: 'bg-slate-100 text-slate-600',
    badgeLabel: 'Borrador',
    title: 'Tu negocio está guardado como borrador',
    description: 'Cuando termines de configurarlo, podrás publicarlo desde la pantalla de edición y aparecerá en el directorio.',
    tips: [
      'Agrega fotos y un logo para destacar entre los demás negocios.',
      'Completa horarios y métodos de pago para dar más confianza.',
      'Revisa la descripción; es lo primero que la gente ve.',
    ],
  },
  pending_review: {
    icon: Clock3,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    badge: 'bg-amber-100 text-amber-700',
    badgeLabel: 'En verificación',
    title: 'Tu negocio está en verificación',
    description: 'Un administrador revisará la información y lo publicará en el directorio. Normalmente toma entre 24 y 48 horas hábiles.',
    tips: [
      'Revisa tu correo por si necesitamos aclarar algún dato.',
      'Puedes seguir editando los detalles mientras revisamos.',
      'Te avisaremos por email cuando se publique.',
    ],
  },
  published: {
    icon: CheckCircle2,
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    badge: 'bg-emerald-100 text-emerald-700',
    badgeLabel: 'Publicado',
    title: '¡Tu negocio ya está publicado!',
    description: 'Aparecerá en las búsquedas del directorio. Recuerda mantener actualizada la información y responder a las reseñas.',
    tips: [
      'Comparte tu página con tus clientes.',
      'Responde a las reseñas para generar confianza.',
      'Sube fotos frescas cada temporada.',
    ],
  },
  suspended: {
    icon: AlertTriangle,
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    badge: 'bg-red-100 text-red-700',
    badgeLabel: 'Suspendido',
    title: 'Tu negocio está suspendido',
    description: 'Contáctanos para resolver esta situación. Mientras tanto no aparece en el directorio.',
    tips: [],
  },
}

const meta = computed(() => STATE_META[status.value] ?? null)

const isOwner = computed(() =>
  negocio.value?.owner?.id ? negocio.value.owner.id === user?.id : true
)
</script>

<template>
  <div class="min-h-[60vh] bg-slate-100 py-10 px-4 md:px-8">
    <div class="max-w-2xl mx-auto">

      <div v-if="pending" class="flex items-center justify-center py-24">
        <Loader2 class="w-6 h-6 text-brand-primary animate-spin" />
      </div>

      <div
        v-else-if="error || !negocio"
        class="bg-white rounded-2xl shadow-sm p-8 text-center"
      >
        <div class="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-100 mb-4">
          <AlertTriangle class="w-7 h-7 text-red-600" />
        </div>
        <h1 class="font-display font-black text-2xl text-brand-text mb-2">Negocio no encontrado</h1>
        <p class="text-brand-azulgris text-sm mb-6">
          No pudimos cargar la información de este negocio. Puede que el enlace sea incorrecto o que no tengas acceso.
        </p>
        <NuxtLink
          to="/mis-negocios"
          class="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-brand-primary text-white text-sm font-bold hover:opacity-90 transition-opacity"
        >
          <ListChecks class="w-4 h-4" />
          Ir a Mis negocios
        </NuxtLink>
      </div>

      <template v-else-if="meta">
        <div class="text-center mb-8">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-bold tracking-widest uppercase mb-4">
            <Sparkles class="w-3.5 h-3.5" />
            Registro completado
          </div>
          <div :class="['inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-5', meta.iconBg]">
            <component :is="meta.icon" :class="['w-10 h-10', meta.iconColor]" />
          </div>
          <h1 class="font-display font-black text-3xl md:text-4xl text-brand-text mb-3 leading-tight">
            {{ meta.title }}
          </h1>
          <p class="text-brand-azulgris text-base leading-relaxed max-w-lg mx-auto">
            {{ meta.description }}
          </p>
        </div>

        <div class="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
          <div class="flex items-center gap-4 p-5 border-b border-gray-100">
            <div class="w-14 h-14 rounded-xl bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
              <img
                v-if="negocio.logo?.url"
                :src="negocio.logo.url"
                :alt="negocio.name"
                class="w-full h-full object-contain"
              />
              <span v-else class="font-display font-black text-xl text-brand-text">
                {{ negocio.name?.[0]?.toUpperCase() }}
              </span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-display font-black text-lg text-brand-text truncate">{{ negocio.name }}</p>
              <div class="flex items-center gap-2 mt-1">
                <span :class="['inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold', meta.badge]">
                  <span class="w-1.5 h-1.5 rounded-full" :class="meta.iconColor.replace('text-', 'bg-')" />
                  {{ meta.badgeLabel }}
                </span>
              </div>
            </div>
          </div>

          <div class="divide-y divide-gray-100">
            <div v-if="negocio.category" class="grid grid-cols-[110px_1fr] gap-4 px-5 py-3 text-sm">
              <span class="text-brand-azulgris">Categoría</span>
              <span class="font-semibold text-brand-text">{{ negocio.category.name }}</span>
            </div>
            <div v-if="negocio.city" class="grid grid-cols-[110px_1fr] gap-4 px-5 py-3 text-sm">
              <span class="text-brand-azulgris">Municipio</span>
              <span class="font-semibold text-brand-text">{{ negocio.city.name }}</span>
            </div>
            <div v-if="negocio.phones?.length" class="grid grid-cols-[110px_1fr] gap-4 px-5 py-3 text-sm">
              <span class="text-brand-azulgris">Teléfono</span>
              <span class="font-semibold text-brand-text">{{ negocio.phones[0].number }}</span>
            </div>
          </div>
        </div>

        <div v-if="meta.tips.length" class="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 class="font-display font-bold text-base text-brand-text mb-3">
            {{ status === 'pending_review' ? 'Mientras revisamos…' : 'Consejos' }}
          </h2>
          <ul class="space-y-2 text-sm text-brand-azulgris">
            <li v-for="(tip, i) in meta.tips" :key="i" class="flex gap-2">
              <span class="text-brand-primary shrink-0">•</span>
              <span>{{ tip }}</span>
            </li>
          </ul>
        </div>

        <div class="flex flex-col sm:flex-row gap-3">
          <NuxtLink
            v-if="isOwner"
            :to="`/negocios/${negocio.slug}/edit`"
            class="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand-primary text-white text-sm font-bold hover:opacity-90 transition-opacity"
          >
            <Pencil class="w-4 h-4" />
            {{ status === 'draft' ? 'Continuar editando' : 'Editar detalles' }}
          </NuxtLink>

          <NuxtLink
            v-if="status === 'published'"
            :to="`/negocios/${negocio.slug}`"
            class="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-brand-text hover:bg-white transition-colors"
          >
            <Eye class="w-4 h-4" />
            Ver perfil público
          </NuxtLink>

          <NuxtLink
            v-else
            to="/mis-negocios"
            class="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-brand-text hover:bg-white transition-colors"
          >
            <ListChecks class="w-4 h-4" />
            Ir a Mis negocios
          </NuxtLink>
        </div>

        <div class="text-center mt-6">
          <NuxtLink to="/" class="inline-flex items-center gap-1.5 text-sm text-brand-azulgris hover:text-brand-text transition-colors">
            <Home class="w-3.5 h-3.5" />
            Volver al inicio
          </NuxtLink>
        </div>
      </template>

    </div>
  </div>
</template>

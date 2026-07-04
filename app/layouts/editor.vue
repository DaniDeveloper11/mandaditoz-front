<script setup>
import { Clock, ArrowRight, Check, CircleUser, Loader2 } from '@lucide/vue'

const { user } = useAuthStore()

const editorMeta = useState('editorMeta', () => ({
  name: '',
  slug: '',
  isPublished: false,
  lastUpdated: null,
  saving: false,
  onSave: null,
}))

const lastUpdatedLabel = computed(() => {
  if (!editorMeta.value.lastUpdated) return null
  const date = new Date(editorMeta.value.lastUpdated)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  const time = date.toLocaleTimeString('es-MX', { hour: 'numeric', minute: '2-digit', hour12: true })
  return `${isToday ? 'hoy' : date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}, ${time}`
})

function handlePreview() {
  if (editorMeta.value.slug) {
    window.open(`/negocios/${editorMeta.value.slug}`, '_blank')
  }
}

function handleSave() {
  editorMeta.value.onSave?.()
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-slate-100">

    <!-- Header fixed -->
    <header class="fixed top-0 inset-x-0 z-30 h-14 bg-white border-b border-gray-200 flex items-center px-6">

      <div class="flex items-center gap-3 min-w-0 flex-1">
        <a href="/" class="shrink-0">
          <img src="/logo-cielo-horizontal.svg" alt="Mandaditoz" class="h-7 w-auto" />
        </a>

        <span class="text-gray-300 text-lg select-none">|</span>

        <nav class="flex items-center gap-1.5 text-sm min-w-0">
          <a href="/mis-negocios" class="text-brand-azulgris hover:text-brand-text transition-colors whitespace-nowrap">
            Mis negocios
          </a>
          <span class="text-gray-400">›</span>
          <span class="font-semibold text-brand-text truncate">{{ editorMeta.name || '…' }}</span>
          <span
            v-if="editorMeta.name"
            class="inline-flex items-center gap-1.5 ml-1 px-2.5 py-0.5 rounded-full text-xs font-semibold"
            :class="editorMeta.isPublished ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'"
          >
            <span class="w-1.5 h-1.5 rounded-full" :class="editorMeta.isPublished ? 'bg-emerald-500' : 'bg-gray-400'" />
            {{ editorMeta.isPublished ? 'Publicado' : 'Borrador' }}
          </span>
        </nav>
      </div>

      <div class="flex items-center gap-3 shrink-0">
        <div class="flex items-center gap-1.5 text-sm text-brand-azulgris">
          <CircleUser class="w-4 h-4" />
          <span>{{ user?.displayName || user?.username || '—' }}</span>
        </div>
        <a
          v-if="editorMeta.slug"
          :href="`/negocios/${editorMeta.slug}`"
          target="_blank"
          class="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg border border-gray-300 text-sm font-semibold text-brand-text hover:bg-gray-50 transition-colors"
        >
          <ArrowRight class="w-3.5 h-3.5" />
          Ver mi página
        </a>
      </div>

    </header>

    <main class="flex-1 pt-14 pb-16">
      <slot />
    </main>

    <!-- Footer fixed -->
    <footer class="fixed bottom-0 inset-x-0 z-30 h-14 bg-white border-t border-gray-200 flex items-center justify-between px-6">

      <div class="flex items-center gap-2 text-sm text-brand-azulgris">
        <Clock class="w-4 h-4 shrink-0" />
        <span v-if="lastUpdatedLabel">Última actualización: {{ lastUpdatedLabel }}</span>
        <span v-else class="text-gray-400">Sin cambios guardados</span>
      </div>

      <div class="flex items-center gap-3">
        <button
          @click="handlePreview"
          class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-300 text-sm font-semibold text-brand-text hover:bg-gray-50 transition-colors"
        >
          <ArrowRight class="w-3.5 h-3.5" />
          Vista previa
        </button>
        <button
          @click="handleSave"
          :disabled="editorMeta.saving"
          class="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-brand-bg-dark text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Loader2 v-if="editorMeta.saving" class="w-3.5 h-3.5 animate-spin" />
          <Check v-else class="w-3.5 h-3.5" />
          {{ editorMeta.saving ? 'Guardando…' : 'Guardar cambios' }}
        </button>
      </div>

    </footer>

  </div>
</template>

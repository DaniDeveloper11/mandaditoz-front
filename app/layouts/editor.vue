<script setup>
import { Clock, ArrowRight, Check, CircleUser, Loader2 } from '@lucide/vue'

const { user } = useAuthStore()

const editorMeta = useState('editorMeta', () => ({
  name: '',
  slug: '',
  publicUrl: '',
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
  const target = editorMeta.value.publicUrl || (editorMeta.value.slug ? `/negocios/${editorMeta.value.slug}` : '')
  if (target) window.open(target, '_blank')
}

function handleSave() {
  editorMeta.value.onSave?.()
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-slate-100">

    <!-- Header fixed -->
    <header class="fixed top-0 inset-x-0 z-30 h-14 bg-white border-b border-gray-200 flex items-center px-4 sm:px-6 gap-3">

      <div class="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        <a href="/" class="shrink-0">
          <img src="/logo-cielo-horizontal.svg" alt="Mandaditoz" class="h-6 sm:h-7 w-auto" />
        </a>

        <span class="hidden sm:inline text-gray-300 text-lg select-none">|</span>

        <nav class="flex items-center gap-1.5 text-sm min-w-0">
          <a href="/mis-negocios" class="hidden sm:inline text-brand-azulgris hover:text-brand-text transition-colors whitespace-nowrap">
            Mis negocios
          </a>
          <span class="hidden sm:inline text-gray-400">›</span>
          <span class="font-semibold text-brand-text truncate">{{ editorMeta.name || '…' }}</span>
          <span
            v-if="editorMeta.name"
            class="inline-flex items-center gap-1.5 ml-1 px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold shrink-0"
            :class="editorMeta.isPublished ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'"
          >
            <span class="w-1.5 h-1.5 rounded-full" :class="editorMeta.isPublished ? 'bg-emerald-500' : 'bg-gray-400'" />
            <span class="hidden sm:inline">{{ editorMeta.isPublished ? 'Publicado' : 'Borrador' }}</span>
          </span>
        </nav>
      </div>

      <div class="flex items-center gap-3 shrink-0">
        <div class="hidden md:flex items-center gap-1.5 text-sm text-brand-azulgris">
          <CircleUser class="w-4 h-4" />
          <span>{{ user?.displayName || user?.username || '—' }}</span>
        </div>
        <a
          v-if="editorMeta.slug"
          :href="editorMeta.publicUrl || `/negocios/${editorMeta.slug}`"
          target="_blank"
          class="hidden sm:inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg border border-gray-300 text-sm font-semibold text-brand-text hover:bg-gray-50 transition-colors"
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
    <footer class="fixed bottom-0 inset-x-0 z-30 h-14 bg-white border-t border-gray-200 flex items-center justify-between px-4 sm:px-6 gap-3">

      <div class="hidden sm:flex items-center gap-2 text-sm text-brand-azulgris min-w-0">
        <Clock class="w-4 h-4 shrink-0" />
        <span v-if="lastUpdatedLabel" class="truncate">Última actualización: {{ lastUpdatedLabel }}</span>
        <span v-else class="text-gray-400">Sin cambios guardados</span>
      </div>

      <div class="flex items-center gap-2 sm:gap-3 flex-1 sm:flex-initial justify-end">
        <button
          @click="handlePreview"
          class="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg border border-gray-300 text-sm font-semibold text-brand-text hover:bg-gray-50 transition-colors"
        >
          <ArrowRight class="w-3.5 h-3.5" />
          <span class="hidden sm:inline">Vista previa</span>
          <span class="sm:hidden">Ver</span>
        </button>
        <button
          @click="handleSave"
          :disabled="editorMeta.saving"
          class="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-lg bg-brand-bg-dark text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Loader2 v-if="editorMeta.saving" class="w-3.5 h-3.5 animate-spin" />
          <Check v-else class="w-3.5 h-3.5" />
          <span class="hidden sm:inline">{{ editorMeta.saving ? 'Guardando…' : 'Guardar cambios' }}</span>
          <span class="sm:hidden">{{ editorMeta.saving ? 'Guardando' : 'Guardar' }}</span>
        </button>
      </div>

    </footer>

  </div>
</template>

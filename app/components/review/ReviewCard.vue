<script setup>
import { Pencil, Trash2, MessageSquareReply, Store } from '@lucide/vue'
import StarRatingDisplay from './StarRatingDisplay.vue'

const props = defineProps({
  review: { type: Object, required: true },
  canEdit: { type: Boolean, default: false },
  canRespond: { type: Boolean, default: false },
  businessName: { type: String, default: '' },
})

const emit = defineEmits(['edit', 'delete', 'respond'])

// Las resenas enviadas sin cuenta no traen author: el nombre viene en guestName.
const authorName = computed(() =>
  props.review.author?.displayName
  ?? props.review.author?.username
  ?? props.review.guestName
  ?? 'Usuario'
)

const authorInitial = computed(() => (authorName.value.charAt(0) || '?').toUpperCase())

function formatDate(iso) {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' })
  } catch { return '' }
}

const showResponse = computed(() => !!props.review.response?.text)
</script>

<template>
  <div class="py-5 first:pt-0 last:pb-0">
    <div class="flex items-start justify-between gap-4">
      <div class="flex items-start gap-3 min-w-0">
        <div
          v-if="review.author?.avatar?.url"
          class="w-10 h-10 rounded-lg overflow-hidden bg-slate-200 shrink-0"
        >
          <img :src="review.author.avatar.url" :alt="authorName" class="w-full h-full object-cover" />
        </div>
        <div
          v-else
          class="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center text-white font-bold text-sm shrink-0"
        >
          {{ authorInitial }}
        </div>
        <div class="min-w-0">
          <p class="font-semibold text-brand-text text-sm leading-tight truncate">{{ authorName }}</p>
          <div class="flex items-center gap-2 mt-1">
            <StarRatingDisplay :value="review.rating" size="xs" />
            <span class="text-brand-azulgris text-xs">{{ formatDate(review.createdAt) }}</span>
            <span v-if="review.editedAt" class="text-brand-azulgris text-xs italic">· editado</span>
          </div>
        </div>
      </div>

      <div v-if="canEdit || canRespond" class="flex items-center gap-1 shrink-0">
        <button
          v-if="canEdit"
          type="button"
          @click="emit('edit', review)"
          class="p-1.5 text-brand-azulgris hover:text-brand-text hover:bg-gray-100 rounded-md transition-colors"
          title="Editar"
        >
          <Pencil class="w-4 h-4" />
        </button>
        <button
          v-if="canEdit"
          type="button"
          @click="emit('delete', review)"
          class="p-1.5 text-brand-azulgris hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
          title="Borrar"
        >
          <Trash2 class="w-4 h-4" />
        </button>
        <button
          v-if="canRespond && !showResponse"
          type="button"
          @click="emit('respond', review)"
          class="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-brand-primary hover:bg-brand-primary/10 rounded-md transition-colors"
          title="Responder"
        >
          <MessageSquareReply class="w-3.5 h-3.5" />
          Responder
        </button>
      </div>
    </div>

    <p v-if="review.title" class="font-semibold text-brand-text text-sm mt-3">{{ review.title }}</p>
    <p class="text-brand-text text-sm leading-relaxed mt-2 whitespace-pre-wrap">{{ review.comment }}</p>

    <div v-if="review.photos?.length" class="grid grid-cols-4 gap-2 mt-3">
      <a
        v-for="ph in review.photos"
        :key="ph.id ?? ph.url"
        :href="ph.url"
        target="_blank"
        rel="noopener"
        class="aspect-square rounded-lg overflow-hidden bg-slate-100 hover:opacity-90 transition-opacity"
      >
        <img :src="ph.url" :alt="ph.alternativeText ?? 'Foto de reseña'" class="w-full h-full object-cover" />
      </a>
    </div>

    <div v-if="showResponse" class="mt-4 ml-13 rounded-xl bg-slate-50 border border-slate-200 p-4">
      <div class="flex items-center gap-2 mb-2">
        <Store class="w-4 h-4 text-brand-primary" />
        <span class="text-xs font-bold text-brand-text">
          Respuesta de {{ businessName || 'el negocio' }}
        </span>
        <span class="text-brand-azulgris text-xs">· {{ formatDate(review.response.respondedAt) }}</span>
      </div>
      <p class="text-brand-text text-sm leading-relaxed whitespace-pre-wrap">{{ review.response.text }}</p>
    </div>
  </div>
</template>

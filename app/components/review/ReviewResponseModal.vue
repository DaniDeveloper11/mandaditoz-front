<script setup>
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import { X } from '@lucide/vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  review: { type: Object, default: null },
})
const emit = defineEmits(['close', 'saved'])

const { respondToReview } = useReviewSubmit()

const message = ref('')
const submitting = ref(false)
const errorMsg = ref(null)

watch(() => props.open, (v) => {
  if (v) {
    message.value = ''
    errorMsg.value = null
  }
})

const canSubmit = computed(() =>
  message.value.trim().length >= 2 && message.value.length <= 500 && !submitting.value
)

async function submit() {
  if (!canSubmit.value || !props.review?.documentId) return
  submitting.value = true
  errorMsg.value = null
  try {
    await respondToReview(props.review.documentId, message.value.trim())
    emit('saved')
    emit('close')
  } catch (err) {
    const apiMsg = err?.response?._data?.error?.message
    errorMsg.value = apiMsg || 'No se pudo enviar la respuesta.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <TransitionRoot :show="open" as="template">
    <Dialog @close="emit('close')" class="relative z-50">
      <TransitionChild
        as="template"
        enter="ease-out duration-200"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in duration-150"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/50" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-end sm:items-center justify-center p-0 sm:p-4">
          <TransitionChild
            as="template"
            enter="ease-out duration-200"
            enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enter-to="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-150"
            leave-from="opacity-100 translate-y-0 sm:scale-100"
            leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <DialogPanel class="w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-xl overflow-hidden">
              <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <DialogTitle class="font-display font-black text-xl text-brand-text">
                  Responder reseña
                </DialogTitle>
                <button
                  type="button"
                  @click="emit('close')"
                  class="p-1.5 text-brand-azulgris hover:text-brand-text rounded-md"
                >
                  <X class="w-5 h-5" />
                </button>
              </div>

              <div class="px-6 py-5 space-y-4">
                <p v-if="review" class="text-sm text-brand-azulgris">
                  Estás respondiendo a la reseña de
                  <span class="font-semibold text-brand-text">
                    {{ review.author?.displayName ?? review.author?.username ?? 'un usuario' }}
                  </span>
                </p>

                <div>
                  <label class="block text-xs font-bold tracking-widest uppercase text-gray-500 mb-2">
                    Tu respuesta
                  </label>
                  <textarea
                    v-model="message"
                    rows="5"
                    maxlength="500"
                    placeholder="Agradece el comentario o responde a cualquier duda del cliente."
                    class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-sm resize-none"
                  />
                  <p class="text-xs text-brand-azulgris mt-1 text-right">{{ message.length }}/500</p>
                </div>

                <p v-if="errorMsg" class="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                  {{ errorMsg }}
                </p>
              </div>

              <div class="flex justify-end gap-2 px-6 py-4 border-t border-gray-100 bg-gray-50">
                <button
                  type="button"
                  @click="emit('close')"
                  class="px-5 py-2.5 rounded-xl text-sm font-semibold text-brand-text hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  @click="submit"
                  :disabled="!canSubmit"
                  class="px-5 py-2.5 rounded-xl bg-brand-primary text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {{ submitting ? 'Enviando…' : 'Publicar respuesta' }}
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

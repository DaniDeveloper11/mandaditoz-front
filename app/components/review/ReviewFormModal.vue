<script setup>
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import { X, ImagePlus, Trash2 } from '@lucide/vue'
import Swal from 'sweetalert2'
import StarRatingInput from './StarRatingInput.vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  business: { type: Object, required: true },
  existingReview: { type: Object, default: null },
})
const emit = defineEmits(['close', 'saved'])

const { createReview, updateReview } = useReviewSubmit()
const { uploadFile, uploading: uploadingFile } = useUpload()

const rating = ref(0)
const title = ref('')
const comment = ref('')
const visitDate = ref('')
const photos = ref([])
const submitting = ref(false)
const errorMsg = ref(null)

const isEditing = computed(() => !!props.existingReview)

watch(
  [() => props.open, () => props.existingReview],
  ([openNow], _prev) => {
    if (!openNow) return
    const ex = props.existingReview
    if (ex) {
      rating.value = ex.rating ?? 0
      title.value = ex.title ?? ''
      comment.value = ex.comment ?? ''
      visitDate.value = ex.visitDate ?? ''
      photos.value = (ex.photos ?? []).map(p => ({
        id: p.id,
        url: p.url,
        name: p.name,
      }))
    } else {
      rating.value = 0
      title.value = ''
      comment.value = ''
      visitDate.value = ''
      photos.value = []
    }
    errorMsg.value = null
  },
  { flush: 'post' }
)

async function handlePhotoAdd(e) {
  const files = Array.from(e.target.files ?? [])
  e.target.value = ''
  for (const file of files) {
    if (photos.value.length >= 6) break
    try {
      const uploaded = await uploadFile(file)
      photos.value.push(uploaded)
    } catch {
      errorMsg.value = 'No se pudo subir una foto. Intenta con una imagen más pequeña.'
    }
  }
}

function removePhoto(idx) {
  photos.value.splice(idx, 1)
}

const canSubmit = computed(() =>
  rating.value >= 1 && rating.value <= 5 && comment.value.trim().length >= 10 && !submitting.value && !uploadingFile.value
)

async function submit() {
  if (!canSubmit.value) return
  submitting.value = true
  errorMsg.value = null
  const payload = {
    rating: rating.value,
    title: title.value.trim(),
    comment: comment.value.trim(),
    visitDate: visitDate.value || null,
    photoIds: photos.value.map(p => p.id).filter(Boolean),
  }
  try {
    if (isEditing.value) {
      await updateReview(props.existingReview.documentId, payload)
    } else {
      const res = await createReview({ businessDocumentId: props.business.documentId, ...payload })
      if (!res.ok && res.conflict) {
        submitting.value = false
        emit('close')
        await Swal.fire({
          icon: 'info',
          title: 'Ya reseñaste este negocio',
          text: 'Solo puedes publicar una reseña por negocio. Refresca la página para editar la existente.',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#1D5A8A',
        })
        emit('saved')
        return
      }
    }
    emit('saved')
    emit('close')
  } catch (err) {
    const apiMsg = err?.response?._data?.error?.message
    errorMsg.value = apiMsg || 'No se pudo guardar la reseña. Intenta de nuevo.'
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
            <DialogPanel class="w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-xl overflow-hidden">
              <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <DialogTitle class="font-display font-black text-xl text-brand-text">
                  {{ isEditing ? 'Editar reseña' : 'Escribir reseña' }}
                </DialogTitle>
                <button
                  type="button"
                  @click="emit('close')"
                  class="p-1.5 text-brand-azulgris hover:text-brand-text rounded-md"
                >
                  <X class="w-5 h-5" />
                </button>
              </div>

              <div class="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
                <p class="text-sm text-brand-azulgris">
                  Tu opinión sobre <span class="font-semibold text-brand-text">{{ business.name }}</span>
                </p>

                <div>
                  <label class="block text-xs font-bold tracking-widest uppercase text-gray-500 mb-2">Calificación</label>
                  <StarRatingInput v-model="rating" size="md" />
                </div>

                <div>
                  <label class="block text-xs font-bold tracking-widest uppercase text-gray-500 mb-2">
                    Título <span class="text-brand-azulgris font-normal normal-case tracking-normal">(opcional)</span>
                  </label>
                  <input
                    v-model="title"
                    type="text"
                    maxlength="100"
                    placeholder="Un resumen corto de tu experiencia"
                    class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-sm"
                  />
                </div>

                <div>
                  <label class="block text-xs font-bold tracking-widest uppercase text-gray-500 mb-2">Comentario</label>
                  <textarea
                    v-model="comment"
                    rows="5"
                    minlength="10"
                    maxlength="1500"
                    placeholder="Cuéntanos cómo fue tu experiencia (mínimo 10 caracteres)"
                    class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-sm resize-none"
                  />
                  <p class="text-xs text-brand-azulgris mt-1 text-right">{{ comment.length }}/1500</p>
                </div>

                <div>
                  <label class="block text-xs font-bold tracking-widest uppercase text-gray-500 mb-2">
                    Fecha de visita <span class="text-brand-azulgris font-normal normal-case tracking-normal">(opcional)</span>
                  </label>
                  <input
                    v-model="visitDate"
                    type="date"
                    class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-sm"
                  />
                </div>

                <div>
                  <label class="block text-xs font-bold tracking-widest uppercase text-gray-500 mb-2">
                    Fotos <span class="text-brand-azulgris font-normal normal-case tracking-normal">({{ photos.length }}/6)</span>
                  </label>
                  <div class="grid grid-cols-3 gap-2">
                    <div
                      v-for="(ph, idx) in photos"
                      :key="ph.id ?? idx"
                      class="relative aspect-square rounded-xl overflow-hidden bg-slate-100 group"
                    >
                      <img :src="ph.url" class="w-full h-full object-cover" />
                      <button
                        type="button"
                        @click="removePhoto(idx)"
                        class="absolute top-1 right-1 p-1 rounded-md bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 class="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <label
                      v-if="photos.length < 6"
                      class="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-brand-primary hover:bg-brand-primary/5 transition-colors"
                    >
                      <ImagePlus class="w-5 h-5 text-brand-azulgris mb-1" />
                      <span class="text-[10px] text-brand-azulgris font-medium">Añadir</span>
                      <input type="file" accept="image/*" multiple class="hidden" @change="handlePhotoAdd" />
                    </label>
                  </div>
                  <p v-if="uploadingFile" class="text-xs text-brand-azulgris mt-2">Subiendo…</p>
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
                  class="px-5 py-2.5 rounded-xl bg-brand-primary text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                >
                  {{ submitting ? 'Guardando…' : (isEditing ? 'Guardar cambios' : 'Publicar reseña') }}
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

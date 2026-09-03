<script setup>
import { UtensilsCrossed, X, ChevronLeft, ChevronRight } from '@lucide/vue'
import { Dialog, DialogPanel, TransitionRoot, TransitionChild } from '@headlessui/vue'
import MenuItemCard from './MenuItemCard.vue'

const props = defineProps({
  sections: { type: Array, default: () => [] },
  /**
   * Modo lectura por defecto. La Fase 4 lo enciende para mostrar los botones
   * de agregar al carrito sin tocar este componente.
   */
  orderable: { type: Boolean, default: false },
})

const emit = defineEmits(['add'])

const priceFormatter = new Intl.NumberFormat('es-MX', {
  style: 'currency', currency: 'MXN', minimumFractionDigits: 0, maximumFractionDigits: 2,
})

const visibleSections = computed(() =>
  props.sections.filter(s => s.items?.length > 0)
)

const itemCount = computed(() =>
  visibleSections.value.reduce((acc, s) => acc + s.items.length, 0)
)

// Galería de fotos de platillos: junta, en orden, todos los platillos que
// tienen foto (sin importar la sección) para poder navegar entre ellos.
const itemsWithPhoto = computed(() =>
  visibleSections.value.flatMap(s => s.items).filter(i => i.photo?.url)
)

const photoLightbox = ref({ open: false, index: 0 })

function openItemPhoto(item) {
  const idx = itemsWithPhoto.value.findIndex(i => i.id === item.id)
  if (idx === -1) return
  photoLightbox.value = { open: true, index: idx }
}
function closePhotoLightbox() { photoLightbox.value.open = false }
function photoPrev() {
  const total = itemsWithPhoto.value.length
  if (!total) return
  photoLightbox.value.index = (photoLightbox.value.index - 1 + total) % total
}
function photoNext() {
  const total = itemsWithPhoto.value.length
  if (!total) return
  photoLightbox.value.index = (photoLightbox.value.index + 1) % total
}
const activeLightboxItem = computed(() => itemsWithPhoto.value[photoLightbox.value.index] ?? null)

function sectionId(section) {
  return String(section.documentId ?? section.id)
}

// Secciones como tabs: solo se muestra una a la vez. Si cambia el menú (o la
// sección activa deja de existir), cae a la primera disponible.
const activeSectionId = ref(null)
watch(visibleSections, (list) => {
  if (!list.length) {
    activeSectionId.value = null
    return
  }
  if (!list.some(s => sectionId(s) === activeSectionId.value)) {
    activeSectionId.value = sectionId(list[0])
  }
}, { immediate: true })

const activeSection = computed(() =>
  visibleSections.value.find(s => sectionId(s) === activeSectionId.value) ?? null
)
</script>

<template>
  <div>
    <!-- Tabs de secciones -->
    <div
      v-if="visibleSections.length > 1"
      class="sticky top-0 z-10 -mx-6 px-6 bg-white/95 backdrop-blur-sm border-b border-brand-border flex gap-1 overflow-x-auto no-scrollbar"
    >
      <button
        v-for="section in visibleSections"
        :key="section.id"
        type="button"
        :class="[
          'shrink-0 whitespace-nowrap px-4 py-3 text-sm font-semibold border-b-2 transition-colors',
          activeSectionId === sectionId(section)
            ? 'border-brand-primary text-brand-primary'
            : 'border-transparent text-brand-azulgris hover:text-brand-text',
        ]"
        @click="activeSectionId = sectionId(section)"
      >
        {{ section.name }}
        <span class="ml-1 text-xs font-normal opacity-60">{{ section.items.length }}</span>
      </button>
    </div>

    <section v-if="activeSection" :key="activeSection.id" class="mt-6">
      <div v-if="visibleSections.length === 1" class="flex items-baseline justify-between gap-3 pb-3 border-b-2 border-brand-primary/15">
        <h3 class="font-display font-black text-xl text-brand-text">
          {{ activeSection.name }}
        </h3>
        <span class="text-xs font-medium text-brand-azulgris shrink-0">
          {{ activeSection.items.length }} {{ activeSection.items.length === 1 ? 'platillo' : 'platillos' }}
        </span>
      </div>
      <p
        v-if="activeSection.description"
        class="mt-2 text-sm text-brand-azulgris leading-relaxed"
      >
        {{ activeSection.description }}
      </p>

      <div class="mt-1 divide-y divide-brand-border">
        <MenuItemCard
          v-for="item in activeSection.items"
          :key="item.id"
          :item="item"
          :orderable="orderable"
          @add="emit('add', $event)"
          @view-photo="openItemPhoto"
        />
      </div>
    </section>

    <div class="mt-8 pt-4 border-t border-brand-border flex items-center gap-2 text-xs text-brand-azulgris">
      <UtensilsCrossed class="w-3.5 h-3.5 shrink-0" />
      {{ itemCount }} {{ itemCount === 1 ? 'platillo' : 'platillos' }} ·
      Los precios pueden cambiar sin previo aviso.
    </div>

    <!-- Galería: foto del platillo -->
    <TransitionRoot appear :show="photoLightbox.open" as="template">
      <Dialog as="div" class="relative z-50" @close="closePhotoLightbox">
        <TransitionChild
          as="template"
          enter="ease-out duration-200" enter-from="opacity-0" enter-to="opacity-100"
          leave="ease-in duration-150" leave-from="opacity-100" leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-black/80 backdrop-blur-sm" aria-hidden="true" />
        </TransitionChild>

        <div class="fixed inset-0 flex items-center justify-center p-4 sm:p-8">
          <TransitionChild
            as="template"
            enter="ease-out duration-200" enter-from="opacity-0 scale-95" enter-to="opacity-100 scale-100"
            leave="ease-in duration-150" leave-from="opacity-100 scale-100" leave-to="opacity-0 scale-95"
          >
            <DialogPanel class="relative w-full max-w-2xl">
              <button
                type="button"
                @click="closePhotoLightbox"
                class="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-white text-brand-text flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors z-10"
              >
                <X class="w-5 h-5" />
              </button>

              <div v-if="activeLightboxItem" class="relative">
                <img
                  :src="activeLightboxItem.photo.url"
                  :alt="activeLightboxItem.photo.alternativeText ?? activeLightboxItem.name"
                  class="w-full max-h-[65vh] object-contain rounded-2xl bg-white"
                />
                <template v-if="itemsWithPhoto.length > 1">
                  <button
                    type="button"
                    @click="photoPrev"
                    class="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 text-brand-text items-center justify-center shadow-lg hover:bg-white transition-colors"
                    aria-label="Platillo anterior"
                  >
                    <ChevronLeft class="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    @click="photoNext"
                    class="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 text-brand-text items-center justify-center shadow-lg hover:bg-white transition-colors"
                    aria-label="Siguiente platillo"
                  >
                    <ChevronRight class="w-5 h-5" />
                  </button>
                </template>
              </div>

              <!-- Caption: nombre, precio y descripción del platillo -->
              <div v-if="activeLightboxItem" class="mt-4 text-center text-white">
                <div class="flex items-center justify-center gap-3 flex-wrap">
                  <h4 class="font-display font-black text-lg">{{ activeLightboxItem.name }}</h4>
                  <span class="font-bold text-white/90">{{ priceFormatter.format(activeLightboxItem.price ?? 0) }}</span>
                </div>
                <p v-if="activeLightboxItem.description" class="mt-1 text-sm text-white/60 max-w-md mx-auto">
                  {{ activeLightboxItem.description }}
                </p>
              </div>

              <div v-if="itemsWithPhoto.length > 1" class="mt-4 flex items-center justify-center gap-3 text-white">
                <button
                  type="button"
                  @click="photoPrev"
                  class="sm:hidden px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-sm font-semibold transition-colors"
                >
                  ← Anterior
                </button>
                <span class="text-white/70 text-sm">{{ photoLightbox.index + 1 }} / {{ itemsWithPhoto.length }}</span>
                <button
                  type="button"
                  @click="photoNext"
                  class="sm:hidden px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-sm font-semibold transition-colors"
                >
                  Siguiente →
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </TransitionRoot>
  </div>
</template>

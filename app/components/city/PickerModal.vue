<template>
  <TransitionRoot as="template" :show="open">
    <Dialog as="div" class="relative z-50" @close="handleClose">
      <TransitionChild
        as="template"
        enter="ease-out duration-200"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in duration-150"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-brand-bg-dark/70 backdrop-blur-sm" />
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
          <DialogPanel class="w-full max-w-3xl bg-white rounded-3xl shadow-2xl p-6 md:p-10 max-h-[90vh] overflow-y-auto">

            <div class="text-center mb-8">
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-bold tracking-widest uppercase mb-3">
                <MapPin class="w-3.5 h-3.5" />
                {{ badge }}
              </div>
              <DialogTitle class="font-display font-black text-2xl md:text-3xl text-brand-text">
                {{ title }}
              </DialogTitle>
              <p class="text-brand-azulgris text-sm mt-2">
                {{ subtitle }}
              </p>
            </div>

            <div v-if="cityStore.citiesPending" class="text-center py-8 text-brand-azulgris text-sm">
              Cargando municipios…
            </div>

            <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                v-for="c in cityStore.cities"
                :key="c.documentId ?? c.slug"
                type="button"
                @click="pick(c)"
                class="group flex md:flex-col items-center md:text-center gap-4 md:gap-3 p-5 md:p-6 rounded-2xl border-2 border-gray-100 hover:border-brand-primary hover:bg-brand-primary/5 transition-all text-left md:text-center"
              >
                <div class="w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center shrink-0 bg-emerald-50 transition-transform group-hover:scale-105">
                  <MapPin class="w-7 h-7 md:w-8 md:h-8 text-emerald-600" />
                </div>
                <div class="min-w-0 flex-1">
                  <p class="font-display font-black text-lg text-brand-text mb-1">{{ c.name }}</p>
                  <p v-if="c.stateName" class="text-brand-azulgris text-xs leading-relaxed">{{ c.stateName }}</p>
                </div>
              </button>
            </div>

          </DialogPanel>
        </TransitionChild>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup>
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { MapPin } from '@lucide/vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: '¿Desde qué municipio nos visitas?' },
  subtitle: { type: String, default: 'Podrás cambiarlo en cualquier momento desde el menú superior.' },
  badge: { type: String, default: 'Ubicación' },
  dismissible: { type: Boolean, default: true },
  updateStoreOnSelect: { type: Boolean, default: true },
})

const emit = defineEmits(['update:open', 'select'])

const cityStore = useCityStore()

onMounted(() => {
  cityStore.fetchCities()
})

function pick(city) {
  if (props.updateStoreOnSelect) {
    cityStore.setActiveCity(city.slug)
  } else {
    cityStore.markOnboarded()
  }
  emit('select', city)
  emit('update:open', false)
}

function handleClose() {
  if (props.dismissible) emit('update:open', false)
}
</script>

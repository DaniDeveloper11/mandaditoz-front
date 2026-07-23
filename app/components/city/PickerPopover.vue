<template>
  <Popover :as="as" class="relative inline-flex" v-slot="{ close, open }">
    <PopoverButton as="template">
      <slot name="trigger" :open="open" :active-name="cityStore.activeCityName" :active-label="cityStore.activeCityLabel">
        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-semibold text-brand-text hover:border-brand-primary hover:text-brand-primary transition focus:outline-none"
        >
          <MapPin class="w-3.5 h-3.5 text-brand-primary" />
          <span class="truncate max-w-[8rem]">{{ cityStore.activeCityName }}</span>
          <ChevronDown class="w-3.5 h-3.5 opacity-60" />
        </button>
      </slot>
    </PopoverButton>

    <transition
      enter-active-class="transition ease-out duration-150"
      enter-from-class="opacity-0 translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-100"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-1"
    >
      <PopoverPanel
        :class="[
          'absolute z-30 mt-2 w-64 origin-top-left rounded-2xl bg-white shadow-xl ring-1 ring-black/5 focus:outline-none',
          align === 'right' ? 'right-0 origin-top-right' : 'left-0',
        ]"
      >
        <div class="p-2">
          <p class="px-3 pt-1 pb-2 text-[10px] font-bold tracking-widest uppercase text-gray-400">
            Elige tu municipio
          </p>

          <div v-if="cityStore.citiesPending" class="px-3 py-4 text-sm text-brand-azulgris">
            Cargando…
          </div>

          <div v-else-if="!cityStore.cities.length" class="px-3 py-4 text-sm text-brand-azulgris">
            No hay municipios disponibles.
          </div>

          <button
            v-else
            v-for="ciudad in cityStore.cities"
            :key="ciudad.slug"
            type="button"
            @click="onSelect(ciudad.slug, close)"
            class="w-full flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition hover:bg-gray-50"
            :class="cityStore.activeCitySlug === ciudad.slug ? 'text-brand-primary font-semibold' : 'text-brand-text'"
          >
            <span class="flex items-center gap-2 min-w-0">
              <MapPin class="w-3.5 h-3.5 shrink-0 opacity-70" />
              <span class="truncate">
                {{ ciudad.name }}<span v-if="ciudad.stateName" class="text-brand-azulgris font-normal">, {{ ciudad.stateName }}</span>
              </span>
            </span>
            <Check v-if="cityStore.activeCitySlug === ciudad.slug" class="w-4 h-4 text-brand-primary" />
          </button>
        </div>
      </PopoverPanel>
    </transition>
  </Popover>
</template>

<script setup>
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue'
import { MapPin, ChevronDown, Check } from '@lucide/vue'

defineProps({
  align: { type: String, default: 'left' },
  as: { type: String, default: 'span' },
})

const cityStore = useCityStore()

onMounted(() => {
  cityStore.fetchCities()
})

function onSelect(slug, close) {
  cityStore.setActiveCity(slug)
  close?.()
}
</script>

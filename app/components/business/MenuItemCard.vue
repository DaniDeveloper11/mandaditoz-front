<script setup>
import { Star } from '@lucide/vue'

const props = defineProps({
  item: { type: Object, required: true },
  /** Cuando sea true (Fase 4) se renderiza el botón de agregar al carrito. */
  orderable: { type: Boolean, default: false },
})

const emit = defineEmits(['add', 'view-photo'])

const priceFormatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

const priceLabel = computed(() => priceFormatter.format(props.item.price ?? 0))
</script>

<template>
  <div
    class="group flex gap-4 py-4 px-3 -mx-3 rounded-xl transition-colors"
    :class="item.isAvailable ? 'hover:bg-gray-50' : 'opacity-60'"
  >
    <div class="flex-1 min-w-0">
      <div class="flex items-start gap-2 flex-wrap">
        <h4 class="font-semibold text-brand-text text-[15px] leading-snug">
          {{ item.name }}
        </h4>
        <span
          v-if="item.isFeatured && item.isAvailable"
          class="chip bg-amber-50 text-amber-700 border border-amber-100"
        >
          <Star class="w-3 h-3 fill-amber-500 text-amber-500" />
          Recomendado
        </span>
        <span
          v-if="!item.isAvailable"
          class="chip bg-gray-100 text-brand-azulgris"
        >
          Agotado
        </span>
      </div>

      <p
        v-if="item.description"
        class="mt-1 text-sm text-brand-azulgris leading-relaxed line-clamp-2"
      >
        {{ item.description }}
      </p>

      <div class="mt-2.5 flex items-center gap-3">
        <span class="font-bold text-brand-primary text-base">{{ priceLabel }}</span>

        <button
          v-if="orderable && item.isAvailable"
          type="button"
          class="btn-primary !px-3 !py-1.5 text-sm"
          @click="emit('add', item)"
        >
          Agregar
        </button>
      </div>
    </div>

    <button
      v-if="item.photo?.url"
      type="button"
      class="w-24 h-24 sm:w-28 sm:h-28 shrink-0 rounded-2xl overflow-hidden bg-brand-bg-dark ring-1 ring-black/5 focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
      @click="emit('view-photo', item)"
    >
      <img
        :src="item.photo.url"
        :alt="item.photo.alternativeText ?? item.name"
        loading="lazy"
        class="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-200"
      />
    </button>
  </div>
</template>

<script setup>
const props = defineProps({
  item: { type: Object, required: true },
  /** Cuando sea true (Fase 4) se renderiza el botón de agregar al carrito. */
  orderable: { type: Boolean, default: false },
})

const emit = defineEmits(['add'])

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
    class="flex gap-4 py-4"
    :class="item.isAvailable ? '' : 'opacity-60'"
  >
    <div class="flex-1 min-w-0">
      <div class="flex items-start gap-2 flex-wrap">
        <h4 class="font-semibold text-brand-text text-[15px] leading-snug">
          {{ item.name }}
        </h4>
        <span
          v-if="!item.isAvailable"
          class="chip bg-gray-100 text-brand-azulgris"
        >
          Agotado
        </span>
      </div>

      <p
        v-if="item.description"
        class="mt-1 text-sm text-brand-azulgris leading-relaxed"
      >
        {{ item.description }}
      </p>

      <div class="mt-2 flex items-center gap-3">
        <span class="font-bold text-brand-text text-[15px]">{{ priceLabel }}</span>

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

    <div
      v-if="item.photo?.url"
      class="w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-brand-bg-dark"
    >
      <img
        :src="item.photo.url"
        :alt="item.photo.alternativeText ?? item.name"
        loading="lazy"
        class="w-full h-full object-cover"
      />
    </div>
  </div>
</template>

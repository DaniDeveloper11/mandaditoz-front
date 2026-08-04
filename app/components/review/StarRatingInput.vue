<script setup>
import { Star } from '@lucide/vue'

const props = defineProps({
  modelValue: { type: Number, default: 0 },
  size: { type: String, default: 'md' },
})
const emit = defineEmits(['update:modelValue'])

const hover = ref(0)

const sizeClass = computed(() => ({
  sm: 'w-5 h-5',
  md: 'w-8 h-8',
  lg: 'w-10 h-10',
}[props.size]))

function select(n) {
  emit('update:modelValue', n)
}

const active = computed(() => hover.value || props.modelValue)

const LABELS = ['Muy malo', 'Malo', 'Regular', 'Bueno', 'Excelente']
</script>

<template>
  <div>
    <div class="flex items-center gap-1">
      <button
        v-for="i in 5"
        :key="i"
        type="button"
        @click="select(i)"
        @mouseenter="hover = i"
        @mouseleave="hover = 0"
        :aria-label="`${i} estrellas`"
        class="p-1 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 rounded"
      >
        <Star
          :class="[
            sizeClass,
            'transition-colors',
            i <= active ? 'text-amber-400 fill-amber-400' : 'text-gray-300 fill-gray-200',
          ]"
        />
      </button>
    </div>
    <p v-if="active" class="text-xs text-brand-azulgris mt-1">{{ LABELS[active - 1] }}</p>
  </div>
</template>

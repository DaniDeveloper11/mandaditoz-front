<script setup>
import { Star } from '@lucide/vue'

const props = defineProps({
  value: { type: Number, default: 0 },
  size: { type: String, default: 'sm' },
})

const sizeClass = computed(() => ({
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
}[props.size]))

const rounded = computed(() => Math.round(props.value))
</script>

<template>
  <div class="flex gap-0.5">
    <Star
      v-for="i in 5"
      :key="i"
      :class="[sizeClass, i <= rounded ? 'text-amber-400 fill-amber-400' : 'text-gray-300 fill-gray-300']"
    />
  </div>
</template>

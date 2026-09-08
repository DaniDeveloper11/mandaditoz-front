<script setup>
import { Check, ChevronRight, PartyPopper } from '@lucide/vue'

const props = defineProps({
  // [{ id, label, hint, done, section }]
  items: { type: Array, required: true },
})

const emit = defineEmits(['ir'])

const total     = computed(() => props.items.length)
const listos    = computed(() => props.items.filter(i => i.done))
const faltantes = computed(() => props.items.filter(i => !i.done))
const porcentaje = computed(() =>
  total.value ? Math.round((listos.value.length / total.value) * 100) : 0
)
const completo = computed(() => faltantes.value.length === 0)
</script>

<template>
  <div class="mb-4 sm:mb-6 bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-5">

    <!-- Encabezado + barra -->
    <div class="flex items-center gap-3">
      <div
        class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
        :class="completo ? 'bg-emerald-50' : 'bg-amber-50'"
      >
        <PartyPopper v-if="completo" class="w-4 h-4 text-emerald-600" />
        <span v-else class="font-display font-black text-sm text-amber-600">{{ faltantes.length }}</span>
      </div>

      <div class="flex-1 min-w-0">
        <p class="font-display font-black text-base sm:text-lg text-brand-text leading-tight">
          <template v-if="completo">Tu ficha está completa</template>
          <template v-else>Tu ficha está al {{ porcentaje }}%</template>
        </p>
        <p class="text-brand-azulgris text-xs sm:text-sm mt-0.5">
          <template v-if="completo">
            Ya tiene todo lo que la gente busca. Puedes seguir mejorándola cuando quieras.
          </template>
          <template v-else>
            Te {{ faltantes.length === 1 ? 'falta 1 cosa' : `faltan ${faltantes.length} cosas` }}
            para que tus clientes te encuentren más fácil.
          </template>
        </p>
      </div>

      <span
        class="hidden sm:block font-display font-black text-2xl shrink-0"
        :class="completo ? 'text-emerald-600' : 'text-brand-text'"
      >{{ porcentaje }}%</span>
    </div>

    <div class="mt-3 h-2 rounded-full bg-gray-100 overflow-hidden">
      <div
        class="h-full rounded-full transition-all duration-500"
        :class="completo ? 'bg-emerald-500' : 'bg-amber-500'"
        :style="{ width: `${porcentaje}%` }"
      />
    </div>

    <!-- Lo que falta -->
    <div v-if="faltantes.length" class="mt-4 space-y-1.5">
      <button
        v-for="item in faltantes"
        :key="item.id"
        type="button"
        @click="emit('ir', item.section)"
        class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-gray-200 hover:border-amber-300 hover:bg-amber-50/50 transition-colors text-left group"
      >
        <span class="w-5 h-5 rounded-full border-2 border-gray-300 shrink-0 group-hover:border-amber-400 transition-colors" />
        <span class="flex-1 min-w-0">
          <span class="block text-sm font-semibold text-brand-text">{{ item.label }}</span>
          <span class="block text-xs text-brand-azulgris">{{ item.hint }}</span>
        </span>
        <ChevronRight class="w-4 h-4 text-gray-400 shrink-0 group-hover:text-amber-600 transition-colors" />
      </button>
    </div>

    <!-- Lo que ya está -->
    <div v-if="listos.length" class="mt-3 flex flex-wrap gap-1.5">
      <span
        v-for="item in listos"
        :key="item.id"
        class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold"
      >
        <Check class="w-3 h-3" />
        {{ item.label }}
      </span>
    </div>

  </div>
</template>

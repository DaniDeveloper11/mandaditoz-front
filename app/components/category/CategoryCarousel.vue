<script setup>
import { ChevronLeft, ChevronRight, Star, Store } from '@lucide/vue'

const props = defineProps({
  slug: { type: String, required: true },
  name: { type: String, required: true },
  icon: { type: Object, required: true },
  accentColor: { type: String, default: 'bg-brand-primary' },
  count: { type: Number, default: 0 },
})

const filtros = computed(() => ({
  categoria: props.slug,
  pagina: 1,
  porPagina: 8,
  orden: 'rating',
  isFeatured: false,
  soloVerificados: false,
  query: '',
}))

const { negocios, pending } = useNegocios(filtros)

const carouselEl = ref(null)
function scroll(dir) {
  carouselEl.value?.scrollBy({ left: dir * 288, behavior: 'smooth' })
}
</script>

<template>
  <div>
    <!-- Row header -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
          <component :is="icon" class="w-5 h-5 text-white" />
        </div>
        <h3 class="font-display font-black text-2xl text-white">{{ name }}</h3>
        <span class="text-brand-azulgris text-sm">{{ count }} negocios</span>
      </div>
      <div class="flex items-center gap-3">
        <a :href="`/list`" class="text-brand-azulgris text-sm hover:text-white transition-colors whitespace-nowrap">Ver todos →</a>
        <button
          @click="scroll(-1)"
          class="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
        >
          <ChevronLeft class="w-4 h-4" />
        </button>
        <button
          @click="scroll(1)"
          class="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
        >
          <ChevronRight class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Carousel -->
    <div
      ref="carouselEl"
      class="flex gap-4 overflow-x-auto pb-2"
      style="scrollbar-width: none; -webkit-overflow-scrolling: touch;"
    >
      <!-- Loading skeletons -->
      <template v-if="pending">
        <div v-for="i in 4" :key="i" class="bg-white/10 rounded-2xl shrink-0 w-56 h-40 animate-pulse" />
      </template>

      <!-- Empty state -->
      <div
        v-else-if="!negocios.length"
        class="flex items-center gap-3 text-white/40 text-sm py-6 px-2"
      >
        <Store class="w-5 h-5 shrink-0" />
        <span>Aún no hay negocios en esta categoría.</span>
      </div>

      <!-- Business cards -->
      <a
        v-for="biz in negocios"
        :key="biz.id"
        :href="`/negocios/${biz.slug}`"
        class="bg-white rounded-2xl overflow-hidden shrink-0 w-56 flex flex-col hover:shadow-lg transition-shadow"
      >
        <!-- Cover photo -->
        <div class="relative h-16 shrink-0">
          <img
            v-if="biz.coverPhoto?.url"
            :src="biz.coverPhoto.url"
            :alt="biz.coverPhoto.alternativeText ?? biz.name"
            class="w-full h-full object-cover"
          />
          <div v-else :class="['w-full h-full', accentColor, 'opacity-20']" />
          <div :class="['absolute bottom-0 left-0 w-full h-1.5', accentColor]" />
        </div>

        <div class="p-4 flex flex-col flex-1">

          <!-- Avatar + name + status -->
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-lg bg-brand-bg-dark overflow-hidden flex items-center justify-center text-white font-bold text-base shrink-0">
              <img
                v-if="biz.logo?.url"
                :src="biz.logo.url"
                :alt="biz.logo.alternativeText ?? biz.name"
                class="w-full h-full object-cover"
              />
              <span v-else>{{ (biz.name ?? '?').charAt(0) }}</span>
            </div>
            <div class="min-w-0">
              <p class="font-semibold text-brand-text text-sm leading-tight truncate">{{ biz.name ?? 'Sin nombre' }}</p>
              <span
                v-if="biz.isOpen !== null && biz.isOpen !== undefined"
                :class="['text-xs font-semibold flex items-center gap-1 mt-0.5', biz.isOpen ? 'text-emerald-600' : 'text-red-500']"
              >
                <span :class="['w-1.5 h-1.5 rounded-full shrink-0', biz.isOpen ? 'bg-emerald-500' : 'bg-red-500']" />
                {{ biz.isOpen ? 'Abierto' : 'Cerrado' }}
              </span>
              <span v-else class="text-xs text-brand-azulgris mt-0.5">Horario no disponible</span>
            </div>
          </div>

          <!-- Description -->
          <p class="text-brand-text text-xs leading-relaxed mb-3 line-clamp-2">
            {{ biz.shortDescription ?? biz.description ?? 'Sin descripción disponible.' }}
          </p>

          <!-- Rating -->
          <div class="flex items-center gap-1 mb-2">
            <div class="flex gap-0.5">
              <Star
                v-for="i in 5"
                :key="i"
                :class="['w-3 h-3', i <= Math.round(biz.ratingAverage ?? 0) ? 'text-amber-400 fill-amber-400' : 'text-gray-300 fill-gray-300']"
              />
            </div>
            <span class="text-xs font-semibold text-brand-text ml-0.5">{{ (biz.ratingAverage ?? 0).toFixed(1) }}</span>
            <span class="text-xs text-brand-azulgris">({{ biz.ratingCount ?? 0 }})</span>
          </div>

          <!-- Address -->
          <p class="text-xs text-brand-azulgris truncate">{{ biz.address ?? 'Dirección no disponible' }}</p>

        </div>
      </a>
    </div>
  </div>
</template>

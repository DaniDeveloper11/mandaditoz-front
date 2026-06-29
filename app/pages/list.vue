<script setup>
import { MapPin, Star, BadgeCheck, ChevronLeft, ChevronRight, ChevronDown, Check } from '@lucide/vue'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'

definePageMeta({ layout: 'landing' })

const router = useRouter()
const store = useSearchStore()
const { negocios, paginacion, pending } = useNegocios(computed(() => store.filtros))
const { categorias } = useCategorias(50)

const totalResultados = computed(() => paginacion.value?.total ?? 0)
const paginaActual = computed(() => store.filtros.pagina)
const totalPaginas = computed(() => paginacion.value?.pageCount ?? 1)

const ORDEN_OPTIONS = [
  { value: 'rating',    label: 'Mejor valorados' },
  { value: 'nombre',    label: 'Nombre A-Z' },
  { value: 'recientes', label: 'Más recientes' },
]

const POR_PAGINA_OPTIONS = [6, 12, 24]

const ordenLabel = computed(() =>
  ORDEN_OPTIONS.find(o => o.value === store.filtros.orden)?.label ?? 'Ordenar'
)

const categoriaLabel = computed(() => {
  if (!store.filtros.categoria) return 'Categoría'
  return categorias.value.find(c => c.slug === store.filtros.categoria)?.name ?? store.filtros.categoria
})

const paginasVisibles = computed(() => {
  const total = totalPaginas.value
  const current = paginaActual.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages = new Set([1, total, current - 1, current, current + 1].filter(p => p >= 1 && p <= total))
  return [...pages].sort((a, b) => a - b)
})
</script>

<template>
  <div class="min-h-screen bg-slate-100 py-8 px-6 md:px-12">
    <div class="max-w-6xl mx-auto">

      <!-- Page header -->
      <div class="flex items-start gap-4 mb-6">
        <button
          @click="router.back()"
          class="mt-1.5 w-9 h-9 rounded-lg border border-gray-300 bg-white flex items-center justify-center shrink-0 hover:bg-gray-50 transition-colors shadow-sm"
        >
          <ChevronLeft class="w-4 h-4 text-brand-text" />
        </button>
        <div>
          <h1 class="font-display font-black text-3xl md:text-4xl text-brand-text leading-tight">
            <template v-if="store.filtros.query">
              Resultados para <span class="italic">"{{ store.filtros.query }}"</span>
            </template>
            <template v-else-if="store.filtros.categoria">
              {{ categoriaLabel }}
            </template>
            <template v-else>Directorio de negocios</template>
          </h1>
          <p class="text-brand-azulgris text-sm mt-1">
            <template v-if="!pending">{{ totalResultados }} resultados · Etzatlán, Jalisco</template>
            <template v-else>Buscando…</template>
          </p>
        </div>
      </div>

      <!-- Filters -->
      <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div class="flex flex-wrap gap-2">

          <!-- Por página -->
          <Menu as="div" class="relative">
            <MenuButton class="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm text-brand-text font-medium hover:bg-gray-50 transition-colors shadow-sm">
              {{ store.filtros.porPagina }} por página <ChevronDown class="w-3.5 h-3.5 text-gray-400" />
            </MenuButton>
            <MenuItems class="absolute left-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20 focus:outline-none">
              <MenuItem v-for="n in POR_PAGINA_OPTIONS" :key="n" v-slot="{ active }">
                <button
                  @click="store.setPorPagina(n)"
                  :class="['w-full flex items-center justify-between px-4 py-2 text-sm transition-colors', active ? 'bg-gray-50' : '', store.filtros.porPagina === n ? 'font-semibold text-brand-primary' : 'text-brand-text']"
                >
                  {{ n }} por página
                  <Check v-if="store.filtros.porPagina === n" class="w-3.5 h-3.5 text-brand-primary" />
                </button>
              </MenuItem>
            </MenuItems>
          </Menu>

          <!-- Categoría -->
          <Menu as="div" class="relative">
            <MenuButton :class="['flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm bg-white', store.filtros.categoria ? 'border border-brand-primary text-brand-primary' : 'border border-gray-200 text-brand-text']">
              {{ categoriaLabel }} <ChevronDown class="w-3.5 h-3.5 opacity-60" />
            </MenuButton>
            <MenuItems class="absolute left-0 mt-1 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20 focus:outline-none max-h-64 overflow-y-auto">
              <MenuItem v-slot="{ active }">
                <button
                  @click="store.setCategoria(null)"
                  :class="['w-full flex items-center justify-between px-4 py-2 text-sm transition-colors', active ? 'bg-gray-50' : '', !store.filtros.categoria ? 'font-semibold text-brand-primary' : 'text-brand-text']"
                >
                  Todas las categorías
                  <Check v-if="!store.filtros.categoria" class="w-3.5 h-3.5 text-brand-primary" />
                </button>
              </MenuItem>
              <MenuItem v-for="cat in categorias" :key="cat.slug" v-slot="{ active }">
                <button
                  @click="store.setCategoria(cat.slug)"
                  :class="['w-full flex items-center justify-between px-4 py-2 text-sm transition-colors', active ? 'bg-gray-50' : '', store.filtros.categoria === cat.slug ? 'font-semibold text-brand-primary' : 'text-brand-text']"
                >
                  {{ cat.name }}
                  <Check v-if="store.filtros.categoria === cat.slug" class="w-3.5 h-3.5 text-brand-primary" />
                </button>
              </MenuItem>
            </MenuItems>
          </Menu>

          <!-- Ordenar -->
          <Menu as="div" class="relative">
            <MenuButton class="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm text-brand-text font-medium hover:bg-gray-50 transition-colors shadow-sm">
              {{ ordenLabel }} <ChevronDown class="w-3.5 h-3.5 text-gray-400" />
            </MenuButton>
            <MenuItems class="absolute left-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20 focus:outline-none">
              <MenuItem v-for="op in ORDEN_OPTIONS" :key="op.value" v-slot="{ active }">
                <button
                  @click="store.setOrden(op.value)"
                  :class="['w-full flex items-center justify-between px-4 py-2 text-sm transition-colors', active ? 'bg-gray-50' : '', store.filtros.orden === op.value ? 'font-semibold text-brand-primary' : 'text-brand-text']"
                >
                  {{ op.label }}
                  <Check v-if="store.filtros.orden === op.value" class="w-3.5 h-3.5 text-brand-primary" />
                </button>
              </MenuItem>
            </MenuItems>
          </Menu>

        </div>

        <!-- Verified toggle -->
        <div class="flex items-center gap-2.5">
          <span class="text-sm text-brand-text font-medium">Mostrar solo verificadas</span>
          <button
            @click="store.toggleVerificados()"
            :class="['relative w-10 h-6 rounded-full transition-colors duration-200 focus:outline-none', store.filtros.soloVerificados ? 'bg-brand-primary' : 'bg-gray-300']"
          >
            <span :class="['absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200', store.filtros.soloVerificados ? 'translate-x-4' : 'translate-x-0']" />
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="pending" class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        <div v-for="i in 6" :key="i" class="bg-white rounded-2xl p-5 shadow-sm h-40 animate-pulse" />
      </div>

      <!-- Empty state -->
      <div v-else-if="!negocios.length" class="text-center py-20">
        <p class="font-display font-black text-2xl text-brand-text mb-2">Sin resultados</p>
        <p class="text-brand-azulgris text-sm">Intenta con otra búsqueda o categoría.</p>
      </div>

      <!-- Business grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        <a
          v-for="biz in negocios"
          :key="biz.id"
          :href="`/negocios/${biz.slug}`"
          class="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3 cursor-pointer"
        >
          <!-- Avatar + name + address -->
          <div class="flex items-start gap-4">
            <div
              class="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-xl shrink-0"
              :class="biz.category?.color ? '' : 'bg-brand-bg-dark'"
              :style="biz.category?.color ? { backgroundColor: biz.category.color + '33' } : {}"
            >
              {{ biz.name.charAt(0) }}
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-1.5 flex-wrap">
                <h3 class="font-display font-bold text-brand-text text-base leading-tight">{{ biz.name }}</h3>
                <BadgeCheck v-if="biz.isVerified" class="w-4 h-4 text-blue-500 shrink-0" />
              </div>
              <div class="flex items-center gap-2 mt-1 flex-wrap">
                <div v-if="biz.address" class="flex items-center gap-1 text-brand-azulgris text-xs">
                  <MapPin class="w-3 h-3 shrink-0" />
                  <span>{{ biz.address }}</span>
                </div>
                <span
                  v-if="biz.category"
                  class="text-xs font-medium px-2 py-0.5 rounded-full"
                  :class="biz.category.color ? '' : getCategoriaConfig(biz.category.slug).badgeStyle"
                  :style="biz.category.color ? { backgroundColor: biz.category.color + '26', color: biz.category.color } : {}"
                >
                  {{ biz.category.name }}
                </span>
              </div>
            </div>
          </div>

          <!-- Description -->
          <p class="text-brand-text text-sm leading-relaxed line-clamp-2">{{ biz.shortDescription ?? biz.description }}</p>

          <!-- Rating + status -->
          <div class="flex items-center justify-between mt-auto">
            <div class="flex items-center gap-1">
              <div class="flex gap-0.5">
                <Star
                  v-for="i in 5"
                  :key="i"
                  :class="['w-3.5 h-3.5', i <= Math.round(biz.ratingAverage) ? 'text-amber-400 fill-amber-400' : 'text-gray-300 fill-gray-300']"
                />
              </div>
              <span class="text-sm font-semibold text-brand-text ml-1">{{ biz.ratingAverage.toFixed(1) }}</span>
              <span class="text-xs text-brand-azulgris">({{ biz.ratingCount }} reseñas)</span>
            </div>
            <span
              v-if="biz.isOpen !== null"
              :class="['text-xs font-semibold flex items-center gap-1.5', biz.isOpen ? 'text-emerald-600' : 'text-red-500']"
            >
              <span :class="['w-1.5 h-1.5 rounded-full', biz.isOpen ? 'bg-emerald-500' : 'bg-red-500']" />
              {{ biz.isOpen ? 'Abierto' : 'Cerrado' }}
            </span>
          </div>
        </a>
      </div>

      <!-- Pagination -->
      <div v-if="totalPaginas > 1" class="flex items-center justify-center gap-1 pb-4">
        <button
          @click="store.setPagina(paginaActual - 1)"
          :disabled="paginaActual <= 1"
          class="w-9 h-9 rounded-lg border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-40"
        >
          <ChevronLeft class="w-4 h-4 text-brand-text" />
        </button>

        <template v-for="(page, i) in paginasVisibles" :key="page">
          <span
            v-if="i > 0 && page - paginasVisibles[i - 1] > 1"
            class="w-9 h-9 flex items-center justify-center text-brand-azulgris text-sm select-none"
          >···</span>
          <button
            @click="store.setPagina(page)"
            :class="[
              'w-9 h-9 rounded-lg text-sm shadow-sm',
              page === paginaActual
                ? 'bg-brand-bg-dark text-white font-semibold'
                : 'border border-gray-200 bg-white text-brand-text hover:bg-gray-50 transition-colors',
            ]"
          >{{ page }}</button>
        </template>

        <button
          @click="store.setPagina(paginaActual + 1)"
          :disabled="paginaActual >= totalPaginas"
          class="w-9 h-9 rounded-lg border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-40"
        >
          <ChevronRight class="w-4 h-4 text-brand-text" />
        </button>
      </div>

    </div>
  </div>
</template>

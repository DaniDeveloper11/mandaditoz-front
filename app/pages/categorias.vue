<script setup>
import { Search, LayoutGrid, Store } from '@lucide/vue'
import { getLucideIcon, getCategoriaConfig } from '~/utils/categorias'

definePageMeta({ layout: 'landing' })

const router = useRouter()
const store = useSearchStore()
const cityStore = useCityStore()

const { categorias, pending } = useCategorias({ limit: 100, allDepths: true })

const filtro = ref('')

const categoriasFiltradas = computed(() => {
  const q = filtro.value.trim().toLowerCase()
  if (!q) return categorias.value
  return categorias.value.filter(cat =>
    cat.name?.toLowerCase().includes(q) ||
    cat.description?.toLowerCase().includes(q) ||
    cat.slug?.toLowerCase().includes(q),
  )
})

function irACategoria(slug) {
  store.setCategoria(slug)
  router.push('/list')
}
</script>

<template>
  <main class="flex-1 bg-slate-100">

    <!-- Header -->
    <section class="bg-brand-bg-dark py-12 px-6 md:px-12">
      <div class="max-w-6xl mx-auto">
        <p class="text-brand-azulgris text-xs font-semibold tracking-widest uppercase mb-2">Directorio</p>
        <h1 class="font-display font-black text-4xl md:text-5xl text-white">Todas las categorías</h1>
        <p class="text-brand-azulgris text-sm mt-3">
          Explora los {{ categorias.length }} rubros disponibles en {{ cityStore.activeCityLabel }}
        </p>

        <!-- Search -->
        <div class="mt-6 max-w-lg">
          <div class="flex items-center bg-white rounded-xl overflow-hidden shadow-lg">
            <div class="pl-4 pr-2 text-brand-primary">
              <Search class="w-4 h-4" />
            </div>
            <input
              v-model="filtro"
              type="text"
              placeholder="Buscar categoría…"
              class="flex-1 py-3 pr-4 text-brand-text text-sm placeholder-brand-azulgris focus:outline-none"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Grid -->
    <section class="py-10 px-6 md:px-12">
      <div class="max-w-6xl mx-auto">

        <!-- Loading -->
        <div
          v-if="pending"
          class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          <div
            v-for="i in 12"
            :key="i"
            class="bg-white rounded-2xl h-32 animate-pulse"
          />
        </div>

        <!-- Empty -->
        <div
          v-else-if="!categoriasFiltradas.length"
          class="bg-white rounded-2xl p-10 text-center"
        >
          <LayoutGrid class="w-10 h-10 text-brand-azulgris mx-auto mb-3" />
          <p class="text-brand-text font-semibold">No encontramos categorías</p>
          <p class="text-brand-azulgris text-sm mt-1">
            Prueba con otra búsqueda o revisa más tarde.
          </p>
        </div>

        <!-- Categories grid -->
        <div
          v-else
          class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          <button
            v-for="cat in categoriasFiltradas"
            :key="cat.slug"
            @click="irACategoria(cat.slug)"
            class="group bg-white rounded-2xl p-5 flex flex-col text-left hover:shadow-lg hover:-translate-y-0.5 transition-all"
          >
            <div class="flex items-start justify-between mb-4">
              <div
                :class="['w-12 h-12 rounded-xl flex items-center justify-center shrink-0', cat.color ? '' : getCategoriaConfig(cat.slug).iconBg]"
                :style="cat.color ? { backgroundColor: cat.color + '33' } : {}"
              >
                <component
                  :is="getLucideIcon(cat.icon)"
                  :class="['w-6 h-6', getCategoriaConfig(cat.slug).iconColor]"
                  :style="cat.color ? { color: cat.color } : {}"
                />
              </div>
              <span
                v-if="cat.businessCount"
                class="inline-flex items-center gap-1 text-brand-azulgris text-xs bg-slate-100 rounded-full px-2.5 py-0.5"
              >
                <Store class="w-3 h-3" />
                {{ cat.businessCount }}
              </span>
            </div>

            <p class="font-display font-black text-lg text-brand-text leading-tight group-hover:text-brand-primary transition-colors">
              {{ cat.name }}
            </p>
            <p
              v-if="cat.description"
              class="text-brand-azulgris text-xs mt-1 line-clamp-2"
            >
              {{ cat.description }}
            </p>
            <p class="text-brand-azulgris text-xs mt-3">
              {{ cat.businessCount ?? 0 }} {{ cat.businessCount === 1 ? 'negocio' : 'negocios' }}
            </p>
          </button>
        </div>

      </div>
    </section>

  </main>
</template>

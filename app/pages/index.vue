<script setup>
import { LayoutGrid, MapPin, Phone, Clock, Star } from '@lucide/vue'

definePageMeta({ layout: 'landing' })

const router = useRouter()
const store = useSearchStore()

const searchQuery = ref('')

function buscar() {
  store.setQuery(searchQuery.value)
  router.push('/list')
}

// Featured businesses
const { negocios: featured, pending: featuredPending } = useNegocios(ref({
  isFeatured: true,
  pagina: 1,
  porPagina: 3,
  orden: 'rating',
  categoria: null,
  soloVerificados: false,
  query: '',
}))

// 6 categorías para el grid "¿Qué estás buscando?"
const { categorias: categoriasGrid } = useCategorias(8)

// Todas las categorías para los carruseles y los pills de filtro
const { categorias: categoriasCarrusel } = useCategorias(30)
const { categorias: categoriaCatalog } = useCategorias(10)
</script>

<template>
  <main class="flex-1">

    <!-- Hero -->
    <section class="bg-brand-bg-dark py-12 md:py-20 px-6 md:px-12">
      <div class="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10 md:gap-16">

        <!-- Left: headline -->
        <div class="flex-1 text-center md:text-left">
          <h1 class="font-display font-black text-4xl sm:text-5xl md:text-6xl leading-tight text-white">
            Todo Etzatlán,<br>
            <span class="text-brand-primary-dark">en un lugar.</span>
          </h1>
          <p class="mt-4 text-brand-azulgris text-sm tracking-wide">
            Negocios locales · 100% gratis
          </p>
        </div>

        <!-- Right: search bar -->
        <div class="w-full md:flex-1">
          <form @submit.prevent="buscar" class="flex flex-col sm:flex-row items-stretch bg-white rounded-xl overflow-hidden shadow-lg">
            <div class="flex flex-1 border-b sm:border-b-0">
              <div class="flex items-center gap-2 px-4 py-3.5 border-r border-gray-200 text-brand-text font-medium text-sm whitespace-nowrap">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-brand-primary shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
                </svg>
                Etzatlán
              </div>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="¿Qué estás buscando?"
                class="flex-1 min-w-0 px-4 py-3.5 text-brand-text placeholder-gray-400 text-sm focus:outline-none"
              />
            </div>
            <button type="submit" class="hidden sm:block bg-brand-primary hover:bg-brand-primary-dark text-white font-semibold px-6 py-3.5 text-sm transition-colors duration-150 w-full sm:w-auto">
              Buscar
            </button>
          </form>
        </div>

      </div>
    </section>

    <!-- Negocios destacados -->
    <section class="bg-white py-12 px-6 md:px-12">
      <div class="max-w-6xl mx-auto">

        <div class="flex items-center justify-between mb-8">
          <h2 class="font-display font-black text-3xl md:text-4xl text-brand-text">Negocios destacados</h2>
          <a href="/list" class="text-brand-azulgris text-sm font-medium hover:text-brand-text transition-colors whitespace-nowrap">Ver todos →</a>
        </div>

        <!-- Loading -->
        <div v-if="featuredPending" class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div v-for="i in 3" :key="i" class="rounded-2xl border border-gray-200 h-64 animate-pulse bg-gray-100" />
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <a
            v-for="biz in featured"
            :key="biz.id"
            :href="`/negocios/${biz.slug}`"
            class="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col"
          >
            <div :class="['h-1.5 w-full', getCategoriaConfig(biz.category?.slug).accentColor]" />

            <div class="p-5 flex flex-col flex-1">
              <!-- Logo + name + badges -->
              <div class="flex items-start gap-4 mb-4">
                <div class="w-14 h-14 rounded-xl bg-brand-bg-dark flex items-center justify-center text-white font-bold text-xl shrink-0">
                  {{ biz.name.charAt(0) }}
                </div>
                <div>
                  <h3 class="font-display font-bold text-lg text-brand-text leading-tight">{{ biz.name }}</h3>
                  <div class="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span v-if="biz.category" :class="['text-xs font-medium px-2 py-0.5 rounded-full border', getCategoriaConfig(biz.category.slug).badgeStyle]">
                      {{ biz.category.name }}
                    </span>
                    <span
                      v-if="biz.isOpen !== null"
                      :class="['text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1', biz.isOpen ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600']"
                    >
                      <span :class="['w-1.5 h-1.5 rounded-full', biz.isOpen ? 'bg-emerald-500' : 'bg-red-500']" />
                      {{ biz.isOpen ? 'Abierto' : 'Cerrado' }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Description -->
              <p class="text-brand-text text-sm leading-relaxed mb-4">{{ biz.shortDescription ?? biz.description }}</p>

              <!-- Rating -->
              <div class="flex items-center gap-1.5 mb-3">
                <div class="flex gap-0.5">
                  <Star
                    v-for="i in 5"
                    :key="i"
                    :class="['w-4 h-4', i <= Math.round(biz.ratingAverage) ? 'text-amber-400 fill-amber-400' : 'text-gray-300 fill-gray-300']"
                  />
                </div>
                <span class="text-sm font-semibold text-brand-text">{{ biz.ratingAverage.toFixed(1) }}</span>
                <span class="text-sm text-brand-azulgris">({{ biz.ratingCount }} reseñas)</span>
              </div>

              <!-- Details -->
              <div class="space-y-2 mb-5">
                <div v-if="biz.address" class="flex items-center gap-2 text-sm text-brand-azulgris">
                  <MapPin class="w-4 h-4 shrink-0" />
                  <span>{{ biz.address }}</span>
                </div>
                <div v-if="biz.phone" class="flex items-center gap-2 text-sm text-brand-azulgris">
                  <Phone class="w-4 h-4 shrink-0" />
                  <span>{{ biz.phone }}</span>
                </div>
              </div>

              <!-- CTA -->
              <div class="mt-auto">
                <span class="block w-full bg-brand-bg-dark hover:opacity-90 text-white text-sm font-semibold text-center py-3.5 rounded-xl transition-opacity">
                  Ver perfil completo →
                </span>
              </div>
            </div>
          </a>
        </div>

      </div>
    </section>

    <!-- Categories grid -->
    <section class="bg-slate-100 py-12 px-6 md:px-12">
      <div class="max-w-6xl mx-auto">

        <div class="flex items-center justify-between mb-8">
          <h2 class="font-display font-black text-3xl md:text-4xl text-brand-text">¿Qué estás buscando?</h2>
          <a href="/list" class="text-brand-azulgris text-sm font-medium hover:text-brand-text transition-colors whitespace-nowrap">Ver todas →</a>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <a
            v-for="cat in categoriasGrid"
            :key="cat.slug"
            :href="`/list`"
            @click.prevent="store.setCategoria(cat.slug); router.push('/list')"
            class="bg-white rounded-2xl p-5 flex items-center gap-4 hover:shadow-md transition-shadow"
          >
            <div :class="['w-12 h-12 rounded-xl flex items-center justify-center shrink-0', getCategoriaConfig(cat.slug).iconBg]">
              <component :is="getCategoriaConfig(cat.slug).icon" :class="['w-6 h-6', getCategoriaConfig(cat.slug).iconColor]" />
            </div>
            <div>
              <p class="font-semibold text-brand-text text-sm leading-tight">{{ cat.name }}</p>
              <p v-if="cat.totalNegocios" class="text-brand-azulgris text-xs mt-0.5">{{ cat.totalNegocios }} negocios</p>
            </div>
          </a>

          <!-- Ver todas -->
          <a
            href="/list"
            class="bg-brand-bg-dark rounded-2xl p-5 flex items-center gap-4 hover:opacity-90 transition-opacity"
          >
            <div class="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
              <LayoutGrid class="w-6 h-6 text-white" />
            </div>
            <div>
              <p class="font-semibold text-white text-sm leading-tight">Ver todas</p>
              <p class="text-gray-400 text-xs mt-0.5">{{ categoriasCarrusel.length }} categorías</p>
            </div>
          </a>
        </div>

      </div>
    </section>

    <!-- Explorar el directorio -->
    <section class="bg-brand-bg-dark py-12 px-6 md:px-12">
      <div class="max-w-6xl mx-auto">

        <!-- Section header -->
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <p class="text-brand-azulgris text-xs font-semibold tracking-widest uppercase mb-2">Directorio completo</p>
            <h2 class="font-display font-black text-4xl md:text-5xl text-white">Explorar el directorio</h2>
            <p class="text-brand-azulgris text-sm mt-2">Etzatlán, Jalisco</p>
          </div>
          <!-- Category filter pills -->
          <div class="flex flex-wrap gap-2">
            <button
              v-for="cat in categoriasCarrusel"
              :key="cat.slug"
              @click="store.setCategoria(cat.slug); router.push('/list')"
              class="px-4 py-1.5 rounded-full border border-white/20 text-white text-sm hover:bg-white/10 transition-colors"
            >
              {{ cat.name }}
            </button>
          </div>
        </div>

        <!-- Category carousels -->
        <div class="space-y-10">
          <CategoryCarousel
            v-for="cat in categoriaCatalog"
            :key="cat.slug"
            :slug="cat.slug"
            :name="cat.name"
            :icon="getCategoriaConfig(cat.slug).icon"
            :accent-color="getCategoriaConfig(cat.slug).accentColor"
            :count="cat.totalNegocios"
          />
        </div>

      </div>
    </section>

    <!-- CTA: ¿Tienes un negocio? -->
    <section class="relative overflow-hidden bg-brand-primary py-16 px-6 md:px-12">
      <svg
        class="absolute right-0 top-0 h-full w-72 text-white/10 pointer-events-none"
        viewBox="0 0 280 240" fill="none" xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true" preserveAspectRatio="xMidYMid slice"
      >
        <circle cx="240" cy="40"  r="14" stroke="currentColor" stroke-width="2" />
        <circle cx="160" cy="100" r="14" stroke="currentColor" stroke-width="2" />
        <circle cx="240" cy="160" r="14" stroke="currentColor" stroke-width="2" />
        <circle cx="80"  cy="160" r="14" stroke="currentColor" stroke-width="2" />
        <circle cx="200" cy="220" r="14" stroke="currentColor" stroke-width="2" />
        <circle cx="240" cy="40"  r="5"  fill="currentColor" />
        <circle cx="160" cy="100" r="5"  fill="currentColor" />
        <circle cx="240" cy="160" r="5"  fill="currentColor" />
        <circle cx="80"  cy="160" r="5"  fill="currentColor" />
        <circle cx="200" cy="220" r="5"  fill="currentColor" />
        <line x1="240" y1="54"  x2="160" y2="86"  stroke="currentColor" stroke-width="1.5" />
        <line x1="160" y1="114" x2="240" y2="146" stroke="currentColor" stroke-width="1.5" />
        <line x1="160" y1="114" x2="80"  y2="146" stroke="currentColor" stroke-width="1.5" />
        <line x1="240" y1="174" x2="200" y2="206" stroke="currentColor" stroke-width="1.5" />
        <line x1="80"  y1="174" x2="200" y2="206" stroke="currentColor" stroke-width="1.5" />
      </svg>

      <div class="relative max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
        <div class="max-w-xl">
          <p class="text-white/60 text-xs font-semibold tracking-widest uppercase mb-3">Para dueños de negocio</p>
          <h2 class="font-display font-black text-4xl md:text-5xl text-white leading-tight mb-4">
            ¿Tienes un negocio<br>en Etzatlán?
          </h2>
          <p class="text-white/75 text-sm leading-relaxed">
            Regístralo gratis en Mandaditoz y llega a más clientes del municipio.<br class="hidden md:block">
            Sin costos, sin contratos, sin complicaciones.
          </p>
        </div>
        <div class="flex flex-col items-center gap-3 shrink-0">
          <a href="#" class="bg-brand-bg-dark hover:opacity-90 text-white font-semibold text-sm px-8 py-4 rounded-xl transition-opacity whitespace-nowrap">
            Registra tu negocio gratis →
          </a>
          <p class="text-white/50 text-xs">Tarda menos de 5 minutos</p>
        </div>
      </div>
    </section>

  </main>
</template>

<template>
  <header class="relative isolate z-40 bg-white ">
    <nav class="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8" aria-label="Global">
      <div class="flex lg:flex-1 items-center gap-3">
        <a href="/" class="-m-1.5 p-1.5">
          <span class="sr-only">Mandaditoz</span>
          <img class="h-14 w-auto " :src="logoLight" alt="Mandaditoz" />
        </a>
        <div class="hidden sm:block">
          <LayoutCitySwitcher />
        </div>
      </div>
      <div class="flex lg:hidden">
        <button type="button" class="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700" @click="mobileMenuOpen = true">
          <span class="sr-only">Open main menu</span>
          <Menu class="size-6" aria-hidden="true" />
        </button>
      </div>
      <PopoverGroup class="hidden lg:flex lg:gap-x-12">
        <Popover>
          <PopoverButton class="text-sm/6 font-semibold text-gray-900">
            Categorías
          </PopoverButton>

          <transition enter-active-class="transition ease-out duration-200" enter-from-class="opacity-0 -translate-y-1" enter-to-class="translate-y-0" leave-active-class="transition ease-in duration-150" leave-from-class="translate-y-0" leave-to-class="opacity-0 -translate-y-1">
            <PopoverPanel class="absolute inset-x-0 top-16 bg-white shadow-lg ring-1 ring-gray-900/5">
              <div class="mx-auto max-w-7xl px-6 py-8 lg:px-8">
                <div class="grid grid-cols-2 gap-x-6 gap-y-1 sm:grid-cols-3 lg:grid-cols-4">
                  <a
                    v-for="cat in categorias"
                    :key="cat.slug"
                    :href="`/list?categoria=${cat.slug}`"
                    class="group flex items-center gap-3 rounded-lg p-3 hover:bg-gray-50 transition"
                  >
                    <div
                      :class="['flex size-9 shrink-0 items-center justify-center rounded-lg', cat.color ? '' : getCategoriaConfig(cat.slug).iconBg]"
                      :style="cat.color ? { backgroundColor: cat.color + '33' } : {}"
                    >
                      <component
                        :is="getLucideIcon(cat.icon)"
                        :class="['size-5', getCategoriaConfig(cat.slug).iconColor]"
                        :style="cat.color ? { color: cat.color } : {}"
                      />
                    </div>
                    <div class="min-w-0">
                      <p class="text-sm font-semibold text-gray-900 group-hover:text-brand-primary transition">{{ cat.name }}</p>
                      <p v-if="cat.description" class="text-xs text-gray-400 truncate">{{ cat.description }}</p>
                    </div>
                  </a>
                </div>
                <div class="mt-6 border-t border-gray-100 pt-4">
                  <a href="/list" class="text-sm font-semibold text-brand-primary hover:text-brand-primary-dark transition">
                    Ver todos los negocios →
                  </a>
                </div>
              </div>
            </PopoverPanel>
          </transition>
        </Popover>

        <a href="/about" class="text-sm/6 font-semibold text-gray-900">Nosotros</a> 
        <a href="/how-to-work" class="text-sm/6 font-semibold text-gray-900">¿Cómo funciona?</a>
      </PopoverGroup>
      <div class="hidden lg:flex lg:flex-1 lg:justify-end lg:items-center lg:gap-x-4">
        <template v-if="isLoggedIn">
          <a href="/mis-negocios" class="text-sm/6 font-semibold text-gray-900 hover:text-brand-primary transition">
            Mis negocios
          </a>
          <span class="text-sm/6 text-gray-600">
            Hola, <span class="font-semibold text-gray-900">{{ user?.displayName || user?.username }}</span>
          </span>
          <button
            class="text-sm/6 font-semibold text-gray-900 hover:text-brand-primary transition"
            @click="handleLogout"
          >
            Cerrar sesión
          </button>
        </template>
        <template v-else>
          <a href="/login" class="text-sm/6 font-semibold text-gray-900">Iniciar sesión</a>
          <a href="/login?type=r" class="rounded-lg bg-brand-primary px-4 py-2 text-sm/6 font-semibold text-white shadow-sm hover:opacity-90">Registra tu negocio</a>
        </template>
      </div>
    </nav>
    <Dialog class="lg:hidden" @close="mobileMenuOpen = false" :open="mobileMenuOpen">
      <div class="fixed inset-0 z-50"></div>
      <DialogPanel class="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white p-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10 ">
        <div class="flex items-center justify-between">
          <a href="#" class="-m-1.5 p-1.5">
            <span class="sr-only">Mandaditoz</span>
            <img class="h-14 w-auto " :src="logoLight" />
          </a>
          <button type="button" class="-m-2.5 rounded-md p-2.5 text-gray-700" @click="mobileMenuOpen = false">
            <span class="sr-only">Close menu</span>
            <X class="size-6" aria-hidden="true" />
          </button>
        </div>
        <div class="mt-6 flow-root">
          <div class="-my-6 divide-y divide-gray-500/10 ">
            <div class="space-y-2 py-6">
              <div class="-mx-3 px-3 pb-2">
                <LayoutCitySwitcher />
              </div>
              <Disclosure as="div" class="-mx-3" v-slot="{ open }">
                <DisclosureButton class="flex w-full items-center justify-between rounded-lg py-2 pr-3.5 pl-3 text-base/7 font-semibold text-gray-900 hover:bg-gray-50">
                  Categorías
                  <ChevronDown :class="[open ? 'rotate-180' : '', 'size-5 flex-none transition-transform']" aria-hidden="true" />
                </DisclosureButton>
                <DisclosurePanel class="mt-2 space-y-1">
                  <DisclosureButton
                    v-for="cat in categorias"
                    :key="cat.slug"
                    as="a"
                    :href="`/list?categoria=${cat.slug}`"
                    class="flex items-center gap-3 rounded-lg py-2 pl-6 pr-3 text-sm font-semibold text-gray-900 hover:bg-gray-50"
                  >
                    <component
                      :is="getLucideIcon(cat.icon)"
                      :class="['size-4 shrink-0', getCategoriaConfig(cat.slug).iconColor]"
                      :style="cat.color ? { color: cat.color } : {}"
                    />
                    {{ cat.name }}
                  </DisclosureButton>
                </DisclosurePanel>
              </Disclosure>
            <!--<a href="#" class="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50">Mapa</a> -->
              <a href="#" class="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50">¿Cómo funciona?</a>
            </div>
            <div class="py-6 space-y-1">
              <template v-if="isLoggedIn">
                <p class="-mx-3 px-3 py-2 text-sm text-gray-500">
                  {{ user?.displayName || user?.username }}
                </p>
                <a href="/mis-negocios" class="-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold text-gray-900 hover:bg-gray-50">
                  Mis negocios
                </a>
                <button
                  class="-mx-3 block w-full text-left rounded-lg px-3 py-2.5 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
                  @click="handleLogout"
                >
                  Cerrar sesión
                </button>
              </template>
              <template v-else>
                <a href="/login" class="-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold text-gray-900 hover:bg-gray-50">Iniciar sesión</a>
                <a href="/login?type=r" class="-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold text-white bg-brand-primary">Registra tu negocio</a>
              </template>
            </div>
          </div>
        </div>
      </DialogPanel>
    </Dialog>
  </header>

  <slot />

  <footer class="bg-brand-bg-dark">
    <div class="max-w-6xl mx-auto px-6 md:px-12 pt-14 pb-8">

      <!-- Main grid -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">

        <!-- Brand column -->
        <div class="md:col-span-1">
          <img :src="logoDark" alt="Mandaditoz" class="h-8 w-auto mb-4" />
          <p class="text-white/60 text-sm leading-relaxed mb-4">
            El directorio gratuito de negocios locales de {{ cityStore.activeCityLabel }}. De vecinos para vecinos.
          </p>
          <p class="text-white/30 text-xs">{{ cityStore.activeCityLabel }} · México</p>
        </div>

        <!-- Directorio -->
        <div>
          <p class="text-white/40 text-xs font-semibold tracking-widest uppercase mb-4">Directorio</p>
          <ul class="space-y-3">
            <li><a href="/#buscador" class="text-white/70 text-sm hover:text-white transition-colors">Buscar negocio</a></li>
            <li><a href="/categorias" class="text-white/70 text-sm hover:text-white transition-colors">Categorías</a></li>
            <!-- <li><a href="#" class="text-white/70 text-sm hover:text-white transition-colors">Mapa interactivo</a></li> -->
            <li><a href="#" class="text-white/70 text-sm hover:text-white transition-colors">Novedades</a></li>
          </ul>
        </div>

        <!-- Negocios -->
        <div>
          <p class="text-white/40 text-xs font-semibold tracking-widest uppercase mb-4">Negocios</p>
          <ul class="space-y-3">
            <li><a href="/negocios/publicar" class="text-white/70 text-sm hover:text-white transition-colors">Registra el tuyo</a></li>
            <li><a href="#" class="text-white/70 text-sm hover:text-white transition-colors">Preguntas frecuentes</a></li>
          </ul>
        </div>

        <!-- Proyecto -->
        <div>
          <p class="text-white/40 text-xs font-semibold tracking-widest uppercase mb-4">Proyecto</p>
          <ul class="space-y-3">
<!--             <li><a href="/how-to-work" class="text-white/70 text-sm hover:text-white transition-colors"></a>¿Como funciona?</li> -->
            <li><a href="/about" class="text-white/70 text-sm hover:text-white transition-colors">Nosotros</a></li>
            <li><a href="#" class="text-white/70 text-sm hover:text-white transition-colors">Contacto</a></li>
            <li><a href="/privacidad" class="text-white/70 text-sm hover:text-white transition-colors">Privacidad</a></li>
            <li><a href="/terminos" class="text-white/70 text-sm hover:text-white transition-colors">Terminos</a></li>

          </ul>
        </div>

      </div>

      <!-- Bottom bar -->
      <div class="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p class="text-white/30 text-xs">© 2026 Mandaditoz · Hecho con orgullo en {{ cityStore.activeCityLabel }}.</p>
        <p class="text-white/30 text-xs">Directorio 100% gratuito · Información aportada por la comunidad</p>
      </div>

    </div>
  </footer>
</template>

<script setup>
import { ref } from 'vue'
import {
  Dialog, DialogPanel,
  Disclosure, DisclosureButton, DisclosurePanel,
  Popover, PopoverButton, PopoverGroup, PopoverPanel,
} from '@headlessui/vue'
import { Menu, X, ChevronDown } from '@lucide/vue'
import { getCategoriaConfig, getLucideIcon } from '~/utils/categorias'

const { isLoggedIn, user, logout } = useAuthStore()
const { categorias } = useCategorias()
const cityStore = useCityStore()

const logoLight = '/logo-cielo-horizontal.svg'
const logoDark = 'logo-cielo-horizontal-dark.svg'
const mobileMenuOpen = ref(false)

function handleLogout() {
  logout()
  navigateTo('/login')
}
</script>

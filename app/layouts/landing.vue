<template>
  <header class="relative isolate z-10 bg-white ">
    <nav class="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8" aria-label="Global">
      <div class="flex lg:flex-1">
        <a href="#" class="-m-1.5 p-1.5">
          <span class="sr-only">Mandaditoz</span>
          <img class="h-14 w-auto " :src="logoLight" alt="Mandaditoz" />
        </a>
      </div>
      <div class="flex lg:hidden">
        <button type="button" class="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700" @click="mobileMenuOpen = true">
          <span class="sr-only">Open main menu</span>
          <Bars3Icon class="size-6" aria-hidden="true" />
        </button>
      </div>
      <PopoverGroup class="hidden lg:flex lg:gap-x-12">
        <Popover>
          <PopoverButton class="text-sm/6 font-semibold text-gray-900">
            Categorías
          </PopoverButton>

          <transition enter-active-class="transition ease-out duration-200" enter-from-class="opacity-0 -translate-y-1" enter-to-class="translate-y-0" leave-active-class="transition ease-in duration-150" leave-from-class="translate-y-0" leave-to-class="opacity-0 -translate-y-1">
            <PopoverPanel class="absolute inset-x-0 top-16 bg-white">
              <div class="absolute inset-0 top-1/2 bg-white shadow-lg ring-1 ring-gray-900/5" aria-hidden="true"></div>
              <div class="relative bg-white">
                <div class="mx-auto grid max-w-7xl grid-cols-4 gap-x-4 px-6 py-10 lg:px-8 xl:gap-x-8">
                  <div v-for="item in products" :key="item.name" class="group relative rounded-lg p-6 text-sm/6 hover:bg-gray-50">
                    <div class="flex size-11 items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white">
                      <component :is="item.icon" class="size-6 text-gray-600 group-hover:text-indigo-600" aria-hidden="true" />
                    </div>
                    <a :href="item.href" class="mt-6 block font-semibold text-gray-900">
                      {{ item.name }}
                      <span class="absolute inset-0"></span>
                    </a>
                    <p class="mt-1 text-gray-600">{{ item.description }}</p>
                  </div>
                </div>
                <div class="bg-gray-50">
                  <div class="mx-auto max-w-7xl px-6 lg:px-8">
                    <div class="grid grid-cols-3 divide-x divide-gray-900/5 border-x border-gray-900/5">
                      <a v-for="item in callsToAction" :key="item.name" :href="item.href" class="flex items-center justify-center gap-x-2.5 p-3 text-sm/6 font-semibold text-gray-900 hover:bg-gray-100">
                        <component :is="item.icon" class="size-5 flex-none text-gray-500" aria-hidden="true" />
                        {{ item.name }}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </PopoverPanel>
          </transition>
        </Popover>

        <a href="#" class="text-sm/6 font-semibold text-gray-900">Mapa</a>
        <a href="#" class="text-sm/6 font-semibold text-gray-900">¿Cómo funciona?</a>
      </PopoverGroup>
      <div class="hidden lg:flex lg:flex-1 lg:justify-end lg:items-center lg:gap-x-4">
        <template v-if="isLoggedIn">
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
            <span class="sr-only">Your Company</span>
            <img class="h-14 w-auto " :src="logoLight" />
          </a>
          <button type="button" class="-m-2.5 rounded-md p-2.5 text-gray-700" @click="mobileMenuOpen = false">
            <span class="sr-only">Close menu</span>
            <XMarkIcon class="size-6" aria-hidden="true" />
          </button>
        </div>
        <div class="mt-6 flow-root">
          <div class="-my-6 divide-y divide-gray-500/10 ">
            <div class="space-y-2 py-6">
              <Disclosure as="div" class="-mx-3" v-slot="{ open }">
                <DisclosureButton class="flex w-full items-center justify-between rounded-lg py-2 pr-3.5 pl-3 text-base/7 font-semibold text-gray-900 hover:bg-gray-50">
                  Categorías
                  <ChevronDownIcon :class="[open ? 'rotate-180' : '', 'size-5 flex-none']" aria-hidden="true" />
                </DisclosureButton>
                <DisclosurePanel class="mt-2 space-y-2">
                  <DisclosureButton v-for="item in [...products, ...callsToAction]" :key="item.name" as="a" :href="item.href" class="block rounded-lg py-2 pr-3 pl-6 text-sm/7 font-semibold text-gray-900 hover:bg-gray-50">{{ item.name }}</DisclosureButton>
                </DisclosurePanel>
              </Disclosure>
              <a href="#" class="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50">Mapa</a>
              <a href="#" class="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50">¿Cómo funciona?</a>
            </div>
            <div class="py-6 space-y-1">
              <template v-if="isLoggedIn">
                <p class="-mx-3 px-3 py-2 text-sm text-gray-500">
                  {{ user?.displayName || user?.username }}
                </p>
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
          <img :src="logoLight" alt="Mandaditoz" class="h-8 w-auto mb-4" />
          <p class="text-white/60 text-sm leading-relaxed mb-4">
            El directorio gratuito de negocios locales de Etzatlán, Jalisco. De vecinos para vecinos.
          </p>
          <p class="text-white/30 text-xs">Etzatlán, Jalisco · México</p>
        </div>

        <!-- Directorio -->
        <div>
          <p class="text-white/40 text-xs font-semibold tracking-widest uppercase mb-4">Directorio</p>
          <ul class="space-y-3">
            <li><a href="#" class="text-white/70 text-sm hover:text-white transition-colors">Buscar negocio</a></li>
            <li><a href="#" class="text-white/70 text-sm hover:text-white transition-colors">Categorías</a></li>
            <li><a href="#" class="text-white/70 text-sm hover:text-white transition-colors">Mapa interactivo</a></li>
            <li><a href="#" class="text-white/70 text-sm hover:text-white transition-colors">Novedades</a></li>
          </ul>
        </div>

        <!-- Negocios -->
        <div>
          <p class="text-white/40 text-xs font-semibold tracking-widest uppercase mb-4">Negocios</p>
          <ul class="space-y-3">
            <li><a href="#" class="text-white/70 text-sm hover:text-white transition-colors">Registra el tuyo</a></li>
            <li><a href="#" class="text-white/70 text-sm hover:text-white transition-colors">Actualizar datos</a></li>
            <li><a href="#" class="text-white/70 text-sm hover:text-white transition-colors">Preguntas frecuentes</a></li>
          </ul>
        </div>

        <!-- Proyecto -->
        <div>
          <p class="text-white/40 text-xs font-semibold tracking-widest uppercase mb-4">Proyecto</p>
          <ul class="space-y-3">
            <li><a href="#" class="text-white/70 text-sm hover:text-white transition-colors">¿Qué es Mandaditoz?</a></li>
            <li><a href="#" class="text-white/70 text-sm hover:text-white transition-colors">Contacto</a></li>
            <li><a href="#" class="text-white/70 text-sm hover:text-white transition-colors">Privacidad</a></li>
          </ul>
        </div>

      </div>

      <!-- Bottom bar -->
      <div class="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p class="text-white/30 text-xs">© 2026 Mandaditoz · Hecho con orgullo en Etzatlán, Jalisco.</p>
        <p class="text-white/30 text-xs">Directorio 100% gratuito · Información aportada por la comunidad</p>
      </div>

    </div>
  </footer>
</template>

<script setup>
import { ref } from 'vue'
const { isLoggedIn, user, logout } = useAuthStore()

function handleLogout() {
  logout()
  navigateTo('/login')
}
const logoDark  = '/logo-cielo-horizontal-dark.svg'
const logoLight = '/logo-cielo-horizontal.svg'
import {
  Dialog,
  DialogPanel,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Popover,
  PopoverButton,
  PopoverGroup,
  PopoverPanel,
} from '@headlessui/vue'
import {
  Bars3Icon,
  ChartPieIcon,
  CursorArrowRaysIcon,
  FingerPrintIcon,
  SquaresPlusIcon,
  XMarkIcon,
} from '@heroicons/vue/24/outline'
import { ChevronDownIcon, PhoneIcon, PlayCircleIcon, RectangleGroupIcon } from '@heroicons/vue/20/solid'

const products = [
  {
    name: 'Analytics',
    description: 'Get a better understanding where your traffic is coming from',
    href: '#',
    icon: ChartPieIcon,
  },
  {
    name: 'Engagement',
    description: 'Speak directly to your customers with our engagement tool',
    href: '#',
    icon: CursorArrowRaysIcon,
  },
  { name: 'Security', description: 'Your customers’ data will be safe and secure', href: '#', icon: FingerPrintIcon },
  {
    name: 'Integrations',
    description: 'Your customers’ data will be safe and secure',
    href: '#',
    icon: SquaresPlusIcon,
  },
]
const callsToAction = [
  { name: 'Watch demo', href: '#', icon: PlayCircleIcon },
  { name: 'Contact sales', href: '#', icon: PhoneIcon },
  { name: 'View all products', href: '#', icon: RectangleGroupIcon },
]

const mobileMenuOpen = ref(false)
</script>

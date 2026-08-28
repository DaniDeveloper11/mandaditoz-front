<script setup>
import {
  Plus, Pencil, Trash2, ChevronUp, ChevronDown, Loader2, ArrowLeft,
  UtensilsCrossed, ImagePlus, Camera, X, Eye, EyeOff, AlertTriangle,
} from '@lucide/vue'
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import { businessUrl } from '~/utils/urls'
import CameraCapture from '~/components/business/CameraCapture.vue'

definePageMeta({ layout: 'landing', middleware: 'auth' })

const route = useRoute()
const slug = computed(() => route.params.slug)

const { negocio, pending: loadingNegocio, error: negocioError } = useNegocio(slug, { includeDrafts: true })
const menuApi = useMenuEdit()
const { isMobileOrTablet } = useDeviceType()
const cameraOpen = ref(false)

const sections = ref([])
const loadingMenu = ref(true)
const loadError = ref(null)

const priceFormatter = new Intl.NumberFormat('es-MX', {
  style: 'currency', currency: 'MXN', minimumFractionDigits: 0, maximumFractionDigits: 2,
})

watch(negocio, async (val) => {
  if (!val?.documentId) return
  loadingMenu.value = true
  loadError.value = null
  try {
    sections.value = await menuApi.fetchMenu(val.documentId)
  } catch (e) {
    loadError.value = e?.data?.error?.message || 'No pudimos cargar el menú.'
  } finally {
    loadingMenu.value = false
  }
}, { immediate: true })

const itemCount = computed(() =>
  sections.value.reduce((acc, s) => acc + s.items.length, 0)
)

// ---- Secciones ----

const newSectionName = ref('')
const creatingSection = ref(false)

async function addSection() {
  const name = newSectionName.value.trim()
  if (name.length < 2 || creatingSection.value) return
  creatingSection.value = true
  try {
    const nextOrder = sections.value.reduce((max, s) => Math.max(max, s.order ?? 0), -1) + 1
    const created = await menuApi.createSection(negocio.value.documentId, {
      name,
      order: nextOrder,
    })
    sections.value.push({ ...created, items: [] })
    newSectionName.value = ''
  } catch (e) {
    loadError.value = e?.data?.error?.message || 'No pudimos crear la sección.'
  } finally {
    creatingSection.value = false
  }
}

const editingSectionId = ref(null)
const editingSectionName = ref('')

function startRenameSection(section) {
  editingSectionId.value = section.documentId
  editingSectionName.value = section.name
}

async function commitRenameSection(section) {
  const name = editingSectionName.value.trim()
  editingSectionId.value = null
  if (name.length < 2 || name === section.name) return
  const previous = section.name
  section.name = name
  try {
    await menuApi.updateSection(section.documentId, { name })
  } catch {
    section.name = previous
  }
}

/** Cambio optimista con revert: es el control que más se toca. */
async function toggleSectionActive(section) {
  const next = !section.isActive
  section.isActive = next
  try {
    await menuApi.updateSection(section.documentId, { isActive: next })
  } catch {
    section.isActive = !next
  }
}

async function moveSection(index, delta) {
  const target = index + delta
  if (target < 0 || target >= sections.value.length) return

  const list = sections.value
  ;[list[index], list[target]] = [list[target], list[index]]

  // Persistir el nuevo orden de las dos que cambiaron de lugar.
  await Promise.all([
    menuApi.updateSection(list[index].documentId, { order: index }),
    menuApi.updateSection(list[target].documentId, { order: target }),
  ]).catch(() => {
    ;[list[index], list[target]] = [list[target], list[index]]
  })
  list[index].order = index
  list[target].order = target
}

const sectionToDelete = ref(null)
const deletingSection = ref(false)

async function confirmDeleteSection() {
  if (!sectionToDelete.value) return
  deletingSection.value = true
  try {
    await menuApi.deleteSection(sectionToDelete.value.documentId)
    sections.value = sections.value.filter(s => s.documentId !== sectionToDelete.value.documentId)
    sectionToDelete.value = null
  } catch (e) {
    loadError.value = e?.data?.error?.message || 'No pudimos borrar la sección.'
  } finally {
    deletingSection.value = false
  }
}

// ---- Platillos ----

const itemModal = ref({ open: false, section: null, item: null })
const itemForm = ref({ name: '', description: '', price: '', photo: null, photoFile: null })
const savingItem = ref(false)
const itemError = ref(null)

function openNewItem(section) {
  itemModal.value = { open: true, section, item: null }
  itemForm.value = { name: '', description: '', price: '', photo: null, photoFile: null }
  itemError.value = null
}

function openEditItem(section, item) {
  itemModal.value = { open: true, section, item }
  itemForm.value = {
    name: item.name,
    description: item.description ?? '',
    price: String(item.price ?? ''),
    photo: item.photo,
    photoFile: null,
  }
  itemError.value = null
}

function closeItemModal() {
  itemModal.value = { open: false, section: null, item: null }
}

function onPhotoPick(event) {
  const file = event.target.files?.[0]
  if (!file) return
  itemForm.value.photoFile = file
  itemForm.value.photo = { url: URL.createObjectURL(file) }
}

function clearPhoto() {
  itemForm.value.photoFile = null
  itemForm.value.photo = null
}

function onCameraCapture(file) {
  itemForm.value.photoFile = file
  itemForm.value.photo = { url: URL.createObjectURL(file) }
}

const itemFormValid = computed(() => {
  const price = Number(itemForm.value.price)
  return itemForm.value.name.trim().length >= 2
    && itemForm.value.price !== ''
    && Number.isFinite(price)
    && price >= 0
})

async function saveItem() {
  if (!itemFormValid.value || savingItem.value) return
  savingItem.value = true
  itemError.value = null

  const { section, item } = itemModal.value
  const price = Number(itemForm.value.price)
  const name = itemForm.value.name.trim()
  const description = itemForm.value.description.trim() || null

  try {
    let photoId
    if (itemForm.value.photoFile) {
      const uploaded = await menuApi.uploadPhoto(itemForm.value.photoFile)
      photoId = uploaded.id
    }

    if (item) {
      const data = { name, description, price }
      if (photoId) data.photo = photoId
      else if (!itemForm.value.photo) data.photo = null

      // La respuesta ya viene con la foto poblada: se usa esa, no el blob local.
      const saved = await menuApi.updateItem(item.documentId, data)
      Object.assign(item, saved ?? { name, description, price })
    } else {
      const created = await menuApi.createItem(section.documentId, {
        name, description, price,
        order: section.items.reduce((max, i) => Math.max(max, i.order ?? 0), -1) + 1,
        photoId,
      })
      section.items.push(created)
    }
    closeItemModal()
  } catch (e) {
    itemError.value = e?.data?.error?.message || 'No pudimos guardar el platillo.'
  } finally {
    savingItem.value = false
  }
}

/**
 * Toggle de disponibilidad inline y optimista. Es la operación de las 3 de la
 * tarde cuando se acaba la birria: si pide abrir un modal, nadie lo mantiene.
 */
async function toggleItemAvailable(item) {
  const next = !item.isAvailable
  item.isAvailable = next
  try {
    await menuApi.updateItem(item.documentId, { isAvailable: next })
  } catch {
    item.isAvailable = !next
  }
}

async function moveItem(section, index, delta) {
  const target = index + delta
  if (target < 0 || target >= section.items.length) return

  const list = section.items
  ;[list[index], list[target]] = [list[target], list[index]]

  await Promise.all([
    menuApi.updateItem(list[index].documentId, { order: index }),
    menuApi.updateItem(list[target].documentId, { order: target }),
  ]).catch(() => {
    ;[list[index], list[target]] = [list[target], list[index]]
  })
  list[index].order = index
  list[target].order = target
}

const itemToDelete = ref(null)
const deletingItem = ref(false)

async function confirmDeleteItem() {
  if (!itemToDelete.value) return
  const { section, item } = itemToDelete.value
  deletingItem.value = true
  try {
    await menuApi.deleteItem(item.documentId)
    section.items = section.items.filter(i => i.documentId !== item.documentId)
    itemToDelete.value = null
  } catch (e) {
    loadError.value = e?.data?.error?.message || 'No pudimos borrar el platillo.'
  } finally {
    deletingItem.value = false
  }
}

useSeoMeta({ title: () => `Menú de ${negocio.value?.name ?? 'tu negocio'} · Mandaditoz`, robots: 'noindex' })
</script>

<template>
  <div class="min-h-screen bg-slate-100">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:px-8 md:py-10">

      <NuxtLink to="/mis-negocios" class="inline-flex items-center gap-2 text-brand-azulgris text-sm font-medium hover:text-brand-text transition-colors">
        <ArrowLeft class="w-4 h-4" />
        Mis negocios
      </NuxtLink>

      <!-- Encabezado -->
      <div v-if="negocio" class="mt-4 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 class="font-display font-black text-2xl sm:text-3xl text-brand-text">Menú</h1>
          <p class="text-brand-azulgris text-sm mt-1">
            {{ negocio.name }} ·
            {{ itemCount }} {{ itemCount === 1 ? 'platillo' : 'platillos' }}
            en {{ sections.length }} {{ sections.length === 1 ? 'sección' : 'secciones' }}
          </p>
        </div>
        <a
          v-if="negocio.businessStatus === 'published'"
          :href="`${businessUrl(negocio)}?tab=menu`"
          target="_blank"
          rel="noopener"
          class="btn-secondary text-sm"
        >
          Ver cómo se ve
        </a>
      </div>

      <div v-if="loadingNegocio || loadingMenu" class="mt-10 flex items-center gap-3 text-brand-azulgris text-sm">
        <Loader2 class="w-5 h-5 animate-spin" />
        Cargando menú…
      </div>

      <div v-else-if="negocioError || !negocio" class="mt-10 card p-6 text-sm text-brand-azulgris">
        No encontramos este negocio.
      </div>

      <template v-else>
        <div v-if="loadError" class="mt-6 flex items-start gap-3 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          <AlertTriangle class="w-5 h-5 shrink-0 mt-0.5" />
          <span>{{ loadError }}</span>
        </div>

        <!-- Estado vacío -->
        <div v-if="!sections.length" class="mt-8 card p-8 text-center">
          <div class="w-14 h-14 rounded-2xl bg-brand-primary/10 flex items-center justify-center mx-auto">
            <UtensilsCrossed class="w-7 h-7 text-brand-primary" />
          </div>
          <h2 class="mt-4 font-display font-black text-lg text-brand-text">Arma tu menú</h2>
          <p class="mt-2 text-sm text-brand-azulgris max-w-md mx-auto">
            Empieza por una sección — "Tacos", "Bebidas", "Postres" — y adentro
            agrega tus platillos con su precio.
          </p>
        </div>

        <!-- Secciones -->
        <div v-else class="mt-8 space-y-4">
          <div
            v-for="(section, sIdx) in sections"
            :key="section.documentId"
            class="card p-5"
            :class="section.isActive ? '' : 'opacity-70'"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0 flex-1">
                <input
                  v-if="editingSectionId === section.documentId"
                  v-model="editingSectionName"
                  type="text"
                  autofocus
                  class="w-full font-display font-black text-lg text-brand-text border-b border-brand-primary bg-transparent focus:outline-none"
                  @blur="commitRenameSection(section)"
                  @keyup.enter="commitRenameSection(section)"
                  @keyup.esc="editingSectionId = null"
                />
                <button
                  v-else
                  type="button"
                  class="group flex items-center gap-2 text-left"
                  @click="startRenameSection(section)"
                >
                  <span class="font-display font-black text-lg text-brand-text">{{ section.name }}</span>
                  <Pencil class="w-3.5 h-3.5 text-brand-azulgris opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
                <p class="text-xs text-brand-azulgris mt-0.5">
                  {{ section.items.length }} {{ section.items.length === 1 ? 'platillo' : 'platillos' }}
                  <span v-if="!section.isActive"> · oculta del menú público</span>
                </p>
              </div>

              <div class="flex items-center gap-1 shrink-0">
                <button type="button" class="p-1.5 rounded-lg text-brand-azulgris hover:bg-gray-100 disabled:opacity-30" :disabled="sIdx === 0" @click="moveSection(sIdx, -1)" aria-label="Subir sección">
                  <ChevronUp class="w-4 h-4" />
                </button>
                <button type="button" class="p-1.5 rounded-lg text-brand-azulgris hover:bg-gray-100 disabled:opacity-30" :disabled="sIdx === sections.length - 1" @click="moveSection(sIdx, 1)" aria-label="Bajar sección">
                  <ChevronDown class="w-4 h-4" />
                </button>
                <button type="button" class="p-1.5 rounded-lg text-brand-azulgris hover:bg-gray-100" @click="toggleSectionActive(section)" :aria-label="section.isActive ? 'Ocultar sección' : 'Mostrar sección'" :title="section.isActive ? 'Ocultar del menú público' : 'Mostrar en el menú público'">
                  <Eye v-if="section.isActive" class="w-4 h-4" />
                  <EyeOff v-else class="w-4 h-4" />
                </button>
                <button type="button" class="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600" @click="sectionToDelete = section" aria-label="Borrar sección">
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </div>

            <!-- Platillos -->
            <div class="mt-3 divide-y divide-brand-border">
              <div
                v-for="(item, iIdx) in section.items"
                :key="item.documentId"
                class="flex items-center gap-3 py-3"
              >
                <div
                  class="w-12 h-12 rounded-lg overflow-hidden shrink-0 flex items-center justify-center"
                  :class="item.photo?.url ? 'bg-brand-bg-dark' : 'bg-amber-50'"
                >
                  <img v-if="item.photo?.url" :src="item.photo.url" :alt="item.name" class="w-full h-full object-cover" />
                  <UtensilsCrossed v-else class="w-5 h-5 text-amber-400" />
                </div>

                <div class="flex-1 min-w-0" :class="item.isAvailable ? '' : 'opacity-50'">
                  <p class="text-sm font-semibold text-brand-text truncate">{{ item.name }}</p>
                  <p class="text-xs text-brand-azulgris">{{ priceFormatter.format(item.price) }}</p>
                </div>

                <button
                  type="button"
                  class="chip shrink-0 transition-colors"
                  :class="item.isAvailable ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-gray-100 text-brand-azulgris hover:bg-gray-200'"
                  @click="toggleItemAvailable(item)"
                >
                  {{ item.isAvailable ? 'Disponible' : 'Agotado' }}
                </button>

                <div class="flex items-center gap-1 shrink-0">
                  <button type="button" class="p-1.5 rounded-lg text-brand-azulgris hover:bg-gray-100 disabled:opacity-30" :disabled="iIdx === 0" @click="moveItem(section, iIdx, -1)" aria-label="Subir platillo">
                    <ChevronUp class="w-4 h-4" />
                  </button>
                  <button type="button" class="p-1.5 rounded-lg text-brand-azulgris hover:bg-gray-100 disabled:opacity-30" :disabled="iIdx === section.items.length - 1" @click="moveItem(section, iIdx, 1)" aria-label="Bajar platillo">
                    <ChevronDown class="w-4 h-4" />
                  </button>
                  <button type="button" class="p-1.5 rounded-lg text-brand-azulgris hover:bg-gray-100" @click="openEditItem(section, item)" aria-label="Editar platillo">
                    <Pencil class="w-4 h-4" />
                  </button>
                  <button type="button" class="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600" @click="itemToDelete = { section, item }" aria-label="Borrar platillo">
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <button type="button" class="mt-3 inline-flex items-center gap-1.5 text-brand-primary text-sm font-semibold hover:underline" @click="openNewItem(section)">
              <Plus class="w-4 h-4" />
              Agregar platillo
            </button>
          </div>
        </div>

        <!-- Nueva sección -->
        <form class="mt-6 card p-5 flex items-center gap-3 flex-wrap" @submit.prevent="addSection">
          <input
            v-model="newSectionName"
            type="text"
            placeholder="Nombre de la sección (ej. Tacos)"
            maxlength="80"
            class="flex-1 min-w-[200px] px-4 py-2.5 rounded-lg border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
          />
          <button type="submit" class="btn-primary text-sm" :disabled="newSectionName.trim().length < 2 || creatingSection">
            <Loader2 v-if="creatingSection" class="w-4 h-4 animate-spin" />
            <template v-else>Agregar sección</template>
          </button>
        </form>
      </template>
    </div>

    <!-- Modal: platillo -->
    <TransitionRoot :show="itemModal.open" as="template">
      <Dialog class="relative z-50" @close="closeItemModal">
        <TransitionChild as="template" enter="duration-200" enter-from="opacity-0" enter-to="opacity-100" leave="duration-150" leave-from="opacity-100" leave-to="opacity-0">
          <div class="fixed inset-0 bg-black/40" />
        </TransitionChild>
        <div class="fixed inset-0 overflow-y-auto p-4 flex items-center justify-center">
          <TransitionChild as="template" enter="duration-200" enter-from="opacity-0 translate-y-2 scale-95" enter-to="opacity-100 translate-y-0 scale-100" leave="duration-150" leave-from="opacity-100" leave-to="opacity-0 scale-95">
            <DialogPanel class="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl">
              <DialogTitle class="font-display font-black text-lg text-brand-text">
                {{ itemModal.item ? 'Editar platillo' : 'Nuevo platillo' }}
              </DialogTitle>

              <div class="mt-4 space-y-4">
                <div>
                  <label class="block text-xs font-semibold text-brand-text mb-1.5">Nombre</label>
                  <input v-model="itemForm.name" type="text" maxlength="120" placeholder="Taco de pastor" class="w-full px-4 py-2.5 rounded-lg border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-primary/40" />
                </div>

                <div>
                  <label class="block text-xs font-semibold text-brand-text mb-1.5">Descripción <span class="font-normal text-brand-azulgris">(opcional)</span></label>
                  <textarea v-model="itemForm.description" rows="2" maxlength="500" placeholder="Con piña y cilantro" class="w-full px-4 py-2.5 rounded-lg border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-primary/40 resize-none" />
                </div>

                <div>
                  <label class="block text-xs font-semibold text-brand-text mb-1.5">Precio (MXN)</label>
                  <input v-model="itemForm.price" type="number" min="0" step="0.5" inputmode="decimal" placeholder="22" class="w-full px-4 py-2.5 rounded-lg border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-primary/40" />
                </div>

                <div>
                  <label class="block text-xs font-semibold text-brand-text mb-1.5">Foto <span class="font-normal text-brand-azulgris">(opcional)</span></label>
                  <div class="flex items-center gap-3 flex-wrap">
                    <div
                      class="w-20 h-20 rounded-xl overflow-hidden shrink-0 relative flex items-center justify-center"
                      :class="itemForm.photo?.url ? 'bg-brand-bg-dark' : 'bg-amber-50'"
                    >
                      <img v-if="itemForm.photo?.url" :src="itemForm.photo.url" alt="" class="w-full h-full object-cover" />
                      <UtensilsCrossed v-else class="w-8 h-8 text-amber-400" />
                      <button v-if="itemForm.photo?.url" type="button" class="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center" @click="clearPhoto" aria-label="Quitar foto">
                        <X class="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div class="flex flex-col gap-2">
                      <!-- Cámara in-app: solo en móvil/tablet, donde tiene sentido tomar la foto ahí mismo -->
                      <button
                        v-if="isMobileOrTablet"
                        type="button"
                        class="btn-secondary text-sm inline-flex items-center gap-2"
                        @click="cameraOpen = true"
                      >
                        <Camera class="w-4 h-4" />
                        Tomar foto
                      </button>
                      <label class="btn-secondary text-sm cursor-pointer inline-flex items-center gap-2">
                        <ImagePlus class="w-4 h-4" />
                        {{ itemForm.photo?.url ? 'Cambiar de galería' : 'Subir de galería' }}
                        <input type="file" accept="image/*" class="hidden" @change="onPhotoPick" />
                      </label>
                    </div>
                  </div>
                </div>

                <p v-if="itemError" class="text-sm text-red-600">{{ itemError }}</p>
              </div>

              <div class="mt-6 flex items-center justify-end gap-3">
                <button type="button" class="btn-secondary text-sm" @click="closeItemModal">Cancelar</button>
                <button type="button" class="btn-primary text-sm inline-flex items-center gap-2" :disabled="!itemFormValid || savingItem" @click="saveItem">
                  <Loader2 v-if="savingItem" class="w-4 h-4 animate-spin" />
                  {{ savingItem ? 'Guardando…' : 'Guardar' }}
                </button>
              </div>

              <!--
                Anidada aquí a propósito (no como hermana del modal): así Headless UI
                considera los clics dentro de la cámara como "dentro" de este DialogPanel
                y no cierra el modal de platillo por "clic afuera" al tocar "Usar foto".
              -->
              <CameraCapture :open="cameraOpen" @close="cameraOpen = false" @capture="onCameraCapture" />
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- Modal: borrar sección -->
    <TransitionRoot :show="!!sectionToDelete" as="template">
      <Dialog class="relative z-50" @close="sectionToDelete = null">
        <div class="fixed inset-0 bg-black/40" />
        <div class="fixed inset-0 overflow-y-auto p-4 flex items-center justify-center">
          <DialogPanel class="w-full max-w-sm bg-white rounded-2xl p-6 shadow-xl">
            <DialogTitle class="font-display font-black text-lg text-brand-text">Borrar sección</DialogTitle>
            <p class="mt-2 text-sm text-brand-azulgris">
              Se borrará <strong class="text-brand-text">{{ sectionToDelete?.name }}</strong>
              y sus {{ sectionToDelete?.items.length }}
              {{ sectionToDelete?.items.length === 1 ? 'platillo' : 'platillos' }}. No se puede deshacer.
            </p>
            <p class="mt-2 text-xs text-brand-azulgris">
              Si solo quieres esconderla por un tiempo, usa el ojo en lugar de borrarla.
            </p>
            <div class="mt-6 flex items-center justify-end gap-3">
              <button type="button" class="btn-secondary text-sm" @click="sectionToDelete = null">Cancelar</button>
              <button type="button" class="text-sm font-semibold px-5 py-2.5 rounded-lg bg-red-600 text-white hover:bg-red-700 inline-flex items-center gap-2" :disabled="deletingSection" @click="confirmDeleteSection">
                <Loader2 v-if="deletingSection" class="w-4 h-4 animate-spin" />
                {{ deletingSection ? 'Borrando…' : 'Borrar' }}
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- Modal: borrar platillo -->
    <TransitionRoot :show="!!itemToDelete" as="template">
      <Dialog class="relative z-50" @close="itemToDelete = null">
        <div class="fixed inset-0 bg-black/40" />
        <div class="fixed inset-0 overflow-y-auto p-4 flex items-center justify-center">
          <DialogPanel class="w-full max-w-sm bg-white rounded-2xl p-6 shadow-xl">
            <DialogTitle class="font-display font-black text-lg text-brand-text">Borrar platillo</DialogTitle>
            <p class="mt-2 text-sm text-brand-azulgris">
              Se borrará <strong class="text-brand-text">{{ itemToDelete?.item.name }}</strong>. No se puede deshacer.
            </p>
            <p class="mt-2 text-xs text-brand-azulgris">
              Si solo se acabó por hoy, márcalo como agotado en lugar de borrarlo.
            </p>
            <div class="mt-6 flex items-center justify-end gap-3">
              <button type="button" class="btn-secondary text-sm" @click="itemToDelete = null">Cancelar</button>
              <button type="button" class="text-sm font-semibold px-5 py-2.5 rounded-lg bg-red-600 text-white hover:bg-red-700 inline-flex items-center gap-2" :disabled="deletingItem" @click="confirmDeleteItem">
                <Loader2 v-if="deletingItem" class="w-4 h-4 animate-spin" />
                {{ deletingItem ? 'Borrando…' : 'Borrar' }}
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </TransitionRoot>
  </div>
</template>

<script setup>
import { Download, X, Copy, Check } from '@lucide/vue'
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import QRCode from 'qrcode'
import { businessUrl } from '~/utils/urls'

const props = defineProps({
  open: { type: Boolean, default: false },
  negocio: { type: Object, default: null },
})

const emit = defineEmits(['close'])

const config = useRuntimeConfig()
const siteUrl = String(config.public?.siteUrl ?? '').replace(/\/$/, '')

const menuUrl = computed(() => {
  if (!props.negocio?.slug) return ''
  return `${siteUrl}${businessUrl(props.negocio)}?tab=menu`
})

const qrDataUrl = ref('')
const generating = ref(false)
const genError = ref('')

async function generate() {
  if (!menuUrl.value) return
  generating.value = true
  genError.value = ''
  try {
    qrDataUrl.value = await QRCode.toDataURL(menuUrl.value, {
      width: 1024,
      margin: 2,
      errorCorrectionLevel: 'M',
    })
  } catch {
    genError.value = 'No se pudo generar el QR. Intenta de nuevo.'
    qrDataUrl.value = ''
  } finally {
    generating.value = false
  }
}

watch(() => props.open, (open) => {
  if (open) {
    generate()
  } else {
    qrDataUrl.value = ''
    genError.value = ''
    copied.value = false
  }
})

function download() {
  if (!qrDataUrl.value || !props.negocio?.slug) return
  const link = document.createElement('a')
  link.href = qrDataUrl.value
  link.download = `qr-menu-${props.negocio.slug}.png`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const copied = ref(false)
async function copyLink() {
  if (!menuUrl.value) return
  try {
    await navigator.clipboard.writeText(menuUrl.value)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {}
}
</script>

<template>
  <TransitionRoot as="template" :show="open">
    <Dialog as="div" class="relative z-50" @close="emit('close')">
      <TransitionChild
        as="template"
        enter="ease-out duration-200"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in duration-150"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/60 backdrop-blur-sm" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4">
          <TransitionChild
            as="template"
            enter="ease-out duration-200"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="ease-in duration-150"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
              <div class="flex items-start justify-between gap-4 mb-4">
                <div class="min-w-0">
                  <DialogTitle class="font-display font-black text-lg text-brand-text">
                    QR del menú
                  </DialogTitle>
                  <p class="text-xs text-brand-azulgris mt-1">
                    Al escanearlo se abre el menú de
                    <span class="font-semibold">{{ negocio?.name }}</span>
                  </p>
                </div>
                <button
                  type="button"
                  @click="emit('close')"
                  class="text-gray-400 hover:text-brand-text transition-colors shrink-0"
                  aria-label="Cerrar"
                >
                  <X class="w-5 h-5" />
                </button>
              </div>

              <div class="rounded-xl border border-gray-200 bg-gray-50 p-4 flex items-center justify-center min-h-[288px]">
                <div v-if="generating" class="text-sm text-brand-azulgris">Generando…</div>
                <div v-else-if="genError" class="text-sm text-red-600">{{ genError }}</div>
                <img
                  v-else-if="qrDataUrl"
                  :src="qrDataUrl"
                  :alt="`QR menú ${negocio?.name ?? ''}`"
                  class="w-64 h-64"
                />
              </div>

              <div class="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 text-xs text-brand-text">
                <span class="flex-1 truncate" :title="menuUrl">{{ menuUrl }}</span>
                <button
                  type="button"
                  @click="copyLink"
                  class="text-brand-azulgris hover:text-brand-text transition-colors shrink-0"
                  :aria-label="copied ? 'Enlace copiado' : 'Copiar enlace'"
                >
                  <Check v-if="copied" class="w-4 h-4 text-emerald-600" />
                  <Copy v-else class="w-4 h-4" />
                </button>
              </div>

              <div class="mt-5 flex items-center gap-3">
                <button
                  type="button"
                  @click="emit('close')"
                  class="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 text-brand-text text-sm font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  @click="download"
                  :disabled="!qrDataUrl || generating"
                  class="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-brand-primary text-white text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download class="w-4 h-4" />
                  Descargar PNG
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

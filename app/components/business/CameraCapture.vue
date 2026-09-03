<script setup>
import { Dialog, DialogPanel, TransitionRoot, TransitionChild } from '@headlessui/vue'
import { X, RefreshCw } from '@lucide/vue'

const props = defineProps({
  open: { type: Boolean, default: false },
})
const emit = defineEmits(['close', 'capture'])

const videoEl = ref(null)
const canvasEl = ref(null)
const streamReady = ref(false)
const errorMsg = ref(null)
const facingMode = ref('environment')
const hasMultipleCameras = ref(false)
const capturedBlob = ref(null)
const capturedPreview = ref(null)

let mediaStream = null

async function startCamera() {
  stopStream()
  errorMsg.value = null
  streamReady.value = false

  if (!import.meta.client) return

  // getUserMedia solo existe en contexto seguro (https, o localhost). Si se
  // prueba desde un celular contra el servidor de desarrollo por IP de LAN
  // (http://192.168.x.x:3000), el navegador ni siquiera expone la API.
  if (!window.isSecureContext) {
    errorMsg.value = 'La cámara solo funciona en HTTPS. Si estás probando en local desde tu celular por IP (http://...), usa "Subir de galería" o prueba en el sitio publicado.'
    return
  }

  if (!navigator.mediaDevices?.getUserMedia) {
    errorMsg.value = 'Tu navegador no soporta acceso a la cámara.'
    return
  }

  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: facingMode.value } },
      audio: false,
    })
    if (videoEl.value) {
      videoEl.value.srcObject = mediaStream
      await videoEl.value.play()
    }
    streamReady.value = true
    detectMultipleCameras()
  } catch (e) {
    errorMsg.value = e?.name === 'NotAllowedError'
      ? 'Bloqueaste el permiso de cámara. Actívalo en los ajustes del navegador para este sitio.'
      : 'No pudimos acceder a la cámara. Revisa los permisos del navegador o usa "Subir de galería".'
  }
}

async function detectMultipleCameras() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices()
    hasMultipleCameras.value = devices.filter(d => d.kind === 'videoinput').length > 1
  } catch {
    hasMultipleCameras.value = false
  }
}

function stopStream() {
  mediaStream?.getTracks().forEach(t => t.stop())
  mediaStream = null
  streamReady.value = false
}

function flipCamera() {
  facingMode.value = facingMode.value === 'environment' ? 'user' : 'environment'
  startCamera()
}

function takePhoto() {
  const video = videoEl.value
  const canvas = canvasEl.value
  if (!video || !canvas || !streamReady.value) return

  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height)

  canvas.toBlob((blob) => {
    if (!blob) return
    capturedBlob.value = blob
    capturedPreview.value = URL.createObjectURL(blob)
    stopStream()
  }, 'image/jpeg', 0.9)
}

function discardCapture() {
  if (capturedPreview.value) URL.revokeObjectURL(capturedPreview.value)
  capturedPreview.value = null
  capturedBlob.value = null
}

function retake() {
  discardCapture()
  startCamera()
}

function usePhoto() {
  if (!capturedBlob.value) return
  const file = new File([capturedBlob.value], `platillo-${Date.now()}.jpg`, { type: 'image/jpeg' })
  emit('capture', file)
  handleClose()
}

function handleClose() {
  stopStream()
  discardCapture()
  emit('close')
}

watch(() => props.open, (isOpen) => {
  if (isOpen) {
    facingMode.value = 'environment'
    nextTick(startCamera)
  } else {
    stopStream()
    discardCapture()
  }
})

onBeforeUnmount(() => {
  stopStream()
  discardCapture()
})
</script>

<template>
  <TransitionRoot appear :show="open" as="template">
    <Dialog as="div" class="relative z-[60]" @close="handleClose">
      <TransitionChild
        as="template"
        enter="duration-150" enter-from="opacity-0" enter-to="opacity-100"
        leave="duration-150" leave-from="opacity-100" leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black" aria-hidden="true" />
      </TransitionChild>

      <div class="fixed inset-0 flex flex-col">
        <DialogPanel class="flex-1 flex flex-col min-h-0">

          <!-- Header -->
          <div class="shrink-0 flex items-center justify-between px-4 py-3">
            <button
              type="button"
              class="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center"
              @click="handleClose"
              aria-label="Cerrar cámara"
            >
              <X class="w-5 h-5" />
            </button>
            <span class="text-white/70 text-sm font-medium">Foto del platillo</span>
            <button
              type="button"
              class="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center disabled:opacity-30"
              :disabled="!hasMultipleCameras || !!capturedPreview"
              @click="flipCamera"
              aria-label="Cambiar de cámara"
            >
              <RefreshCw class="w-5 h-5" />
            </button>
          </div>

          <!-- Visor -->
          <div class="relative flex-1 min-h-0 flex items-center justify-center bg-black overflow-hidden">
            <img
              v-if="capturedPreview"
              :src="capturedPreview"
              alt="Foto capturada"
              class="max-w-full max-h-full object-contain"
            />
            <video
              v-else
              ref="videoEl"
              autoplay
              playsinline
              muted
              class="w-full h-full object-cover"
            />
            <p
              v-if="errorMsg && !capturedPreview"
              class="absolute inset-x-6 top-1/2 -translate-y-1/2 text-center text-white/80 text-sm leading-relaxed"
            >
              {{ errorMsg }}
            </p>
            <canvas ref="canvasEl" class="hidden" />
          </div>

          <!-- Controles -->
          <div class="shrink-0 px-6 py-6 flex items-center justify-center gap-6">
            <template v-if="!capturedPreview">
              <button
                type="button"
                class="w-16 h-16 rounded-full border-4 border-white bg-white/20 active:scale-95 transition-transform disabled:opacity-30"
                :disabled="!streamReady"
                @click="takePhoto"
                aria-label="Tomar foto"
              />
            </template>
            <template v-else>
              <button
                type="button"
                class="px-5 py-2.5 rounded-lg text-sm font-medium bg-white/10 text-white hover:bg-white/20 transition-colors"
                @click="retake"
              >
                Repetir
              </button>
              <button
                type="button"
                class="btn-primary text-sm"
                @click="usePhoto"
              >
                Usar foto
              </button>
            </template>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

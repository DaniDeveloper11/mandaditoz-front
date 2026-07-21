<script setup>
import { reactive, ref, computed } from 'vue'
import {
  Mail, Phone, MapPin, MessageSquare, User as UserIcon,
  Send, CheckCircle2, AlertCircle,
} from '@lucide/vue'

definePageMeta({ layout: 'landing' })

useHead({
  title: 'Contacto — Mandaditoz',
  meta: [
    { name: 'description', content: 'Escríbenos: dudas sobre tu negocio, sugerencias, reportes o prensa. Respondemos en menos de 48 horas hábiles.' },
  ],
})

const config = useRuntimeConfig()
const cityStore = useCityStore()

const SUBJECTS = [
  { value: 'general',    label: 'Consulta general' },
  { value: 'negocio',    label: 'Ayuda con mi negocio' },
  { value: 'reporte',    label: 'Reportar contenido' },
  { value: 'prensa',     label: 'Prensa / medios' },
  { value: 'sugerencia', label: 'Sugerencia' },
]

const form = reactive({
  name: '',
  email: '',
  phone: '',
  subject: 'general',
  message: '',
  termsAccepted: false,
})

const loading = ref(false)
const error = ref(null)
const sent = ref(false)

const remaining = computed(() => 2000 - form.message.length)
const canSubmit = computed(() =>
  form.name.trim().length >= 2 &&
  /^[^@]+@[^@]+\.[^@]+$/.test(form.email.trim()) &&
  form.message.trim().length >= 10 &&
  form.termsAccepted &&
  !loading.value
)

async function handleSubmit() {
  if (!canSubmit.value) return
  error.value = null
  loading.value = true

  try {
    await $fetch(`${config.public.apiBase}/contact-messages/submit`, {
      method: 'POST',
      body: {
        data: {
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || null,
          subject: form.subject,
          message: form.message.trim(),
          city: cityStore.activeCity?.documentId ?? null,
          termsAccepted: true,
        },
      },
    })
    sent.value = true
  } catch (err) {
    const status = err?.response?.status
    if (status === 429) {
      error.value = 'Has enviado demasiados mensajes desde esta conexión. Intenta de nuevo más tarde.'
    } else if (status === 400) {
      error.value = err?.response?._data?.error?.message ?? 'Revisa los campos del formulario.'
    } else {
      error.value = 'No pudimos enviar tu mensaje. Intenta de nuevo en unos minutos.'
    }
  } finally {
    loading.value = false
  }
}

function resetForm() {
  form.name = ''
  form.email = ''
  form.phone = ''
  form.subject = 'general'
  form.message = ''
  form.termsAccepted = false
  sent.value = false
  error.value = null
}
</script>

<template>
  <main class="flex-1">

    <!-- Hero -->
    <section class="relative overflow-hidden bg-slate-50 py-16 md:py-20 px-6 md:px-12">
      <div class="max-w-6xl mx-auto">
        <div class="flex items-center gap-3 mb-6">
          <span class="h-px w-10 bg-brand-ocre" />
          <span class="text-brand-ocre text-xs font-semibold tracking-[0.25em] uppercase">
            Contacto
          </span>
        </div>
        <h1 class="font-display font-black text-5xl sm:text-6xl md:text-7xl leading-[0.95] tracking-tight text-brand-bg-dark max-w-3xl">
          Hablemos.
          <span class="block text-brand-primary-dark">Estamos del otro lado.</span>
        </h1>
        <p class="mt-8 max-w-2xl text-brand-text-soft text-base md:text-lg leading-relaxed">
          ¿Dudas sobre tu perfil de negocio, sugerencias para mejorar el directorio,
          o quieres reportar algo? Escríbenos y respondemos en menos de
          <span class="font-semibold text-brand-text">48 horas hábiles</span>.
        </p>
      </div>
    </section>

    <!-- Form + info -->
    <section class="bg-white py-14 md:py-20 px-6 md:px-12">
      <div class="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-14">

        <!-- Info lateral -->
        <aside class="md:col-span-4 order-2 md:order-1">
          <p class="text-brand-primary text-xs font-semibold tracking-[0.25em] uppercase mb-4">
            Otras vías
          </p>
          <h2 class="font-display font-black text-3xl leading-tight text-brand-bg-dark mb-6">
            Si prefieres,<br>escríbenos directo.
          </h2>

          <ul class="space-y-5">
            <li class="flex items-start gap-4">
              <div class="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-brand-primary ring-1 ring-blue-100">
                <Mail class="size-5" />
              </div>
              <div class="min-w-0">
                <p class="text-xs font-semibold uppercase tracking-wider text-brand-azulgris">Correo</p>
                <a href="mailto:hola@mandaditoz.com" class="text-brand-text font-medium hover:text-brand-primary transition break-all">
                  hola@mandaditoz.com
                </a>
              </div>
            </li>

            <li class="flex items-start gap-4">
              <div class="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                <Phone class="size-5" />
              </div>
              <div class="min-w-0">
                <p class="text-xs font-semibold uppercase tracking-wider text-brand-azulgris">WhatsApp</p>
                <a
                  href="https://wa.me/523860000000"
                  target="_blank"
                  rel="noopener"
                  class="text-brand-text font-medium hover:text-emerald-700 transition"
                >
                  +52 386 121 3747
                </a>
              </div>
            </li>

            <li class="flex items-start gap-4">
              <div class="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-brand-ocre ring-1 ring-amber-100">
                <MapPin class="size-5" />
              </div>
              <div class="min-w-0">
                <p class="text-xs font-semibold uppercase tracking-wider text-brand-azulgris">Base</p>
                <p class="text-brand-text font-medium">Etzatlán, Jalisco · México</p>
                <p class="text-brand-text-soft text-sm mt-0.5">Servimos varios municipios de Jalisco.</p>
              </div>
            </li>
          </ul>

          <div class="mt-8 rounded-2xl bg-slate-50 border border-brand-border p-5">
            <p class="text-brand-text text-sm leading-relaxed">
              <span class="font-semibold text-brand-bg-dark">¿Quieres registrar tu negocio?</span>
              Es gratis y toma 5 minutos.
            </p>
            <a
              href="/negocios/publicar"
              class="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-primary hover:text-brand-primary-dark transition"
            >
              Ir al registro
              <span aria-hidden="true">→</span>
            </a>
          </div>
        </aside>

        <!-- Formulario -->
        <div class="md:col-span-8 order-1 md:order-2">
          <div class="card p-6 md:p-10">

            <!-- Éxito -->
            <div v-if="sent" class="text-center py-6">
              <div class="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-50 ring-8 ring-emerald-100/60">
                <CheckCircle2 class="size-8 text-emerald-600" />
              </div>
              <h3 class="mt-6 font-display font-black text-2xl md:text-3xl text-brand-bg-dark">
                ¡Mensaje recibido!
              </h3>
              <p class="mt-3 text-brand-text-soft max-w-md mx-auto">
                Gracias por escribirnos, <span class="font-semibold text-brand-text">{{ form.name || 'vecino' }}</span>.
                Te contestaremos a <span class="font-semibold text-brand-text">{{ form.email }}</span> en menos de 48 horas hábiles.
              </p>
              <div class="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button type="button" class="btn-secondary" @click="resetForm">
                  Enviar otro mensaje
                </button>
                <NuxtLink to="/" class="btn-primary">
                  Volver al inicio
                </NuxtLink>
              </div>
            </div>

            <!-- Formulario -->
            <form v-else class="space-y-5" @submit.prevent="handleSubmit">
              <div>
                <h2 class="font-display font-black text-2xl md:text-3xl text-brand-bg-dark">
                  Escríbenos un mensaje
                </h2>
                <p class="mt-2 text-brand-text-soft text-sm">
                  Los campos con <span class="text-brand-terracota">*</span> son obligatorios.
                </p>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label for="c-name" class="block text-sm font-medium text-brand-text mb-1.5">
                    Nombre <span class="text-brand-terracota">*</span>
                  </label>
                  <div class="relative">
                    <UserIcon class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-brand-azulgris" />
                    <input
                      id="c-name"
                      v-model="form.name"
                      type="text"
                      autocomplete="name"
                      required
                      maxlength="120"
                      placeholder="Tu nombre"
                      class="w-full pl-9 pr-3 py-2.5 rounded-lg border border-brand-border bg-white text-brand-text text-sm placeholder:text-brand-azulgris/60 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition"
                    />
                  </div>
                </div>

                <div>
                  <label for="c-email" class="block text-sm font-medium text-brand-text mb-1.5">
                    Correo <span class="text-brand-terracota">*</span>
                  </label>
                  <div class="relative">
                    <Mail class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-brand-azulgris" />
                    <input
                      id="c-email"
                      v-model="form.email"
                      type="email"
                      autocomplete="email"
                      required
                      placeholder="tu@correo.com"
                      class="w-full pl-9 pr-3 py-2.5 rounded-lg border border-brand-border bg-white text-brand-text text-sm placeholder:text-brand-azulgris/60 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition"
                    />
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label for="c-phone" class="block text-sm font-medium text-brand-text mb-1.5">
                    Teléfono <span class="text-brand-text-soft font-normal">(opcional)</span>
                  </label>
                  <div class="relative">
                    <Phone class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-brand-azulgris" />
                    <input
                      id="c-phone"
                      v-model="form.phone"
                      type="tel"
                      autocomplete="tel"
                      maxlength="30"
                      placeholder="386 000 0000"
                      class="w-full pl-9 pr-3 py-2.5 rounded-lg border border-brand-border bg-white text-brand-text text-sm placeholder:text-brand-azulgris/60 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition"
                    />
                  </div>
                </div>

                <div>
                  <label for="c-subject" class="block text-sm font-medium text-brand-text mb-1.5">
                    Asunto <span class="text-brand-terracota">*</span>
                  </label>
                  <select
                    id="c-subject"
                    v-model="form.subject"
                    required
                    class="w-full px-3 py-2.5 rounded-lg border border-brand-border bg-white text-brand-text text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition"
                  >
                    <option v-for="s in SUBJECTS" :key="s.value" :value="s.value">
                      {{ s.label }}
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <label for="c-message" class="block text-sm font-medium text-brand-text mb-1.5">
                  Mensaje <span class="text-brand-terracota">*</span>
                </label>
                <div class="relative">
                  <MessageSquare class="absolute left-3 top-3 size-4 text-brand-azulgris" />
                  <textarea
                    id="c-message"
                    v-model="form.message"
                    rows="6"
                    required
                    minlength="10"
                    maxlength="2000"
                    placeholder="Cuéntanos en qué te podemos ayudar…"
                    class="w-full pl-9 pr-3 py-2.5 rounded-lg border border-brand-border bg-white text-brand-text text-sm placeholder:text-brand-azulgris/60 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition resize-y"
                  />
                </div>
                <p class="mt-1.5 text-xs text-brand-text-soft text-right">
                  {{ remaining }} caracteres restantes
                </p>
              </div>

              <label class="flex items-start gap-3 cursor-pointer select-none">
                <input
                  v-model="form.termsAccepted"
                  type="checkbox"
                  required
                  class="mt-0.5 rounded border-brand-border text-brand-primary focus:ring-brand-primary/40"
                />
                <span class="text-sm text-brand-text-soft leading-relaxed">
                  Acepto la
                  <a href="/privacidad" class="font-semibold text-brand-primary hover:text-brand-primary-dark transition underline">
                    Política de privacidad
                  </a>
                  y autorizo a Mandaditoz a contactarme por este medio.
                </span>
              </label>

              <div
                v-if="error"
                class="flex items-start gap-3 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800"
                role="alert"
              >
                <AlertCircle class="size-5 shrink-0 text-red-500 mt-0.5" />
                <span>{{ error }}</span>
              </div>

              <button
                type="submit"
                :disabled="!canSubmit"
                class="btn-primary w-full sm:w-auto inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
              >
                <template v-if="loading">
                  <svg class="animate-spin size-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" opacity="0.25" />
                    <path d="M4 12a8 8 0 018-8" stroke="currentColor" stroke-width="4" stroke-linecap="round" />
                  </svg>
                  Enviando…
                </template>
                <template v-else>
                  <Send class="size-4" />
                  Enviar mensaje
                </template>
              </button>
            </form>

          </div>
        </div>

      </div>
    </section>

  </main>
</template>

<script setup>
definePageMeta({ layout: 'landing' })

useHead({
  title: 'Términos de uso · Mandaditoz',
  meta: [{ name: 'description', content: 'Términos de uso del directorio Mandaditoz.' }],
})

const lastUpdated = '7 de julio de 2026'
</script>

<template>
  <div class="min-h-screen bg-white">
    <div class="max-w-3xl mx-auto px-4 md:px-8 py-12 md:py-16">

      <div class="mb-10">
        <p class="text-xs font-bold tracking-widest uppercase text-brand-primary mb-3">Legal</p>
        <h1 class="font-display font-black text-3xl md:text-4xl text-brand-text mb-3">Términos de uso</h1>
        <p class="text-brand-azulgris text-sm">Última actualización: {{ lastUpdated }}</p>
      </div>

      <div class="prose prose-slate max-w-none space-y-8 text-brand-text">

        <section>
          <h2 class="font-display font-black text-xl mb-3">1. Aceptación</h2>
          <p class="text-sm leading-relaxed text-brand-azulgris">
            Al usar Mandaditoz (el "Servicio") o publicar un negocio en el directorio, aceptas estos Términos de uso.
            Si no estás de acuerdo, no uses el Servicio.
          </p>
        </section>

        <section>
          <h2 class="font-display font-black text-xl mb-3">2. Descripción del Servicio</h2>
          <p class="text-sm leading-relaxed text-brand-azulgris">
            Mandaditoz es un directorio gratuito de negocios locales. Cualquier persona puede enviar una solicitud
            para publicar un negocio; un administrador revisa la información antes de hacerla visible en el directorio.
          </p>
        </section>

        <section>
          <h2 class="font-display font-black text-xl mb-3">3. Contenido enviado por usuarios</h2>
          <p class="text-sm leading-relaxed text-brand-azulgris mb-2">
            Al enviar información de un negocio garantizas que:
          </p>
          <ul class="list-disc pl-6 space-y-1.5 text-sm text-brand-azulgris">
            <li>Tienes derecho a compartir los datos, imágenes y menú que subes.</li>
            <li>La información es veraz y actualizada al momento del envío.</li>
            <li>No incluyes contenido ilegal, engañoso, ofensivo o que infrinja derechos de terceros.</li>
          </ul>
          <p class="text-sm leading-relaxed text-brand-azulgris mt-2">
            Mandaditoz puede editar, rechazar o retirar cualquier contenido a su discreción.
          </p>
        </section>

        <section>
          <h2 class="font-display font-black text-xl mb-3">4. Cuentas y reclamación de negocios</h2>
          <p class="text-sm leading-relaxed text-brand-azulgris">
            Si eres el dueño o representante autorizado de un negocio publicado, puedes crear una cuenta y reclamarlo
            para administrarlo directamente. La reclamación está sujeta a verificación por parte de Mandaditoz.
          </p>
        </section>

        <section>
          <h2 class="font-display font-black text-xl mb-3">5. Uso permitido</h2>
          <p class="text-sm leading-relaxed text-brand-azulgris">
            No debes usar el Servicio para actividades ilegales, spam, scraping automatizado no autorizado, ni para
            saturar los formularios con envíos falsos o de prueba en producción.
          </p>
        </section>

        <section>
          <h2 class="font-display font-black text-xl mb-3">6. Propiedad intelectual</h2>
          <p class="text-sm leading-relaxed text-brand-azulgris">
            La marca, el diseño y el software de Mandaditoz pertenecen a sus creadores. El contenido enviado por
            usuarios (nombres de negocio, fotos, menú) sigue siendo propiedad de sus titulares; nos otorgas una
            licencia no exclusiva para mostrarlo en el directorio.
          </p>
        </section>

        <section>
          <h2 class="font-display font-black text-xl mb-3">7. Limitación de responsabilidad</h2>
          <p class="text-sm leading-relaxed text-brand-azulgris">
            El Servicio se ofrece "tal cual". Mandaditoz no se responsabiliza por la exactitud de la información
            publicada por terceros ni por daños derivados del uso del directorio.
          </p>
        </section>

        <section>
          <h2 class="font-display font-black text-xl mb-3">8. Cambios a estos Términos</h2>
          <p class="text-sm leading-relaxed text-brand-azulgris">
            Podemos actualizar estos Términos en cualquier momento. La versión vigente aparecerá siempre en esta página
            con la fecha de última actualización.
          </p>
        </section>

        <section>
          <h2 class="font-display font-black text-xl mb-3">9. Contacto</h2>
          <p class="text-sm leading-relaxed text-brand-azulgris">
            Para dudas sobre estos Términos escríbenos a
            <a href="mailto:hola@mandaditoz.com" class="text-brand-primary font-semibold underline hover:opacity-80">hola@mandaditoz.com</a>.
          </p>
        </section>

      </div>

      <div class="mt-12 pt-6 border-t border-gray-100 flex flex-wrap gap-4 text-sm">
        <NuxtLink to="/privacidad" class="text-brand-primary font-semibold hover:opacity-80">Política de privacidad</NuxtLink>
        <NuxtLink to="/" class="text-brand-azulgris hover:text-brand-text">Volver al inicio</NuxtLink>
      </div>

    </div>
  </div>
</template>

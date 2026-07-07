<script setup>
definePageMeta({ layout: 'landing' })

useHead({
  title: 'Política de privacidad · Mandaditoz',
  meta: [{ name: 'description', content: 'Política de privacidad de Mandaditoz.' }],
})

const lastUpdated = '7 de julio de 2026'
</script>

<template>
  <div class="min-h-screen bg-white">
    <div class="max-w-3xl mx-auto px-4 md:px-8 py-12 md:py-16">

      <div class="mb-10">
        <p class="text-xs font-bold tracking-widest uppercase text-brand-primary mb-3">Legal</p>
        <h1 class="font-display font-black text-3xl md:text-4xl text-brand-text mb-3">Política de privacidad</h1>
        <p class="text-brand-azulgris text-sm">Última actualización: {{ lastUpdated }}</p>
      </div>

      <div class="prose prose-slate max-w-none space-y-8 text-brand-text">

        <section>
          <h2 class="font-display font-black text-xl mb-3">1. Quiénes somos</h2>
          <p class="text-sm leading-relaxed text-brand-azulgris">
            Mandaditoz es un directorio local de negocios operado en México. Esta política explica qué datos
            personales recopilamos, cómo los usamos y qué derechos tienes sobre ellos.
          </p>
        </section>

        <section>
          <h2 class="font-display font-black text-xl mb-3">2. Qué datos recopilamos</h2>

          <h3 class="font-semibold text-brand-text mt-4 mb-2">Del negocio publicado</h3>
          <ul class="list-disc pl-6 space-y-1.5 text-sm text-brand-azulgris">
            <li>Nombre del negocio, categoría, descripción, dirección (opcional), teléfono, email, sitio web y horarios.</li>
            <li>Métodos de pago aceptados y si es un negocio ambulante.</li>
            <li>Logo, menú (PDF o imágenes) y otros archivos que subas.</li>
          </ul>

          <h3 class="font-semibold text-brand-text mt-4 mb-2">De quien envía la solicitud</h3>
          <ul class="list-disc pl-6 space-y-1.5 text-sm text-brand-azulgris">
            <li>Nombre, email y teléfono de contacto — <strong>solo para uso interno del administrador</strong>. No se muestran públicamente en el directorio.</li>
            <li>Fecha y hora de aceptación de estos términos.</li>
          </ul>

          <h3 class="font-semibold text-brand-text mt-4 mb-2">Datos técnicos</h3>
          <ul class="list-disc pl-6 space-y-1.5 text-sm text-brand-azulgris">
            <li>Dirección IP, usada temporalmente para rate limiting y prevención de abuso.</li>
            <li>Cookies mínimas para recordar el municipio activo del navegador.</li>
          </ul>
        </section>

        <section>
          <h2 class="font-display font-black text-xl mb-3">3. Para qué usamos los datos</h2>
          <ul class="list-disc pl-6 space-y-1.5 text-sm text-brand-azulgris">
            <li>Publicar la información del negocio en el directorio (datos del negocio).</li>
            <li>Contactar al submitter si necesitamos aclarar algo antes de publicar (datos del submitter).</li>
            <li>Notificar al submitter cuando su solicitud es aprobada (email transaccional).</li>
            <li>Prevenir abuso del formulario público (IP, timestamps).</li>
          </ul>
          <p class="text-sm leading-relaxed text-brand-azulgris mt-3">
            No vendemos ni cedemos datos personales a terceros para fines publicitarios.
          </p>
        </section>

        <section>
          <h2 class="font-display font-black text-xl mb-3">4. Cuánto tiempo guardamos los datos</h2>
          <ul class="list-disc pl-6 space-y-1.5 text-sm text-brand-azulgris">
            <li>Datos del negocio publicado: mientras la ficha esté activa en el directorio.</li>
            <li>Datos del submitter: se conservan asociados al negocio para trazabilidad; puedes solicitar su borrado (ver punto 6).</li>
            <li>Archivos huérfanos (subidos y no asociados a ningún negocio en 24h): se eliminan automáticamente.</li>
            <li>Registros de IP para rate limiting: se retienen en memoria por 1 hora, no se persisten.</li>
          </ul>
        </section>

        <section>
          <h2 class="font-display font-black text-xl mb-3">5. Con quién compartimos</h2>
          <p class="text-sm leading-relaxed text-brand-azulgris">
            La información pública del negocio se muestra a cualquier visitante del directorio. Los datos del submitter
            solo son visibles para los administradores. Utilizamos proveedores estándar (Gmail SMTP para envío de emails,
            hosting) que procesan datos únicamente para prestar el servicio.
          </p>
        </section>

        <section>
          <h2 class="font-display font-black text-xl mb-3">6. Tus derechos</h2>
          <p class="text-sm leading-relaxed text-brand-azulgris mb-2">
            De acuerdo con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP)
            tienes derecho a:
          </p>
          <ul class="list-disc pl-6 space-y-1.5 text-sm text-brand-azulgris">
            <li><strong>Acceder</strong> a los datos que tenemos sobre ti.</li>
            <li><strong>Rectificar</strong> información incorrecta.</li>
            <li><strong>Cancelar</strong> (borrar) tus datos personales.</li>
            <li><strong>Oponerte</strong> al uso de tus datos para fines específicos.</li>
          </ul>
          <p class="text-sm leading-relaxed text-brand-azulgris mt-3">
            Escríbenos a
            <a href="mailto:hola@mandaditoz.com" class="text-brand-primary font-semibold underline hover:opacity-80">hola@mandaditoz.com</a>
            para ejercer cualquiera de estos derechos.
          </p>
        </section>

        <section>
          <h2 class="font-display font-black text-xl mb-3">7. Cookies</h2>
          <p class="text-sm leading-relaxed text-brand-azulgris">
            Usamos una cookie llamada <code class="bg-slate-100 px-1.5 py-0.5 rounded text-xs">city:active</code> para
            recordar qué municipio elegiste ver en el directorio. No usamos cookies de analítica ni publicidad de terceros.
          </p>
        </section>

        <section>
          <h2 class="font-display font-black text-xl mb-3">8. Cambios a esta política</h2>
          <p class="text-sm leading-relaxed text-brand-azulgris">
            Cualquier actualización se publicará en esta página con la nueva fecha de "Última actualización". Si el
            cambio es material te avisaremos por email cuando corresponda.
          </p>
        </section>

        <section>
          <h2 class="font-display font-black text-xl mb-3">9. Contacto</h2>
          <p class="text-sm leading-relaxed text-brand-azulgris">
            Para dudas sobre privacidad escríbenos a
            <a href="mailto:hola@mandaditoz.com" class="text-brand-primary font-semibold underline hover:opacity-80">hola@mandaditoz.com</a>.
          </p>
        </section>

      </div>

      <div class="mt-12 pt-6 border-t border-gray-100 flex flex-wrap gap-4 text-sm">
        <NuxtLink to="/terminos" class="text-brand-primary font-semibold hover:opacity-80">Términos de uso</NuxtLink>
        <NuxtLink to="/" class="text-brand-azulgris hover:text-brand-text">Volver al inicio</NuxtLink>
      </div>

    </div>
  </div>
</template>

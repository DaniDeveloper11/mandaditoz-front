<script setup>
import MenuItemCard from './MenuItemCard.vue'

const props = defineProps({
  sections: { type: Array, default: () => [] },
  /**
   * Modo lectura por defecto. La Fase 4 lo enciende para mostrar los botones
   * de agregar al carrito sin tocar este componente.
   */
  orderable: { type: Boolean, default: false },
})

const emit = defineEmits(['add'])

const visibleSections = computed(() =>
  props.sections.filter(s => s.items?.length > 0)
)

const itemCount = computed(() =>
  visibleSections.value.reduce((acc, s) => acc + s.items.length, 0)
)

function sectionAnchor(section) {
  return `menu-seccion-${section.documentId ?? section.id}`
}

function scrollToSection(section) {
  const el = document.getElementById(sectionAnchor(section))
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <div>
    <!-- Navegación rápida entre secciones -->
    <div
      v-if="visibleSections.length > 1"
      class="flex gap-2 overflow-x-auto no-scrollbar pb-3 -mx-1 px-1"
    >
      <button
        v-for="section in visibleSections"
        :key="section.id"
        type="button"
        class="chip bg-brand-bg-dark/5 text-brand-text hover:bg-brand-primary/10 whitespace-nowrap shrink-0"
        @click="scrollToSection(section)"
      >
        {{ section.name }}
      </button>
    </div>

    <div class="space-y-8">
      <section
        v-for="section in visibleSections"
        :key="section.id"
        :id="sectionAnchor(section)"
        class="scroll-mt-24"
      >
        <h3 class="font-display font-black text-lg text-brand-text">
          {{ section.name }}
        </h3>
        <p
          v-if="section.description"
          class="mt-1 text-sm text-brand-azulgris"
        >
          {{ section.description }}
        </p>

        <div class="mt-2 divide-y divide-brand-border">
          <MenuItemCard
            v-for="item in section.items"
            :key="item.id"
            :item="item"
            :orderable="orderable"
            @add="emit('add', $event)"
          />
        </div>
      </section>
    </div>

    <p class="mt-8 text-xs text-brand-azulgris">
      {{ itemCount }} {{ itemCount === 1 ? 'platillo' : 'platillos' }} ·
      Los precios pueden cambiar sin previo aviso.
    </p>
  </div>
</template>

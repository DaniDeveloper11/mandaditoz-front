import { defineStore } from 'pinia'
import { ref } from 'vue'

const DEFAULT_FILTROS = {
  query: '',
  categoria: null,
  ciudad: null,
  colonia: null,
  priceLevel: null,
  soloVerificados: false,
  isFeatured: false,
  orden: 'rating',
  pagina: 1,
  porPagina: 12,
}

export const useSearchStore = defineStore('search', () => {
  const filtros = ref({ ...DEFAULT_FILTROS })

  function setQuery(q) {
    filtros.value.query = q
    filtros.value.pagina = 1
  }

  function setCategoria(slug) {
    filtros.value.categoria = slug
    filtros.value.pagina = 1
  }

  function setCiudad(slug) {
    filtros.value.ciudad = slug
    filtros.value.colonia = null
    filtros.value.pagina = 1
  }

  function setColonia(slug) {
    filtros.value.colonia = slug
    filtros.value.pagina = 1
  }

  function setPriceLevel(level) {
    filtros.value.priceLevel = level
    filtros.value.pagina = 1
  }

  function setOrden(orden) {
    filtros.value.orden = orden
    filtros.value.pagina = 1
  }

  function toggleVerificados() {
    filtros.value.soloVerificados = !filtros.value.soloVerificados
    filtros.value.pagina = 1
  }

  function toggleDestacados() {
    filtros.value.isFeatured = !filtros.value.isFeatured
    filtros.value.pagina = 1
  }

  function setPorPagina(n) {
    filtros.value.porPagina = n
    filtros.value.pagina = 1
  }

  function setPagina(n) {
    filtros.value.pagina = n
  }

  function reset() {
    filtros.value = { ...DEFAULT_FILTROS }
  }

  return {
    filtros,
    setQuery,
    setCategoria,
    setCiudad,
    setColonia,
    setPriceLevel,
    setOrden,
    setPorPagina,
    toggleVerificados,
    toggleDestacados,
    setPagina,
    reset,
  }
})

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
  abiertosAhora: false,
  orden: 'rating',
  pagina: 1,
  porPagina: 12,
}

export const useSearchStore = defineStore('search', () => {
  const filtros = ref({ ...DEFAULT_FILTROS })

  // Con texto, el orden natural es por relevancia; sin texto, "relevancia" no
  // significa nada y se vuelve al default. Solo se toca el orden si el usuario
  // no eligió otro a mano.
  function ajustarOrden() {
    const hayTexto = !!filtros.value.query?.trim()
    if (hayTexto && filtros.value.orden === DEFAULT_FILTROS.orden) {
      filtros.value.orden = 'relevancia'
    } else if (!hayTexto && filtros.value.orden === 'relevancia') {
      filtros.value.orden = DEFAULT_FILTROS.orden
    }
  }

  // Refinar dentro de /list: conserva categoría y demás filtros.
  function setQuery(q) {
    filtros.value.query = q
    filtros.value.pagina = 1
    ajustarOrden()
  }

  function setCategoria(slug) {
    filtros.value.categoria = slug
    filtros.value.pagina = 1
  }

  // Búsqueda nueva desde fuera de /list (buscador del home): el store
  // sobrevive a la navegación, y sin esto la categoría de la visita anterior
  // filtraba la búsqueda nueva sin que se viera por qué.
  function nuevaBusqueda(q) {
    filtros.value.categoria = null
    setQuery(q)
  }

  // Entrar a una categoría desde un menú o el home: misma razón, al revés —
  // la búsqueda anterior se quedaba pegada a la categoría.
  function verCategoria(slug) {
    filtros.value.query = ''
    setCategoria(slug)
    ajustarOrden()
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

  function toggleAbiertos() {
    filtros.value.abiertosAhora = !filtros.value.abiertosAhora
    filtros.value.pagina = 1
  }

  function setAbiertos(valor) {
    filtros.value.abiertosAhora = !!valor
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
    nuevaBusqueda,
    verCategoria,
    setCiudad,
    setColonia,
    setPriceLevel,
    setOrden,
    setPorPagina,
    toggleVerificados,
    toggleDestacados,
    toggleAbiertos,
    setAbiertos,
    setPagina,
    reset,
  }
})

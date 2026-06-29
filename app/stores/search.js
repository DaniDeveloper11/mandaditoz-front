import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSearchStore = defineStore('search', () => {
  const filtros = ref({
    query: '',
    categoria: null,
    soloVerificados: false,
    orden: 'rating',
    pagina: 1,
    porPagina: 12,
  })

  function setQuery(q) {
    filtros.value.query = q
    filtros.value.pagina = 1
  }

  function setCategoria(slug) {
    filtros.value.categoria = slug
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

  function setPorPagina(n) {
    filtros.value.porPagina = n
    filtros.value.pagina = 1
  }

  function setPagina(n) {
    filtros.value.pagina = n
  }

  function reset() {
    filtros.value = {
      query: '',
      categoria: null,
      soloVerificados: false,
      orden: 'rating',
      pagina: 1,
      porPagina: 12,
    }
  }

  return { filtros, setQuery, setCategoria, setOrden, setPorPagina, toggleVerificados, setPagina, reset }
})

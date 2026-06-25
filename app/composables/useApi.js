export function useApi() {
  const config = useRuntimeConfig()
  const base = config.public.apiBase

  function get(path, query) {
    return useFetch(`${base}${path}`, {
      query,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return { get }
}

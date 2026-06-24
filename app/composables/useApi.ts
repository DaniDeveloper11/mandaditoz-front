export function useApi() {
  const config = useRuntimeConfig()
  const base = config.public.apiBase

  function get<T>(path: string, query?: Record<string, unknown>) {
    return useFetch<T>(`${base}${path}`, {
      query,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return { get }
}

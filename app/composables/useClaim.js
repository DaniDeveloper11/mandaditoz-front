export function useClaim() {
  const config = useRuntimeConfig()
  const { token } = useAuthStore()

  async function submitClaim({ businessDocumentId, claimantName, claimantRole, claimantPhone, notes }) {
    console.log("token dentro de submitClaim",token)
    if (!token) throw new Error('No autenticado')

    return $fetch(`${config.public.apiBase}/claims`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: {
        data: {
          business: businessDocumentId,
          claimantName,
          claimantRole,
          claimantPhone,
          notes,
        },
      },
    })
  }

  return { submitClaim }
}

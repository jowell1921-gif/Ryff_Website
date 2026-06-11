import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

export function GoogleCallbackPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      const encoded = params.get('data')
      console.log('[Google Callback] full URL:', window.location.href)
      console.log('[Google Callback] encoded param:', encoded?.slice(0, 80))
      if (!encoded) {
        console.error('[Google Callback] No data param in URL')
        navigate('/auth/login', { replace: true })
        return
      }

      const parsed = JSON.parse(decodeURIComponent(encoded))
      console.log('[Google Callback] parsed:', parsed)
      const { user, tokens } = parsed
      setAuth(user, tokens)
      window.location.href = '/feed'
    } catch (err) {
      console.error('[Google Callback] Error:', err)
      navigate('/auth/login', { replace: true })
    }
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: 16 }}>
      <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-[var(--color-text-muted)]" style={{ fontSize: 14 }}>Iniciando sesión con Google...</p>
    </div>
  )
}

import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  // Si no está logueado, redirige al login
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />
  }

  // Si está logueado, renderiza la página solicitada
  return <Outlet />
}

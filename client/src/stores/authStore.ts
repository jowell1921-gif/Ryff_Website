import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, AuthTokens } from '@/types/auth.types'

interface AuthState {
  // --- Estado ---
  user: User | null
  tokens: AuthTokens | null

  // --- Computed ---
  isAuthenticated: boolean

  // --- Acciones ---
  setAuth: (user: User, tokens: AuthTokens) => void
  updateUser: (partial: Partial<User>) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Estado inicial — no hay nadie logueado
      user: null,
      tokens: null,
      isAuthenticated: false,

      // Se llama cuando el login o registro es exitoso
      setAuth: (user, tokens) =>
        set({
          user,
          tokens,
          isAuthenticated: true,
        }),

      // Actualiza datos del perfil sin perder el resto del estado
      updateUser: (partial) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partial } : null,
        })),

      // Limpia todo — cierra la sesión
      logout: () =>
        set({
          user: null,
          tokens: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'ryff-auth', // clave en localStorage
      // Solo persistimos lo necesario — nunca el estado completo
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

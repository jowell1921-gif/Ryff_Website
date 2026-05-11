import { api } from '@/lib/api'
import type { AuthResponse, LoginDto, RegisterDto } from '@/types/auth.types'

export const authService = {
  login: async (dto: LoginDto): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/login', dto)
    return data
  },

  register: async (dto: RegisterDto): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/register', dto)
    return data
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout')
  },

  getMe: async () => {
    const { data } = await api.get('/auth/me')
    return data
  },
}

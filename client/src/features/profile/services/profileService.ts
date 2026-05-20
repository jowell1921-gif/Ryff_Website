import { api } from '@/lib/api'
import type { UserProfile, UserSuggestion } from '@/types/user.types'
import type { Post } from '@/types/post.types'

export interface SearchUsersParams {
  search?: string
  instrument?: string
  genre?: string
}

export const profileService = {
  getProfile: async (userId: string): Promise<UserProfile> => {
    const { data } = await api.get<UserProfile>(`/users/${userId}`)
    return data
  },

  updateProfile: async (dto: Partial<UserProfile>): Promise<UserProfile> => {
    const { data } = await api.patch<UserProfile>('/users/me', dto)
    return data
  },

  getUserPosts: async (userId: string): Promise<Post[]> => {
    const { data } = await api.get<Post[]>(`/users/${userId}/posts`)
    return data
  },

  followUser: async (userId: string): Promise<void> => {
    await api.post(`/users/${userId}/follow`)
  },

  unfollowUser: async (userId: string): Promise<void> => {
    await api.delete(`/users/${userId}/follow`)
  },

  searchUsers: async (params: SearchUsersParams): Promise<UserProfile[]> => {
    const { data } = await api.get<UserProfile[]>('/users', { params })
    return data
  },

  getSuggestions: async (): Promise<UserSuggestion[]> => {
    const { data } = await api.get<UserSuggestion[]>('/users/suggestions')
    return data
  },

  uploadAvatar: async (file: File): Promise<{ avatar: string }> => {
    const formData = new FormData()
    formData.append('avatar', file)
    const { data } = await api.post<{ avatar: string }>('/users/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },
}

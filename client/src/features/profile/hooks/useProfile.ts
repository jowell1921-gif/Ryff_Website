import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { profileService, type SearchUsersParams } from '../services/profileService'
import { useAuthStore } from '@/stores/authStore'
import type { UserProfile } from '@/types/user.types'

export function useProfile(userId: string) {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: () => profileService.getProfile(userId),
    enabled: !!userId,
  })
}

export function useUserPosts(userId: string) {
  return useQuery({
    queryKey: ['userPosts', userId],
    queryFn: () => profileService.getUserPosts(userId),
    enabled: !!userId,
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const updateUser = useAuthStore((state) => state.updateUser)

  return useMutation({
    mutationFn: profileService.updateProfile,
    onSuccess: (updatedProfile) => {
      updateUser({
        name: updatedProfile.name,
        bio: updatedProfile.bio,
        location: updatedProfile.location,
        instruments: updatedProfile.instruments,
        genres: updatedProfile.genres,
      })
      queryClient.setQueryData(['profile', user?.id], updatedProfile)
    },
  })
}

export function useFollowUser(targetUserId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => profileService.followUser(targetUserId),

    // Optimistic update: actualizamos el cache ANTES de que el servidor responda
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['profile', targetUserId] })
      const previous = queryClient.getQueryData<UserProfile>(['profile', targetUserId])

      if (previous) {
        queryClient.setQueryData<UserProfile>(['profile', targetUserId], {
          ...previous,
          isFollowing: true,
          _count: { ...previous._count, followers: previous._count.followers + 1 },
        })
      }

      return { previous }
    },

    // Si falla, revertimos al estado anterior
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['profile', targetUserId], context.previous)
      }
    },

    // Después de todo (éxito o error), sincronizamos con el servidor
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', targetUserId] })
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export function useUnfollowUser(targetUserId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => profileService.unfollowUser(targetUserId),

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['profile', targetUserId] })
      const previous = queryClient.getQueryData<UserProfile>(['profile', targetUserId])

      if (previous) {
        queryClient.setQueryData<UserProfile>(['profile', targetUserId], {
          ...previous,
          isFollowing: false,
          _count: {
            ...previous._count,
            followers: Math.max(0, previous._count.followers - 1),
          },
        })
      }

      return { previous }
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['profile', targetUserId], context.previous)
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', targetUserId] })
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export function useSearchUsers(params: SearchUsersParams) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => profileService.searchUsers(params),
  })
}

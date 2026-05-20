import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { notificationService } from '../services/notificationService'
import { useNotificationStore } from '@/stores/notificationStore'

export function useNotifications() {
  const setUnreadNotifications = useNotificationStore((s) => s.setUnreadNotifications)

  const query = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationService.getAll,
  })

  // Sincroniza el store con el conteo real del servidor al cargar
  const countQuery = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: notificationService.getUnreadCount,
  })

  useEffect(() => {
    if (countQuery.data) {
      setUnreadNotifications(countQuery.data.count)
    }
  }, [countQuery.data, setUnreadNotifications])

  return query
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient()
  const clearUnreadNotifications = useNotificationStore((s) => s.clearUnreadNotifications)

  return useMutation({
    mutationFn: notificationService.markAllAsRead,
    onSuccess: () => {
      clearUnreadNotifications()
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

export function useTogglePostLike() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ postId, isLiked }: { postId: string; isLiked: boolean }) =>
      isLiked
        ? fetch(`/api/posts/${postId}/like`, { method: 'DELETE' }) // se maneja en postService
        : fetch(`/api/posts/${postId}/like`, { method: 'POST' }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['posts'] }),
  })
}

import { api } from '@/lib/api'
import type { AppNotification } from '@/types/notification.types'

export const notificationService = {
  getAll: () =>
    api.get<AppNotification[]>('/notifications').then((r) => r.data),

  getUnreadCount: () =>
    api.get<{ count: number }>('/notifications/unread-count').then((r) => r.data),

  markAllAsRead: () =>
    api.patch('/notifications/read-all').then((r) => r.data),
}

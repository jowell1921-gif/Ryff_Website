import { create } from 'zustand'
import type { AppNotification } from '@/types/notification.types'

interface ToastMessage {
  conversationId: string
  senderName: string
  senderAvatar: string | null
  content: string
}

interface NotificationState {
  // Chat
  unreadCounts: Record<string, number>
  toast: ToastMessage | null
  addUnread: (conversationId: string) => void
  clearUnread: (conversationId: string) => void
  totalUnread: () => number
  setToast: (toast: ToastMessage) => void
  clearToast: () => void

  // Notificaciones de la app
  unreadNotifications: number
  setUnreadNotifications: (count: number) => void
  incrementUnreadNotifications: () => void
  clearUnreadNotifications: () => void
  pendingNotification: AppNotification | null
  setPendingNotification: (n: AppNotification) => void
  clearPendingNotification: () => void
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  // Chat
  unreadCounts: {},
  toast: null,

  addUnread: (conversationId) =>
    set((state) => ({
      unreadCounts: {
        ...state.unreadCounts,
        [conversationId]: (state.unreadCounts[conversationId] ?? 0) + 1,
      },
    })),

  clearUnread: (conversationId) =>
    set((state) => {
      const next = { ...state.unreadCounts }
      delete next[conversationId]
      return { unreadCounts: next }
    }),

  totalUnread: () =>
    Object.values(get().unreadCounts).reduce((sum, n) => sum + n, 0),

  setToast: (toast) => set({ toast }),
  clearToast: () => set({ toast: null }),

  // Notificaciones
  unreadNotifications: 0,
  setUnreadNotifications: (count) => set({ unreadNotifications: count }),
  incrementUnreadNotifications: () =>
    set((state) => ({ unreadNotifications: state.unreadNotifications + 1 })),
  clearUnreadNotifications: () => set({ unreadNotifications: 0 }),
  pendingNotification: null,
  setPendingNotification: (n) => set({ pendingNotification: n }),
  clearPendingNotification: () => set({ pendingNotification: null }),
}))

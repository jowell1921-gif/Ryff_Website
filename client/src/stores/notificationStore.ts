import { create } from 'zustand'

interface ToastMessage {
  conversationId: string
  senderName: string
  senderAvatar: string | null
  content: string
}

interface NotificationState {
  unreadCounts: Record<string, number>
  toast: ToastMessage | null
  addUnread: (conversationId: string) => void
  clearUnread: (conversationId: string) => void
  totalUnread: () => number
  setToast: (toast: ToastMessage) => void
  clearToast: () => void
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
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
}))

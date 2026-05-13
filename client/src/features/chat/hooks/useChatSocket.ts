import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import { useNotificationStore } from '@/stores/notificationStore'
import { socketClient } from '../socket/socketClient'
import type { ChatMessage } from '@/types/chat.types'

export function useChatSocket() {
  const queryClient = useQueryClient()
  const tokens = useAuthStore((s) => s.tokens)
  const addUnread = useNotificationStore((s) => s.addUnread)
  const setToast = useNotificationStore((s) => s.setToast)

  useEffect(() => {
    if (!tokens?.accessToken) return

    const socket = socketClient.connect(tokens.accessToken)

    socket.on('connect', () => console.log('[socket] conectado, id:', socket.id))
    socket.on('connect_error', (err) => console.error('[socket] error de conexión:', err.message))

    const handleNewMessage = (message: ChatMessage) => {
      console.log('[socket] newMessage recibido:', message.id, 'conversación:', message.conversationId)
      console.log('[socket] pathname actual:', window.location.pathname)
      // 1. Actualiza el cache — evita duplicados si el mensaje llega
      //    tanto por la room de conversación como por la room personal
      queryClient.setQueryData<ChatMessage[]>(
        ['messages', message.conversationId],
        (old) => {
          if (old?.some((m) => m.id === message.id)) return old
          return [...(old ?? []), message]
        },
      )
      // 2. Refresca la lista de conversaciones (preview del último mensaje)
      queryClient.invalidateQueries({ queryKey: ['conversations'] })

      // 3. Si el usuario NO está viendo esa conversación: notificar
      const isViewingConversation = window.location.pathname.includes(message.conversationId)
      console.log('[socket] isViewingConversation:', isViewingConversation)
      if (!isViewingConversation) {
        addUnread(message.conversationId)

        const toastData = {
          conversationId: message.conversationId,
          senderName: message.sender.name,
          senderAvatar: message.sender.avatar,
          content: message.content,
        }
        console.log('[toast] llamando setToast con:', toastData)
        // Toast in-app
        setToast(toastData)

        // Notificación del navegador (si el usuario dio permiso y la pestaña no está activa)
        if (
          Notification.permission === 'granted' &&
          document.visibilityState === 'hidden'
        ) {
          new Notification(message.sender.name, {
            body: message.content,
            icon: message.sender.avatar ?? '/vite.svg',
          })
        }
      }
    }

    socket.on('newMessage', handleNewMessage)

    return () => {
      socket.off('newMessage', handleNewMessage)
      socketClient.disconnect()
    }
  }, [tokens?.accessToken, queryClient, addUnread, setToast])
}

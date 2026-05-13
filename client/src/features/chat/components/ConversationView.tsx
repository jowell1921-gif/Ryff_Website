import { useState, useEffect, useRef, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Send, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Avatar } from '@/components/ui/Avatar'
import { MessageBubble } from './MessageBubble'
import { chatService } from '../services/chatService'
import { socketClient } from '../socket/socketClient'
import { useAuthStore } from '@/stores/authStore'
import { useNotificationStore } from '@/stores/notificationStore'
import type { Conversation, ChatMessage } from '@/types/chat.types'

interface ConversationViewProps {
  conversation: Conversation
}

export function ConversationView({ conversation }: ConversationViewProps) {
  const navigate = useNavigate()
  const currentUserId = useAuthStore((s) => s.user?.id)
  const [input, setInput] = useState('')
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const other = conversation.participants.find((p) => p.id !== currentUserId)
  const clearUnread = useNotificationStore((s) => s.clearUnread)

  // Al abrir la conversación, marca todos sus mensajes como leídos
  useEffect(() => {
    clearUnread(conversation.id)
  }, [conversation.id, clearUnread])

  // Carga el historial de mensajes via REST
  const { data: messages = [] } = useQuery<ChatMessage[]>({
    queryKey: ['messages', conversation.id],
    queryFn: () => chatService.getMessages(conversation.id),
  })

  // Al entrar, unirse a la room de esta conversación
  useEffect(() => {
    const socket = socketClient.get()
    if (!socket) return

    socket.emit('joinConversation', conversation.id)

    // Escucha el indicador de escritura de los demás
    const handleTyping = ({ userId, isTyping }: { userId: string; isTyping: boolean }) => {
      setTypingUsers((prev) =>
        isTyping ? [...new Set([...prev, userId])] : prev.filter((id) => id !== userId),
      )
    }

    socket.on('typing', handleTyping)

    return () => {
      socket.emit('leaveConversation', conversation.id)
      socket.off('typing', handleTyping)
    }
  }, [conversation.id])

  // Auto-scroll al llegar mensajes nuevos
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Emite el evento typing (con debounce para no saturar)
  const emitTyping = useCallback(
    (isTyping: boolean) => {
      socketClient.get()?.emit('typing', { conversationId: conversation.id, isTyping })
    },
    [conversation.id],
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
    emitTyping(true)
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
    typingTimerRef.current = setTimeout(() => emitTyping(false), 1500)
  }

  const sendMessage = () => {
    const content = input.trim()
    if (!content) return

    socketClient.get()?.emit('sendMessage', { conversationId: conversation.id, content })
    setInput('')
    emitTyping(false)
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Nombre del usuario que está escribiendo
  const typingName = typingUsers.length > 0
    ? (conversation.participants.find((p) => p.id === typingUsers[0])?.name ?? 'Alguien')
    : null

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface-2)]">
        <button
          onClick={() => navigate('/messages')}
          className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors md:hidden"
        >
          <ArrowLeft size={18} />
        </button>
        {other && (
          <>
            <Avatar size="sm" src={other.avatar} alt={other.name} isOnline={true} />
            <div>
              <p className="text-sm font-semibold text-[var(--color-text)]">{other.name}</p>
              <p className="text-xs text-green-400">En línea</p>
            </div>
          </>
        )}
      </div>

      {/* Área de mensajes */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2">
        {messages.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-[var(--color-text-muted)]">
              Sé el primero en escribir algo 🎵
            </p>
          </div>
        )}

        {messages.map((msg, index) => {
          // showAvatar: solo cuando el siguiente mensaje es de otro usuario (o es el último)
          const nextMsg = messages[index + 1]
          const showAvatar = !nextMsg || nextMsg.senderId !== msg.senderId

          return (
            <MessageBubble
              key={msg.id}
              message={msg}
              isOwn={msg.senderId === currentUserId}
              showAvatar={showAvatar}
            />
          )
        })}

        {/* Typing indicator */}
        {typingName && (
          <div className="flex items-center gap-2 pl-9">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-[var(--color-text-muted)] animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
            <span className="text-xs text-[var(--color-text-muted)]">{typingName} está escribiendo</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-[var(--color-border)] bg-[var(--color-surface-2)]">
        <div className="flex items-center gap-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-4 py-2 focus-within:border-purple-500 transition-colors">
          <input
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Escribe un mensaje..."
            className="flex-1 bg-transparent text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] outline-none"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            className="text-purple-400 hover:text-purple-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shrink-0"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

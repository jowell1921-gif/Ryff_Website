import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { MessageCircle, SquarePen } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/Avatar'
import { chatService } from '../services/chatService'
import { useAuthStore } from '@/stores/authStore'
import { NewConversationModal } from './NewConversationModal'
import type { Conversation } from '@/types/chat.types'

interface ConversationListProps {
  activeId?: string
}

export function ConversationList({ activeId }: ConversationListProps) {
  const navigate = useNavigate()
  const currentUserId = useAuthStore((s) => s.user?.id)
  const [showNewModal, setShowNewModal] = useState(false)

  const { data: conversations, isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: chatService.getConversations,
  })

  // Devuelve el participante que NO es el usuario logueado
  const getOtherParticipant = (conv: Conversation) =>
    conv.participants.find((p) => p.id !== currentUserId)

  if (isLoading) {
    return (
      <div className="flex flex-col gap-1 p-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-3 rounded-xl animate-pulse">
            <div className="w-10 h-10 rounded-full bg-[var(--color-surface)]" />
            <div className="flex-1 flex flex-col gap-1.5">
              <div className="w-24 h-3 rounded bg-[var(--color-surface)]" />
              <div className="w-36 h-2.5 rounded bg-[var(--color-surface)]" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!conversations?.length) {
    return (
      <div className="flex flex-col items-center justify-center h-40 gap-2 text-center px-4">
        <MessageCircle size={28} className="text-[var(--color-text-muted)] opacity-40" />
        <p className="text-xs text-[var(--color-text-muted)]">
          Ninguna conversación todavía. Visita el perfil de un músico para iniciar un chat.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-0.5 p-2">
      {conversations.map((conv) => {
        const other = getOtherParticipant(conv)
        if (!other) return null
        const lastMsg = conv.messages[0]
        const isActive = conv.id === activeId

        return (
          <button
            key={conv.id}
            onClick={() => navigate(`/messages/${conv.id}`)}
            className={cn(
              'flex items-center gap-3 px-3 py-3 rounded-xl w-full text-left transition-all',
              isActive
                ? 'bg-purple-600/15 text-purple-300'
                : 'hover:bg-[var(--color-surface)] text-[var(--color-text)]',
            )}
          >
            <Avatar size="md" src={other.avatar} alt={other.name} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <p className={cn('text-sm font-semibold truncate', isActive && 'text-purple-300')}>
                  {other.name}
                </p>
                {lastMsg && (
                  <span className="text-[10px] text-[var(--color-text-muted)] shrink-0">
                    {formatDistanceToNow(new Date(lastMsg.createdAt), {
                      addSuffix: false,
                      locale: es,
                    })}
                  </span>
                )}
              </div>
              {lastMsg && (
                <p className="text-xs text-[var(--color-text-muted)] truncate">
                  {lastMsg.senderId === currentUserId ? 'Tú: ' : ''}
                  {lastMsg.content}
                </p>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}

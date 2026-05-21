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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '16px 12px' }}>
      {conversations.map((conv) => {
        const other = getOtherParticipant(conv)
        if (!other) return null
        const lastMsg = conv.messages[0]
        const isActive = conv.id === activeId

        return (
          <button
            key={conv.id}
            onClick={() => navigate(`/messages/${conv.id}`)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 14px',
              borderRadius: 16,
              width: '100%',
              textAlign: 'left',
              border: isActive ? '1px solid rgba(147,51,234,0.45)' : '1px solid var(--color-border)',
              background: isActive ? 'rgba(147,51,234,0.1)' : 'var(--color-surface)',
              transition: 'all 0.2s',
            }}
            className={isActive ? '' : 'hover:border-purple-600/30 hover:bg-[var(--color-surface-2)]'}
          >
            <Avatar size="md" src={other.avatar} alt={other.name} />
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                <p
                  className="truncate"
                  style={{ fontSize: 14, fontWeight: 600, color: isActive ? 'rgb(216,180,254)' : 'var(--color-text)', flex: 1, minWidth: 0 }}
                >
                  {other.name}
                </p>
                {lastMsg && (
                  <span style={{ fontSize: 10, color: 'var(--color-text-muted)', flexShrink: 0 }}>
                    {formatDistanceToNow(new Date(lastMsg.createdAt), { addSuffix: false, locale: es })}
                  </span>
                )}
              </div>
              {lastMsg && (
                <p className="truncate" style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
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

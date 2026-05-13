import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { MessageCircle, SquarePen } from 'lucide-react'
import { ConversationList } from '@/features/chat/components/ConversationList'
import { ConversationView } from '@/features/chat/components/ConversationView'
import { NewConversationModal } from '@/features/chat/components/NewConversationModal'
import { chatService } from '@/features/chat/services/chatService'

export function MessagesPage() {
  const { conversationId } = useParams()
  const [showNewModal, setShowNewModal] = useState(false)

  // Solicita permiso para notificaciones del navegador la primera vez que se abre mensajes
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  // Si hay conversationId en la URL, carga esa conversación
  const { data: activeConversation } = useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: () => chatService.getConversations().then((convs) =>
      convs.find((c) => c.id === conversationId) ?? null
    ),
    enabled: !!conversationId,
  })

  return (
    <div className="flex h-screen">

      {/* Panel izquierdo — lista de conversaciones */}
      <div className={`
        w-72 shrink-0 border-r border-[var(--color-border)] flex flex-col
        ${conversationId ? 'hidden md:flex' : 'flex'}
      `}>
        <div className="px-4 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
          <h1 className="text-base font-bold text-[var(--color-text)]">Mensajes</h1>
          <button
            onClick={() => setShowNewModal(true)}
            className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-purple-300 hover:bg-purple-600/10 transition-all"
            title="Nueva conversación"
          >
            <SquarePen size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <ConversationList activeId={conversationId} />
        </div>
      </div>

      {/* Panel derecho — conversación activa */}
      <div className={`
        flex-1 flex flex-col
        ${conversationId ? 'flex' : 'hidden md:flex'}
      `}>
        {activeConversation ? (
          <ConversationView conversation={activeConversation} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-8">
            <MessageCircle size={48} className="text-[var(--color-text-muted)] opacity-20" />
            <p className="font-semibold text-[var(--color-text)]">Selecciona una conversación</p>
            <p className="text-sm text-[var(--color-text-muted)] max-w-xs">
              O inicia una nueva con el icono <SquarePen size={13} className="inline" /> de la esquina superior izquierda.
            </p>
          </div>
        )}
      </div>
      {showNewModal && (
        <NewConversationModal onClose={() => setShowNewModal(false)} />
      )}
    </div>
  )
}

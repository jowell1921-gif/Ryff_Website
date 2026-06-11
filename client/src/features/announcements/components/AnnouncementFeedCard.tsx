import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { MapPin, Megaphone } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Avatar } from '@/components/ui/Avatar'
import type { Announcement, AnnouncementType } from '@/types/announcement.types'
import { useAuthStore } from '@/stores/authStore'
import { useDeleteAnnouncement } from '../hooks/useAnnouncements'
import { chatService } from '@/features/chat/services/chatService'
import { socketClient } from '@/features/chat/socket/socketClient'

const TYPE_LABELS: Record<AnnouncementType, string> = {
  BUSCO_MUSICO: 'Busco músico',
  BUSCO_BANDA: 'Busco banda',
}

export function AnnouncementFeedCard({ announcement }: { announcement: Announcement }) {
  const currentUserId = useAuthStore((s) => s.user?.id)
  const deleteAnnouncement = useDeleteAnnouncement()
  const isOwn = announcement.author.id === currentUserId
  const timeAgo = formatDistanceToNow(new Date(announcement.createdAt), { addSuffix: true, locale: es })
  const isMusico = announcement.type === 'BUSCO_MUSICO'

  const navigate = useNavigate()
  const [showRequest, setShowRequest] = useState(false)
  const [requestText, setRequestText] = useState('')

  const sendRequest = useMutation({
    mutationFn: async () => {
      const conv = await chatService.getOrCreateConversation(announcement.author.id)
      socketClient.get()?.emit('sendMessage', { conversationId: conv.id, content: requestText.trim() })
      return conv
    },
    onSuccess: (conv) => navigate(`/messages/${conv.id}`),
  })

  return (
    <article
      className="border border-amber-500/20 hover:border-amber-500/40 transition-colors duration-200"
      style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.04), rgba(147,51,234,0.04))', borderRadius: 14, display: 'flex', flexDirection: 'column', gap: 10, padding: 10 }}
    >
      {/* Badge anuncio */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span
          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700 }}
          className={isMusico ? 'bg-purple-600/15 border border-purple-500/30 text-purple-300' : 'bg-blue-600/15 border border-blue-500/30 text-blue-300'}
        >
          <Megaphone size={11} />
          {TYPE_LABELS[announcement.type]}
        </span>
        {isOwn && (
          <button
            onClick={() => deleteAnnouncement.mutate(announcement.id)}
            disabled={deleteAnnouncement.isPending}
            className="text-[var(--color-text-muted)] hover:text-red-400 transition-colors disabled:opacity-50"
            style={{ fontSize: 11 }}
          >
            Eliminar
          </button>
        )}
      </div>

      {/* Cabecera */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Avatar size="md" alt={announcement.author.name} src={announcement.author.avatar} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p className="text-[var(--color-text)]" style={{ fontSize: 14, fontWeight: 600 }}>{announcement.author.name}</p>
          <p className="text-[var(--color-text-muted)]" style={{ fontSize: 12 }}>{timeAgo}</p>
        </div>
      </div>

      {/* Título + descripción */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <h3 className="text-[var(--color-text)]" style={{ fontSize: 15, fontWeight: 700 }}>{announcement.title}</h3>
        <p className="text-[var(--color-text-muted)]" style={{ fontSize: 14, lineHeight: 1.6 }}>{announcement.description}</p>
      </div>

      {/* Instrumentos */}
      {announcement.instruments.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
          <span className="text-[var(--color-text-muted)]" style={{ fontSize: 11, fontWeight: 600, flexShrink: 0, paddingTop: 3 }}>
            Instrumento buscado:
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {announcement.instruments.map((inst) => (
              <span
                key={inst}
                className="rounded-full bg-purple-600 border border-purple-500 font-semibold"
                style={{ padding: '3px 10px', fontSize: 11, color: 'white' }}
              >
                {inst}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Géneros */}
      {announcement.genres.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
          <span className="text-[var(--color-text-muted)]" style={{ fontSize: 11, fontWeight: 600, flexShrink: 0, paddingTop: 3 }}>
            Para tocar:
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {announcement.genres.map((g) => (
              <span
                key={g}
                className="rounded-full border border-purple-500/30 bg-purple-500/10 font-semibold"
                style={{ padding: '3px 10px', fontSize: 11, color: 'white' }}
              >
                {g}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Fila inferior: ubicación + solicitar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {announcement.location ? (
          <p style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }} className="text-[var(--color-text-muted)]">
            <MapPin size={12} />
            {announcement.location}
          </p>
        ) : <span />}
        {!isOwn && (
          <button
            onClick={() => setShowRequest((v) => !v)}
            className="text-purple-400 hover:text-purple-300 transition-colors"
            style={{ fontSize: 12, fontWeight: 600 }}
          >
            Solicitar anuncio
          </button>
        )}
      </div>

      {/* Card de solicitud */}
      {showRequest && (
        <div
          className="border border-[var(--color-border)] bg-[var(--color-surface)]"
          style={{ borderRadius: 12, padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}
        >
          <input
            autoFocus
            value={requestText}
            onChange={(e) => setRequestText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && requestText.trim() && !sendRequest.isPending) {
                e.preventDefault()
                sendRequest.mutate()
              }
            }}
            placeholder="Preséntate y comenta tu interés..."
            className="bg-transparent text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] border border-[var(--color-border)]"
            style={{ borderRadius: 8, padding: '8px 10px', fontSize: 13, outline: 'none', width: '100%' }}
          />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button
              onClick={() => { setShowRequest(false); setRequestText('') }}
              className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
              style={{ fontSize: 12, fontWeight: 500 }}
            >
              Cancelar
            </button>
            <button
              onClick={() => sendRequest.mutate()}
              disabled={!requestText.trim() || sendRequest.isPending}
              className="bg-purple-600 hover:bg-purple-500 text-white transition-colors disabled:opacity-50"
              style={{ fontSize: 12, fontWeight: 600, padding: '5px 14px', borderRadius: 8 }}
            >
              {sendRequest.isPending ? 'Enviando...' : 'Enviar'}
            </button>
          </div>
        </div>
      )}
    </article>
  )
}

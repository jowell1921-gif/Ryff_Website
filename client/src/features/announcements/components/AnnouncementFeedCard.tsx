import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { MapPin, Megaphone } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import type { Announcement, AnnouncementType } from '@/types/announcement.types'
import { useAuthStore } from '@/stores/authStore'
import { useDeleteAnnouncement } from '../hooks/useAnnouncements'

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

      {/* Pills */}
      {(announcement.instruments.length > 0 || announcement.genres.length > 0) && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {announcement.instruments.map((inst) => (
            <span
              key={inst}
              className="rounded-full bg-purple-600 border border-purple-500 font-semibold"
              style={{ padding: '4px 12px', fontSize: 11, color: 'white' }}
            >
              {inst}
            </span>
          ))}
          {announcement.genres.map((g) => (
            <span
              key={g}
              className="rounded-full border border-purple-500/30 bg-purple-500/10 font-semibold"
              style={{ padding: '4px 12px', fontSize: 11, color: 'white' }}
            >
              {g}
            </span>
          ))}
        </div>
      )}

      {announcement.location && (
        <p style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }} className="text-[var(--color-text-muted)]">
          <MapPin size={12} />
          {announcement.location}
        </p>
      )}
    </article>
  )
}

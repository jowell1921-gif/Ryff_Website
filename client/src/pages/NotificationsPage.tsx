import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { Sparkles, UserPlus, MessageCircle, AtSign, X, Trash2, CheckSquare, Square, Clapperboard, Repeat2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { Avatar } from '@/components/ui/Avatar'
import {
  useNotifications,
  useMarkAllAsRead,
  useDeleteNotification,
  useDeleteAllNotifications,
} from '@/features/notifications/hooks/useNotifications'
import type { AppNotification, NotificationType, ReactionType } from '@/types/notification.types'

// ── Reacciones ───────────────────────────────────────────────────────────────
const REACTION_EMOJI: Record<ReactionType, string> = {
  APLAUSO: '👏',
  FIRE: '🔥',
  ASOMBRA: '😮',
}

// ── Sección config ────────────────────────────────────────────────────────────
const SECTIONS: {
  type: NotificationType
  label: string
  Icon: React.ElementType
  iconColor: string
  badgeBg: string
  badgeStyle?: React.CSSProperties
  emptyText: string
}[] = [
  {
    type: 'POST_LIKE',
    label: 'Reacciones',
    Icon: Sparkles,
    iconColor: 'text-purple-400',
    badgeBg: '',
    badgeStyle: { background: 'linear-gradient(to right, #9333ea, #4f46e5)' },
    emptyText: 'Sin reacciones todavía',
  },
  {
    type: 'POST_COMMENT',
    label: 'Comentarios',
    Icon: MessageCircle,
    iconColor: 'text-blue-400',
    badgeBg: 'bg-blue-500',
    emptyText: 'Sin comentarios todavía',
  },
  {
    type: 'FOLLOW',
    label: 'Nuevos seguidores',
    Icon: UserPlus,
    iconColor: 'text-purple-400',
    badgeBg: 'bg-purple-600',
    emptyText: 'Sin nuevos seguidores',
  },
  {
    type: 'MENTION',
    label: 'Menciones',
    Icon: AtSign,
    iconColor: 'text-teal-400',
    badgeBg: 'bg-teal-500',
    emptyText: 'Sin menciones todavía',
  },
  {
    type: 'REEL_LIKE',
    label: 'Reacciones en Reels',
    Icon: Clapperboard,
    iconColor: 'text-pink-400',
    badgeBg: 'bg-pink-600',
    emptyText: 'Sin reacciones en reels todavía',
  },
  {
    type: 'REEL_COMMENT',
    label: 'Comentarios en Reels',
    Icon: MessageCircle,
    iconColor: 'text-cyan-400',
    badgeBg: 'bg-cyan-600',
    emptyText: 'Sin comentarios en reels todavía',
  },
  {
    type: 'POST_REPOST',
    label: 'Difusiones',
    Icon: Repeat2,
    iconColor: 'text-green-400',
    badgeBg: 'bg-green-600',
    emptyText: 'Nadie ha difundido tus posts todavía',
  },
]

// ── Helpers ───────────────────────────────────────────────────────────────────
function notificationText(n: AppNotification): string {
  if (n.type === 'FOLLOW') return 'ha empezado a seguirte'
  if (n.type === 'POST_REPOST') return 'difundió tu publicación'
  if (n.type === 'POST_LIKE') {
    const emoji = n.reactionType ? REACTION_EMOJI[n.reactionType] : '👍'
    return `reaccionó ${emoji} a tu post`
  }
  if (n.type === 'REEL_LIKE') {
    const emoji = n.reactionType ? REACTION_EMOJI[n.reactionType] : '👍'
    return `reaccionó ${emoji} a tu reel`
  }
  if (n.type === 'REEL_COMMENT') return 'comentó tu reel'
  if (n.type === 'POST_COMMENT') return 'comentó tu post'
  if (n.type === 'MENTION') return 'te mencionó en un comentario'
  return ''
}

function stripMentionBrackets(text: string) {
  return text.replace(/@\[([^\]]+)\]/g, '@$1')
}

function notificationPreview(n: AppNotification): string | null {
  if ((n.type === 'POST_LIKE' || n.type === 'POST_COMMENT' || n.type === 'POST_REPOST') && n.post) return stripMentionBrackets(n.post.content)
  if ((n.type === 'REEL_LIKE' || n.type === 'REEL_COMMENT') && n.reel?.caption) return n.reel.caption
  if (n.type === 'MENTION' && n.comment) return stripMentionBrackets(n.comment.content)
  return null
}

function reactionBadgeContent(n: AppNotification, section: (typeof SECTIONS)[number]) {
  if ((n.type === 'POST_LIKE' || n.type === 'REEL_LIKE') && n.reactionType) {
    return <span style={{ fontSize: 9, lineHeight: 1 }}>{REACTION_EMOJI[n.reactionType]}</span>
  }
  return <section.Icon size={8} className="text-white" />
}

// ── Page ──────────────────────────────────────────────────────────────────────
export function NotificationsPage() {
  const { data: notifications = [], isLoading } = useNotifications()
  const markAllAsRead = useMarkAllAsRead()
  const deleteAll = useDeleteAllNotifications()
  const [selectMode, setSelectMode] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const deleteOne = useDeleteNotification()
  const navigate = useNavigate()

  useEffect(() => { markAllAsRead.mutate() }, [])

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleDeleteSelected = () => {
    selected.forEach((id) => deleteOne.mutate(id))
    setSelected(new Set())
    setSelectMode(false)
  }

  const handleDeleteAll = () => {
    deleteAll.mutate()
    setSelected(new Set())
    setSelectMode(false)
  }

  const cancelSelect = () => {
    setSelectMode(false)
    setSelected(new Set())
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', paddingLeft: 16, paddingRight: 16, paddingTop: 28, paddingBottom: 32 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 className="text-[var(--color-text)]" style={{ fontSize: 22, fontWeight: 800 }}>
          Notificaciones
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {selectMode ? (
            <>
              {selected.size > 0 && (
                <button
                  onClick={handleDeleteSelected}
                  disabled={deleteOne.isPending}
                  className="text-red-400 hover:text-red-300 border border-red-500/40 hover:border-red-400 transition-colors"
                  style={{ fontSize: 12, fontWeight: 600, borderRadius: 8, padding: '6px 12px' }}
                >
                  Borrar ({selected.size})
                </button>
              )}
              <button
                onClick={handleDeleteAll}
                disabled={deleteAll.isPending}
                className="text-red-400 hover:text-red-300 border border-red-500/40 hover:border-red-400 transition-colors"
                style={{ fontSize: 12, fontWeight: 600, borderRadius: 8, padding: '6px 12px' }}
              >
                Borrar todo
              </button>
              <button
                onClick={cancelSelect}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                style={{ fontSize: 12, fontWeight: 600, borderRadius: 8, padding: '6px 12px', border: '1px solid var(--color-border)' }}
              >
                Cancelar
              </button>
            </>
          ) : (
            notifications.length > 0 && (
              <button
                onClick={() => setSelectMode(true)}
                className="text-[var(--color-text-muted)] hover:text-purple-300 transition-colors"
                style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, borderRadius: 8, padding: '6px 12px', border: '1px solid var(--color-border)' }}
              >
                <CheckSquare size={14} />
                Seleccionar
              </button>
            )
          )}
        </div>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-[var(--color-surface-2)] border border-[var(--color-border)] animate-pulse" style={{ borderRadius: 16, height: 120 }} />
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {SECTIONS.map((section, si) => {
            const items = notifications.filter((n) => n.type === section.type)
            const unread = items.filter((n) => !n.read).length

            return (
              <motion.div
                key={section.type}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: si * 0.07, duration: 0.35, ease: 'easeOut' }}
                className="bg-[var(--color-surface-2)] border border-[var(--color-border)]"
                style={{ borderRadius: 18, overflow: 'hidden' }}
              >
                {/* Card header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}>
                  <section.Icon size={16} className={section.iconColor} />
                  <span className="text-[var(--color-text)]" style={{ fontSize: 14, fontWeight: 700, flex: 1 }}>
                    {section.label}
                  </span>
                  {unread > 0 && (
                    <span className={`${section.badgeBg} text-white`} style={{ fontSize: 11, fontWeight: 700, borderRadius: 999, padding: '2px 8px', ...section.badgeStyle }}>
                      {unread} nueva{unread !== 1 ? 's' : ''}
                    </span>
                  )}
                  {items.length > 0 && unread === 0 && (
                    <span className="text-[var(--color-text-muted)]" style={{ fontSize: 11 }}>
                      {items.length} total
                    </span>
                  )}
                </div>

                {/* Items */}
                {items.length === 0 ? (
                  <p className="text-[var(--color-text-muted)]" style={{ fontSize: 13, textAlign: 'center', padding: '24px 20px' }}>
                    {section.emptyText}
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {items.map((n, i) => (
                      <NotificationRow
                        key={n.id}
                        notification={n}
                        section={section}
                        isLast={i === items.length - 1}
                        selectMode={selectMode}
                        selected={selected.has(n.id)}
                        onToggleSelect={() => toggleSelect(n.id)}
                        onDelete={() => deleteOne.mutate(n.id)}
                        navigate={navigate}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Row ───────────────────────────────────────────────────────────────────────
function NotificationRow({
  notification: n,
  section,
  isLast,
  selectMode,
  selected,
  onToggleSelect,
  onDelete,
  navigate,
}: {
  notification: AppNotification
  section: (typeof SECTIONS)[number]
  isLast: boolean
  selectMode: boolean
  selected: boolean
  onToggleSelect: () => void
  onDelete: () => void
  navigate: ReturnType<typeof useNavigate>
}) {
  const timeAgo = formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: es })
  const preview = notificationPreview(n)

  const handleClick = () => {
    if (selectMode) { onToggleSelect(); return }
    if (n.type === 'FOLLOW' || n.type === 'POST_REPOST') navigate(`/profile/${n.from.id}`)
    else if (n.type === 'REEL_LIKE' || n.type === 'REEL_COMMENT') navigate('/reels')
    else if (n.post) navigate(`/profile/${n.from.id}`)
  }

  return (
    <div
      className={`transition-colors ${!n.read && !selectMode ? 'bg-purple-600/5' : ''} ${selected ? 'bg-purple-600/10' : ''}`}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        padding: '14px 20px',
        borderBottom: isLast ? 'none' : '1px solid var(--color-border)',
      }}
    >
      {/* Checkbox / Avatar */}
      {selectMode ? (
        <button onClick={onToggleSelect} className="shrink-0" style={{ marginTop: 2 }}>
          {selected
            ? <CheckSquare size={18} className="text-purple-400" />
            : <Square size={18} className="text-[var(--color-text-muted)]" />
          }
        </button>
      ) : null}

      {/* Clickable content */}
      <button
        onClick={handleClick}
        className="text-left hover:opacity-80 transition-opacity"
        style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flex: 1, minWidth: 0 }}
      >
        {/* Avatar + badge de tipo */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <Avatar size="sm" src={n.from.avatar} alt={n.from.name} />
          <span
            className={`${section.badgeBg} absolute`}
            style={{ bottom: -2, right: -2, width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', ...section.badgeStyle }}
          >
            {reactionBadgeContent(n, section)}
          </span>
        </div>

        {/* Texto */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <p className="text-[var(--color-text)]" style={{ fontSize: 13 }}>
            <span style={{ fontWeight: 700 }}>{n.from.name}</span>
            {' '}
            <span className="text-[var(--color-text-muted)]">{notificationText(n)}</span>
          </p>
          {preview && (
            <p className="text-[var(--color-text-muted)] truncate" style={{ fontSize: 12, fontStyle: 'italic' }}>
              "{preview}"
            </p>
          )}
          <p className="text-[var(--color-text-muted)]" style={{ fontSize: 11 }}>{timeAgo}</p>
        </div>
      </button>

      {/* Punto no leído + X */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, paddingTop: 2 }}>
        {!n.read && !selectMode && (
          <span className="bg-purple-500" style={{ width: 7, height: 7, borderRadius: '50%' }} />
        )}
        {!selectMode && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete() }}
            className="text-[var(--color-text-muted)] hover:text-red-400 transition-colors opacity-50 hover:opacity-100"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  )
}

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { Bell, UserPlus, Heart, MessageCircle } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { useNotifications, useMarkAllAsRead } from '@/features/notifications/hooks/useNotifications'
import type { AppNotification } from '@/types/notification.types'

export function NotificationsPage() {
  const { data: notifications = [], isLoading } = useNotifications()
  const markAllAsRead = useMarkAllAsRead()
  const navigate = useNavigate()

  // Marcar como leídas al abrir la página
  useEffect(() => {
    markAllAsRead.mutate()
  }, [])

  if (isLoading) {
    return (
      <div style={{ maxWidth: 576, margin: '0 auto', paddingLeft: 16, paddingRight: 16, paddingTop: 24, paddingBottom: 24 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 rounded-xl bg-[var(--color-surface-2)] animate-pulse mb-2" />
        ))}
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 576, margin: '0 auto', paddingLeft: 16, paddingRight: 16, paddingTop: 24, paddingBottom: 24 }}>
      <h1 className="text-xl font-bold text-[var(--color-text)] mb-6">Notificaciones</h1>

      {notifications.length === 0 ? (
        <div className="text-center py-20">
          <Bell size={32} className="text-[var(--color-text-muted)] mx-auto mb-3 opacity-40" />
          <p className="text-sm text-[var(--color-text-muted)]">Aún no tienes notificaciones</p>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          {notifications.map((n) => (
            <NotificationRow key={n.id} notification={n} navigate={navigate} />
          ))}
        </div>
      )}
    </div>
  )
}

function NotificationRow({
  notification: n,
  navigate,
}: {
  notification: AppNotification
  navigate: ReturnType<typeof useNavigate>
}) {
  const timeAgo = formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: es })

  const handleClick = () => {
    if (n.type === 'FOLLOW') navigate(`/profile/${n.from.id}`)
    if (n.type === 'POST_LIKE') navigate(`/profile/${n.from.id}`)
  }

  return (
    <button
      onClick={handleClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left ${
        !n.read
          ? 'bg-purple-600/10 border border-purple-500/20 hover:bg-purple-600/15'
          : 'hover:bg-[var(--color-surface-2)]'
      }`}
    >
      {/* Avatar con icono de tipo */}
      <div className="relative shrink-0">
        <Avatar size="sm" src={n.from.avatar} alt={n.from.name} />
        <span className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center ${
          n.type === 'FOLLOW' ? 'bg-purple-600' : n.type === 'POST_LIKE' ? 'bg-red-500' : 'bg-blue-500'
        }`}>
          {n.type === 'FOLLOW' && <UserPlus size={8} className="text-white" />}
          {n.type === 'POST_LIKE' && <Heart size={8} className="text-white" />}
          {n.type === 'POST_COMMENT' && <MessageCircle size={8} className="text-white" />}
        </span>
      </div>

      {/* Texto */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-[var(--color-text)]">
          <span className="font-semibold">{n.from.name}</span>
          {n.type === 'FOLLOW' && ' ha empezado a seguirte'}
          {n.type === 'POST_LIKE' && ' le ha dado me gusta a tu post'}
          {n.type === 'POST_COMMENT' && ' ha comentado tu post'}
        </p>
        {(n.type === 'POST_LIKE' || n.type === 'POST_COMMENT') && n.post && (
          <p className="text-xs text-[var(--color-text-muted)] truncate mt-0.5">
            "{n.post.content}"
          </p>
        )}
        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{timeAgo}</p>
      </div>

      {/* Punto de no leído */}
      {!n.read && (
        <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
      )}
    </button>
  )
}

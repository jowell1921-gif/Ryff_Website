import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Bell, X } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { useNotificationStore } from '@/stores/notificationStore'
import type { AppNotification, ReactionType } from '@/types/notification.types'

const REACTION_EMOJI: Record<ReactionType, string> = {
  APLAUSO: '👏',
  FIRE: '🔥',
  ASOMBRA: '😮',
}

function toastText(n: AppNotification): string {
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
  return 'nueva notificación'
}

export function NotificationToast() {
  const navigate = useNavigate()
  const notification = useNotificationStore((s) => s.pendingNotification)
  const clear = useNotificationStore((s) => s.clearPendingNotification)

  useEffect(() => {
    if (!notification) return
    const timer = setTimeout(clear, 4000)
    return () => clearTimeout(timer)
  }, [notification, clear])

  const handleClick = () => {
    navigate('/notifications')
    clear()
  }

  return (
    <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 50, pointerEvents: 'none', marginTop: 56 }}>
      <AnimatePresence>
        {notification && (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 80, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={handleClick}
            className="bg-[var(--color-surface-2)] border border-purple-500/30 hover:border-purple-500/60 transition-colors"
            style={{
              pointerEvents: 'auto',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              width: 288,
              padding: 14,
              borderRadius: 18,
              boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
              cursor: 'pointer',
            }}
          >
            {/* Avatar + badge */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <Avatar size="md" src={notification.from.avatar} alt={notification.from.name} />
              <span
                className="bg-purple-600"
                style={{ position: 'absolute', bottom: -2, right: -2, width: 16, height: 16, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Bell size={8} className="text-white" />
              </span>
            </div>

            {/* Texto */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p className="text-purple-300 truncate" style={{ fontSize: 12, fontWeight: 700 }}>
                {notification.from.name}
              </p>
              <p className="text-[var(--color-text)] truncate" style={{ fontSize: 13, marginTop: 2 }}>
                {toastText(notification)}
              </p>
            </div>

            {/* Cerrar */}
            <button
              onClick={(e) => { e.stopPropagation(); clear() }}
              className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
              style={{ flexShrink: 0, paddingTop: 2 }}
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

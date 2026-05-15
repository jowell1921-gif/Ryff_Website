import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { MessageCircle, X } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { useNotificationStore } from '@/stores/notificationStore'

export function MessageToast() {
  const navigate = useNavigate()
  const toast = useNotificationStore((s) => s.toast)
  const clearToast = useNotificationStore((s) => s.clearToast)

  // Auto-dismiss después de 4 segundos
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(clearToast, 4000)
    return () => clearTimeout(timer)
  }, [toast, clearToast])

  const handleClick = () => {
    if (!toast) return
    navigate(`/messages/${toast.conversationId}`)
    clearToast()
  }

  return (
    <div className="fixed top-4 right-4 z-50 pointer-events-none">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.conversationId + toast.content}
            initial={{ opacity: 0, x: 80, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={handleClick}
            className="pointer-events-auto flex items-start gap-3 w-72 p-3.5 rounded-2xl
              bg-[var(--color-surface-2)] border border-purple-500/30 shadow-2xl
              cursor-pointer hover:border-purple-500/60 transition-colors"
          >
            {/* Icono o avatar */}
            <div className="relative shrink-0">
              <Avatar size="md" src={toast.senderAvatar} alt={toast.senderName} />
              <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-purple-600 flex items-center justify-center">
                <MessageCircle size={9} className="text-white" />
              </span>
            </div>

            {/* Contenido */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-purple-300 truncate">{toast.senderName}</p>
              <p className="text-sm text-[var(--color-text)] truncate mt-0.5">{toast.content}</p>
            </div>

            {/* Cerrar */}
            <button
              onClick={(e) => { e.stopPropagation(); clearToast() }}
              className="shrink-0 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors mt-0.5"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useLocation, Outlet } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, Sparkles } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { RightSidebar } from './RightSidebar'
import { BottomNav } from './BottomNav'
import { useChatSocket } from '@/features/chat/hooks/useChatSocket'
import { MessageToast } from '@/features/chat/components/MessageToast'
import { NotificationToast } from '@/features/notifications/components/NotificationToast'
import { useNotifications } from '@/features/notifications/hooks/useNotifications'

const HIDE_RIGHT_SIDEBAR = ['/messages', '/reels', '/notifications']

export function AppLayout() {
  useChatSocket()
  useNotifications()

  const { pathname } = useLocation()
  const showRightSidebar = !HIDE_RIGHT_SIDEBAR.some((p) => pathname.startsWith(p))

  const [leftOpen, setLeftOpen] = useState(false)
  const [rightOpen, setRightOpen] = useState(false)

  useEffect(() => {
    setLeftOpen(false)
    setRightOpen(false)
  }, [pathname])

  return (
    <>
      <div className="min-h-screen bg-[var(--color-surface)]">

        {/* Top bar móvil */}
        <div
          className="flex items-center md:hidden fixed top-0 left-0 right-0 z-30 bg-[var(--color-surface-2)] border-b border-[var(--color-border)]"
          style={{ height: 64, paddingLeft: 8, paddingRight: 8 }}
        >
          <button
            onClick={() => setLeftOpen(true)}
            className="text-[var(--color-text-muted)] hover:text-purple-400 transition-colors rounded-xl"
            style={{ padding: 10 }}
          >
            <Menu size={22} />
          </button>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <img src="/logo-sin.png" alt="RYFF" style={{ height: 120, objectFit: 'contain' }} />
          </div>
          <button
            onClick={() => setRightOpen(true)}
            className="text-[var(--color-text-muted)] hover:text-purple-400 transition-colors rounded-xl"
            style={{ padding: 10 }}
          >
            <Sparkles size={20} />
          </button>
        </div>

        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex' }}>
          <Sidebar />
          <main className="flex-1 min-w-0 mobile-top-offset pb-16 md:pb-0">
            <Outlet />
          </main>
          {showRightSidebar && <RightSidebar />}
        </div>
      </div>

      {/* Drawer izquierdo — menú de navegación */}
      <AnimatePresence>
        {leftOpen && (
          <>
            <motion.div
              className="md:hidden fixed inset-0 z-[55]"
              style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLeftOpen(false)}
            />
            <motion.div
              className="md:hidden fixed left-0 top-0 h-full z-[60]"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            >
              <Sidebar isDrawer onClose={() => setLeftOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Drawer derecho — descubrir y PRO */}
      <AnimatePresence>
        {rightOpen && (
          <>
            <motion.div
              className="md:hidden fixed inset-0 z-[55]"
              style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setRightOpen(false)}
            />
            <motion.div
              className="md:hidden fixed right-0 top-0 h-full z-[60]"
              initial={{ x: 290 }}
              animate={{ x: 0 }}
              exit={{ x: 290 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            >
              <RightSidebar isDrawer onClose={() => setRightOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <BottomNav />
      <MessageToast />
      <NotificationToast />
    </>
  )
}

import { useLocation, Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { RightSidebar } from './RightSidebar'
import { BottomNav } from './BottomNav'
import { useChatSocket } from '@/features/chat/hooks/useChatSocket'
import { MessageToast } from '@/features/chat/components/MessageToast'
import { useNotifications } from '@/features/notifications/hooks/useNotifications'

const HIDE_RIGHT_SIDEBAR = ['/messages', '/reels', '/notifications']

export function AppLayout() {
  useChatSocket()
  useNotifications()

  const { pathname } = useLocation()
  const showRightSidebar = !HIDE_RIGHT_SIDEBAR.some((p) => pathname.startsWith(p))

  return (
    <>
      <div className="min-h-screen bg-[var(--color-surface)]">
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex' }}>
          <Sidebar />
          <main className="flex-1 min-w-0 pb-16 md:pb-0">
            <Outlet />
          </main>
          {showRightSidebar && <RightSidebar />}
        </div>
      </div>

      <BottomNav />
      <MessageToast />
    </>
  )
}

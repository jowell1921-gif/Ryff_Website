import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { useChatSocket } from '@/features/chat/hooks/useChatSocket'
import { MessageToast } from '@/features/chat/components/MessageToast'

export function AppLayout() {
  // Conecta el socket globalmente mientras el usuario está autenticado
  useChatSocket()

  return (
    <div className="flex min-h-screen bg-[var(--color-surface)]">
      <Sidebar />
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
      {/* Toast de notificaciones — visible desde cualquier página */}
      <MessageToast />
    </div>
  )
}

import { NavLink, useLocation } from 'react-router-dom'
import { Home, Compass, Bell, MessageCircle, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useNotificationStore } from '@/stores/notificationStore'

const navItems = [
  { to: '/feed',          icon: Home,          label: 'Inicio' },
  { to: '/discover',      icon: Compass,       label: 'Descubrir' },
  { to: '/notifications', icon: Bell,          label: 'Notificaciones' },
  { to: '/messages',      icon: MessageCircle, label: 'Mensajes' },
  { to: '/profile',       icon: User,          label: 'Perfil' },
]

export function BottomNav() {
  const { pathname } = useLocation()
  const totalUnread          = useNotificationStore((s) => s.totalUnread())
  const unreadNotifications  = useNotificationStore((s) => s.unreadNotifications)

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--color-surface-2)] border-t border-[var(--color-border)] safe-area-inset-bottom">
      <div className="flex items-center justify-around h-14 px-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'relative flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-lg transition-colors',
                isActive
                  ? 'text-purple-400'
                  : 'text-[var(--color-text-muted)]'
              )
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                  {to === '/messages' && totalUnread > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[14px] h-[14px] px-0.5 rounded-full bg-purple-600 text-white text-[8px] font-bold flex items-center justify-center">
                      {totalUnread > 9 ? '9+' : totalUnread}
                    </span>
                  )}
                  {to === '/notifications' && unreadNotifications > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[14px] h-[14px] px-0.5 rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center">
                      {unreadNotifications > 9 ? '9+' : unreadNotifications}
                    </span>
                  )}
                </div>
                <span className="text-[9px] font-medium leading-none">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

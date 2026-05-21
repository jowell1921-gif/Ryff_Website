import { NavLink, useNavigate } from 'react-router-dom'
import { Home, Compass, Users, MessageCircle, User, Settings, Music2, LogOut, Clapperboard, Bell, Megaphone, LibraryBig } from 'lucide-react'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/Avatar'
import { useAuthStore } from '@/stores/authStore'
import { useNotificationStore } from '@/stores/notificationStore'

const navItems = [
  { to: '/feed', icon: Home, label: 'Inicio' },
  { to: '/discover', icon: Compass, label: 'Descubrir' },
  { to: '/reels', icon: Clapperboard, label: 'Reels' },
  { to: '/bands', icon: Users, label: 'Bandas' },
  { to: '/announcements', icon: Megaphone, label: 'Anuncio para músicos' },
  { to: '/music', icon: LibraryBig, label: 'Tu música' },
  { to: '/notifications', icon: Bell, label: 'Notificaciones' },
  { to: '/messages', icon: MessageCircle, label: 'Mensajes' },
  { to: '/profile', icon: User, label: 'Mi perfil' },
]

export function Sidebar() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const totalUnread = useNotificationStore((s) => s.totalUnread())
  const unreadNotifications = useNotificationStore((s) => s.unreadNotifications)

  const [expanded, setExpanded] = useState(() => window.innerWidth >= 1280)

  useEffect(() => {
    const handler = () => setExpanded(window.innerWidth >= 1280)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/auth/login')
  }

  return (
    <aside
      className="hidden md:flex shrink-0 h-screen sticky top-0 flex-col bg-[var(--color-surface-2)] border-r border-[var(--color-border)]"
      style={{ width: expanded ? 256 : 72, overflow: 'hidden' }}
    >
      {/* Logo */}
      <div
        className="h-16 border-b border-[var(--color-border)]"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: expanded ? 'flex-start' : 'center',
          paddingLeft: expanded ? 20 : 0,
          paddingRight: expanded ? 20 : 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center shrink-0">
            <Music2 size={16} className="text-white" />
          </div>
          {expanded && (
            <span className="text-lg font-bold text-[var(--color-text)] tracking-tight">RYFF</span>
          )}
        </div>
      </div>

      {/* Navegación */}
      <nav
        style={{
          flex: 1,
          overflowY: 'auto',
          paddingTop: 24,
          paddingBottom: 24,
          paddingLeft: expanded ? 8 : 4,
          paddingRight: expanded ? 8 : 4,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center rounded-xl text-sm font-medium transition-colors duration-200',
                expanded ? 'gap-3' : 'justify-center',
                isActive
                  ? 'bg-purple-600/15 text-purple-300'
                  : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-3)] hover:text-[var(--color-text)]'
              )
            }
            style={
              expanded
                ? { paddingTop: 12, paddingBottom: 12, paddingLeft: 12, paddingRight: 12, marginLeft: 4, marginRight: 4 }
                : { width: 44, height: 44, alignSelf: 'center' }
            }
          >
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <Icon size={18} />
              {!expanded && to === '/messages' && totalUnread > 0 && (
                <span
                  className="absolute bg-purple-600 rounded-full"
                  style={{ top: -2, right: -2, width: 7, height: 7 }}
                />
              )}
              {!expanded && to === '/notifications' && unreadNotifications > 0 && (
                <span
                  className="absolute bg-red-500 rounded-full"
                  style={{ top: -2, right: -2, width: 7, height: 7 }}
                />
              )}
            </div>
            {expanded && (
              <>
                <span style={{ flex: 1 }}>{label}</span>
                {to === '/messages' && totalUnread > 0 && (
                  <span
                    className="rounded-full bg-purple-600 text-white font-bold flex items-center justify-center"
                    style={{ minWidth: 18, height: 18, paddingLeft: 4, paddingRight: 4, fontSize: 10 }}
                  >
                    {totalUnread > 99 ? '99+' : totalUnread}
                  </span>
                )}
                {to === '/notifications' && unreadNotifications > 0 && (
                  <span
                    className="rounded-full bg-red-500 text-white font-bold flex items-center justify-center"
                    style={{ minWidth: 18, height: 18, paddingLeft: 4, paddingRight: 4, fontSize: 10 }}
                  >
                    {unreadNotifications > 99 ? '99+' : unreadNotifications}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Parte inferior */}
      <div
        className="border-t border-[var(--color-border)]"
        style={{
          paddingTop: 16,
          paddingBottom: 16,
          paddingLeft: expanded ? 8 : 4,
          paddingRight: expanded ? 8 : 4,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              'flex items-center rounded-xl text-sm font-medium transition-colors duration-200',
              expanded ? 'gap-3' : 'justify-center',
              isActive
                ? 'bg-purple-600/15 text-purple-300'
                : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-3)] hover:text-[var(--color-text)]'
            )
          }
          style={
            expanded
              ? { paddingTop: 12, paddingBottom: 12, paddingLeft: 12, paddingRight: 12, marginLeft: 4, marginRight: 4 }
              : { width: 44, height: 44, alignSelf: 'center' }
          }
        >
          <Settings size={18} />
          {expanded && <span>Configuración</span>}
        </NavLink>

        {/* Usuario logueado */}
        <div
          className="rounded-xl group"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: expanded ? 'flex-start' : 'center',
            gap: expanded ? 12 : 0,
            paddingTop: 10,
            paddingBottom: 10,
            paddingLeft: expanded ? 12 : 0,
            paddingRight: expanded ? 12 : 0,
            marginLeft: expanded ? 4 : 0,
            marginRight: expanded ? 4 : 0,
          }}
        >
          <Avatar size="sm" alt={user?.name ?? ''} src={user?.avatar ?? null} isOnline={true} />
          {expanded && (
            <>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p className="text-sm font-medium text-[var(--color-text)] truncate">{user?.name}</p>
                <p className="text-xs text-[var(--color-text-muted)] truncate">{user?.location ?? 'RYFF'}</p>
              </div>
              <button
                onClick={handleLogout}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--color-text-muted)] hover:text-red-400"
                title="Cerrar sesión"
              >
                <LogOut size={15} />
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  )
}

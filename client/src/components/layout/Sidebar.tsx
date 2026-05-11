import { NavLink, useNavigate } from 'react-router-dom'
import { Home, Compass, Users, MessageCircle, User, Settings, Music2, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/Avatar'
import { useAuthStore } from '@/stores/authStore'

const navItems = [
  { to: '/feed', icon: Home, label: 'Inicio' },
  { to: '/discover', icon: Compass, label: 'Descubrir' },
  { to: '/bands', icon: Users, label: 'Bandas' },
  { to: '/messages', icon: MessageCircle, label: 'Mensajes' },
  { to: '/profile', icon: User, label: 'Mi perfil' },
]

export function Sidebar() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  const handleLogout = () => {
    logout()
    navigate('/auth/login')
  }

  return (
    <aside className="w-60 shrink-0 h-screen sticky top-0 flex flex-col bg-[var(--color-surface-2)] border-r border-[var(--color-border)]">

      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center">
            <Music2 size={16} className="text-white" />
          </div>
          <span className="text-lg font-bold text-[var(--color-text)] tracking-tight">RYFF</span>
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-purple-600/15 text-purple-300'
                  : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-3)] hover:text-[var(--color-text)]'
              )
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Parte inferior */}
      <div className="p-3 border-t border-[var(--color-border)] flex flex-col gap-1">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
              isActive
                ? 'bg-purple-600/15 text-purple-300'
                : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-3)] hover:text-[var(--color-text)]'
            )
          }
        >
          <Settings size={18} />
          Configuración
        </NavLink>

        {/* Usuario logueado — datos reales desde el store */}
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg mt-1 group">
          <Avatar size="sm" alt={user?.name ?? ''} src={user?.avatar ?? null} isOnline={true} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[var(--color-text)] truncate">{user?.name}</p>
            <p className="text-xs text-[var(--color-text-muted)] truncate">{user?.location ?? 'RYFF'}</p>
          </div>
          {/* Botón de cerrar sesión — aparece al hacer hover en la tarjeta */}
          <button
            onClick={handleLogout}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--color-text-muted)] hover:text-red-400"
            title="Cerrar sesión"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>

    </aside>
  )
}

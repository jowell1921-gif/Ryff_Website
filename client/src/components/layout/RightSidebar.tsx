import { useNavigate } from 'react-router-dom'
import { Sparkles, Users, BarChart2, EyeOff, Star, ShieldCheck, Guitar, Mic2, Music2, Headphones, Drum, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/Avatar'
import { Pill } from '@/components/ui/Pill'
import { useUserSuggestions } from '@/features/profile/hooks/useProfile'

interface RightSidebarProps {
  isDrawer?: boolean
  onClose?: () => void
}

export function RightSidebar({ isDrawer = false, onClose }: RightSidebarProps) {
  return (
    <aside
      className={cn(
        isDrawer ? 'flex' : 'hidden xl:flex',
        'shrink-0 h-screen sticky top-0 flex-col bg-[var(--color-surface-2)] border-l border-[var(--color-border)] overflow-y-auto scrollbar-hide'
      )}
      style={{ width: 272 }}
    >
      {isDrawer && (
        <div
          className="border-b border-[var(--color-border)]"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}
        >
          <span className="text-sm font-semibold text-[var(--color-text)]">Descubrir</span>
          <button
            onClick={onClose}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors rounded-lg"
            style={{ padding: 6 }}
          >
            <X size={18} />
          </button>
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingTop: 32, paddingBottom: 32, paddingLeft: 20, paddingRight: 20 }}>
        <DiscoverCard />
        <ProCard />
        <PoliciesFooter />
      </div>
    </aside>
  )
}

/* ─── Descubre músicos ─── */
function DiscoverCard() {
  const navigate = useNavigate()
  const { data: suggestions = [], isLoading } = useUserSuggestions()

  return (
    <div className="relative overflow-hidden bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl" style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 16, paddingBottom: 16, paddingLeft: 24, paddingRight: 24 }}>

      {/* Íconos animados de fondo */}
      <motion.div
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-2 right-3 text-purple-500/15 pointer-events-none"
      >
        <Headphones size={40} />
      </motion.div>

      <motion.div
        animate={{ rotate: [0, -8, 8, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-2 left-2 text-purple-500/10 pointer-events-none"
      >
        <Drum size={32} />
      </motion.div>
      <div style={{ display: 'flex', alignItems: 'center', paddingBottom: 12, borderBottom: '1px solid var(--color-border)' }}>
        <h3 className="text-sm font-bold text-[var(--color-text)]" style={{ flex: 1 }}>Descubre músicos</h3>
        <button
          onClick={() => navigate('/discover')}
          className="text-purple-400 hover:text-purple-300 transition-colors"
          style={{ fontSize: 10 }}
        >
          Ver todos
        </button>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[var(--color-surface-2)] animate-pulse shrink-0" />
              <div className="flex-1 flex flex-col gap-1.5">
                <div className="h-2.5 w-24 rounded bg-[var(--color-surface-2)] animate-pulse" />
                <div className="h-2 w-16 rounded bg-[var(--color-surface-2)] animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : suggestions.length === 0 ? (
        <p className="text-xs text-[var(--color-text-muted)] text-center py-2">
          No hay sugerencias por ahora
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {suggestions.map((user) => (
            <button
              key={user.id}
              onClick={() => navigate(`/profile/${user.id}`)}
              className="flex rounded-xl hover:bg-[var(--color-surface-2)] transition-colors text-left group"
              style={{ paddingTop: 5, paddingBottom: 5, paddingLeft: 2, paddingRight: 0, alignItems: 'flex-start', gap: 10 }}
            >
              <Avatar size="sm" src={user.avatar} alt={user.name} />
              <div className="flex-1 min-w-0" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <p className="text-xs font-semibold text-[var(--color-text)] truncate group-hover:text-purple-300 transition-colors" style={{ flex: 1, minWidth: 0 }}>
                    {user.name}
                  </p>
                  <span style={{ flexShrink: 0, marginRight: -8 }}>
                    <Pill variant="outline" size="sm">{user.inBand ? 'En banda' : 'Solo'}</Pill>
                  </span>
                </div>
                {user.mainInstrument && (
                  <div>
                    <Pill variant="outline" size="sm">{user.mainInstrument}</Pill>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── Suscripción PRO ─── */
const PRO_FEATURES = [
  { icon: EyeOff,    text: 'Sin anuncios' },
  { icon: Users,     text: 'Mayor visibilidad' },
  { icon: BarChart2, text: 'Estadísticas de tu perfil' },
  { icon: Star,      text: 'Marca de Músico PRO' },
]

function ProCard() {
  const navigate = useNavigate()
  return (
    <div className="relative overflow-hidden bg-[var(--color-surface)] border border-purple-500/30 rounded-xl flex flex-col items-center gap-4" style={{ paddingTop: 34, paddingBottom: 34, paddingLeft: 24, paddingRight: 24 }}>
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/8 via-transparent to-indigo-600/8 pointer-events-none" />

      {/* Íconos animados de fondo */}
      <motion.div
        animate={{ y: [0, -14, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-3 right-4 text-purple-500/20 pointer-events-none"
      >
        <Guitar size={44} />
      </motion.div>

      <motion.div
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-4 left-3 text-purple-500/15 pointer-events-none"
      >
        <Music2 size={34} />
      </motion.div>

      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.08, 0.18, 0.08] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/2 left-4 text-purple-400 pointer-events-none"
      >
        <Mic2 size={28} />
      </motion.div>

      {/* Icono */}
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
        <Sparkles size={18} className="text-white" />
      </div>

      {/* Título */}
      <div className="text-center">
        <h3 className="text-base font-bold text-[var(--color-text)]">Músico PRO</h3>
        <p className="text-xs text-purple-400 font-medium mt-0.5">Lleva tu perfil al siguiente nivel</p>
      </div>

      {/* Beneficios */}
      <ul className="flex flex-col gap-2.5 w-full">
        {PRO_FEATURES.map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-center justify-center gap-2">
            <Icon size={13} className="text-purple-400 shrink-0" />
            <span className="text-xs text-[var(--color-text-muted)]">{text}</span>
          </li>
        ))}
      </ul>

      {/* Botón — centrado, no pegado a los bordes */}
      <button
        onClick={() => navigate('/coming-soon')}
        style={{ borderRadius: 9999, paddingLeft: 18, paddingRight: 18, paddingTop: 3, paddingBottom: 3, background: 'linear-gradient(to right, #9333ea, #4f46e5)', color: 'white', fontSize: 12, fontWeight: 700 }}
      >
        Suscribirse · €4.99/mes
      </button>
    </div>
  )
}

/* ─── Políticas y footer ─── */
function PoliciesFooter() {
  return (
    <div className="px-1 flex flex-col gap-2">
      <div className="flex items-center gap-1.5 mb-0.5">
        <ShieldCheck size={11} className="text-[var(--color-text-muted)] opacity-60" />
        <span className="text-[10px] text-[var(--color-text-muted)] opacity-60 font-medium uppercase tracking-wide">
          Legal
        </span>
      </div>
      <div className="flex flex-wrap gap-x-2.5 gap-y-1">
        {[
          'Términos de servicio',
          'Política de privacidad',
          'Política de cookies',
          'Directrices de la comunidad',
          'Accesibilidad',
        ].map((label) => (
          <button
            key={label}
            className="text-[10px] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
          >
            {label}
          </button>
        ))}
      </div>
      <p className="text-[10px] text-[var(--color-text-muted)] opacity-50 mt-1">
        © {new Date().getFullYear()} RYFF. Todos los derechos reservados.
      </p>
    </div>
  )
}

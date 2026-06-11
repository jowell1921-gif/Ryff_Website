import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, Guitar, Mic2, Music2, Drum, Headphones, ArrowLeft } from 'lucide-react'

export function ComingSoonPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[var(--color-surface)] flex flex-col items-center justify-center relative overflow-hidden px-6">

      {/* Fondo con gradiente */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-950/40 via-[var(--color-surface)] to-indigo-950/30 pointer-events-none" />

      {/* Íconos animados de fondo */}
      <motion.div
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-16 right-24 text-purple-500/10 pointer-events-none"
      >
        <Guitar size={90} />
      </motion.div>

      <motion.div
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-24 left-20 text-purple-500/10 pointer-events-none"
      >
        <Drum size={70} />
      </motion.div>

      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.06, 0.14, 0.06] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/3 left-16 text-purple-400 pointer-events-none"
      >
        <Mic2 size={56} />
      </motion.div>

      <motion.div
        animate={{ y: [0, 14, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-1/3 right-12 text-purple-500/8 pointer-events-none"
      >
        <Headphones size={64} />
      </motion.div>

      <motion.div
        animate={{ rotate: [0, -12, 12, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/4 left-1/3 text-indigo-500/8 pointer-events-none"
      >
        <Music2 size={44} />
      </motion.div>

      {/* Contenido principal */}
      <div className="relative z-10 flex flex-col items-center text-center" style={{ gap: 32, maxWidth: 480 }}>

        {/* Icono */}
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center"
          style={{ boxShadow: '0 0 40px rgba(147, 51, 234, 0.3)' }}
        >
          <Sparkles size={36} className="text-white" />
        </motion.div>

        {/* Texto */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h1 className="text-3xl font-bold text-[var(--color-text)]">
            Estamos trabajando
          </h1>
          <p className="text-[var(--color-text-muted)]" style={{ fontSize: 15, lineHeight: 1.6 }}>
            Próximamente esta página estará en funcionamiento.
            <br />
            Estamos preparando algo especial para ti.
          </p>
        </div>

        {/* Barra de progreso animada */}
        <div className="w-full rounded-full bg-[var(--color-surface-2)] overflow-hidden" style={{ height: 4 }}>
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        {/* Botón volver */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[var(--color-text-muted)] hover:text-purple-400 transition-colors"
          style={{ fontSize: 14 }}
        >
          <ArrowLeft size={16} />
          Volver
        </button>
      </div>
    </div>
  )
}

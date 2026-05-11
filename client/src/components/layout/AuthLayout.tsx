import { Outlet } from 'react-router-dom'
import { Music2, Mic2, Guitar, Drum } from 'lucide-react'
import { motion } from 'framer-motion'

export function AuthLayout() {
  return (
    <div className="min-h-screen flex bg-[var(--color-surface)]">

      {/* Panel izquierdo — branding visual */}
      <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-12 overflow-hidden">

        {/* Fondo con gradiente cinematográfico */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-950 via-[#0f0f13] to-[#0f0f13]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f13] via-transparent to-transparent" />

        {/* Esferas de luz de fondo */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-violet-500/15 rounded-full blur-3xl" />

        {/* Guitarra — flota arriba y abajo */}
        <motion.div
          animate={{ y: [0, -18, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/3 right-16 text-purple-500/20"
        >
          <Guitar size={80} />
        </motion.div>

        {/* Batería — se balancea */}
        <motion.div
          animate={{ rotate: [0, 8, -8, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-1/3 left-16 text-purple-500/15"
        >
          <Drum size={60} />
        </motion.div>

        {/* Micrófono — pulsa */}
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.25, 0.1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/2 left-1/3 text-purple-400"
        >
          <Mic2 size={48} />
        </motion.div>

        {/* Logo */}
        <div className="relative flex items-center gap-3 z-10">
          <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center">
            <Music2 size={18} className="text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">RYFF</span>
        </div>

        {/* Tagline central */}
        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Tu música.<br />
            Tu comunidad.<br />
            <span className="text-purple-400">Tu escena.</span>
          </h1>
          <p className="text-[var(--color-text-muted)] text-lg leading-relaxed max-w-sm">
            Conecta con músicos de todo el mundo, forma tu banda y comparte lo que creas.
          </p>
        </div>

        {/* Stat */}
        <div className="relative z-10 flex items-center gap-4">
          <div className="flex -space-x-2">
            {['A', 'B', 'C', 'D'].map((letter) => (
              <div
                key={letter}
                className="w-8 h-8 rounded-full bg-purple-600/30 border-2 border-[var(--color-surface)] flex items-center justify-center text-xs font-semibold text-purple-300"
              >
                {letter}
              </div>
            ))}
          </div>
          <p className="text-sm text-[var(--color-text-muted)]">
            +12.000 músicos ya están aquí
          </p>
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center">
              <Music2 size={16} className="text-white" />
            </div>
            <span className="text-lg font-bold text-[var(--color-text)]">RYFF</span>
          </div>
          <Outlet />
        </div>
      </div>

    </div>
  )
}

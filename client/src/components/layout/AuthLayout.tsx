import { Outlet } from 'react-router-dom'
import { Mic2, Guitar, Drum } from 'lucide-react'
import { motion } from 'framer-motion'

export function AuthLayout() {
  return (
    <div className="min-h-screen flex bg-[var(--color-surface)]">

      {/* Panel izquierdo — branding visual (solo desktop) */}
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

        <div />

        {/* Logo + Tagline central */}
        <div className="relative z-10" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <motion.img
            src="/logo-sin.png"
            alt="RYFF"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            style={{ height: 300, objectFit: 'contain', marginBottom: -84 }}
          />
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
        <div className="relative z-10 flex items-center justify-center gap-4">
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
      <div className="w-full lg:w-1/2 flex flex-col lg:items-center lg:justify-center">

        {/* Header móvil animado (oculto en desktop) */}
        <div className="lg:hidden relative overflow-hidden flex flex-col items-center" style={{ paddingTop: 48, paddingBottom: 32, background: 'linear-gradient(to bottom, rgba(88,28,135,0.35) 0%, transparent 100%)' }}>

          {/* Esfera de luz */}
          <div className="absolute top-0 left-1/4 w-40 h-40 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

          {/* Guitarra — flota */}
          <motion.div
            animate={{ y: [0, -14, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-5 right-8 text-purple-500/25 pointer-events-none"
          >
            <Guitar size={54} />
          </motion.div>

          {/* Batería — se balancea */}
          <motion.div
            animate={{ rotate: [0, 8, -8, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-4 left-6 text-purple-500/20 pointer-events-none"
          >
            <Drum size={40} />
          </motion.div>

          {/* Micrófono — pulsa */}
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.28, 0.1] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/2 left-8 text-purple-400 pointer-events-none"
          >
            <Mic2 size={32} />
          </motion.div>

          {/* Logo animado */}
          <motion.img
            src="/logo-sin.png"
            alt="RYFF"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            style={{ height: 110, objectFit: 'contain', position: 'relative', zIndex: 1 }}
          />
        </div>

        {/* Formulario */}
        <div className="flex-1 w-full flex items-start lg:items-center justify-center" style={{ padding: '32px 24px 48px' }}>
          <div className="w-full max-w-md">
            <Outlet />
          </div>
        </div>

      </div>
    </div>
  )
}

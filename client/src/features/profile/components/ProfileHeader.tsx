import { MapPin, Calendar, Music2, Disc3 } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { motion } from 'framer-motion'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import type { UserProfile } from '@/types/user.types'

interface ProfileHeaderProps {
  profile: UserProfile
  isOwnProfile: boolean
  onEdit: () => void
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: 'easeOut' },
  }),
}

export function ProfileHeader({ profile, isOwnProfile, onEdit }: ProfileHeaderProps) {
  const joinedDate = format(new Date(profile.createdAt), "MMM yyyy", { locale: es })

  return (
    // Sin overflow-hidden aquí para que el avatar pueda sobresalir del banner
    <div className="relative rounded-2xl shadow-2xl">

      {/* ── Banner / Escenario ── */}
      <div className="relative h-48 bg-[#080810] overflow-hidden rounded-t-2xl">
        {/* Focos de concierto */}
        <div className="absolute -top-10 left-1/4 w-48 h-64 bg-purple-600/25 rounded-full blur-3xl rotate-12" />
        <div className="absolute -top-10 right-1/4 w-48 h-64 bg-violet-500/20 rounded-full blur-3xl -rotate-12" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-48 bg-purple-400/15 rounded-full blur-2xl" />

        {/* Disco girando — animación continua como el vinilo */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
          className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10 text-purple-300"
        >
          <Disc3 size={150} />
        </motion.div>

        {/* Segundo disco más pequeño — gira en sentido contrario */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
          className="absolute left-6 bottom-4 opacity-5 text-purple-400"
        >
          <Disc3 size={70} />
        </motion.div>

        {/* Botón de editar — esquina superior derecha del banner */}
        {isOwnProfile && (
          <div className="absolute top-4 right-4">
            <Button variant="secondary" size="sm" onClick={onEdit}>
              Editar perfil
            </Button>
          </div>
        )}
      </div>

      {/* ── Avatar centrado sobreposicionado en el borde banner/contenido ── */}
      <div className="absolute left-1/2 -translate-x-1/2 z-10" style={{ top: 'calc(12rem - 2.5rem)' }}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="relative"
        >
          {/* Anillo de luz pulsante */}
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 rounded-full bg-purple-500/40 blur-lg"
          />
          <Avatar
            size="xl"
            alt={profile.name}
            src={profile.avatar}
            className="relative z-10"
          />
        </motion.div>
      </div>

      {/* ── Contenido inferior ── */}
      <div className="bg-[var(--color-surface-2)] rounded-b-2xl px-6 pt-32 pb-6 flex flex-col gap-5 items-center text-center">

        {/* Nombre y ubicación — centrados */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={1} className="flex flex-col items-center gap-1">
          <h1 className="text-2xl font-black text-[var(--color-text)] tracking-tight">
            {profile.name}
          </h1>
          {profile.location && (
            <p className="flex items-center gap-1.5 text-purple-300/80 text-sm font-medium">
              <MapPin size={12} />
              {profile.location}
            </p>
          )}
        </motion.div>

        {/* Bio */}
        {profile.bio && (
          <motion.p
            variants={fadeUp} initial="hidden" animate="show" custom={2}
            className="text-sm text-[var(--color-text-muted)] leading-relaxed max-w-sm"
          >
            {profile.bio}
          </motion.p>
        )}

        {/* ── Stats ── */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="show" custom={3}
          className="grid grid-cols-3 gap-3 w-full"
        >
          {[
            { label: 'Posts', value: profile._count.posts },
            { label: 'Seguidores', value: profile._count.followers },
            { label: 'Siguiendo', value: profile._count.following },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="flex flex-col items-center justify-center bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl py-3 hover:border-purple-600/40 transition-colors"
            >
              <span className="text-2xl font-black text-[var(--color-text)]">{value}</span>
              <span className="text-xs text-[var(--color-text-muted)] mt-0.5">{label}</span>
            </div>
          ))}
        </motion.div>

        {/* ── Setlist de instrumentos ── */}
        {profile.instruments.length > 0 && (
          <motion.div
            variants={fadeUp} initial="hidden" animate="show" custom={4}
            className="flex flex-col gap-2 w-full"
          >
            <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-widest flex items-center justify-center gap-2">
              <Music2 size={12} /> Instrumentos
            </p>
            <div className="flex flex-col gap-1">
              {profile.instruments.map((instrument, index) => (
                <div
                  key={instrument}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[var(--color-surface)] transition-colors group"
                >
                  <span className="text-xs text-purple-500/60 font-mono w-5 text-right">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="flex-1 h-px bg-[var(--color-border)] group-hover:bg-purple-600/30 transition-colors" />
                  <span className="text-sm font-medium text-[var(--color-text)]">{instrument}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Géneros ── */}
        {profile.genres.length > 0 && (
          <motion.div
            variants={fadeUp} initial="hidden" animate="show" custom={5}
            className="flex flex-wrap gap-2 justify-center"
          >
            {profile.genres.map((genre) => (
              <span
                key={genre}
                className="px-3 py-1 text-xs font-semibold rounded-full border border-purple-500/30 text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 hover:border-purple-400/50 transition-colors cursor-default"
              >
                {genre}
              </span>
            ))}
          </motion.div>
        )}

        {/* Fecha */}
        <motion.p
          variants={fadeUp} initial="hidden" animate="show" custom={6}
          className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]"
        >
          <Calendar size={11} /> Miembro desde {joinedDate}
        </motion.p>
      </div>
    </div>
  )
}

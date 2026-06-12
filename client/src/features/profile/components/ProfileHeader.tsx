import { useRef } from 'react'
import { MapPin, Calendar, Music2, Camera } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { useUploadAvatar } from '../hooks/useProfile'
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
    transition: { delay: i * 0.08, duration: 0.4, ease: 'easeOut' as const },
  }),
}

export function ProfileHeader({ profile, isOwnProfile, onEdit }: ProfileHeaderProps) {
  const joinedDate = format(new Date(profile.createdAt), "MMM yyyy", { locale: es })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const { mutate: uploadAvatar, isPending: isUploading } = useUploadAvatar()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) uploadAvatar(file)
    e.target.value = ''
  }

  const initials = profile.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()

  return (
    <div className="relative rounded-2xl shadow-2xl">

      {/* ── Banner ── */}
      <div className="relative h-48 bg-[#080810] overflow-hidden rounded-t-2xl">
        <div className="absolute -top-10 left-1/4 w-48 h-64 bg-purple-600/25 rounded-full blur-3xl rotate-12" />
        <div className="absolute -top-10 right-1/4 w-48 h-64 bg-violet-500/20 rounded-full blur-3xl -rotate-12" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-48 bg-purple-400/15 rounded-full blur-2xl" />

        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
          className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10 text-purple-300"
        >
          <svg width="150" height="150" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
        </motion.div>

        {isOwnProfile && (
          <div className="absolute top-4 right-4">
            <Button variant="secondary" size="sm" onClick={onEdit}>
              Editar perfil
            </Button>
          </div>
        )}
      </div>

      {/* ── Avatar centrado ── */}
      <div className="absolute left-1/2 -translate-x-1/2 z-10" style={{ top: 'calc(12rem - 124px)' }}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="relative"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 rounded-full bg-purple-500/40 blur-lg"
          />

          {/* Avatar clickeable si es perfil propio */}
          <div
            className={`relative z-10 w-36 h-36 rounded-full overflow-hidden bg-purple-600/20 border-2 border-purple-600/40 flex items-center justify-center ${isOwnProfile ? 'cursor-pointer group' : ''}`}
            onClick={isOwnProfile ? () => fileInputRef.current?.click() : undefined}
          >
            {profile.avatar ? (
              <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-semibold text-purple-300">{initials || '?'}</span>
            )}

            {/* Overlay de cámara en hover */}
            {isOwnProfile && (
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                {isUploading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Camera size={20} className="text-white" />
                )}
              </div>
            )}
          </div>

          {/* Inputs ocultos */}
          {isOwnProfile && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileChange}
              />
            </>
          )}
        </motion.div>
      </div>

      {/* ── Contenido ── */}
      <div
        className="bg-[var(--color-surface-2)] rounded-b-2xl"
        style={{ paddingLeft: 24, paddingRight: 24, paddingTop: 40, paddingBottom: 20, display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center', textAlign: 'center' }}
      >

        {/* Nombre y ubicación */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={1} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
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

        {/* Stats */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="show" custom={3}
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, width: '100%'}}
        >
          {[
            { label: 'Posts', value: profile._count.posts },
            { label: 'Fans', value: profile._count.followers },
            { label: 'Músicos', value: profile._count.following },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="flex flex-col items-center justify-center bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl hover:border-purple-600/40 transition-colors"
              style={{ paddingTop: 2, paddingBottom: 2 }}
            >
              <span className="text-xs font-black text-[var(--color-text)]">{value}</span>
              <span className="text-xs text-[var(--color-text-muted)]" style={{ marginTop: 4 }}>{label}</span>
            </div>
          ))}
        </motion.div>

        {/* Instrumentos — solo texto, centrado */}
        {profile.instruments.length > 0 && (
          <motion.div
            variants={fadeUp} initial="hidden" animate="show" custom={4}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, width: '100%' }}
          >
            <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-widest flex items-center gap-2">
              <Music2 size={12} /> Instrumentos
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
              {profile.instruments.map((instrument) => (
                <span
                  key={instrument}
                  className="rounded-full border border-purple-500/30 bg-purple-500/10 font-semibold"
                  style={{ padding: '5px 12px', fontSize: 12, color: 'white' }}
                >
                  {instrument}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Géneros — mismas píldoras que EditProfile */}
        {profile.genres.length > 0 && (
          <motion.div
            variants={fadeUp} initial="hidden" animate="show" custom={5}
            style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}
          >
            {profile.genres.map((genre) => (
              <span
                key={genre}
                className="rounded-full bg-purple-600 text-white border border-purple-500 font-semibold"
                style={{ padding: '5px 12px', fontSize: 12 }}
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

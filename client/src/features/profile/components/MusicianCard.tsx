import { useNavigate } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import { motion } from 'framer-motion'
import { Avatar } from '@/components/ui/Avatar'
import { FollowButton } from './FollowButton'
import type { UserProfile } from '@/types/user.types'

interface MusicianCardProps {
  musician: UserProfile
  index: number
}

export function MusicianCard({ musician, index }: MusicianCardProps) {
  const navigate = useNavigate()

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35, ease: 'easeOut' }}
      onClick={() => navigate(`/profile/${musician.id}`)}
      className="flex items-start gap-4 p-5 rounded-2xl bg-[var(--color-surface-2)] border border-[var(--color-border)]
        hover:border-purple-600/40 hover:bg-[var(--color-surface-3,var(--color-surface-2))]
        cursor-pointer transition-all group"
    >
      {/* Avatar */}
      <div className="shrink-0">
        <Avatar size="lg" src={musician.avatar} alt={musician.name} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-bold text-[var(--color-text)] group-hover:text-purple-300 transition-colors truncate">
              {musician.name}
            </p>
            {musician.location && (
              <p className="flex items-center gap-1 text-xs text-[var(--color-text-muted)] mt-0.5">
                <MapPin size={10} />
                {musician.location}
              </p>
            )}
          </div>

          {/* Follow button — stopPropagation en el propio botón */}
          <div className="shrink-0">
            <FollowButton
              userId={musician.id}
              isFollowing={musician.isFollowing}
              size="sm"
            />
          </div>
        </div>

        {/* Bio */}
        {musician.bio && (
          <p className="text-xs text-[var(--color-text-muted)] line-clamp-2 leading-relaxed">
            {musician.bio}
          </p>
        )}

        {/* Instrumentos + géneros */}
        {(musician.instruments.length > 0 || musician.genres.length > 0) && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
            {musician.instruments.slice(0, 2).map((inst) => (
              <span
                key={inst}
                className="rounded-full border border-purple-500/30 bg-purple-500/10 font-semibold"
                style={{ padding: '5px 12px', fontSize: 12, color: 'white' }}
              >
                {inst}
              </span>
            ))}
            {musician.genres.slice(0, 2).map((genre) => (
              <span
                key={genre}
                className="rounded-full bg-purple-600 text-white border border-purple-500 font-semibold"
                style={{ padding: '5px 12px', fontSize: 12 }}
              >
                {genre}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

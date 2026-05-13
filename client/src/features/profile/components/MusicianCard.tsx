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
      className="flex items-start gap-4 p-4 rounded-2xl bg-[var(--color-surface-2)] border border-[var(--color-border)]
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
          <div className="flex flex-wrap gap-1 mt-1">
            {musician.instruments.slice(0, 2).map((inst) => (
              <span
                key={inst}
                className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/25"
              >
                {inst}
              </span>
            ))}
            {musician.genres.slice(0, 2).map((genre) => (
              <span
                key={genre}
                className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-[var(--color-surface)] text-[var(--color-text-muted)] border border-[var(--color-border)]"
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

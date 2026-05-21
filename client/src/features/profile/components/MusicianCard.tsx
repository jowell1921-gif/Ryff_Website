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
      className="bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:border-purple-500/40 cursor-pointer transition-all"
      style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '16px 18px', borderRadius: 18 }}
    >
      {/* Avatar */}
      <div style={{ flexShrink: 0 }}>
        <Avatar size="lg" src={musician.avatar} alt={musician.name} />
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 5 }}>

        {/* Nombre + follow */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
          <div style={{ minWidth: 0 }}>
            <p
              className="text-[var(--color-text)] hover:text-purple-300 transition-colors truncate"
              style={{ fontSize: 15, fontWeight: 700 }}
            >
              {musician.name}
            </p>
            {musician.location && (
              <p
                className="text-[var(--color-text-muted)]"
                style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, marginTop: 2 }}
              >
                <MapPin size={11} />
                {musician.location}
              </p>
            )}
          </div>
          <div style={{ flexShrink: 0 }}>
            <FollowButton userId={musician.id} isFollowing={musician.isFollowing} size="sm" />
          </div>
        </div>

        {/* Bio */}
        {musician.bio && (
          <p
            className="text-[var(--color-text-muted)]"
            style={{ fontSize: 13, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
          >
            {musician.bio}
          </p>
        )}

        {/* Pills de instrumentos y géneros */}
        {(musician.instruments.length > 0 || musician.genres.length > 0) && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 2 }}>
            {musician.instruments.slice(0, 2).map((inst) => (
              <span
                key={inst}
                className="rounded-full border border-purple-500/30 bg-purple-500/10 font-semibold"
                style={{ padding: '4px 12px', fontSize: 11, color: 'white' }}
              >
                {inst}
              </span>
            ))}
            {musician.genres.slice(0, 2).map((g) => (
              <span
                key={g}
                className="rounded-full bg-purple-600 border border-purple-500 font-semibold"
                style={{ padding: '4px 12px', fontSize: 11, color: 'white' }}
              >
                {g}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

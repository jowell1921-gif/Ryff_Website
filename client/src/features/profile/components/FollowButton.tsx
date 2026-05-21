import { UserPlus, UserCheck, Loader2 } from 'lucide-react'
import { useFollowUser, useUnfollowUser } from '../hooks/useProfile'

interface FollowButtonProps {
  userId: string
  isFollowing: boolean
  size?: 'sm' | 'md'
}

const sizes = {
  sm: { padding: '5px 14px', fontSize: 12, iconSize: 12, gap: 6 },
  md: { padding: '9px 22px', fontSize: 14, iconSize: 14, gap: 7 },
}

export function FollowButton({ userId, isFollowing, size = 'md' }: FollowButtonProps) {
  const follow = useFollowUser(userId)
  const unfollow = useUnfollowUser(userId)
  const isPending = follow.isPending || unfollow.isPending
  const s = sizes[size]

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isPending) return
    isFollowing ? unfollow.mutate() : follow.mutate()
  }

  if (isFollowing) {
    return (
      <button
        onClick={handleClick}
        disabled={isPending}
        style={{ display: 'flex', alignItems: 'center', gap: s.gap, padding: s.padding, fontSize: s.fontSize, borderRadius: 999, fontWeight: 600, border: '1px solid', transition: 'all 0.2s' }}
        className="bg-purple-600/20 text-purple-300 border-purple-600/40 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/40 disabled:opacity-50 disabled:cursor-not-allowed group"
      >
        {isPending
          ? <Loader2 size={s.iconSize} className="animate-spin" />
          : <UserCheck size={s.iconSize} className="group-hover:hidden" />
        }
        <span className="group-hover:hidden">Siguiendo</span>
        {!isPending && (
          <span className="hidden group-hover:inline">Dejar de seguir</span>
        )}
      </button>
    )
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      style={{ display: 'flex', alignItems: 'center', gap: s.gap, padding: s.padding, fontSize: s.fontSize, borderRadius: 999, fontWeight: 600, border: '1px solid', transition: 'all 0.2s' }}
      className="bg-purple-600 text-white border-purple-500 hover:bg-purple-700 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isPending
        ? <Loader2 size={s.iconSize} className="animate-spin" />
        : <UserPlus size={s.iconSize} />
      }
      Seguir
    </button>
  )
}

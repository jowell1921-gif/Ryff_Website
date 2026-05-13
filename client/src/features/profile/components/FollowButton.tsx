import { UserPlus, UserCheck, Loader2 } from 'lucide-react'
import { useFollowUser, useUnfollowUser } from '../hooks/useProfile'

interface FollowButtonProps {
  userId: string
  isFollowing: boolean
  size?: 'sm' | 'md'
}

export function FollowButton({ userId, isFollowing, size = 'md' }: FollowButtonProps) {
  const follow = useFollowUser(userId)
  const unfollow = useUnfollowUser(userId)

  const isPending = follow.isPending || unfollow.isPending

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isPending) return
    isFollowing ? unfollow.mutate() : follow.mutate()
  }

  const sizeClasses = size === 'sm'
    ? 'px-3 py-1 text-xs gap-1'
    : 'px-4 py-1.5 text-sm gap-1.5'

  if (isFollowing) {
    return (
      <button
        onClick={handleClick}
        disabled={isPending}
        className={`flex items-center rounded-full font-semibold border transition-all
          bg-purple-600/20 text-purple-300 border-purple-600/40
          hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/40
          disabled:opacity-50 disabled:cursor-not-allowed group ${sizeClasses}`}
      >
        {isPending
          ? <Loader2 size={size === 'sm' ? 12 : 14} className="animate-spin" />
          : <UserCheck size={size === 'sm' ? 12 : 14} className="group-hover:hidden" />
        }
        <span className="group-hover:hidden">Siguiendo</span>
        {!isPending && (
          <>
            <span className="hidden group-hover:inline text-xs">Dejar de seguir</span>
          </>
        )}
      </button>
    )
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`flex items-center rounded-full font-semibold border transition-all
        bg-purple-600 text-white border-purple-500
        hover:bg-purple-700 hover:scale-105
        disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses}`}
    >
      {isPending
        ? <Loader2 size={size === 'sm' ? 12 : 14} className="animate-spin" />
        : <UserPlus size={size === 'sm' ? 12 : 14} />
      }
      Seguir
    </button>
  )
}

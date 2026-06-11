import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { Repeat2 } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { PostCard } from './PostCard'
import type { RepostItem } from '@/types/post.types'

interface RepostCardProps {
  repost: RepostItem
}

export function RepostCard({ repost }: RepostCardProps) {
  const timeAgo = formatDistanceToNow(new Date(repost.createdAt), { addSuffix: true, locale: es })

  return (
    <article
      className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl hover:border-purple-600/30 transition-colors duration-200"
      style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 10 }}
    >
      {/* Cabecera: quien difundió */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Repeat2 size={13} className="text-green-400 shrink-0" />
        <Avatar size="sm" alt={repost.repostedBy.name} src={repost.repostedBy.avatar} />
        <span className="text-xs font-semibold text-[var(--color-text)]">{repost.repostedBy.name}</span>
        <span className="text-xs text-[var(--color-text-muted)]">difundió · {timeAgo}</span>
      </div>

      {/* Comentario del que difunde */}
      {repost.comment && (
        <p className="text-sm text-[var(--color-text)] leading-relaxed" style={{ paddingLeft: 4 }}>
          {repost.comment}
        </p>
      )}

      {/* Post original embebido */}
      <div className="border border-[var(--color-border)] rounded-xl overflow-hidden">
        <PostCard post={repost.post} />
      </div>
    </article>
  )
}

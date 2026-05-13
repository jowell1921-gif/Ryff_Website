import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import type { Post } from '@/types/post.types'

interface PostCardProps {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  const timeAgo = formatDistanceToNow(new Date(post.createdAt), {
    addSuffix: true,
    locale: es,
  })

  return (
    <article className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl p-5 flex flex-col gap-4 hover:border-purple-600/30 transition-colors duration-200">

      {/* Cabecera — autor y tiempo */}
      <div className="flex items-center gap-3">
        <Avatar size="md" alt={post.author.name} src={post.author.avatar} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[var(--color-text)] truncate">
            {post.author.name}
          </p>
          <p className="text-xs text-[var(--color-text-muted)]">{timeAgo}</p>
        </div>
      </div>

      {/* Contenido */}
      <p className="text-sm text-[var(--color-text)] leading-relaxed whitespace-pre-wrap">
        {post.content}
      </p>

      {/* Instrumentos del autor */}
      {post.author.instruments.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {post.author.instruments.map((instrument) => (
            <Badge key={instrument} variant="purple">{instrument}</Badge>
          ))}
        </div>
      )}

    </article>
  )
}

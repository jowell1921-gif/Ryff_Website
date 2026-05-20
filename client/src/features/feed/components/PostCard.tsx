import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { MessageCircle } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Pill } from '@/components/ui/Pill'
import { detectEmbed, embedHeight } from '@/lib/mediaEmbed'
import { CommentSection } from '@/features/comments/components/CommentSection'
import { useReactToPost } from '../hooks/useFeed'
import type { Post, ReactionType } from '@/types/post.types'

interface PostCardProps {
  post: Post
}

const REACTIONS: { type: ReactionType; emoji: string; activeClass: string }[] = [
  { type: 'APLAUSO', emoji: '👏', activeClass: 'text-purple-400' },
  { type: 'FIRE',    emoji: '🔥', activeClass: 'text-orange-400' },
  { type: 'ASOMBRA', emoji: '😮', activeClass: 'text-yellow-400' },
]

function reactionCount(post: Post, type: ReactionType) {
  if (type === 'APLAUSO') return post.clapCount
  if (type === 'FIRE')    return post.fireCount
  return post.asombraCount
}

function reactionActive(post: Post, type: ReactionType) {
  if (type === 'APLAUSO') return post.isClapped
  if (type === 'FIRE')    return post.isFired
  return post.isAsombra
}

export function PostCard({ post }: PostCardProps) {
  const [showComments, setShowComments] = useState(false)
  const reactToPost = useReactToPost()
  const timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: es })
  const embed = detectEmbed(post.content)

  return (
    <article className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl hover:border-purple-600/30 transition-colors duration-200" style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 10 }}>

      {/* Cabecera */}
      <div className="flex items-center gap-3">
        <Avatar size="md" alt={post.author.name} src={post.author.avatar} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[var(--color-text)] truncate">{post.author.name}</p>
          <p className="text-xs text-[var(--color-text-muted)]">{timeAgo}</p>
        </div>
      </div>

      {/* Contenido */}
      <p className="text-sm text-[var(--color-text)] leading-relaxed whitespace-pre-wrap">
        {post.content}
      </p>

      {/* Embed multimedia */}
      {embed && (
        <div className="rounded-xl overflow-hidden border border-[var(--color-border)]">
          <iframe
            src={embed.embedUrl}
            height={embedHeight(embed.type)}
            width="100%"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            style={{ border: 'none', display: 'block' }}
          />
        </div>
      )}

      {/* Footer: instrumentos + acciones */}
      <div className="flex items-center justify-between gap-2">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {post.author.instruments.slice(0, 5).map((i) => (
            <Pill key={i} variant="outline" size="sm">{i}</Pill>
          ))}
        </div>

        <div className="flex items-center gap-4 shrink-0">
          {/* Botón comentarios */}
          <button
            onClick={() => setShowComments((v) => !v)}
            className="flex items-center gap-1.5 group"
          >
            <MessageCircle
              size={16}
              className={`transition-colors ${
                showComments
                  ? 'text-purple-400'
                  : 'text-[var(--color-text-muted)] group-hover:text-purple-400'
              }`}
            />
            <span className={`text-xs font-medium ${showComments ? 'text-purple-400' : 'text-[var(--color-text-muted)]'}`}>
              {post.commentsCount}
            </span>
          </button>

          {/* Reacciones */}
          {REACTIONS.map((r) => {
            const active = reactionActive(post, r.type)
            const count  = reactionCount(post, r.type)
            return (
              <button
                key={r.type}
                onClick={() => reactToPost.mutate({ postId: post.id, type: r.type })}
                disabled={reactToPost.isPending}
                className="flex items-center gap-1 group"
              >
                <span
                  className={`text-base leading-none transition-all duration-200 select-none ${
                    active
                      ? 'opacity-100 scale-110'
                      : 'opacity-30 grayscale hover:opacity-60 hover:grayscale-0'
                  }`}
                >
                  {r.emoji}
                </span>
                <span className={`text-xs font-medium transition-colors ${
                  active ? r.activeClass : 'text-[var(--color-text-muted)]'
                }`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Sección de comentarios (expandible) */}
      {showComments && <CommentSection postId={post.id} />}

    </article>
  )
}

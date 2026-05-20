import { useState, useRef, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { Trash2, Send } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { useAuthStore } from '@/stores/authStore'
import { useComments, useCreateComment, useDeleteComment } from '../hooks/useComments'

interface CommentSectionProps {
  postId: string
}

export function CommentSection({ postId }: CommentSectionProps) {
  const [text, setText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const currentUser = useAuthStore((s) => s.user)

  const { data: comments = [], isLoading } = useComments(postId, true)
  const createComment = useCreateComment(postId)
  const deleteComment = useDeleteComment(postId)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = () => {
    const trimmed = text.trim()
    if (!trimmed || createComment.isPending) return
    createComment.mutate(trimmed, { onSuccess: () => setText('') })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="flex flex-col gap-3 pt-3 border-t border-[var(--color-border)]">

      {/* Lista de comentarios */}
      {isLoading ? (
        <div className="flex flex-col gap-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-10 rounded-lg bg-[var(--color-surface)] animate-pulse" />
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-xs text-[var(--color-text-muted)] text-center py-2">
          Sé el primero en comentar
        </p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {comments.map((comment) => {
            const timeAgo = formatDistanceToNow(new Date(comment.createdAt), {
              addSuffix: true,
              locale: es,
            })
            const isOwn = comment.author.id === currentUser?.id

            return (
              <div key={comment.id} className="flex items-start gap-2.5 group">
                <Avatar size="xs" src={comment.author.avatar} alt={comment.author.name} />
                <div className="flex-1 min-w-0 bg-[var(--color-surface)] rounded-xl px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-[var(--color-text)] truncate">
                      {comment.author.name}
                    </span>
                    <span className="text-[10px] text-[var(--color-text-muted)] shrink-0">{timeAgo}</span>
                  </div>
                  <p className="text-xs text-[var(--color-text)] mt-0.5 leading-relaxed">
                    {comment.content}
                  </p>
                </div>
                {isOwn && (
                  <button
                    onClick={() => deleteComment.mutate(comment.id)}
                    disabled={deleteComment.isPending}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--color-text-muted)] hover:text-red-400 mt-2 shrink-0"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Input para nuevo comentario */}
      <div className="flex items-center gap-2">
        <Avatar size="xs" src={currentUser?.avatar ?? null} alt={currentUser?.name ?? ''} />
        <div className="flex-1 flex items-center gap-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-3 py-2 focus-within:border-purple-500 transition-colors">
          <input
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe un comentario..."
            className="flex-1 bg-transparent text-xs text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] outline-none"
          />
          <button
            onClick={handleSubmit}
            disabled={!text.trim() || createComment.isPending}
            className="text-purple-400 hover:text-purple-300 disabled:opacity-30 transition-colors shrink-0"
          >
            <Send size={13} />
          </button>
        </div>
      </div>

    </div>
  )
}

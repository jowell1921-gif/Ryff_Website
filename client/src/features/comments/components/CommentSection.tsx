import { useState, useRef, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { Trash2, Send } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { useAuthStore } from '@/stores/authStore'
import { useComments, useCreateComment, useDeleteComment } from '../hooks/useComments'
import { profileService } from '@/features/profile/services/profileService'
import type { UserProfile } from '@/types/user.types'

interface CommentSectionProps {
  postId: string
}

// Renders @[Name] mentions as highlighted spans
function renderContent(content: string) {
  const parts = content.split(/(@\[[^\]]+\])/g)
  return parts.map((part, i) => {
    const match = part.match(/^@\[([^\]]+)\]$/)
    if (match) {
      return (
        <span key={i} className="text-purple-400 font-semibold">
          @{match[1]}
        </span>
      )
    }
    return <span key={i}>{part}</span>
  })
}

export function CommentSection({ postId }: CommentSectionProps) {
  const [text, setText] = useState('')
  const [mentionQuery, setMentionQuery] = useState<string | null>(null)
  const [mentionStart, setMentionStart] = useState(-1)
  const [mentionResults, setMentionResults] = useState<UserProfile[]>([])
  const [isSearchingMention, setIsSearchingMention] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const currentUser = useAuthStore((s) => s.user)

  const { data: comments = [], isLoading } = useComments(postId, true)
  const createComment = useCreateComment(postId)
  const deleteComment = useDeleteComment(postId)

  useEffect(() => { inputRef.current?.focus() }, [])

  // Search users when mention query changes
  useEffect(() => {
    if (mentionQuery === null || mentionQuery.length < 1) {
      setMentionResults([])
      return
    }
    const timer = setTimeout(async () => {
      setIsSearchingMention(true)
      try {
        const users = await profileService.searchUsers({ search: mentionQuery })
        setMentionResults(users.slice(0, 5))
      } finally {
        setIsSearchingMention(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [mentionQuery])

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setText(val)

    const cursor = e.target.selectionStart ?? val.length
    const before = val.slice(0, cursor)
    // Detect @word at the end of text before cursor
    const atMatch = before.match(/@(\w*)$/)
    if (atMatch) {
      setMentionQuery(atMatch[1])
      setMentionStart(cursor - atMatch[0].length)
    } else {
      setMentionQuery(null)
      setMentionResults([])
    }
  }

  const selectMention = (user: UserProfile) => {
    const before = text.slice(0, mentionStart)
    const mentionLen = (mentionQuery?.length ?? 0) + 1 // +1 for @
    const after = text.slice(mentionStart + mentionLen)
    setText(`${before}@[${user.name}] ${after}`)
    setMentionQuery(null)
    setMentionResults([])
    inputRef.current?.focus()
  }

  const closeMention = () => {
    setMentionQuery(null)
    setMentionResults([])
  }

  const handleSubmit = () => {
    const trimmed = text.trim()
    if (!trimmed || createComment.isPending) return
    createComment.mutate(trimmed, { onSuccess: () => setText('') })
    closeMention()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') { closeMention(); return }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const showDropdown = mentionQuery !== null && (mentionResults.length > 0 || isSearchingMention)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 12, borderTop: '1px solid var(--color-border)' }}>

      {/* Lista de comentarios */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[1, 2].map((i) => (
            <div key={i} className="h-10 rounded-lg bg-[var(--color-surface)] animate-pulse" />
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-[var(--color-text-muted)]" style={{ fontSize: 12, textAlign: 'center', paddingTop: 8, paddingBottom: 8 }}>
          Sé el primero en comentar
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {comments.map((comment) => {
            const timeAgo = formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: es })
            const isOwn = comment.author.id === currentUser?.id

            return (
              <div key={comment.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }} className="group">
                <Avatar size="xs" src={comment.author.avatar} alt={comment.author.name} />
                <div
                  className="bg-[var(--color-surface)] border border-[var(--color-border)]"
                  style={{ flex: 1, minWidth: 0, borderRadius: 12, padding: '8px 12px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <span className="truncate text-[var(--color-text)]" style={{ fontSize: 12, fontWeight: 600 }}>
                      {comment.author.name}
                    </span>
                    <span className="text-[var(--color-text-muted)]" style={{ fontSize: 10, flexShrink: 0 }}>{timeAgo}</span>
                  </div>
                  <p className="text-[var(--color-text)]" style={{ fontSize: 12, marginTop: 4, lineHeight: 1.5 }}>
                    {renderContent(comment.content)}
                  </p>
                </div>
                {isOwn && (
                  <button
                    onClick={() => deleteComment.mutate(comment.id)}
                    disabled={deleteComment.isPending}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--color-text-muted)] hover:text-red-400 shrink-0"
                    style={{ marginTop: 10 }}
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Input con mention dropdown */}
      <div style={{ position: 'relative' }}>
        {/* Dropdown de menciones */}
        {showDropdown && (
          <div
            ref={dropdownRef}
            className="bg-[var(--color-surface-2)] border border-[var(--color-border)]"
            style={{ position: 'absolute', bottom: '100%', left: 0, right: 0, borderRadius: 12, marginBottom: 4, zIndex: 20, overflow: 'hidden' }}
          >
            {isSearchingMention ? (
              <p className="text-[var(--color-text-muted)]" style={{ fontSize: 12, textAlign: 'center', padding: '10px 0' }}>
                Buscando...
              </p>
            ) : (
              mentionResults.map((user) => (
                <button
                  key={user.id}
                  onMouseDown={(e) => { e.preventDefault(); selectMention(user) }}
                  className="hover:bg-[var(--color-surface)] transition-colors"
                  style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left', padding: '8px 12px' }}
                >
                  <Avatar size="xs" src={user.avatar} alt={user.name} />
                  <span className="text-[var(--color-text)]" style={{ fontSize: 13, fontWeight: 600 }}>{user.name}</span>
                  {user.location && (
                    <span className="text-[var(--color-text-muted)]" style={{ fontSize: 11 }}>{user.location}</span>
                  )}
                </button>
              ))
            )}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Avatar size="xs" src={currentUser?.avatar ?? null} alt={currentUser?.name ?? ''} />
          <div
            className="bg-[var(--color-surface)] border border-[var(--color-border)] focus-within:border-purple-500 transition-colors"
            style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, borderRadius: 12, padding: '8px 12px' }}
          >
            <input
              ref={inputRef}
              value={text}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              onBlur={() => setTimeout(closeMention, 150)}
              placeholder="Escribe un comentario... usa @ para mencionar"
              className="placeholder:text-[var(--color-text-muted)] text-[var(--color-text)]"
              style={{ flex: 1, background: 'transparent', fontSize: 12, outline: 'none' }}
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

    </div>
  )
}

import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  MessageCircle, MoreVertical, Trash2, Share2, Ban, UserPlus, Link2,
  Music, Video, Image, Repeat2,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Avatar } from '@/components/ui/Avatar'
import { Pill } from '@/components/ui/Pill'
import { detectEmbed, embedHeight, extractOriginalUrl } from '@/lib/mediaEmbed'
import { CommentSection } from '@/features/comments/components/CommentSection'
import { useReactToPost, useDeletePost, useRepostPost } from '../hooks/useFeed'
import { useFollowUser } from '@/features/profile/hooks/useProfile'
import { useAuthStore } from '@/stores/authStore'
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

// Strip the platform URL from displayed text — it's already rendered as an embed
function getDisplayContent(post: Post): string {
  const urlToRemove = post.mediaUrl ?? extractOriginalUrl(post.content)
  if (!urlToRemove) return post.content
  return post.content.replace(urlToRemove, '').trim()
}

// Returns the shareable external URL for a post (platform link or uploaded media)
function getShareUrl(post: Post): string | null {
  if (post.mediaUrl) {
    // Uploaded file or already-stored platform URL
    return post.mediaUrl
  }
  // Detect from content (backwards compat for posts without stored mediaUrl)
  return extractOriginalUrl(post.content)
}

function isExternalPlatformUrl(url: string | null): boolean {
  if (!url) return false
  return detectEmbed(url) !== null
}

function MediaPreview({ post }: { post: Post }) {
  if (post.mediaUrl && post.mediaType) {
    if (post.mediaType === 'IMAGE') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {post.mediaName && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Image size={13} className="text-purple-400" />
              <span className="text-purple-300" style={{ fontSize: 12, fontWeight: 600 }}>{post.mediaName}</span>
            </div>
          )}
          <img src={post.mediaUrl} alt={post.mediaName ?? 'media'} className="rounded-xl" style={{ width: '100%', maxHeight: 300, objectFit: 'cover' }} />
        </div>
      )
    }
    if (post.mediaType === 'VIDEO') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {post.mediaName && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Video size={13} className="text-purple-400" />
              <span className="text-purple-300" style={{ fontSize: 12, fontWeight: 600 }}>{post.mediaName}</span>
            </div>
          )}
          <video src={post.mediaUrl} controls className="rounded-xl" style={{ width: '100%', maxHeight: 300 }} />
        </div>
      )
    }
    if (post.mediaType === 'AUDIO') {
      return (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl" style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Music size={14} className="text-purple-400" />
            <span className="text-[var(--color-text)]" style={{ fontSize: 13, fontWeight: 600 }}>
              {post.mediaName ?? 'Audio'}
            </span>
          </div>
          <audio src={post.mediaUrl} controls style={{ width: '100%' }} />
        </div>
      )
    }
  }

  // Embed from external platform — check mediaUrl first, then content
  const embedSource = post.mediaUrl ?? post.content
  const embed = detectEmbed(embedSource)
  if (embed) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {post.mediaName && (
          <span className="text-[var(--color-text)]" style={{ fontSize: 14, fontWeight: 600 }}>
            {post.mediaName}
          </span>
        )}
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
      </div>
    )
  }

  return null
}

export function PostCard({ post }: PostCardProps) {
  const [showComments, setShowComments] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [showRepostModal, setShowRepostModal] = useState(false)
  const [repostComment, setRepostComment] = useState('')
  const menuRef = useRef<HTMLDivElement>(null)
  const repostRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const currentUser = useAuthStore((s) => s.user)
  const isOwn = currentUser?.id === post.author.id

  const reactToPost = useReactToPost()
  const deletePost  = useDeletePost()
  const repostPost  = useRepostPost()
  const followUser  = useFollowUser(post.author.id)

  const timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: es })

  const shareUrl  = getShareUrl(post)
  const hasPlatformLink = isExternalPlatformUrl(shareUrl)

  // Close menu on outside click
  useEffect(() => {
    if (!showMenu) return
    const handle = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [showMenu])

  // Close repost modal on outside click
  useEffect(() => {
    if (!showRepostModal) return
    const handle = (e: MouseEvent) => {
      if (repostRef.current && !repostRef.current.contains(e.target as Node)) {
        setShowRepostModal(false)
        setRepostComment('')
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [showRepostModal])

  const handleShare = async () => {
    setShowMenu(false)
    const url = shareUrl ?? window.location.href
    const shareData = { title: post.mediaName ?? post.author.name, text: post.content, url }
    if (navigator.share) {
      try { await navigator.share(shareData) } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(url)
    }
  }

  const handleCopyLink = async () => {
    if (shareUrl) await navigator.clipboard.writeText(shareUrl)
    setShowMenu(false)
  }

  const handleBlock = () => {
    navigate(`/block/${post.author.id}`)
    setShowMenu(false)
  }

  const handleFollow = () => {
    followUser.mutate()
    setShowMenu(false)
  }

  const handleDelete = () => {
    deletePost.mutate(post.id)
    setShowMenu(false)
  }

  const menuItems = [
    ...(isOwn ? [{ label: 'Borrar publicación', icon: Trash2, color: 'text-red-400', action: handleDelete }] : []),
    { label: 'Compartir', icon: Share2, color: 'text-[var(--color-text)]', action: handleShare },
    ...(!isOwn ? [
      { label: 'Bloquear usuario', icon: Ban, color: 'text-red-400', action: handleBlock },
      { label: 'Seguir', icon: UserPlus, color: 'text-purple-400', action: handleFollow },
    ] : []),
    // "Copiar enlace" only when the post has an external platform URL
    ...(hasPlatformLink ? [{ label: 'Copiar enlace', icon: Link2, color: 'text-[var(--color-text)]', action: handleCopyLink }] : []),
  ]

  return (
    <article className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl hover:border-purple-600/30 transition-colors duration-200" style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 10 }}>

      {/* Cabecera */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Avatar size="md" alt={post.author.name} src={post.author.avatar} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p className="text-sm font-semibold text-[var(--color-text)] truncate">{post.author.name}</p>
          <p className="text-xs text-[var(--color-text-muted)]">{timeAgo}</p>
        </div>

        {/* Menú ⋮ */}
        <div ref={menuRef} style={{ position: 'relative', flexShrink: 0 }}>
          <button
            onClick={() => setShowMenu((v) => !v)}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors rounded-lg"
            style={{ padding: 4 }}
          >
            <MoreVertical size={17} />
          </button>

          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: -6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: -6 }}
                transition={{ duration: 0.14, ease: 'easeOut' }}
                className="bg-[var(--color-surface-2)] border border-[var(--color-border)]"
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 4px)',
                  right: 0,
                  borderRadius: 14,
                  minWidth: 200,
                  zIndex: 50,
                  overflow: 'hidden',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
                  transformOrigin: 'top right',
                }}
              >
                {menuItems.map(({ label, icon: Icon, color, action }) => (
                  <button
                    key={label}
                    onClick={action}
                    className={`hover:bg-[var(--color-surface)] transition-colors ${color}`}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left', padding: '11px 16px', fontSize: 13, fontWeight: 500 }}
                  >
                    <Icon size={15} />
                    {label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Contenido de texto — URL de plataforma oculta (se muestra como embed) */}
      {getDisplayContent(post) && (
        <p className="text-sm text-[var(--color-text)] leading-relaxed whitespace-pre-wrap">
          {getDisplayContent(post)}
        </p>
      )}

      {/* Media */}
      <MediaPreview post={post} />

      {/* Footer: instrumentos + acciones */}
      <div className="flex items-center justify-between gap-2">
        <div>
          {post.author.role && (
            <Pill variant="outline">{post.author.role}</Pill>
          )}
        </div>

        <div className="flex items-center gap-4 shrink-0">
          {/* Comentarios */}
          <button onClick={() => setShowComments((v) => !v)} className="flex items-center gap-1.5 group">
            <MessageCircle
              size={16}
              className={`transition-colors ${showComments ? 'text-purple-400' : 'text-[var(--color-text-muted)] group-hover:text-purple-400'}`}
            />
            <span className={`text-xs font-medium ${showComments ? 'text-purple-400' : 'text-[var(--color-text-muted)]'}`}>
              {post.commentsCount}
            </span>
          </button>

          {/* Difundir — solo en publicaciones ajenas */}
          {!isOwn && <div ref={repostRef} style={{ position: 'relative' }}>
            <button
              onClick={() => {
                if (post.isReposted) {
                  repostPost.mutate({ postId: post.id })
                } else {
                  setShowRepostModal((v) => !v)
                }
              }}
              disabled={repostPost.isPending}
              className="flex items-center gap-1 group"
              title="Difundir"
            >
              <Repeat2
                size={18}
                className={`transition-colors ${
                  post.isReposted
                    ? 'text-green-400'
                    : 'text-[var(--color-text-muted)] group-hover:text-green-400'
                }`}
              />
              <span className={`text-xs font-medium transition-colors ${post.isReposted ? 'text-green-400' : 'text-[var(--color-text-muted)]'}`}>
                {post.repostCount}
              </span>
            </button>

            <AnimatePresence>
              {showRepostModal && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.92, y: 6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92, y: 6 }}
                  transition={{ duration: 0.14, ease: 'easeOut' }}
                  className="bg-[var(--color-surface-2)] border border-[var(--color-border)]"
                  style={{
                    position: 'absolute',
                    bottom: 'calc(100% + 8px)',
                    right: 0,
                    borderRadius: 14,
                    width: 280,
                    zIndex: 50,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
                    transformOrigin: 'bottom right',
                    padding: 12,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                  }}
                >
                  <p className="text-xs font-semibold text-[var(--color-text)]">Difundir publicación</p>
                  <textarea
                    value={repostComment}
                    onChange={(e) => setRepostComment(e.target.value.slice(0, 200))}
                    placeholder="Añade un comentario (opcional)"
                    className="bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] rounded-lg resize-none"
                    style={{ fontSize: 13, padding: '8px 10px', minHeight: 70, outline: 'none', width: '100%' }}
                  />
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => { setShowRepostModal(false); setRepostComment('') }}
                      className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                      style={{ fontSize: 12, fontWeight: 500, padding: '6px 12px', borderRadius: 8 }}
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => {
                        repostPost.mutate({ postId: post.id, comment: repostComment || undefined })
                        setShowRepostModal(false)
                        setRepostComment('')
                      }}
                      disabled={repostPost.isPending}
                      className="bg-purple-600 hover:bg-purple-500 text-white transition-colors disabled:opacity-50"
                      style={{ fontSize: 12, fontWeight: 600, padding: '6px 14px', borderRadius: 8 }}
                    >
                      Difundir
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>}

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

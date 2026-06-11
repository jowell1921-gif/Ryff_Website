import { useRef, useEffect, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { Play, Pause, Music2, Video, X, MessageCircle, Share2, Trash2, Send } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { useReactToTrack, useTrackComments, useCreateTrackComment, useDeleteTrackComment } from '../hooks/useTracks'
import { useAuthStore } from '@/stores/authStore'
import type { Track } from '@/types/track.types'
import type { ReactionType } from '@/types/post.types'

const REACTIONS: { type: ReactionType; emoji: string; activeColor: string; activeKey: keyof Track; countKey: keyof Track }[] = [
  { type: 'APLAUSO', emoji: '👏', activeColor: '#a855f7', activeKey: 'isClapped',  countKey: 'clapCount'    },
  { type: 'FIRE',    emoji: '🔥', activeColor: '#f97316', activeKey: 'isFired',    countKey: 'fireCount'    },
  { type: 'ASOMBRA', emoji: '😮', activeColor: '#3b82f6', activeKey: 'isAsombra',  countKey: 'asombraCount' },
]

function formatDuration(secs: number | null) {
  if (!secs) return '--:--'
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

const MAX_TRACK_COMMENT = 150

function TrackCommentSection({ trackId }: { trackId: string }) {
  const [text, setText] = useState('')
  const currentUser = useAuthStore((s) => s.user)
  const { data: comments = [], isLoading } = useTrackComments(trackId)
  const createComment = useCreateTrackComment(trackId)
  const deleteComment = useDeleteTrackComment(trackId)

  const remaining = MAX_TRACK_COMMENT - text.length

  const handleSubmit = () => {
    const trimmed = text.trim()
    if (!trimmed || remaining < 0 || createComment.isPending) return
    createComment.mutate(trimmed, { onSuccess: () => setText('') })
  }

  return (
    <div
      className="border-t border-[var(--color-border)]"
      style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 12 }}
    >
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}>
          <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-[var(--color-text-muted)]" style={{ fontSize: 12, textAlign: 'center' }}>
          Sin comentarios aún.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {comments.map((c) => (
            <div key={c.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <Avatar size="xs" src={c.author.avatar} alt={c.author.name} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <span className="text-[var(--color-text)]" style={{ fontSize: 12, fontWeight: 700 }}>{c.author.name} </span>
                <span className="text-[var(--color-text-muted)]" style={{ fontSize: 12 }}>{c.content}</span>
              </div>
              {currentUser?.id === c.author.id && (
                <button
                  onClick={() => deleteComment.mutate(c.id)}
                  className="text-[var(--color-text-muted)] hover:text-red-400 transition-colors"
                  style={{ flexShrink: 0 }}
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <div
        className={`border bg-[var(--color-surface)] ${remaining < 0 ? 'border-red-500/50' : 'border-[var(--color-border)]'}`}
        style={{ borderRadius: 10, padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 8 }}
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, MAX_TRACK_COMMENT + 10))}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSubmit() } }}
          placeholder="Escribe un comentario..."
          className="bg-transparent text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]"
          style={{ flex: 1, border: 'none', outline: 'none', fontSize: 13 }}
        />
        <span className={`text-xs ${remaining < 20 ? (remaining < 0 ? 'text-red-400' : 'text-orange-400') : 'text-[var(--color-text-muted)]'}`}>
          {remaining}
        </span>
        <button
          onClick={handleSubmit}
          disabled={!text.trim() || remaining < 0 || createComment.isPending}
          className="text-purple-400 disabled:opacity-30 hover:text-purple-300 transition-colors"
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  )
}

export function TrackFeedCard({ track }: { track: Track }) {
  const isAudio = track.type === 'AUDIO'
  const [playing, setPlaying] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const reactToTrack = useReactToTrack()
  const [showVideo, setShowVideo] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)
  const timeAgo = formatDistanceToNow(new Date(track.createdAt), { addSuffix: true, locale: es })

  const handleShare = async () => {
    const shareData = { title: track.title, text: `${track.author.name} - ${track.title}`, url: track.url }
    if (navigator.share) {
      try { await navigator.share(shareData) } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(track.url)
    }
  }

  useEffect(() => {
    const el = audioRef.current
    if (!el) return
    if (playing) el.play().catch(() => setPlaying(false))
    else { el.pause(); el.currentTime = 0 }
  }, [playing])

  useEffect(() => {
    const el = audioRef.current
    if (!el) return
    const onEnded = () => setPlaying(false)
    const onTime = () => setCurrentTime(el.currentTime)
    el.addEventListener('ended', onEnded)
    el.addEventListener('timeupdate', onTime)
    return () => { el.removeEventListener('ended', onEnded); el.removeEventListener('timeupdate', onTime) }
  }, [])

  const progress = track.duration ? (currentTime / track.duration) * 100 : 0

  return (
    <>
      <article
        className="bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:border-purple-600/30 transition-colors duration-200"
        style={{ borderRadius: 14, padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}
      >
        {/* Cabecera */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar size="md" alt={track.author.name} src={track.author.avatar} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p className="text-[var(--color-text)]" style={{ fontSize: 14, fontWeight: 600 }}>{track.author.name}</p>
            <p className="text-[var(--color-text-muted)]" style={{ fontSize: 12 }}>{timeAgo}</p>
          </div>
          <span
            className={isAudio
              ? 'bg-purple-600/15 border border-purple-500/30 text-purple-300'
              : 'bg-blue-600/15 border border-blue-500/30 text-blue-300'
            }
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700 }}
          >
            {isAudio ? <Music2 size={11} /> : <Video size={11} />}
            {isAudio ? 'Audio' : 'Video'}
          </span>
        </div>

        {/* Título */}
        <p className="text-[var(--color-text)]" style={{ fontSize: 15, fontWeight: 700 }}>{track.title}</p>

        {/* Reproductor de audio */}
        {isAudio && (
          <div
            className="border border-purple-500/20"
            style={{ background: 'linear-gradient(135deg, rgba(88,28,135,0.15), rgba(49,46,129,0.1))', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14 }}
          >
            <button
              onClick={() => setPlaying((v) => !v)}
              className="bg-purple-600 hover:bg-purple-700 transition-colors shrink-0"
              style={{ width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {playing
                ? <Pause size={18} className="text-white" />
                : <Play size={18} className="text-white" style={{ marginLeft: 2 }} />
              }
            </button>

            {/* Barras de onda */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 3, height: 28, flexShrink: 0 }}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className={playing ? 'bg-purple-400' : 'bg-purple-600/35'}
                  style={{
                    width: 3,
                    borderRadius: 2,
                    height: playing ? undefined : `${6 + (i % 3) * 7}px`,
                    ...(playing && {
                      animation: `waveBar ${0.5 + i * 0.1}s ease-in-out infinite alternate`,
                      animationDelay: `${i * 0.07}s`,
                    }),
                  }}
                />
              ))}
            </div>

            {/* Barra de progreso */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div
                className="bg-purple-900/40 cursor-pointer"
                style={{ height: 4, borderRadius: 4, overflow: 'hidden' }}
                onClick={(e) => {
                  if (!audioRef.current || !track.duration) return
                  const rect = e.currentTarget.getBoundingClientRect()
                  const ratio = (e.clientX - rect.left) / rect.width
                  audioRef.current.currentTime = ratio * track.duration
                }}
              >
                <div
                  className="bg-purple-500 transition-all duration-100"
                  style={{ height: '100%', width: `${progress}%`, borderRadius: 4 }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="text-purple-300/70" style={{ fontSize: 11 }}>
                  {formatDuration(Math.floor(currentTime))}
                </span>
                <span className="text-purple-300/70" style={{ fontSize: 11 }}>
                  {formatDuration(track.duration)}
                </span>
              </div>
            </div>

            <audio ref={audioRef} src={track.url} preload="none" />
          </div>
        )}

        {/* Preview de video */}
        {!isAudio && (
          <button
            onClick={() => setShowVideo(true)}
            className="relative overflow-hidden group"
            style={{ borderRadius: 12, width: '100%', aspectRatio: '16/9', background: 'linear-gradient(135deg, rgba(37,99,235,0.2), rgba(79,70,229,0.2))' }}
          >
            {track.coverUrl ? (
              <img src={track.coverUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Video size={32} className="text-blue-400/50" />
              </div>
            )}
            <div
              className="absolute inset-0 flex items-center justify-center transition-opacity duration-200"
              style={{ background: 'rgba(0,0,0,0.35)' }}
            >
              <div className="bg-white/20 backdrop-blur-sm rounded-full group-hover:bg-white/30 transition-colors" style={{ width: 52, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Play size={22} className="text-white" style={{ marginLeft: 3 }} />
              </div>
            </div>
            {track.duration && (
              <span
                className="absolute bg-black/70 text-white"
                style={{ bottom: 8, right: 8, padding: '2px 7px', borderRadius: 6, fontSize: 12, fontWeight: 600 }}
              >
                {formatDuration(track.duration)}
              </span>
            )}
          </button>
        )}
        {/* Footer: comentar + compartir + reacciones */}
        <div
          className="border-t border-[var(--color-border)]"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10 }}
        >
          {/* Comentar + Compartir */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button
              onClick={() => setShowComments((v) => !v)}
              className="flex items-center gap-1.5 group"
            >
              <MessageCircle
                size={16}
                className={`transition-colors ${showComments ? 'text-purple-400' : 'text-[var(--color-text-muted)] group-hover:text-purple-400'}`}
              />
              <span className={`text-xs font-medium ${showComments ? 'text-purple-400' : 'text-[var(--color-text-muted)]'}`}>
                {track.commentsCount}
              </span>
            </button>

            <button onClick={handleShare} className="flex items-center group">
              <Share2
                size={16}
                className="text-[var(--color-text-muted)] group-hover:text-purple-400 transition-colors"
              />
            </button>
          </div>

          {/* Reacciones */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {REACTIONS.map(({ type, emoji, activeColor, activeKey, countKey }) => {
              const active = track[activeKey] as boolean
              const count = track[countKey] as number
              return (
                <button
                  key={type}
                  onClick={() => reactToTrack.mutate({ trackId: track.id, type })}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '5px 10px', borderRadius: 999,
                    fontSize: 13, fontWeight: 600,
                    color: active ? activeColor : 'var(--color-text-muted)',
                    background: active ? `${activeColor}18` : 'transparent',
                    border: `1px solid ${active ? activeColor + '50' : 'transparent'}`,
                    transition: 'all 0.15s',
                  }}
                  className="hover:opacity-80"
                >
                  <span style={{ fontSize: 15 }}>{emoji}</span>
                  {count > 0 && <span>{count}</span>}
                </button>
              )
            })}
          </div>
        </div>

        {/* Sección de comentarios */}
        {showComments && <TrackCommentSection trackId={track.id} />}
      </article>

      {/* Modal video */}
      {showVideo && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
          onClick={() => setShowVideo(false)}
        >
          <div style={{ width: '100%', maxWidth: 800, display: 'flex', flexDirection: 'column', gap: 12 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p className="text-white" style={{ fontSize: 15, fontWeight: 700 }}>{track.title}</p>
              <button onClick={() => setShowVideo(false)} className="text-white/60 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <video src={track.url} controls autoPlay style={{ width: '100%', borderRadius: 14, background: '#000', maxHeight: '70vh' }} />
          </div>
        </div>
      )}
    </>
  )
}

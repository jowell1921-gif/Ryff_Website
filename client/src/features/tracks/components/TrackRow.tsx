import { useRef, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { Play, Pause, Trash2, Video } from 'lucide-react'
import type { Track } from '@/types/track.types'

export function formatDuration(secs: number | null) {
  if (!secs) return '--:--'
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function formatSize(bytes: number | null) {
  if (!bytes) return ''
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function AudioTrackRow({
  track, isPlaying, onPlay, onStop, onDelete, deleting,
}: {
  track: Track
  isPlaying: boolean
  onPlay: () => void
  onStop: () => void
  onDelete?: () => void
  deleting?: boolean
}) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const timeAgo = formatDistanceToNow(new Date(track.createdAt), { addSuffix: true, locale: es })

  useEffect(() => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.play().catch(() => {})
    } else {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }, [isPlaying])

  return (
    <div
      className={`border transition-all duration-200 ${isPlaying ? 'border-purple-500/50 bg-purple-600/8' : 'border-[var(--color-border)] bg-[var(--color-surface-2)] hover:border-purple-500/25'}`}
      style={{ borderRadius: 16, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 14 }}
    >
      <button
        onClick={onPlay}
        className={`shrink-0 rounded-xl transition-all duration-200 ${isPlaying ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-600/15 hover:bg-purple-600/30'}`}
        style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        {isPlaying
          ? <Pause size={18} className="text-white" />
          : <Play size={18} className="text-purple-400" style={{ marginLeft: 2 }} />
        }
      </button>

      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 2, height: 28 }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={isPlaying ? 'bg-purple-500' : 'bg-purple-600/25'}
            style={{
              width: 3,
              borderRadius: 2,
              height: isPlaying ? undefined : `${8 + i * 4}px`,
              ...(isPlaying && {
                animation: `waveBar ${0.6 + i * 0.1}s ease-in-out infinite alternate`,
                animationDelay: `${i * 0.08}s`,
              }),
            }}
          />
        ))}
      </div>

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <p className="text-[var(--color-text)] truncate" style={{ fontSize: 14, fontWeight: 600 }}>{track.title}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            className="rounded-full bg-purple-600/15 border border-purple-500/25 text-purple-300"
            style={{ padding: '2px 8px', fontSize: 11, fontWeight: 600 }}
          >
            AUDIO
          </span>
          <span className="text-[var(--color-text-muted)]" style={{ fontSize: 12 }}>{formatDuration(track.duration)}</span>
          {track.fileSize && <span className="text-[var(--color-text-muted)]" style={{ fontSize: 12 }}>{formatSize(track.fileSize)}</span>}
          <span className="text-[var(--color-text-muted)]" style={{ fontSize: 12 }}>{timeAgo}</span>
        </div>
      </div>

      {onDelete && (
        <button
          onClick={onDelete}
          disabled={deleting}
          className="text-[var(--color-text-muted)] hover:text-red-400 transition-colors disabled:opacity-40 shrink-0"
        >
          <Trash2 size={15} />
        </button>
      )}

      <audio ref={audioRef} src={track.url} onEnded={onStop} preload="none" />
    </div>
  )
}

export function VideoTrackRow({
  track, onOpen, onDelete, deleting,
}: {
  track: Track
  onOpen: () => void
  onDelete?: () => void
  deleting?: boolean
}) {
  const timeAgo = formatDistanceToNow(new Date(track.createdAt), { addSuffix: true, locale: es })

  return (
    <div
      className="border border-[var(--color-border)] bg-[var(--color-surface-2)] hover:border-blue-500/25 transition-all duration-200"
      style={{ borderRadius: 16, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 14 }}
    >
      <button
        onClick={onOpen}
        className="shrink-0 overflow-hidden rounded-xl group relative"
        style={{ width: 72, height: 44, background: 'linear-gradient(135deg, rgba(37,99,235,0.3), rgba(79,70,229,0.3))' }}
      >
        {track.coverUrl ? (
          <img src={track.coverUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Video size={18} className="text-blue-400" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Play size={16} className="text-white" style={{ marginLeft: 2 }} />
        </div>
      </button>

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <p className="text-[var(--color-text)] truncate" style={{ fontSize: 14, fontWeight: 600 }}>{track.title}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            className="rounded-full bg-blue-600/15 border border-blue-500/25 text-blue-300"
            style={{ padding: '2px 8px', fontSize: 11, fontWeight: 600 }}
          >
            VIDEO
          </span>
          <span className="text-[var(--color-text-muted)]" style={{ fontSize: 12 }}>{formatDuration(track.duration)}</span>
          {track.fileSize && <span className="text-[var(--color-text-muted)]" style={{ fontSize: 12 }}>{formatSize(track.fileSize)}</span>}
          <span className="text-[var(--color-text-muted)]" style={{ fontSize: 12 }}>{timeAgo}</span>
        </div>
      </div>

      <button
        onClick={onOpen}
        className="border border-blue-500/30 bg-blue-600/10 hover:bg-blue-600/20 transition-colors text-blue-300"
        style={{ padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600, flexShrink: 0 }}
      >
        Ver
      </button>

      {onDelete && (
        <button
          onClick={onDelete}
          disabled={deleting}
          className="text-[var(--color-text-muted)] hover:text-red-400 transition-colors disabled:opacity-40 shrink-0"
        >
          <Trash2 size={15} />
        </button>
      )}
    </div>
  )
}

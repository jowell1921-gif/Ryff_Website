import { useRef, useEffect, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { Play, Pause, Music2, Video, X } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import type { Track } from '@/types/track.types'

function formatDuration(secs: number | null) {
  if (!secs) return '--:--'
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function TrackFeedCard({ track }: { track: Track }) {
  const isAudio = track.type === 'AUDIO'
  const [playing, setPlaying] = useState(false)
  const [showVideo, setShowVideo] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)
  const timeAgo = formatDistanceToNow(new Date(track.createdAt), { addSuffix: true, locale: es })

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

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Music2, Video, Clock, ChevronLeft, X } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { useProfile } from '@/features/profile/hooks/useProfile'
import { useUserTracks } from '@/features/tracks/hooks/useTracks'
import { AudioTrackRow, VideoTrackRow, formatDuration } from '@/features/tracks/components/TrackRow'
import type { Track } from '@/types/track.types'

type Filter = 'all' | 'audio' | 'video'

function isAudio(track: Track) {
  return track.type === 'AUDIO'
}

export function UserMusicPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: profile, isLoading: loadingProfile } = useProfile(id ?? '')
  const { data: tracks = [], isLoading: loadingTracks } = useUserTracks(id ?? '')

  const [filter, setFilter] = useState<Filter>('all')
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [videoModal, setVideoModal] = useState<Track | null>(null)

  const filtered = tracks.filter((t) => {
    if (filter === 'audio') return isAudio(t)
    if (filter === 'video') return !isAudio(t)
    return true
  })

  const audioCount = tracks.filter(isAudio).length
  const videoCount = tracks.filter((t) => !isAudio(t)).length
  const totalDuration = tracks.reduce((acc, t) => acc + (t.duration ?? 0), 0)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setVideoModal(null) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', paddingLeft: 16, paddingRight: 16, paddingBottom: 40 }}>

      {/* Header */}
      <div style={{ height: 64, display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0, borderBottom: '1px solid var(--color-border)', marginBottom: 28 }}>
        <button
          onClick={() => navigate(-1)}
          className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, borderRadius: 10, border: '1px solid var(--color-border)' }}
        >
          <ChevronLeft size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="bg-purple-600/20 rounded-xl" style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Music2 size={18} className="text-purple-400" />
          </div>
          {loadingProfile ? (
            <div className="bg-[var(--color-surface-2)] animate-pulse" style={{ width: 140, height: 18, borderRadius: 8 }} />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {profile && <Avatar size="xs" src={profile.avatar} alt={profile.name} />}
              <h1 className="text-[var(--color-text)]" style={{ fontSize: 17, fontWeight: 700 }}>
                {profile ? `Música de ${profile.name}` : 'Música'}
              </h1>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      {tracks.length > 0 && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          {[
            { icon: Music2, label: 'Audios', value: audioCount, color: 'text-purple-400', bg: 'bg-purple-600/10 border-purple-500/20' },
            { icon: Video, label: 'Videos', value: videoCount, color: 'text-blue-400', bg: 'bg-blue-600/10 border-blue-500/20' },
            { icon: Clock, label: 'Duración', value: formatDuration(totalDuration), color: 'text-emerald-400', bg: 'bg-emerald-600/10 border-emerald-500/20' },
          ].map((s) => (
            <div
              key={s.label}
              className={`border ${s.bg} rounded-2xl`}
              style={{ flex: 1, padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 6 }}
            >
              <s.icon size={16} className={s.color} />
              <p className="text-[var(--color-text)]" style={{ fontSize: 20, fontWeight: 800 }}>{s.value}</p>
              <p className="text-[var(--color-text-muted)]" style={{ fontSize: 12 }}>{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filtros */}
      {tracks.length > 0 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {([
            { key: 'all', label: `Todo (${tracks.length})` },
            { key: 'audio', label: `Audio (${audioCount})` },
            { key: 'video', label: `Video (${videoCount})` },
          ] as { key: Filter; label: string }[]).map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={filter === f.key
                ? 'bg-purple-600 border-purple-500'
                : 'border-[var(--color-border)] bg-[var(--color-surface-2)] hover:border-purple-500/40 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors'
              }
              style={{ padding: '7px 16px', borderRadius: 999, fontSize: 13, fontWeight: 600, border: '1px solid', color: filter === f.key ? 'white' : undefined }}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {/* Lista de tracks */}
      {loadingTracks ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl bg-[var(--color-surface-2)] animate-pulse" style={{ height: 72 }} />
          ))}
        </div>
      ) : filtered.length === 0 && tracks.length === 0 ? (
        <div style={{ textAlign: 'center', paddingTop: 48, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <div className="bg-purple-600/10 rounded-2xl" style={{ width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Music2 size={24} className="text-purple-400/50" />
          </div>
          <p className="text-[var(--color-text)]" style={{ fontSize: 15, fontWeight: 600 }}>Sin música publicada</p>
          <p className="text-[var(--color-text-muted)]" style={{ fontSize: 13 }}>
            {profile?.name ?? 'Este usuario'} aún no ha subido ningún archivo.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map((track) =>
            isAudio(track) ? (
              <AudioTrackRow
                key={track.id}
                track={track}
                isPlaying={playingId === track.id}
                onPlay={() => setPlayingId(playingId === track.id ? null : track.id)}
                onStop={() => setPlayingId(null)}
              />
            ) : (
              <VideoTrackRow
                key={track.id}
                track={track}
                onOpen={() => setVideoModal(track)}
              />
            )
          )}
        </div>
      )}

      {/* Modal reproductor de video */}
      {videoModal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
          onClick={() => setVideoModal(null)}
        >
          <div
            style={{ width: '100%', maxWidth: 800, display: 'flex', flexDirection: 'column', gap: 12 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p className="text-white" style={{ fontSize: 16, fontWeight: 700 }}>{videoModal.title}</p>
              <button onClick={() => setVideoModal(null)} className="text-white/60 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <video
              src={videoModal.url}
              controls
              autoPlay
              style={{ width: '100%', borderRadius: 16, background: '#000', maxHeight: '70vh' }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

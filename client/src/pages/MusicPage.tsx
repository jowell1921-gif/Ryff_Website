import { useState, useRef, useCallback, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  Music2, Video, Upload, Play, Pause, Trash2, X,
  CloudUpload, Check, AlertCircle, Clock, HardDrive,
} from 'lucide-react'
import { useMyTracks, useDeleteTrack } from '@/features/tracks/hooks/useTracks'
import { trackService } from '@/features/tracks/services/trackService'
import { useQueryClient } from '@tanstack/react-query'
import type { Track } from '@/types/track.types'

type Filter = 'all' | 'audio' | 'video'

const ACCEPTED = '.mp3,.wav,.ogg,.flac,.aac,.m4a,.opus,.mp4,.mov,.webm,.avi,.mkv'
const AUDIO_EXTS = ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a', 'opus']

function formatDuration(secs: number | null) {
  if (!secs) return '--:--'
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function formatSize(bytes: number | null) {
  if (!bytes) return ''
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function isAudio(track: Track) {
  return track.type === 'AUDIO'
}

// ── Upload state ──────────────────────────────────────────────────────────────
interface UploadItem {
  id: string
  file: File
  title: string
  progress: number
  status: 'pending' | 'uploading' | 'done' | 'error'
  error?: string
}

export function MusicPage() {
  const { data: tracks = [], isLoading } = useMyTracks()
  const deleteTrack = useDeleteTrack()
  const queryClient = useQueryClient()

  const [filter, setFilter] = useState<Filter>('all')
  const [isDragging, setIsDragging] = useState(false)
  const [uploads, setUploads] = useState<UploadItem[]>([])
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [showUploadZone, setShowUploadZone] = useState(false)
  const [videoModal, setVideoModal] = useState<Track | null>(null)
  const dropRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = tracks.filter((t) => {
    if (filter === 'audio') return isAudio(t)
    if (filter === 'video') return !isAudio(t)
    return true
  })

  const audioCount = tracks.filter(isAudio).length
  const videoCount = tracks.filter((t) => !isAudio(t)).length
  const totalDuration = tracks.reduce((acc, t) => acc + (t.duration ?? 0), 0)

  // ── Drag & drop ─────────────────────────────────────────────────────────────
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    if (!dropRef.current?.contains(e.relatedTarget as Node)) setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    queueFiles(files)
  }, [])

  const queueFiles = (files: File[]) => {
    const items: UploadItem[] = files.map((file) => ({
      id: crypto.randomUUID(),
      file,
      title: file.name.replace(/\.[^.]+$/, ''),
      progress: 0,
      status: 'pending',
    }))
    setUploads((prev) => [...prev, ...items])
    items.forEach((item) => startUpload(item))
  }

  const startUpload = async (item: UploadItem) => {
    setUploads((prev) => prev.map((u) => u.id === item.id ? { ...u, status: 'uploading' } : u))
    try {
      const newTrack = await trackService.upload(item.file, item.title, (pct) => {
        setUploads((prev) => prev.map((u) => u.id === item.id ? { ...u, progress: pct } : u))
      })
      setUploads((prev) => prev.map((u) => u.id === item.id ? { ...u, status: 'done', progress: 100 } : u))
      // Inyectar en ambos cachés para que Tu música y el feed global actualicen al instante
      queryClient.setQueryData<Track[]>(['tracks', 'mine'], (old) => [newTrack, ...(old ?? [])])
      queryClient.setQueryData<Track[]>(['tracks', 'all'], (old) => [newTrack, ...(old ?? [])])
      setTimeout(() => setUploads((prev) => prev.filter((u) => u.id !== item.id)), 3000)
    } catch {
      setUploads((prev) => prev.map((u) => u.id === item.id ? { ...u, status: 'error', error: 'Error al subir' } : u))
    }
  }

  const updateTitle = (id: string, title: string) =>
    setUploads((prev) => prev.map((u) => u.id === id ? { ...u, title } : u))

  // Close video modal on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setVideoModal(null) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', paddingLeft: 16, paddingRight: 16, paddingBottom: 40 }}>

      {/* Header */}
      <div
        style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, borderBottom: '1px solid var(--color-border)', marginBottom: 28 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="bg-purple-600/20 rounded-xl" style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Music2 size={18} className="text-purple-400" />
          </div>
          <h1 className="text-[var(--color-text)]" style={{ fontSize: 17, fontWeight: 700 }}>Tu música</h1>
        </div>
        <button
          onClick={() => inputRef.current?.click()}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 20px', borderRadius: 999, fontSize: 13, fontWeight: 700, border: '1px solid', transition: 'all 0.2s' }}
          className="bg-purple-600 text-white border-purple-500 hover:bg-purple-700 hover:scale-105"
        >
          <Upload size={15} />
          Subir archivo
        </button>
      </div>

      {/* Input file oculto */}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        multiple
        style={{ display: 'none' }}
        onChange={(e) => {
          if (e.target.files) queueFiles(Array.from(e.target.files))
          e.target.value = ''
        }}
      />

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

      {/* Zona de subida (drag & drop) */}
      <div
        ref={dropRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed transition-all duration-200 cursor-pointer ${
          isDragging
            ? 'border-purple-500 bg-purple-600/10'
            : 'border-[var(--color-border)] hover:border-purple-500/50 hover:bg-purple-600/5 bg-[var(--color-surface-2)]'
        }`}
        style={{ borderRadius: 20, padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginBottom: 24, userSelect: 'none' }}
      >
        <div
          className={`rounded-2xl transition-colors ${isDragging ? 'bg-purple-600/25' : 'bg-purple-600/10'}`}
          style={{ width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <CloudUpload size={26} className={isDragging ? 'text-purple-300' : 'text-purple-400'} />
        </div>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <p className="text-[var(--color-text)]" style={{ fontSize: 15, fontWeight: 600 }}>
            {isDragging ? 'Suelta aquí para subir' : 'Arrastra archivos o haz clic'}
          </p>
          <p className="text-[var(--color-text-muted)]" style={{ fontSize: 13 }}>
            Audio: MP3, WAV, OGG, FLAC, AAC, M4A · Video: MP4, MOV, WEBM, AVI
          </p>
          <p className="text-[var(--color-text-muted)]" style={{ fontSize: 12 }}>Máximo 200 MB por archivo</p>
        </div>
      </div>

      {/* Uploads en progreso */}
      {uploads.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
          {uploads.map((u) => (
            <div
              key={u.id}
              className="bg-[var(--color-surface-2)] border border-[var(--color-border)]"
              style={{ borderRadius: 14, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}
            >
              {/* Icono estado */}
              <div style={{ flexShrink: 0 }}>
                {u.status === 'done' ? (
                  <div className="bg-emerald-600/20 rounded-full" style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Check size={14} className="text-emerald-400" />
                  </div>
                ) : u.status === 'error' ? (
                  <div className="bg-red-600/20 rounded-full" style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <AlertCircle size={14} className="text-red-400" />
                  </div>
                ) : (
                  <div className="bg-purple-600/20 rounded-full" style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {AUDIO_EXTS.some((ext) => u.file.name.endsWith(ext))
                      ? <Music2 size={14} className="text-purple-400" />
                      : <Video size={14} className="text-purple-400" />
                    }
                  </div>
                )}
              </div>

              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {u.status === 'pending' || u.status === 'uploading' ? (
                  <input
                    value={u.title}
                    onChange={(e) => updateTitle(u.id, e.target.value)}
                    className="bg-transparent text-[var(--color-text)]"
                    style={{ fontSize: 13, fontWeight: 600, outline: 'none', border: 'none', width: '100%' }}
                    placeholder="Título del archivo"
                  />
                ) : (
                  <p className="text-[var(--color-text)] truncate" style={{ fontSize: 13, fontWeight: 600 }}>{u.title}</p>
                )}

                {u.status === 'uploading' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="bg-[var(--color-surface-3)]" style={{ flex: 1, height: 4, borderRadius: 4, overflow: 'hidden' }}>
                      <div
                        className="bg-purple-600 transition-all duration-300"
                        style={{ height: '100%', width: `${u.progress}%`, borderRadius: 4 }}
                      />
                    </div>
                    <span className="text-[var(--color-text-muted)]" style={{ fontSize: 11, flexShrink: 0 }}>{u.progress}%</span>
                  </div>
                )}
                {u.status === 'done' && (
                  <p className="text-emerald-400" style={{ fontSize: 12 }}>Subido correctamente</p>
                )}
                {u.status === 'error' && (
                  <p className="text-red-400" style={{ fontSize: 12 }}>{u.error}</p>
                )}
              </div>

              <button
                onClick={() => setUploads((prev) => prev.filter((x) => x.id !== u.id))}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                style={{ flexShrink: 0 }}
              >
                <X size={14} />
              </button>
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
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl bg-[var(--color-surface-2)] animate-pulse" style={{ height: 72 }} />
          ))}
        </div>
      ) : filtered.length === 0 && tracks.length === 0 ? (
        <div style={{ textAlign: 'center', paddingTop: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <p className="text-[var(--color-text-muted)]" style={{ fontSize: 14 }}>Aún no has subido ningún archivo. ¡Usa la zona de arriba para empezar!</p>
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
                onDelete={() => deleteTrack.mutate(track.id)}
                deleting={deleteTrack.isPending && deleteTrack.variables === track.id}
              />
            ) : (
              <VideoTrackRow
                key={track.id}
                track={track}
                onOpen={() => setVideoModal(track)}
                onDelete={() => deleteTrack.mutate(track.id)}
                deleting={deleteTrack.isPending && deleteTrack.variables === track.id}
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

// ── Fila de audio ─────────────────────────────────────────────────────────────
function AudioTrackRow({
  track, isPlaying, onPlay, onStop, onDelete, deleting,
}: {
  track: Track
  isPlaying: boolean
  onPlay: () => void
  onStop: () => void
  onDelete: () => void
  deleting: boolean
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
      {/* Play button */}
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

      {/* Waveform animado cuando reproduce */}
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

      {/* Info */}
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

      {/* Eliminar */}
      <button
        onClick={onDelete}
        disabled={deleting}
        className="text-[var(--color-text-muted)] hover:text-red-400 transition-colors disabled:opacity-40 shrink-0"
      >
        <Trash2 size={15} />
      </button>

      <audio ref={audioRef} src={track.url} onEnded={onStop} preload="none" />
    </div>
  )
}

// ── Fila de video ─────────────────────────────────────────────────────────────
function VideoTrackRow({
  track, onOpen, onDelete, deleting,
}: {
  track: Track
  onOpen: () => void
  onDelete: () => void
  deleting: boolean
}) {
  const timeAgo = formatDistanceToNow(new Date(track.createdAt), { addSuffix: true, locale: es })

  return (
    <div
      className="border border-[var(--color-border)] bg-[var(--color-surface-2)] hover:border-blue-500/25 transition-all duration-200"
      style={{ borderRadius: 16, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 14 }}
    >
      {/* Thumbnail o placeholder */}
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

      {/* Info */}
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

      {/* Ver */}
      <button
        onClick={onOpen}
        className="border border-blue-500/30 bg-blue-600/10 hover:bg-blue-600/20 transition-colors text-blue-300"
        style={{ padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600, flexShrink: 0 }}
      >
        Ver
      </button>

      {/* Eliminar */}
      <button
        onClick={onDelete}
        disabled={deleting}
        className="text-[var(--color-text-muted)] hover:text-red-400 transition-colors disabled:opacity-40 shrink-0"
      >
        <Trash2 size={15} />
      </button>
    </div>
  )
}

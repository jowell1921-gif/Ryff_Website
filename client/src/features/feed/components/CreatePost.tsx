import { useState, useRef } from 'react'
import { Paperclip, X, Music, Video, Image } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/stores/authStore'
import { useCreatePost } from '../hooks/useFeed'
import { feedService } from '../services/feedService'
import { detectEmbed, embedHeight, extractOriginalUrl } from '@/lib/mediaEmbed'

const MAX = 150

const EMBED_LABELS: Record<string, string> = { youtube: 'YouTube', spotify: 'Spotify', soundcloud: 'SoundCloud' }

function mediaIcon(type: string) {
  if (type === 'AUDIO') return <Music size={14} className="text-purple-300" />
  if (type === 'VIDEO') return <Video size={14} className="text-purple-300" />
  return <Image size={14} className="text-purple-300" />
}

export function CreatePost() {
  const [content, setContent]         = useState('')
  const [embedName, setEmbedName]     = useState('')
  const [file, setFile]               = useState<File | null>(null)
  const [previewUrl, setPreviewUrl]   = useState<string | null>(null)
  const [mediaName, setMediaName]     = useState('')
  const [mediaType, setMediaType]     = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const user = useAuthStore((state) => state.user)
  const { mutate: createPost, isPending } = useCreatePost()

  const embed = content.trim() && !file ? detectEmbed(content) : null

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    if (val.length <= MAX) {
      setContent(val)
      // Reset embed name when content changes
      if (!detectEmbed(val)) setEmbedName('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') handleSubmit()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (!selected) return
    const mime = selected.type
    setFile(selected)
    setPreviewUrl(URL.createObjectURL(selected))
    setMediaName(selected.name.replace(/\.[^/.]+$/, ''))
    if (mime.startsWith('image/')) setMediaType('IMAGE')
    else if (mime.startsWith('audio/')) setMediaType('AUDIO')
    else setMediaType('VIDEO')
    e.target.value = ''
  }

  const removeFile = () => {
    setFile(null)
    setPreviewUrl(null)
    setMediaName('')
    setMediaType(null)
  }

  const handleSubmit = async () => {
    const trimmed = content.trim()
    if (!trimmed && !file) return
    if (trimmed.length > MAX) return

    if (file) {
      setIsUploading(true)
      try {
        const { url, mediaType: type } = await feedService.uploadPostMedia(file)
        createPost(
          { content: trimmed || mediaName, mediaUrl: url, mediaName: mediaName || file.name, mediaType: type },
          { onSuccess: () => { setContent(''); removeFile() } },
        )
      } finally {
        setIsUploading(false)
      }
    } else if (embed) {
      // Post with external platform embed
      const originalUrl = extractOriginalUrl(trimmed)
      createPost(
        { content: trimmed, mediaUrl: originalUrl ?? undefined, mediaName: embedName || undefined },
        { onSuccess: () => { setContent(''); setEmbedName('') } },
      )
    } else {
      createPost({ content: trimmed }, { onSuccess: () => setContent('') })
    }
  }

  const loading = isPending || isUploading
  const embedRequiresTitle = !!embed && embedName.trim().length === 0
  const canSubmit =
    (content.trim().length > 0 || file !== null) &&
    content.length <= MAX &&
    !loading &&
    !embedRequiresTitle

  return (
    <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl" style={{ display: 'flex', gap: 10, padding: 12 }}>
      <Avatar size="md" alt={user?.name ?? ''} src={user?.avatar ?? null} className="shrink-0 mt-0.5" />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="bg-[var(--color-surface)] rounded-xl border border-purple-500/30 focus-within:border-purple-500/70 transition-colors" style={{ paddingTop: 8, paddingBottom: 8, paddingLeft: 16, paddingRight: 16 }}>
          <textarea
            value={content}
            onChange={handleContentChange}
            onKeyDown={handleKeyDown}
            placeholder="¿Qué está sonando hoy? Pega un enlace de YouTube, Spotify o SoundCloud..."
            rows={3}
            className="w-full bg-transparent text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] outline-none resize-none leading-relaxed"
          />
        </div>

        {/* Embed preview + name input (obligatorio) */}
        {embed && (
          <div className="rounded-xl overflow-hidden border border-purple-500/30">
            <iframe
              src={embed.embedUrl}
              height={embedHeight(embed.type)}
              width="100%"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              style={{ border: 'none', display: 'block' }}
            />
            <div className="bg-purple-600/5 border-t border-purple-500/20" style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label className="text-[var(--color-text-muted)]" style={{ fontSize: 11, fontWeight: 600 }}>
                Título <span className="text-red-400">*</span>
              </label>
              <input
                value={embedName}
                onChange={(e) => setEmbedName(e.target.value.slice(0, 100))}
                placeholder={`Ponle un título a este ${EMBED_LABELS[embed.type] ?? embed.type}...`}
                className="bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] rounded-lg focus:outline-none focus:border-purple-500/70 transition-colors"
                style={{ fontSize: 13, padding: '6px 10px' }}
              />
            </div>
          </div>
        )}

        {/* Attached file preview */}
        {file && previewUrl && (
          <div className="rounded-xl overflow-hidden border border-purple-500/30 bg-[var(--color-surface)]" style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {mediaType && mediaIcon(mediaType)}
                <span className="text-purple-300" style={{ fontSize: 12, fontWeight: 600 }}>
                  {mediaType === 'IMAGE' ? 'Imagen' : mediaType === 'AUDIO' ? 'Audio' : 'Video'} adjunto
                </span>
              </div>
              <button onClick={removeFile} className="text-[var(--color-text-muted)] hover:text-red-400 transition-colors">
                <X size={14} />
              </button>
            </div>

            {mediaType === 'IMAGE' && (
              <img src={previewUrl} alt="preview" className="rounded-lg" style={{ maxHeight: 200, objectFit: 'cover', width: '100%' }} />
            )}
            {mediaType === 'VIDEO' && (
              <video src={previewUrl} controls className="rounded-lg" style={{ maxHeight: 200, width: '100%' }} />
            )}
            {mediaType === 'AUDIO' && (
              <audio src={previewUrl} controls style={{ width: '100%' }} />
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label className="text-[var(--color-text-muted)]" style={{ fontSize: 11, fontWeight: 600 }}>
                Nombre del archivo
              </label>
              <input
                value={mediaName}
                onChange={(e) => setMediaName(e.target.value.slice(0, 100))}
                placeholder="Dale un nombre a tu archivo..."
                className="bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] rounded-lg focus:outline-none focus:border-purple-500/70 transition-colors"
                style={{ fontSize: 13, padding: '6px 10px' }}
              />
            </div>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={loading}
              className="text-[var(--color-text-muted)] hover:text-purple-400 transition-colors disabled:opacity-30"
              title="Adjuntar archivo (video, audio, imagen)"
            >
              <Paperclip size={16} />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="video/*,audio/*,image/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />

            <span className={`text-xs ${content.length > 450 ? 'text-red-400' : 'text-[var(--color-text-muted)]'}`}>
              {content.length}/{MAX}
            </span>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={handleSubmit}
            isLoading={loading}
            disabled={!canSubmit}
          >
            {isUploading ? 'Subiendo...' : 'Publicar'}
          </Button>
        </div>
      </div>
    </div>
  )
}

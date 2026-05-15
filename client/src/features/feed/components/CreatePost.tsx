import { useState } from 'react'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/stores/authStore'
import { useCreatePost } from '../hooks/useFeed'
import { detectEmbed, embedHeight } from '@/lib/mediaEmbed'

export function CreatePost() {
  const [content, setContent] = useState('')
  const user = useAuthStore((state) => state.user)
  const { mutate: createPost, isPending } = useCreatePost()

  const embed = content.trim() ? detectEmbed(content) : null

  const handleSubmit = () => {
    const trimmed = content.trim()
    if (!trimmed) return
    createPost({ content: trimmed }, { onSuccess: () => setContent('') })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') handleSubmit()
  }

  return (
    <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl p-5 flex gap-4">
      <Avatar size="md" alt={user?.name ?? ''} src={user?.avatar ?? null} />

      <div className="flex-1 flex flex-col gap-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="¿Qué está sonando hoy? Pega un enlace de YouTube, Spotify o SoundCloud..."
          rows={3}
          className="w-full bg-transparent text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] outline-none resize-none leading-relaxed"
        />

        {/* Preview del embed en tiempo real */}
        {embed && (
          <div className="rounded-xl overflow-hidden border border-purple-500/30">
            <div className="px-3 py-1.5 bg-purple-600/10 border-b border-purple-500/20">
              <p className="text-xs text-purple-300 font-medium capitalize">{embed.type} detectado</p>
            </div>
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

        <div className="flex items-center justify-between">
          <span className={`text-xs ${content.length > 450 ? 'text-red-400' : 'text-[var(--color-text-muted)]'}`}>
            {content.length}/500
          </span>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            isLoading={isPending}
            disabled={!content.trim() || content.length > 500}
          >
            Publicar
          </Button>
        </div>
      </div>
    </div>
  )
}

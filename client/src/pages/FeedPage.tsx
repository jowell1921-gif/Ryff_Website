import { CreatePost } from '@/features/feed/components/CreatePost'
import { PostCard } from '@/features/feed/components/PostCard'
import { useFeed } from '@/features/feed/hooks/useFeed'

export function FeedPage() {
  const { data, isLoading, isError } = useFeed()

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-6">

      <h1 className="text-xl font-bold text-[var(--color-text)]">Inicio</h1>

      <CreatePost />

      {isLoading && (
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl p-5 animate-pulse">
              <div className="flex gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[var(--color-surface-3)]" />
                <div className="flex flex-col gap-2">
                  <div className="w-32 h-3 rounded bg-[var(--color-surface-3)]" />
                  <div className="w-20 h-2 rounded bg-[var(--color-surface-3)]" />
                </div>
              </div>
              <div className="w-full h-3 rounded bg-[var(--color-surface-3)] mb-2" />
              <div className="w-3/4 h-3 rounded bg-[var(--color-surface-3)]" />
            </div>
          ))}
        </div>
      )}

      {isError && (
        <div className="text-center py-12 text-[var(--color-text-muted)]">
          <p className="text-sm">No se pudo cargar el feed. Verifica que el servidor está corriendo.</p>
        </div>
      )}

      {data && data.posts.length === 0 && (
        <div className="text-center py-12 text-[var(--color-text-muted)]">
          <p className="font-medium text-[var(--color-text)]">El feed está vacío</p>
          <p className="text-sm mt-1">Sé el primero en publicar algo.</p>
        </div>
      )}

      {data && data.posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}

    </div>
  )
}

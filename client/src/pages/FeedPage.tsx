import { useMemo } from 'react'
import { CreatePost } from '@/features/feed/components/CreatePost'
import { PostCard } from '@/features/feed/components/PostCard'
import { RepostCard } from '@/features/feed/components/RepostCard'
import { useFeed, useRepostsFeed } from '@/features/feed/hooks/useFeed'
import { useAnnouncements } from '@/features/announcements/hooks/useAnnouncements'
import { AnnouncementFeedCard } from '@/features/announcements/components/AnnouncementFeedCard'
import { useAllTracks } from '@/features/tracks/hooks/useTracks'
import { TrackFeedCard } from '@/features/tracks/components/TrackFeedCard'
import type { Post, RepostItem } from '@/types/post.types'
import type { Announcement } from '@/types/announcement.types'
import type { Track } from '@/types/track.types'

type FeedItem =
  | { kind: 'post'; data: Post; createdAt: string }
  | { kind: 'repost'; data: RepostItem; createdAt: string }
  | { kind: 'announcement'; data: Announcement; createdAt: string }
  | { kind: 'track'; data: Track; createdAt: string }

export function FeedPage() {
  const { data: feedData, isLoading: loadingPosts, isError } = useFeed()
  const { data: reposts = [], isLoading: loadingReposts } = useRepostsFeed()
  const { data: announcements = [], isLoading: loadingAnn } = useAnnouncements()
  const { data: tracks = [], isLoading: loadingTracks } = useAllTracks()

  const isLoading = loadingPosts || loadingReposts || loadingAnn || loadingTracks

  const items = useMemo<FeedItem[]>(() => {
    const posts: FeedItem[] = (feedData?.posts ?? []).map((p) => ({ kind: 'post', data: p, createdAt: p.createdAt }))
    const rps: FeedItem[] = reposts.map((r) => ({ kind: 'repost', data: r, createdAt: r.createdAt }))
    const ann: FeedItem[] = announcements.map((a) => ({ kind: 'announcement', data: a, createdAt: a.createdAt }))
    const trks: FeedItem[] = tracks.map((t) => ({ kind: 'track', data: t, createdAt: t.createdAt }))
    return [...posts, ...rps, ...ann, ...trks].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }, [feedData, reposts, announcements, tracks])

  return (
    <div style={{ maxWidth: 672, margin: '0 auto', paddingLeft: 16, paddingRight: 16, paddingTop: 32, paddingBottom: 32, display: 'flex', flexDirection: 'column', gap: 24 }}>

      <h1 className="text-xl font-bold text-[var(--color-text)]">Inicio</h1>

      <CreatePost />

      {isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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

      {!isLoading && items.length === 0 && (
        <div className="text-center py-12 text-[var(--color-text-muted)]">
          <p className="font-medium text-[var(--color-text)]">El feed está vacío</p>
          <p className="text-sm mt-1">Sé el primero en publicar algo.</p>
        </div>
      )}

      {items.map((item) => {
        if (item.kind === 'post') return <PostCard key={`post-${item.data.id}`} post={item.data} />
        if (item.kind === 'repost') return <RepostCard key={`repost-${item.data.id}`} repost={item.data} />
        if (item.kind === 'announcement') return <AnnouncementFeedCard key={`ann-${item.data.id}`} announcement={item.data} />
        return <TrackFeedCard key={`track-${item.data.id}`} track={item.data} />
      })}

    </div>
  )
}

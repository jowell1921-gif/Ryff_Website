import { useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { MessageCircle, Music2 } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { chatService } from '@/features/chat/services/chatService'
import { useProfile, useUserPosts } from '@/features/profile/hooks/useProfile'
import { ProfileHeader } from '@/features/profile/components/ProfileHeader'
import { EditProfileModal } from '@/features/profile/components/EditProfileModal'
import { FollowButton } from '@/features/profile/components/FollowButton'
import { PostCard } from '@/features/feed/components/PostCard'
import { RepostCard } from '@/features/feed/components/RepostCard'
import { TrackFeedCard } from '@/features/tracks/components/TrackFeedCard'
import { useUserReposts } from '@/features/feed/hooks/useFeed'
import { useUserTracks } from '@/features/tracks/hooks/useTracks'
import type { Post, RepostItem } from '@/types/post.types'

type ProfileItem =
  | { kind: 'post'; data: Post; createdAt: string }
  | { kind: 'repost'; data: RepostItem; createdAt: string }

export function ProfilePage() {
  const { id } = useParams()
  const currentUser = useAuthStore((state) => state.user)

  // Si no hay id en la URL usamos el usuario logueado
  const profileId = id ?? currentUser?.id ?? ''
  const isOwnProfile = profileId === currentUser?.id

  const navigate = useNavigate()
  const { data: profile, isLoading: loadingProfile } = useProfile(profileId)
  const { data: posts = [], isLoading: loadingPosts } = useUserPosts(profileId)
  const { data: userReposts = [], isLoading: loadingReposts } = useUserReposts(profileId)
  const { data: userTracks = [], isLoading: loadingTracks } = useUserTracks(profileId)
  const [editOpen, setEditOpen] = useState(false)

  const profileItems = useMemo<ProfileItem[]>(() => {
    const p: ProfileItem[] = posts.map((post) => ({ kind: 'post', data: post, createdAt: post.createdAt }))
    const r: ProfileItem[] = userReposts.map((rp) => ({ kind: 'repost', data: rp, createdAt: rp.createdAt }))
    return [...p, ...r].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [posts, userReposts])

  const openChat = useMutation({
    mutationFn: () => chatService.getOrCreateConversation(profileId),
    onSuccess: (conv) => navigate(`/messages/${conv.id}`),
  })

  if (loadingProfile) {
    return (
      <div style={{ maxWidth: 672, margin: '0 auto', paddingLeft: 16, paddingRight: 16, paddingTop: 32, paddingBottom: 32 }}>
        <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl overflow-hidden animate-pulse">
          <div className="h-32 bg-[var(--color-surface-3)]" />
          <div className="p-6 flex flex-col gap-3">
            <div className="w-20 h-20 rounded-full bg-[var(--color-surface-3)] -mt-10" />
            <div className="w-40 h-4 rounded bg-[var(--color-surface-3)]" />
            <div className="w-64 h-3 rounded bg-[var(--color-surface-3)]" />
          </div>
        </div>
      </div>
    )
  }

  if (!profile) return null

  return (
    <div style={{ maxWidth: 672, margin: '0 auto', paddingLeft: 16, paddingRight: 16, paddingTop: 32, paddingBottom: 32, display: 'flex', flexDirection: 'column', gap: 24 }}>
      <ProfileHeader
        profile={profile}
        isOwnProfile={isOwnProfile}
        onEdit={() => setEditOpen(true)}
      />

      {/* Acciones en perfil ajeno */}
      {!isOwnProfile && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: -8 }}>
          <FollowButton userId={profile.id} isFollowing={profile.isFollowing} />
          <button
            onClick={() => openChat.mutate()}
            disabled={openChat.isPending}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 22px', borderRadius: 999, fontSize: 14, fontWeight: 600, border: '1px solid var(--color-border)', background: 'var(--color-surface-2)', color: 'var(--color-text-muted)', transition: 'all 0.2s' }}
            className="hover:border-purple-500/50 hover:text-purple-300 disabled:opacity-50"
          >
            <MessageCircle size={15} />
            Mensaje
          </button>
          <button
            onClick={() => navigate(`/music/${profile.id}`)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 22px', borderRadius: 999, fontSize: 14, fontWeight: 600, border: '1px solid var(--color-border)', background: 'var(--color-surface-2)', color: 'var(--color-text-muted)', transition: 'all 0.2s' }}
            className="hover:border-purple-500/50 hover:text-purple-300"
          >
            <Music2 size={15} />
            Mi música
          </button>
        </div>
      )}

      {/* Publicaciones del usuario (posts + difusiones mezcladas por fecha) */}
      <div className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-widest">
          Publicaciones
        </h2>

        {(loadingPosts || loadingReposts) && (
          <div className="text-sm text-[var(--color-text-muted)] text-center py-8">Cargando...</div>
        )}

        {!loadingPosts && !loadingReposts && profileItems.length === 0 && (
          <div className="text-center py-12 text-[var(--color-text-muted)]">
            <p className="font-medium text-[var(--color-text)]">Sin publicaciones todavía</p>
            {isOwnProfile && <p className="text-sm mt-1">Comparte algo en el feed para que aparezca aquí.</p>}
          </div>
        )}

        {profileItems.map((item) =>
          item.kind === 'post'
            ? <PostCard key={`post-${item.data.id}`} post={item.data} />
            : <RepostCard key={`repost-${item.data.id}`} repost={item.data} />
        )}
      </div>

      {/* Mi música */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h2 className="text-[var(--color-text-muted)] uppercase tracking-widest" style={{ fontSize: 12, fontWeight: 600 }}>
          Mi música
        </h2>

        {loadingTracks && (
          <div className="text-[var(--color-text-muted)]" style={{ fontSize: 13, textAlign: 'center', paddingTop: 32 }}>Cargando...</div>
        )}

        {!loadingTracks && userTracks.length === 0 && (
          <div style={{ textAlign: 'center', paddingTop: 32 }}>
            <p className="text-[var(--color-text)]" style={{ fontSize: 14, fontWeight: 600 }}>Sin música publicada</p>
            {isOwnProfile && (
              <p className="text-[var(--color-text-muted)]" style={{ fontSize: 13, marginTop: 4 }}>
                Sube tus tracks desde la sección Mi música.
              </p>
            )}
          </div>
        )}

        {userTracks.map((track) => (
          <TrackFeedCard key={track.id} track={track} />
        ))}
      </div>

      {editOpen && (
        <EditProfileModal
          profile={profile}
          onClose={() => setEditOpen(false)}
        />
      )}
    </div>
  )
}

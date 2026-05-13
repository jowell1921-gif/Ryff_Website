import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { MessageCircle } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { chatService } from '@/features/chat/services/chatService'
import { useProfile, useUserPosts } from '@/features/profile/hooks/useProfile'
import { ProfileHeader } from '@/features/profile/components/ProfileHeader'
import { EditProfileModal } from '@/features/profile/components/EditProfileModal'
import { FollowButton } from '@/features/profile/components/FollowButton'
import { PostCard } from '@/features/feed/components/PostCard'

export function ProfilePage() {
  const { id } = useParams()
  const currentUser = useAuthStore((state) => state.user)

  // Si no hay id en la URL usamos el usuario logueado
  const profileId = id ?? currentUser?.id ?? ''
  const isOwnProfile = profileId === currentUser?.id

  const navigate = useNavigate()
  const { data: profile, isLoading: loadingProfile } = useProfile(profileId)
  const { data: posts, isLoading: loadingPosts } = useUserPosts(profileId)
  const [editOpen, setEditOpen] = useState(false)

  const openChat = useMutation({
    mutationFn: () => chatService.getOrCreateConversation(profileId),
    onSuccess: (conv) => navigate(`/messages/${conv.id}`),
  })

  if (loadingProfile) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
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
    <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-6">
      <ProfileHeader
        profile={profile}
        isOwnProfile={isOwnProfile}
        onEdit={() => setEditOpen(true)}
      />

      {/* Acciones en perfil ajeno */}
      {!isOwnProfile && (
        <div className="flex justify-center gap-3 -mt-2">
          <FollowButton userId={profile.id} isFollowing={profile.isFollowing} />
          <button
            onClick={() => openChat.mutate()}
            disabled={openChat.isPending}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold border
              bg-[var(--color-surface-2)] text-[var(--color-text-muted)] border-[var(--color-border)]
              hover:border-purple-500/50 hover:text-purple-300 transition-all disabled:opacity-50"
          >
            <MessageCircle size={14} />
            Mensaje
          </button>
        </div>
      )}

      {/* Posts del usuario */}
      <div className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-widest">
          Posts
        </h2>

        {loadingPosts && (
          <div className="text-sm text-[var(--color-text-muted)] text-center py-8">Cargando posts...</div>
        )}

        {posts && posts.length === 0 && (
          <div className="text-center py-12 text-[var(--color-text-muted)]">
            <p className="font-medium text-[var(--color-text)]">Sin posts todavía</p>
            {isOwnProfile && <p className="text-sm mt-1">Comparte algo en el feed para que aparezca aquí.</p>}
          </div>
        )}

        {posts?.map((post) => (
          <PostCard key={post.id} post={post} />
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

import { api } from '@/lib/api'
import type { Reel, ReactionType, ReelReactionResponse, ReelComment } from '@/types/reel.types'

export const reelService = {
  getReels: () =>
    api.get<Reel[]>('/reels').then((r) => r.data),

  upload: (file: File, caption?: string) => {
    const form = new FormData()
    form.append('video', file)
    if (caption) form.append('caption', caption)
    return api.post<Reel>('/reels', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data)
  },

  react: (reelId: string, type: ReactionType) =>
    api.post<ReelReactionResponse>(`/reels/${reelId}/react`, { type }).then((r) => r.data),

  getComments: (reelId: string) =>
    api.get<ReelComment[]>(`/reels/${reelId}/comments`).then((r) => r.data),

  addComment: (reelId: string, content: string) =>
    api.post<ReelComment>(`/reels/${reelId}/comments`, { content }).then((r) => r.data),

  deleteComment: (reelId: string, commentId: string) =>
    api.delete(`/reels/${reelId}/comments/${commentId}`).then((r) => r.data),
}

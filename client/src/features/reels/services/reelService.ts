import { api } from '@/lib/api'
import type { Reel } from '@/types/reel.types'

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

  like: (reelId: string) =>
    api.post<{ likesCount: number; isLiked: boolean }>(`/reels/${reelId}/like`).then((r) => r.data),

  unlike: (reelId: string) =>
    api.delete<{ likesCount: number; isLiked: boolean }>(`/reels/${reelId}/like`).then((r) => r.data),
}

import { api } from '@/lib/api'
import type { Track, TrackComment } from '@/types/track.types'
import type { ReactionType } from '@/types/post.types'

export interface TrackReactionResult {
  clapCount: number
  fireCount: number
  asombraCount: number
  isClapped: boolean
  isFired: boolean
  isAsombra: boolean
}

export const trackService = {
  getAll: () =>
    api.get<Track[]>('/tracks').then((r) => r.data),

  getMine: () =>
    api.get<Track[]>('/tracks/mine').then((r) => r.data),

  getByUser: (userId: string) =>
    api.get<Track[]>(`/tracks/user/${userId}`).then((r) => r.data),

  upload: (file: File, title: string, onProgress?: (pct: number) => void) => {
    const form = new FormData()
    form.append('file', file)
    form.append('title', title)
    return api.post<Track>('/tracks', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onProgress && e.total) onProgress(Math.round((e.loaded / e.total) * 100))
      },
    }).then((r) => r.data)
  },

  reactToTrack: (trackId: string, type: ReactionType) =>
    api.post<TrackReactionResult>(`/tracks/${trackId}/react`, { type }).then((r) => r.data),

  deleteOne: (id: string) =>
    api.delete(`/tracks/${id}`).then((r) => r.data),

  getComments: (trackId: string) =>
    api.get<TrackComment[]>(`/tracks/${trackId}/comments`).then((r) => r.data),

  addComment: (trackId: string, content: string) =>
    api.post<TrackComment>(`/tracks/${trackId}/comments`, { content }).then((r) => r.data),

  deleteComment: (trackId: string, commentId: string) =>
    api.delete(`/tracks/${trackId}/comments/${commentId}`).then((r) => r.data),
}

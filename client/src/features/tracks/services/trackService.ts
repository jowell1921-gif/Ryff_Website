import { api } from '@/lib/api'
import type { Track } from '@/types/track.types'

export const trackService = {
  getAll: () =>
    api.get<Track[]>('/tracks').then((r) => r.data),

  getMine: () =>
    api.get<Track[]>('/tracks/mine').then((r) => r.data),

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

  deleteOne: (id: string) =>
    api.delete(`/tracks/${id}`).then((r) => r.data),
}

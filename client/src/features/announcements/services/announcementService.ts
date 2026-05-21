import { api } from '@/lib/api'
import type { Announcement, AnnouncementType } from '@/types/announcement.types'

export interface CreateAnnouncementPayload {
  type: AnnouncementType
  title: string
  description: string
  instruments?: string[]
  genres?: string[]
  location?: string
}

export const announcementService = {
  getAll: (params?: { search?: string; type?: string }) =>
    api.get<Announcement[]>('/announcements', { params }).then((r) => r.data),

  create: (data: CreateAnnouncementPayload) =>
    api.post<Announcement>('/announcements', data).then((r) => r.data),

  deleteOne: (id: string) =>
    api.delete(`/announcements/${id}`).then((r) => r.data),
}

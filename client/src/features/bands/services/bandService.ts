import { api } from '@/lib/api'
import type { Band } from '@/types/band.types'

export interface CreateBandPayload {
  name: string
  description?: string
  genres?: string[]
  location?: string
  lookingFor?: string[]
  creatorInstrument?: string
}

export const bandService = {
  getBands: (params?: { search?: string; genre?: string }) =>
    api.get<Band[]>('/bands', { params }).then((r) => r.data),

  getBandById: (id: string) =>
    api.get<Band>(`/bands/${id}`).then((r) => r.data),

  createBand: (data: CreateBandPayload) =>
    api.post<Band>('/bands', data).then((r) => r.data),

  joinBand: (bandId: string) =>
    api.post(`/bands/${bandId}/join`).then((r) => r.data),

  leaveBand: (bandId: string) =>
    api.delete(`/bands/${bandId}/leave`).then((r) => r.data),
}

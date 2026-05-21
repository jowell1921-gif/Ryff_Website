export type TrackType = 'AUDIO' | 'VIDEO'

export interface Track {
  id: string
  title: string
  type: TrackType
  url: string
  duration: number | null
  coverUrl: string | null
  mimeType: string | null
  fileSize: number | null
  createdAt: string
  author: {
    id: string
    name: string
    avatar: string | null
  }
}

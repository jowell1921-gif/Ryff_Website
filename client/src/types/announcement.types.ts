export type AnnouncementType = 'BUSCO_MUSICO' | 'BUSCO_BANDA'

export interface Announcement {
  id: string
  title: string
  description: string
  type: AnnouncementType
  instruments: string[]
  genres: string[]
  location: string | null
  createdAt: string
  author: {
    id: string
    name: string
    avatar: string | null
    location: string | null
  }
}

export interface BandMember {
  id: string
  role: 'ADMIN' | 'MEMBER'
  instrument: string | null
  joinedAt: string
  userId: string
  user: {
    id: string
    name: string
    avatar: string | null
  }
}

export interface Band {
  id: string
  name: string
  description: string | null
  genres: string[]
  location: string | null
  avatar: string | null
  banner: string | null
  lookingFor: string[]
  createdAt: string
  members: BandMember[]
  _count: { members: number }
}

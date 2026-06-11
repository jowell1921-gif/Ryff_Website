export interface UserSuggestion {
  id: string
  name: string
  avatar: string | null
  instruments: string[]
  mainInstrument: string | null
  inBand: boolean
  isFollowing: boolean
}

export interface UserProfile {
  id: string
  name: string
  avatar: string | null
  bio: string | null
  location: string | null
  instruments: string[]
  mainInstrument: string | null
  role: string | null
  genres: string[]
  createdAt: string
  isFollowing: boolean
  _count: {
    posts: number
    followers: number
    following: number
  }
}

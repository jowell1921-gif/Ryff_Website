export interface UserProfile {
  id: string
  name: string
  avatar: string | null
  bio: string | null
  location: string | null
  instruments: string[]
  genres: string[]
  createdAt: string
  isFollowing: boolean
  _count: {
    posts: number
    followers: number
    following: number
  }
}

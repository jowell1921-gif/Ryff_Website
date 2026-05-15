export interface Reel {
  id: string
  videoUrl: string
  thumbnailUrl: string | null
  caption: string | null
  createdAt: string
  author: {
    id: string
    name: string
    avatar: string | null
  }
  likesCount: number
  isLiked: boolean
}

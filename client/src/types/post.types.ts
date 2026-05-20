export interface PostAuthor {
  id: string
  name: string
  avatar: string | null
  instruments: string[]
}

export interface Post {
  id: string
  content: string
  mediaUrl: string | null
  createdAt: string
  author: PostAuthor
  commentsCount: number
  clapCount: number
  fireCount: number
  asombraCount: number
  isClapped: boolean
  isFired: boolean
  isAsombra: boolean
}

export interface FeedResponse {
  posts: Post[]
  total: number
  page: number
  totalPages: number
  hasMore: boolean
}

export type ReactionType = 'APLAUSO' | 'FIRE' | 'ASOMBRA'

export interface ReactResponse {
  clapCount: number
  fireCount: number
  asombraCount: number
  isClapped: boolean
  isFired: boolean
  isAsombra: boolean
}

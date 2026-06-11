export interface PostAuthor {
  id: string
  name: string
  avatar: string | null
  instruments: string[]
  role: string | null
}

export interface Post {
  id: string
  content: string
  mediaUrl: string | null
  mediaName: string | null
  mediaType: string | null
  createdAt: string
  author: PostAuthor
  commentsCount: number
  repostCount: number
  isReposted: boolean
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

export interface RepostResponse {
  repostCount: number
  isReposted: boolean
}

export interface RepostItem {
  itemType: 'repost'
  id: string
  comment: string | null
  createdAt: string
  repostedBy: {
    id: string
    name: string
    avatar: string | null
    role: string | null
  }
  post: Post
}

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
}

export interface FeedResponse {
  posts: Post[]
  total: number
  page: number
  totalPages: number
  hasMore: boolean
}

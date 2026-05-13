import { api } from '@/lib/api'
import type { FeedResponse, Post } from '@/types/post.types'

export const feedService = {
  getPosts: async (page = 1): Promise<FeedResponse> => {
    const { data } = await api.get<FeedResponse>('/posts', { params: { page } })
    return data
  },

  createPost: async (content: string, mediaUrl?: string): Promise<Post> => {
    const { data } = await api.post<Post>('/posts', { content, mediaUrl })
    return data
  },
}

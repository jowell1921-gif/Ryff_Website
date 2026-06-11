import { api } from '@/lib/api'
import type { FeedResponse, Post, ReactResponse, ReactionType, RepostResponse, RepostItem } from '@/types/post.types'

export const feedService = {
  getPosts: async (page = 1): Promise<FeedResponse> => {
    const { data } = await api.get<FeedResponse>('/posts', { params: { page } })
    return data
  },

  createPost: async (
    content: string,
    mediaUrl?: string,
    mediaName?: string,
    mediaType?: string,
  ): Promise<Post> => {
    const { data } = await api.post<Post>('/posts', { content, mediaUrl, mediaName, mediaType })
    return data
  },

  deletePost: async (postId: string): Promise<{ success: boolean }> => {
    const { data } = await api.delete<{ success: boolean }>(`/posts/${postId}`)
    return data
  },

  uploadPostMedia: async (file: File): Promise<{ url: string; mediaType: string }> => {
    const formData = new FormData()
    formData.append('file', file)
    const { data } = await api.post<{ url: string; mediaType: string }>('/posts/upload-media', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  repostPost: async (postId: string, comment?: string): Promise<RepostResponse> => {
    const { data } = await api.post<RepostResponse>(`/posts/${postId}/repost`, { comment })
    return data
  },

  getRepostsFeed: async (): Promise<RepostItem[]> => {
    const { data } = await api.get<RepostItem[]>('/posts/reposts/feed')
    return data
  },

  getUserReposts: async (userId: string): Promise<RepostItem[]> => {
    const { data } = await api.get<RepostItem[]>(`/posts/reposts/user/${userId}`)
    return data
  },

  reactToPost: async (postId: string, type: ReactionType): Promise<ReactResponse> => {
    const { data } = await api.post<ReactResponse>(`/posts/${postId}/react`, { type })
    return data
  },
}

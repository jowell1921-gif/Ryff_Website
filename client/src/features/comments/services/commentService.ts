import { api } from '@/lib/api'
import type { Comment } from '@/types/comment.types'

export const commentService = {
  getComments: (postId: string) =>
    api.get<Comment[]>(`/posts/${postId}/comments`).then((r) => r.data),

  createComment: (postId: string, content: string) =>
    api.post<Comment>(`/posts/${postId}/comments`, { content }).then((r) => r.data),

  deleteComment: (postId: string, commentId: string) =>
    api.delete(`/posts/${postId}/comments/${commentId}`).then((r) => r.data),
}

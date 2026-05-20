import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { commentService } from '../services/commentService'

export function useComments(postId: string, enabled: boolean) {
  return useQuery({
    queryKey: ['comments', postId],
    queryFn: () => commentService.getComments(postId),
    enabled,
  })
}

export function useCreateComment(postId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (content: string) => commentService.createComment(postId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] })
      queryClient.invalidateQueries({ queryKey: ['feed'] })
    },
  })
}

export function useDeleteComment(postId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (commentId: string) => commentService.deleteComment(postId, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] })
      queryClient.invalidateQueries({ queryKey: ['feed'] })
    },
  })
}

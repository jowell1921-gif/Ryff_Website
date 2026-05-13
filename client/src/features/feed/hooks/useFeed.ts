import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { feedService } from '../services/feedService'

export function useFeed(page = 1) {
  return useQuery({
    queryKey: ['feed', page],
    queryFn: () => feedService.getPosts(page),
  })
}

export function useCreatePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ content, mediaUrl }: { content: string; mediaUrl?: string }) =>
      feedService.createPost(content, mediaUrl),

    // Cuando el post se crea, invalidamos el caché del feed
    // TanStack Query lo re-fetcha automáticamente
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] })
    },
  })
}

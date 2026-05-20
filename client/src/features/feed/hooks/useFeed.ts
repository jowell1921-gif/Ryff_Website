import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { feedService } from '../services/feedService'
import type { FeedResponse, Post, ReactionType } from '@/types/post.types'

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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['feed'] }),
  })
}

export function useReactToPost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ postId, type }: { postId: string; type: ReactionType }) =>
      feedService.reactToPost(postId, type),

    onMutate: async ({ postId, type }) => {
      await queryClient.cancelQueries({ queryKey: ['feed'] })
      const snapshots = queryClient.getQueriesData<FeedResponse>({ queryKey: ['feed'] })

      queryClient.setQueriesData<FeedResponse>({ queryKey: ['feed'] }, (old) => {
        if (!old) return old
        return {
          ...old,
          posts: old.posts.map((p: Post) => {
            if (p.id !== postId) return p
            if (type === 'APLAUSO') {
              return { ...p, isClapped: !p.isClapped, clapCount: p.clapCount + (p.isClapped ? -1 : 1) }
            }
            if (type === 'FIRE') {
              return { ...p, isFired: !p.isFired, fireCount: p.fireCount + (p.isFired ? -1 : 1) }
            }
            return { ...p, isAsombra: !p.isAsombra, asombraCount: p.asombraCount + (p.isAsombra ? -1 : 1) }
          }),
        }
      })

      return { snapshots }
    },

    onError: (_err, _vars, context) => {
      context?.snapshots.forEach(([key, data]) => queryClient.setQueryData(key, data))
    },

    onSettled: () => queryClient.invalidateQueries({ queryKey: ['feed'] }),
  })
}

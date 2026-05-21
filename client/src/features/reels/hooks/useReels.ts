import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { reelService } from '../services/reelService'
import type { Reel, ReactionType, ReelComment } from '@/types/reel.types'

export function useReels() {
  return useQuery({
    queryKey: ['reels'],
    queryFn: reelService.getReels,
  })
}

export function useUploadReel() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ file, caption }: { file: File; caption?: string }) =>
      reelService.upload(file, caption),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reels'] }),
  })
}

export function useReactToReel() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ reelId, type }: { reelId: string; type: ReactionType }) =>
      reelService.react(reelId, type),
    onMutate: async ({ reelId, type }) => {
      await queryClient.cancelQueries({ queryKey: ['reels'] })
      const prev = queryClient.getQueryData<Reel[]>(['reels'])
      queryClient.setQueryData<Reel[]>(['reels'], (old) =>
        old?.map((r) => {
          if (r.id !== reelId) return r
          if (type === 'APLAUSO') return { ...r, isClapped: !r.isClapped, clapCount: r.clapCount + (r.isClapped ? -1 : 1) }
          if (type === 'FIRE')    return { ...r, isFired:   !r.isFired,   fireCount: r.fireCount + (r.isFired ? -1 : 1) }
          return { ...r, isAsombra: !r.isAsombra, asombraCount: r.asombraCount + (r.isAsombra ? -1 : 1) }
        }),
      )
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(['reels'], ctx.prev)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['reels'] }),
  })
}

export function useReelComments(reelId: string | null) {
  return useQuery({
    queryKey: ['reel-comments', reelId],
    queryFn: () => reelService.getComments(reelId!),
    enabled: !!reelId,
  })
}

export function useAddReelComment(reelId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (content: string) => reelService.addComment(reelId, content),
    onSuccess: (newComment) => {
      queryClient.setQueryData<ReelComment[]>(['reel-comments', reelId], (old) => [
        ...(old ?? []),
        newComment,
      ])
      queryClient.setQueryData<Reel[]>(['reels'], (old) =>
        old?.map((r) => r.id === reelId ? { ...r, commentCount: r.commentCount + 1 } : r),
      )
    },
  })
}

export function useDeleteReelComment(reelId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (commentId: string) => reelService.deleteComment(reelId, commentId),
    onSuccess: (_data, commentId) => {
      queryClient.setQueryData<ReelComment[]>(['reel-comments', reelId], (old) =>
        old?.filter((c) => c.id !== commentId),
      )
      queryClient.setQueryData<Reel[]>(['reels'], (old) =>
        old?.map((r) => r.id === reelId ? { ...r, commentCount: Math.max(0, r.commentCount - 1) } : r),
      )
    },
  })
}

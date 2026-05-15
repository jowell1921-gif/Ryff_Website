import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { reelService } from '../services/reelService'
import type { Reel } from '@/types/reel.types'

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

export function useToggleReelLike() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ reelId, isLiked }: { reelId: string; isLiked: boolean }) =>
      isLiked ? reelService.unlike(reelId) : reelService.like(reelId),
    onMutate: async ({ reelId, isLiked }) => {
      await queryClient.cancelQueries({ queryKey: ['reels'] })
      const prev = queryClient.getQueryData<Reel[]>(['reels'])
      queryClient.setQueryData<Reel[]>(['reels'], (old) =>
        old?.map((r) =>
          r.id === reelId
            ? { ...r, isLiked: !isLiked, likesCount: r.likesCount + (isLiked ? -1 : 1) }
            : r,
        ),
      )
      return { prev }
    },
    onError: (_err, _vars, context) => {
      if (context?.prev) queryClient.setQueryData(['reels'], context.prev)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['reels'] }),
  })
}

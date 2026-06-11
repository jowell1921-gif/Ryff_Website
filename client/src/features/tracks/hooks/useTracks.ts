import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { trackService } from '../services/trackService'
import type { Track, TrackComment } from '@/types/track.types'
import type { ReactionType } from '@/types/post.types'

export function useAllTracks() {
  return useQuery({
    queryKey: ['tracks', 'all'],
    queryFn: trackService.getAll,
  })
}

export function useMyTracks() {
  return useQuery({
    queryKey: ['tracks', 'mine'],
    queryFn: trackService.getMine,
  })
}

export function useUserTracks(userId: string) {
  return useQuery({
    queryKey: ['tracks', 'user', userId],
    queryFn: () => trackService.getByUser(userId),
    enabled: !!userId,
  })
}

export function useDeleteTrack() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => trackService.deleteOne(id),
    onSuccess: (_data, id) => {
      queryClient.setQueryData<Track[]>(['tracks', 'mine'], (old) => old?.filter((t) => t.id !== id) ?? [])
      queryClient.setQueryData<Track[]>(['tracks', 'all'], (old) => old?.filter((t) => t.id !== id) ?? [])
    },
  })
}

export function useTrackComments(trackId: string) {
  return useQuery({
    queryKey: ['trackComments', trackId],
    queryFn: () => trackService.getComments(trackId),
    enabled: !!trackId,
  })
}

export function useCreateTrackComment(trackId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (content: string) => trackService.addComment(trackId, content),
    onSuccess: (newComment) => {
      queryClient.setQueryData<TrackComment[]>(['trackComments', trackId], (old) =>
        old ? [...old, newComment] : [newComment],
      )
      queryClient.setQueriesData<Track[]>({ queryKey: ['tracks'] }, (old) =>
        old?.map((t) => t.id === trackId ? { ...t, commentsCount: t.commentsCount + 1 } : t) ?? old,
      )
    },
  })
}

export function useDeleteTrackComment(trackId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (commentId: string) => trackService.deleteComment(trackId, commentId),
    onSuccess: (_data, commentId) => {
      queryClient.setQueryData<TrackComment[]>(['trackComments', trackId], (old) =>
        old?.filter((c) => c.id !== commentId) ?? [],
      )
      queryClient.setQueriesData<Track[]>({ queryKey: ['tracks'] }, (old) =>
        old?.map((t) => t.id === trackId ? { ...t, commentsCount: Math.max(0, t.commentsCount - 1) } : t) ?? old,
      )
    },
  })
}

export function useReactToTrack() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ trackId, type }: { trackId: string; type: ReactionType }) =>
      trackService.reactToTrack(trackId, type),

    onMutate: async ({ trackId, type }) => {
      await queryClient.cancelQueries({ queryKey: ['tracks'] })
      const snapshots = queryClient.getQueriesData<Track[]>({ queryKey: ['tracks'] })

      queryClient.setQueriesData<Track[]>({ queryKey: ['tracks'] }, (old) => {
        if (!old) return old
        return old.map((t: Track) => {
          if (t.id !== trackId) return t
          if (type === 'APLAUSO') return { ...t, isClapped: !t.isClapped, clapCount: t.clapCount + (t.isClapped ? -1 : 1) }
          if (type === 'FIRE')    return { ...t, isFired: !t.isFired, fireCount: t.fireCount + (t.isFired ? -1 : 1) }
          return { ...t, isAsombra: !t.isAsombra, asombraCount: t.asombraCount + (t.isAsombra ? -1 : 1) }
        })
      })

      return { snapshots }
    },

    onError: (_err, _vars, context) => {
      context?.snapshots.forEach(([key, data]) => queryClient.setQueryData(key, data))
    },

    onSettled: () => queryClient.invalidateQueries({ queryKey: ['tracks'] }),
  })
}

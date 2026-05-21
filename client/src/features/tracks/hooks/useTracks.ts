import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { trackService } from '../services/trackService'
import type { Track } from '@/types/track.types'

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

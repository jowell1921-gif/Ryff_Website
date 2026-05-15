import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { bandService, type CreateBandPayload } from '../services/bandService'
import type { Band } from '@/types/band.types'

export function useBands(search?: string, genre?: string) {
  return useQuery({
    queryKey: ['bands', search, genre],
    queryFn: () => bandService.getBands({ search, genre }),
  })
}

export function useBand(id: string) {
  return useQuery({
    queryKey: ['band', id],
    queryFn: () => bandService.getBandById(id),
    enabled: !!id,
  })
}

export function useCreateBand() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateBandPayload) => bandService.createBand(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bands'] }),
  })
}

export function useJoinBand(bandId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => bandService.joinBand(bandId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['band', bandId] })
      queryClient.invalidateQueries({ queryKey: ['bands'] })
    },
  })
}

export function useLeaveBand(bandId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => bandService.leaveBand(bandId),
    onSuccess: (data) => {
      if ((data as { deleted?: boolean }).deleted) {
        queryClient.removeQueries({ queryKey: ['band', bandId] })
      } else {
        queryClient.invalidateQueries({ queryKey: ['band', bandId] })
      }
      queryClient.invalidateQueries({ queryKey: ['bands'] })
    },
  })
}

export function useIsMember(band: Band | undefined, userId: string | undefined) {
  if (!band || !userId) return { isMember: false, isAdmin: false, member: null }
  const member = band.members.find((m) => m.userId === userId) ?? null
  return {
    isMember: !!member,
    isAdmin: member?.role === 'ADMIN',
    member,
  }
}

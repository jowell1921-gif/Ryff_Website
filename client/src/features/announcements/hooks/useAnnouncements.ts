import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { announcementService, type CreateAnnouncementPayload } from '../services/announcementService'

export function useAnnouncements(params?: { search?: string; type?: string }) {
  return useQuery({
    queryKey: ['announcements', params],
    queryFn: () => announcementService.getAll(params),
  })
}

export function useCreateAnnouncement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateAnnouncementPayload) => announcementService.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['announcements'] }),
  })
}

export function useDeleteAnnouncement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => announcementService.deleteOne(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['announcements'] }),
  })
}

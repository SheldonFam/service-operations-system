import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  completeService,
  listJobsForTechnician,
  postponeOrder,
  type CompleteServiceInput,
} from '@/lib/supabase-queries'
import type { OrderStatus } from '@/lib/types'

export function useJobs(technicianId: string, statuses?: OrderStatus[]) {
  return useQuery({
    queryKey: ['jobs', technicianId, statuses ?? []],
    queryFn: async ({ signal }) => {
      const { data, error } = await listJobsForTechnician(technicianId, statuses, signal)
      if (error) throw new Error(error)
      return data ?? []
    },
    enabled: !!technicianId,
  })
}

export function useCompleteJob() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      orderId,
      technicianId,
      data,
    }: {
      orderId: string
      technicianId: string
      data: CompleteServiceInput
    }) => {
      const result = await completeService(orderId, technicianId, data)
      if (result.error) throw new Error(result.error)
      return result
    },
    onSuccess: async (_, { orderId }) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['jobs'] }),
        queryClient.invalidateQueries({ queryKey: ['order', orderId] }),
        queryClient.invalidateQueries({ queryKey: ['orders'] }),
      ])
    },
  })
}

export function usePostponeJob() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ orderId, reason }: { orderId: string; reason: string }) => {
      const { error } = await postponeOrder(orderId, reason)
      if (error) throw new Error(error)
      return { orderId }
    },
    onSuccess: async ({ orderId }) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['jobs'] }),
        queryClient.invalidateQueries({ queryKey: ['order', orderId] }),
        queryClient.invalidateQueries({ queryKey: ['orders'] }),
      ])
    },
  })
}

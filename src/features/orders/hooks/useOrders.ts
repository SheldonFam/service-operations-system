import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createOrder as createOrderQuery,
  getOrderById,
  listManagers,
  listOrders,
  listTechnicians,
  updateOrder as updateOrderQuery,
  type ListOrdersOptions,
  type OrderUpdatable,
} from '@/lib/supabase-queries'
import type { OrderFormValues } from '../schemas/order.schema'

export function useOrders(options?: ListOrdersOptions) {
  return useQuery({
    queryKey: ['orders', options ?? {}],
    queryFn: async ({ signal }) => {
      const { data, error } = await listOrders(options, signal)
      if (error) throw new Error(error)
      return data ?? []
    },
    staleTime: 30_000,
  })
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: async ({ signal }) => {
      const { data, error } = await getOrderById(id, signal)
      if (error) throw new Error(error)
      return data
    },
    enabled: !!id,
  })
}

export function useCreateOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ values, createdBy }: { values: OrderFormValues; createdBy: string }) => {
      const { data, error } = await createOrderQuery(values, createdBy)
      if (error) throw new Error(error)
      if (!data) throw new Error('Create order returned no data')
      return data
    },
    onSuccess: async (order) => {
      queryClient.setQueryData(['order', order.id], order)
      await queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}

export function useUpdateOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: OrderUpdatable }) => {
      const { error } = await updateOrderQuery(id, updates)
      if (error) throw new Error(error)
      return { id }
    },
    onSuccess: async ({ id }) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['order', id] }),
        queryClient.invalidateQueries({ queryKey: ['orders'] }),
        queryClient.invalidateQueries({ queryKey: ['jobs'] }),
      ])
    },
  })
}

export function useTechnicians() {
  return useQuery({
    queryKey: ['technicians'],
    queryFn: () => listTechnicians(),
    staleTime: Infinity,
  })
}

export function useManagers() {
  return useQuery({
    queryKey: ['managers'],
    queryFn: () => listManagers(),
    staleTime: Infinity,
  })
}

'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import type {
  CreateTicketForm,
  PaginatedResponse,
  Ticket,
  TicketFilters,
  UpdateTicketForm,
} from '@/types'

export function useTickets(filters?: TicketFilters) {
  return useQuery({
    queryKey: ['tickets', filters ?? {}],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Ticket>>('/tickets', {
        params: filters,
      })
      return data
    },
  })
}

export function useTicket(id: number) {
  return useQuery({
    queryKey: ['tickets', id],
    queryFn: async () => {
      const { data } = await api.get<{ data: Ticket }>(`/tickets/${id}`)
      return data.data
    },
    enabled: !!id,
  })
}

export function useCreateTicket() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateTicketForm) => {
      const { data } = await api.post<{ data: Ticket }>('/tickets', payload)
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
    },
  })
}

export function useUpdateTicket(id: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: UpdateTicketForm) => {
      const { data } = await api.put<{ data: Ticket }>(`/tickets/${id}`, payload)
      return data.data
    },
    onSuccess: (ticket) => {
      queryClient.setQueryData(['tickets', id], ticket)
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
    },
  })
}

export function useDeleteTicket() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/tickets/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
    },
  })
}

export function useStats() {
  return useQuery({
    queryKey: ['tickets', 'stats'],
    queryFn: async () => {
      const { data } = await api.get<{ data: import('@/types').Stats }>('/stats')
      return data.data
    },
  })
}

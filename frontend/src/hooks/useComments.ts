'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import type { Comment, CreateCommentForm } from '@/types'

export function useComments(ticketId: number) {
  return useQuery({
    queryKey: ['tickets', ticketId, 'comments'],
    queryFn: async () => {
      const { data } = await api.get<{ data: Comment[] }>(`/tickets/${ticketId}/comments`)
      return data.data
    },
    enabled: !!ticketId,
  })
}

export function useCreateComment(ticketId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateCommentForm) => {
      const { data } = await api.post<{ data: Comment }>(
        `/tickets/${ticketId}/comments`,
        payload,
      )
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets', ticketId, 'comments'] })
    },
  })
}

export function useDeleteComment(ticketId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (commentId: number) => {
      await api.delete(`/tickets/${ticketId}/comments/${commentId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets', ticketId, 'comments'] })
    },
  })
}

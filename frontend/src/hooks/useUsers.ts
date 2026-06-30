'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import type { CreateUserForm, PaginatedResponse, UpdateUserForm, User } from '@/types'

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<User>>('/users')
      return data
    },
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateUserForm) => {
      const { data } = await api.post<{ data: User }>('/users', payload)
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export function useUpdateUser(id: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: UpdateUserForm) => {
      const { data } = await api.put<{ data: User }>(`/users/${id}`, payload)
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/users/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

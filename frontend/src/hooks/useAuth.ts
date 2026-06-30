'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { clearAuth, isAuthenticated, storeUser, setToken } from '@/lib/auth'
import type { AuthResponse, LoginForm, User } from '@/types'

export function useCurrentUser() {
  return useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data } = await api.get<{ data: User }>('/auth/me')
      return data.data
    },
    enabled: isAuthenticated(),
    staleTime: Infinity,
  })
}

export function useLogin() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: async (credentials: LoginForm) => {
      const { data } = await api.post<AuthResponse>('/auth/login', credentials)
      return data
    },
    onSuccess: (data) => {
      setToken(data.token)
      storeUser(data.data)
      queryClient.setQueryData(['user'], data.data)
      router.push('/dashboard')
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: () => api.post('/auth/logout'),
    onSettled: () => {
      clearAuth()
      queryClient.clear()
      router.push('/login')
    },
  })
}

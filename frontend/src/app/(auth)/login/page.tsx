'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { isAxiosError } from 'axios'
import { useLogin } from '@/hooks/useAuth'
import { Button, Input } from '@/components/ui'
import type { LoginForm } from '@/types'

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export default function LoginPage() {
  const login = useLogin()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(schema) })

  const errorMessage =
    login.error
      ? isAxiosError(login.error) && login.error.response?.status === 401
        ? 'Invalid email or password.'
        : 'Something went wrong. Please try again.'
      : null

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600">
          <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-gray-900">Sign in to ITSM Lite</h1>
        <p className="mt-1 text-sm text-gray-500">Enter your credentials to continue</p>
      </div>

      <form onSubmit={handleSubmit((data) => login.mutate(data))} className="space-y-4">
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          error={errors.email?.message}
          required
          {...register('email')}
        />
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          required
          {...register('password')}
        />

        {errorMessage && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
            {errorMessage}
          </p>
        )}

        <Button type="submit" loading={login.isPending} className="w-full">
          Sign in
        </Button>
      </form>
    </div>
  )
}

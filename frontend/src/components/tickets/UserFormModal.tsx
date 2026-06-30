'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateUser, useUpdateUser } from '@/hooks/useUsers'
import { Button, Input, Modal, Select } from '@/components/ui'
import type { User, UserRole } from '@/types'

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  email: z.string().email('Enter a valid email'),
  role: z.enum(['admin', 'agent', 'user']),
  password: z.string(),
  password_confirmation: z.string(),
})

type FormData = z.infer<typeof schema>

const ROLE_OPTIONS = [
  { value: 'user', label: 'User' },
  { value: 'agent', label: 'Agent' },
  { value: 'admin', label: 'Admin' },
]

interface Props {
  open: boolean
  onClose: () => void
  user?: User
}

export function UserFormModal({ open, onClose, user }: Props) {
  const isEdit = !!user
  const create = useCreateUser()
  const update = useUpdateUser(user?.id ?? 0)

  const { register, handleSubmit, reset, setError, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', role: 'user', password: '', password_confirmation: '' },
  })

  useEffect(() => {
    if (open) {
      reset(
        isEdit
          ? { name: user!.name, email: user!.email, role: user!.role, password: '', password_confirmation: '' }
          : { name: '', email: '', role: 'user', password: '', password_confirmation: '' },
      )
    }
  }, [open, isEdit, user, reset])

  const handleClose = () => { reset(); onClose() }

  const onSubmit = (data: FormData) => {
    if (!isEdit && data.password.length < 8) {
      setError('password', { message: 'Password must be at least 8 characters' })
      return
    }
    if (data.password && data.password !== data.password_confirmation) {
      setError('password_confirmation', { message: 'Passwords must match' })
      return
    }

    if (isEdit) {
      const payload: Partial<{ name: string; email: string; role: UserRole; password: string; password_confirmation: string }> = {
        name: data.name,
        email: data.email,
        role: data.role,
      }
      if (data.password) {
        payload.password = data.password
        payload.password_confirmation = data.password_confirmation
      }
      update.mutate(payload, { onSuccess: handleClose })
    } else {
      create.mutate(
        { name: data.name, email: data.email, role: data.role, password: data.password, password_confirmation: data.password_confirmation },
        { onSuccess: handleClose },
      )
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={isEdit ? 'Edit User' : 'New User'}
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>Cancel</Button>
          <Button form="user-form" type="submit" loading={create.isPending || update.isPending}>
            {isEdit ? 'Save Changes' : 'Create User'}
          </Button>
        </>
      }
    >
      <form id="user-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Name" error={errors.name?.message} required={!isEdit} {...register('name')} />
        <Input label="Email" type="email" error={errors.email?.message} required={!isEdit} {...register('email')} />
        <Select label="Role" options={ROLE_OPTIONS} error={errors.role?.message} {...register('role')} />
        <Input
          label={isEdit ? 'New Password (leave blank to keep)' : 'Password'}
          type="password"
          error={errors.password?.message}
          required={!isEdit}
          {...register('password')}
        />
        <Input
          label="Confirm Password"
          type="password"
          error={errors.password_confirmation?.message}
          required={!isEdit}
          {...register('password_confirmation')}
        />
      </form>
    </Modal>
  )
}

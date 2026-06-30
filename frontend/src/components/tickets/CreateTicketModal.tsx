'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateTicket } from '@/hooks/useTickets'
import { useCategories } from '@/hooks/useCategories'
import { Button, Input, Modal, Select, Textarea } from '@/components/ui'

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().min(1, 'Description is required'),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  category_id: z.number().int().min(1, 'Category is required'),
})

type FormData = z.infer<typeof schema>

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
]

interface Props {
  open: boolean
  onClose: () => void
}

export function CreateTicketModal({ open, onClose }: Props) {
  const { data: categories = [] } = useCategories()
  const create = useCreateTicket()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const handleClose = () => {
    reset()
    onClose()
  }

  const onSubmit = (data: FormData) => {
    create.mutate(data, { onSuccess: handleClose })
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="New Ticket"
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>Cancel</Button>
          <Button form="create-ticket-form" type="submit" loading={create.isPending}>
            Create Ticket
          </Button>
        </>
      }
    >
      <form id="create-ticket-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Title"
          placeholder="Brief description of the issue"
          error={errors.title?.message}
          required
          {...register('title')}
        />
        <Textarea
          label="Description"
          placeholder="Detailed explanation of the issue..."
          error={errors.description?.message}
          required
          {...register('description')}
        />
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Priority"
            options={PRIORITY_OPTIONS}
            error={errors.priority?.message}
            required
            {...register('priority')}
          />
          <Select
            label="Category"
            placeholder="Select category"
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
            error={errors.category_id?.message}
            required
            {...register('category_id', { valueAsNumber: true })}
          />
        </div>
      </form>
    </Modal>
  )
}

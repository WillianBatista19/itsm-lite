'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useUpdateTicket } from '@/hooks/useTickets'
import { useCurrentUser } from '@/hooks/useAuth'
import { useUsers } from '@/hooks/useUsers'
import { Button, Select } from '@/components/ui'
import type { Ticket } from '@/types'

const schema = z.object({
  status: z.enum(['open', 'in_progress', 'resolved', 'closed']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  assignee_id: z.number().nullable().optional(),
})

type FormData = z.infer<typeof schema>

const STATUS_OPTIONS = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
]

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
]

interface Props {
  ticket: Ticket
}

export function TicketEditForm({ ticket }: Props) {
  const { data: currentUser } = useCurrentUser()
  const isAdmin = currentUser?.role === 'admin'
  const { data: usersPage } = useUsers()
  const update = useUpdateTicket(ticket.id)

  const { register, handleSubmit, watch, setValue, formState: { isDirty } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      status: ticket.status,
      priority: ticket.priority,
      assignee_id: ticket.assignee?.id ?? null,
    },
  })

  const userOptions = [
    { value: '', label: 'Unassigned' },
    ...(usersPage?.data ?? []).map((u) => ({ value: String(u.id), label: u.name })),
  ]

  const assigneeId = watch('assignee_id')

  const onSubmit = (data: FormData) => {
    update.mutate(data)
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
      <h3 className="mb-3 text-sm font-semibold text-gray-700">Update Ticket</h3>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Select label="Status" options={STATUS_OPTIONS} {...register('status')} />
          <Select label="Priority" options={PRIORITY_OPTIONS} {...register('priority')} />
          {isAdmin && (
            <Select
              label="Assignee"
              options={userOptions}
              value={assigneeId == null ? '' : String(assigneeId)}
              onChange={(e) =>
                setValue(
                  'assignee_id',
                  e.target.value === '' ? null : parseInt(e.target.value, 10),
                  { shouldDirty: true },
                )
              }
            />
          )}
        </div>
        <div className="mt-3 flex justify-end">
          <Button type="submit" size="sm" loading={update.isPending} disabled={!isDirty}>
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  )
}

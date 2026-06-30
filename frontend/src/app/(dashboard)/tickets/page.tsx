'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTickets, useDeleteTicket } from '@/hooks/useTickets'
import { useCurrentUser } from '@/hooks/useAuth'
import { Button, EmptyState, PriorityBadge, Select, Spinner, StatusBadge } from '@/components/ui'
import { CreateTicketModal } from '@/components/tickets/CreateTicketModal'
import type { TicketFilters, TicketPriority, TicketStatus } from '@/types'

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
]

const PRIORITY_OPTIONS = [
  { value: '', label: 'All Priorities' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
]

export default function TicketsPage() {
  const [filters, setFilters] = useState<TicketFilters>({})
  const [createOpen, setCreateOpen] = useState(false)
  const [page, setPage] = useState(1)

  const { data, isLoading } = useTickets({ ...filters, page })
  const { data: currentUser } = useCurrentUser()
  const remove = useDeleteTicket()

  const tickets = data?.data ?? []
  const meta = data?.meta

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tickets</h1>
          {meta && (
            <p className="mt-1 text-sm text-gray-500">{meta.total} ticket{meta.total !== 1 ? 's' : ''}</p>
          )}
        </div>
        <Button onClick={() => setCreateOpen(true)}>New Ticket</Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="w-44">
          <Select
            options={STATUS_OPTIONS}
            value={filters.status ?? ''}
            onChange={(e) => {
              setFilters((f) => ({ ...f, status: (e.target.value as TicketStatus) || undefined }))
              setPage(1)
            }}
          />
        </div>
        <div className="w-44">
          <Select
            options={PRIORITY_OPTIONS}
            value={filters.priority ?? ''}
            onChange={(e) => {
              setFilters((f) => ({ ...f, priority: (e.target.value as TicketPriority) || undefined }))
              setPage(1)
            }}
          />
        </div>
        {(filters.status || filters.priority) && (
          <Button variant="ghost" size="sm" onClick={() => { setFilters({}); setPage(1) }}>
            Clear filters
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : tickets.length === 0 ? (
          <EmptyState title="No tickets found" description="Try adjusting your filters or create a new ticket." />
        ) : (
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                {['Title', 'Status', 'Priority', 'Requester', 'Assignee', ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/tickets/${ticket.id}`} className="font-medium text-gray-900 hover:text-blue-600">
                      <span className="block max-w-xs truncate">{ticket.title}</span>
                      <span className="text-xs text-gray-400">#{ticket.id}</span>
                    </Link>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={ticket.status} /></td>
                  <td className="px-4 py-3"><PriorityBadge priority={ticket.priority} /></td>
                  <td className="px-4 py-3 text-sm text-gray-600">{ticket.requester.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{ticket.assignee?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/tickets/${ticket.id}`}
                        className="text-xs text-blue-600 hover:underline">View</Link>
                      {currentUser?.role === 'admin' && (
                        <button
                          onClick={() => { if (confirm('Delete this ticket?')) remove.mutate(ticket.id) }}
                          className="text-xs text-red-500 hover:text-red-700"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Page {meta.current_page} of {meta.last_page}</span>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <Button variant="secondary" size="sm" disabled={page === meta.last_page} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}

      <CreateTicketModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  )
}

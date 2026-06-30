'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTicket, useDeleteTicket } from '@/hooks/useTickets'
import { useCurrentUser } from '@/hooks/useAuth'
import { FullPageSpinner, PriorityBadge, StatusBadge } from '@/components/ui'
import { TicketEditForm } from '@/components/tickets/TicketEditForm'
import { CommentSection } from '@/components/tickets/CommentSection'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

interface MetaItemProps { label: string; value: string | undefined }
function MetaItem({ label, value }: MetaItemProps) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900">{value ?? '—'}</dd>
    </div>
  )
}

export default function TicketDetailPage({ params }: { params: { id: string } }) {
  const id = parseInt(params.id, 10)
  const router = useRouter()
  const { data: ticket, isLoading, error } = useTicket(id)
  const { data: currentUser } = useCurrentUser()
  const remove = useDeleteTicket()

  const isAgentOrAdmin = currentUser?.role === 'agent' || currentUser?.role === 'admin'
  const isAdmin = currentUser?.role === 'admin'

  const handleDelete = () => {
    if (!confirm('Delete this ticket? This cannot be undone.')) return
    remove.mutate(id, { onSuccess: () => router.push('/tickets') })
  }

  if (isLoading) return <FullPageSpinner />

  if (error || !ticket) {
    return (
      <div className="py-16 text-center">
        <p className="text-gray-500">Ticket not found.</p>
        <Link href="/tickets" className="mt-4 inline-block text-sm text-blue-600 hover:underline">
          Back to tickets
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/tickets" className="text-sm text-gray-400 hover:text-gray-600">
            ← Tickets
          </Link>
          <span className="text-gray-200">/</span>
          <span className="text-sm text-gray-500">#{ticket.id}</span>
        </div>
        {isAdmin && (
          <button onClick={handleDelete} className="text-sm text-red-500 hover:text-red-700">
            Delete ticket
          </button>
        )}
      </div>

      {/* Title + badges */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">{ticket.title}</h1>
        <div className="mt-2 flex items-center gap-2">
          <StatusBadge status={ticket.status} />
          <PriorityBadge priority={ticket.priority} />
          <span className="text-xs text-gray-400">Created {formatDate(ticket.created_at)}</span>
        </div>
      </div>

      {/* Meta grid */}
      <dl className="grid grid-cols-2 gap-4 rounded-xl border border-gray-200 bg-white p-5 sm:grid-cols-4">
        <MetaItem label="Category" value={ticket.category?.name} />
        <MetaItem label="Requester" value={ticket.requester?.name} />
        <MetaItem label="Assignee" value={ticket.assignee?.name} />
        <MetaItem label="Updated" value={formatDate(ticket.updated_at)} />
      </dl>

      {/* Description */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-3 text-sm font-semibold text-gray-700">Description</h2>
        <p className="whitespace-pre-wrap text-sm text-gray-700">{ticket.description}</p>
      </div>

      {/* Edit form — agents and admins only */}
      {isAgentOrAdmin && <TicketEditForm ticket={ticket} />}

      {/* Comments */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <CommentSection ticketId={ticket.id} />
      </div>
    </div>
  )
}

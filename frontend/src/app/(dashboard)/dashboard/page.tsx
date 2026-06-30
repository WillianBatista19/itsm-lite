'use client'

import Link from 'next/link'
import { useStats, useTickets } from '@/hooks/useTickets'
import { FullPageSpinner, PriorityBadge, StatusBadge } from '@/components/ui'
import type { TicketPriority } from '@/types'

const PRIORITY_ORDER: TicketPriority[] = ['critical', 'high', 'medium', 'low']
const PRIORITY_COLORS: Record<TicketPriority, string> = {
  critical: 'bg-red-500',
  high: 'bg-orange-400',
  medium: 'bg-blue-400',
  low: 'bg-gray-300',
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${color}`}>{value}</p>
    </div>
  )
}

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useStats()
  const { data: recent } = useTickets({ page: 1 })

  if (statsLoading) return <FullPageSpinner />

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Overview of your IT service desk</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Open Tickets" value={stats?.open ?? 0} color="text-blue-600" />
        <StatCard label="In Progress" value={stats?.in_progress ?? 0} color="text-yellow-600" />
        <StatCard label="Resolved Today" value={stats?.resolved_today ?? 0} color="text-green-600" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent tickets */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h2 className="text-sm font-semibold text-gray-900">Recent Tickets</h2>
              <Link href="/tickets" className="text-xs text-blue-600 hover:underline">
                View all
              </Link>
            </div>
            <ul className="divide-y divide-gray-100">
              {recent?.data.slice(0, 8).map((ticket) => (
                <li key={ticket.id}>
                  <Link
                    href={`/tickets/${ticket.id}`}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">{ticket.title}</p>
                      <p className="text-xs text-gray-400">#{ticket.id} · {ticket.requester.name}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <PriorityBadge priority={ticket.priority} />
                      <StatusBadge status={ticket.status} />
                    </div>
                  </Link>
                </li>
              ))}
              {!recent?.data.length && (
                <li className="px-5 py-8 text-center text-sm text-gray-400">No tickets yet</li>
              )}
            </ul>
          </div>
        </div>

        {/* By priority */}
        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-gray-900">By Priority</h2>
          </div>
          <ul className="divide-y divide-gray-100 px-5">
            {PRIORITY_ORDER.map((p) => {
              const count = stats?.by_priority[p] ?? 0
              const total = Object.values(stats?.by_priority ?? {}).reduce((a, b) => a + b, 0)
              const pct = total ? Math.round((count / total) * 100) : 0
              return (
                <li key={p} className="flex items-center gap-3 py-3">
                  <PriorityBadge priority={p} />
                  <div className="flex-1">
                    <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className={`h-full rounded-full ${PRIORITY_COLORS[p]}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  <span className="w-6 text-right text-sm font-medium text-gray-700">{count}</span>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </div>
  )
}

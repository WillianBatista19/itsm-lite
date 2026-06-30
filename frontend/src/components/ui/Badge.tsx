import type { TicketPriority, TicketStatus, UserRole } from '@/types'

type BadgeVariant =
  | 'status-open'
  | 'status-in_progress'
  | 'status-resolved'
  | 'status-closed'
  | 'priority-low'
  | 'priority-medium'
  | 'priority-high'
  | 'priority-critical'
  | 'role-admin'
  | 'role-agent'
  | 'role-user'

const variantClasses: Record<BadgeVariant, string> = {
  'status-open': 'bg-blue-100 text-blue-700',
  'status-in_progress': 'bg-yellow-100 text-yellow-700',
  'status-resolved': 'bg-green-100 text-green-700',
  'status-closed': 'bg-gray-100 text-gray-600',
  'priority-low': 'bg-gray-100 text-gray-600',
  'priority-medium': 'bg-blue-100 text-blue-600',
  'priority-high': 'bg-orange-100 text-orange-700',
  'priority-critical': 'bg-red-100 text-red-700',
  'role-admin': 'bg-purple-100 text-purple-700',
  'role-agent': 'bg-indigo-100 text-indigo-700',
  'role-user': 'bg-gray-100 text-gray-600',
}

const labelMap: Record<string, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
  admin: 'Admin',
  agent: 'Agent',
  user: 'User',
}

interface StatusBadgeProps {
  status: TicketStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variantClasses[`status-${status}`]}`}
    >
      {labelMap[status]}
    </span>
  )
}

interface PriorityBadgeProps {
  priority: TicketPriority
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variantClasses[`priority-${priority}`]}`}
    >
      {labelMap[priority]}
    </span>
  )
}

interface RoleBadgeProps {
  role: UserRole
}

export function RoleBadge({ role }: RoleBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variantClasses[`role-${role}`]}`}
    >
      {labelMap[role]}
    </span>
  )
}

interface BadgeProps {
  children: React.ReactNode
  className?: string
}

export function Badge({ children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700 ${className}`}
    >
      {children}
    </span>
  )
}

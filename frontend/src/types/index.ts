export type UserRole = 'admin' | 'agent' | 'user'
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed'
export type TicketPriority = 'low' | 'medium' | 'high' | 'critical'

export interface User {
  id: number
  name: string
  email: string
  role: UserRole
  created_at: string
}

export interface Category {
  id: number
  name: string
}

export interface Comment {
  id: number
  body: string
  user: User
  created_at: string
}

export interface Ticket {
  id: number
  title: string
  description: string
  status: TicketStatus
  priority: TicketPriority
  category: Category
  requester: User
  assignee: User | null
  comments_count: number
  comments?: Comment[]
  created_at: string
  updated_at: string
}

export interface Stats {
  open: number
  in_progress: number
  resolved_today: number
  by_priority: Record<TicketPriority, number>
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    current_page: number
    last_page: number
    total: number
  }
}

export interface SingleResponse<T> {
  data: T
  message?: string
}

export interface AuthResponse {
  data: User
  token: string
}

// Form payloads

export interface LoginForm {
  email: string
  password: string
}

export interface CreateTicketForm {
  title: string
  description: string
  priority: TicketPriority
  category_id: number
}

export interface UpdateTicketForm {
  title?: string
  description?: string
  status?: TicketStatus
  priority?: TicketPriority
  category_id?: number
  assignee_id?: number | null
}

export interface CreateCommentForm {
  body: string
}

export interface CreateUserForm {
  name: string
  email: string
  password: string
  password_confirmation: string
  role: UserRole
}

export interface UpdateUserForm {
  name?: string
  email?: string
  password?: string
  password_confirmation?: string
  role?: UserRole
}

export interface TicketFilters {
  status?: TicketStatus
  priority?: TicketPriority
  assignee_id?: number
  page?: number
}

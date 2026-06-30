import type { User } from '@/types'

const TOKEN_KEY = 'itsm_token'
const USER_KEY = 'itsm_user'

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
  // Cookie lets middleware guard protected routes server-side
  document.cookie = `${TOKEN_KEY}=${token}; path=/; SameSite=Lax; max-age=86400`
}

export function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw) as User) : null
  } catch {
    return null
  }
}

export function storeUser(user: User): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  document.cookie = `${TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
}

export function isAuthenticated(): boolean {
  return !!getToken()
}

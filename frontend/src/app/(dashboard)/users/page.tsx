'use client'

import { useState } from 'react'
import { useUsers, useDeleteUser } from '@/hooks/useUsers'
import { Button, EmptyState, RoleBadge, Spinner } from '@/components/ui'
import { UserFormModal } from '@/components/tickets/UserFormModal'
import type { User } from '@/types'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function UsersPage() {
  const { data, isLoading } = useUsers()
  const remove = useDeleteUser()
  const [createOpen, setCreateOpen] = useState(false)
  const [editUser, setEditUser] = useState<User | undefined>()

  const users = data?.data ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          {data?.meta && (
            <p className="mt-1 text-sm text-gray-500">{data.meta.total} user{data.meta.total !== 1 ? 's' : ''}</p>
          )}
        </div>
        <Button onClick={() => setCreateOpen(true)}>New User</Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : users.length === 0 ? (
          <EmptyState
            title="No users found"
            description="Create the first user to get started."
            action={<Button onClick={() => setCreateOpen(true)}>New User</Button>}
          />
        ) : (
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                {['Name', 'Email', 'Role', 'Joined', ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                  <td className="px-4 py-3"><RoleBadge role={user.role} /></td>
                  <td className="px-4 py-3 text-sm text-gray-400">{formatDate(user.created_at)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditUser(user)}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete ${user.name}?`)) remove.mutate(user.id)
                        }}
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <UserFormModal open={createOpen} onClose={() => setCreateOpen(false)} />
      <UserFormModal
        open={!!editUser}
        onClose={() => setEditUser(undefined)}
        user={editUser}
      />
    </div>
  )
}

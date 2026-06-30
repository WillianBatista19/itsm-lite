'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useComments, useCreateComment, useDeleteComment } from '@/hooks/useComments'
import { useCurrentUser } from '@/hooks/useAuth'
import { Button, EmptyState, Spinner, Textarea } from '@/components/ui'
import type { CreateCommentForm } from '@/types'

const schema = z.object({ body: z.string().min(1, 'Comment cannot be empty') })

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

interface Props {
  ticketId: number
}

export function CommentSection({ ticketId }: Props) {
  const { data: comments, isLoading } = useComments(ticketId)
  const { data: currentUser } = useCurrentUser()
  const create = useCreateComment(ticketId)
  const remove = useDeleteComment(ticketId)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateCommentForm>({
    resolver: zodResolver(schema),
  })

  const onSubmit = (data: CreateCommentForm) => {
    create.mutate(data, { onSuccess: () => reset() })
  }

  const canDelete = (authorId: number) =>
    currentUser?.role === 'admin' ||
    currentUser?.role === 'agent' ||
    currentUser?.id === authorId

  return (
    <div className="mt-6">
      <h3 className="mb-4 text-sm font-semibold text-gray-900">
        Comments {comments && `(${comments.length})`}
      </h3>

      {isLoading && (
        <div className="flex justify-center py-6"><Spinner /></div>
      )}

      {!isLoading && comments?.length === 0 && (
        <EmptyState title="No comments yet" description="Be the first to add a comment." />
      )}

      <ul className="space-y-4">
        {comments?.map((comment) => (
          <li key={comment.id} className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-600">
              {comment.user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 rounded-lg border border-gray-200 bg-white p-3">
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-gray-900">{comment.user.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">{formatDate(comment.created_at)}</span>
                  {canDelete(comment.user.id) && (
                    <button
                      onClick={() => remove.mutate(comment.id)}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-700">{comment.body}</p>
            </div>
          </li>
        ))}
      </ul>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-2">
        <Textarea
          placeholder="Add a comment..."
          rows={3}
          error={errors.body?.message}
          {...register('body')}
        />
        <div className="flex justify-end">
          <Button type="submit" size="sm" loading={create.isPending}>
            Add Comment
          </Button>
        </div>
      </form>
    </div>
  )
}

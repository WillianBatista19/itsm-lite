<?php

namespace App\Policies;

use App\Models\Comment;
use App\Models\Ticket;
use App\Models\User;

class CommentPolicy
{
    public function viewAny(User $user, Ticket $ticket): bool
    {
        if ($user->isAgentOrAdmin()) {
            return true;
        }

        return $ticket->requester_id === $user->id
            || $ticket->assignee_id === $user->id;
    }

    public function create(User $user, Ticket $ticket): bool
    {
        if ($user->isAgentOrAdmin()) {
            return true;
        }

        return $ticket->requester_id === $user->id
            || $ticket->assignee_id === $user->id;
    }

    public function delete(User $user, Comment $comment): bool
    {
        if ($user->isAgentOrAdmin()) {
            return true;
        }

        return $comment->user_id === $user->id;
    }
}

<?php

use App\Models\Comment;
use App\Models\Ticket;
use App\Models\User;

describe('Comments', function () {
    describe('index', function () {
        it('returns 401 for unauthenticated', function () {
            $ticket = Ticket::factory()->create();
            $this->getJson("/api/v1/tickets/{$ticket->id}/comments")->assertStatus(401);
        });

        it('lets requester view comments on their ticket', function () {
            $user = User::factory()->create();
            $ticket = Ticket::factory()->create(['requester_id' => $user->id]);
            Comment::factory()->count(2)->create(['ticket_id' => $ticket->id]);

            $this->actingAs($user)
                ->getJson("/api/v1/tickets/{$ticket->id}/comments")
                ->assertOk()
                ->assertJsonCount(2, 'data');
        });

        it('prevents non-participant from viewing comments', function () {
            $user = User::factory()->create();
            $ticket = Ticket::factory()->create();

            $this->actingAs($user)
                ->getJson("/api/v1/tickets/{$ticket->id}/comments")
                ->assertStatus(403);
        });
    });

    describe('store', function () {
        it('lets requester add a comment', function () {
            $user = User::factory()->create();
            $ticket = Ticket::factory()->create(['requester_id' => $user->id]);

            $this->actingAs($user)
                ->postJson("/api/v1/tickets/{$ticket->id}/comments", ['body' => 'Hello!'])
                ->assertStatus(201)
                ->assertJsonPath('data.body', 'Hello!');
        });

        it('prevents non-participant from commenting', function () {
            $user = User::factory()->create();
            $ticket = Ticket::factory()->create();

            $this->actingAs($user)
                ->postJson("/api/v1/tickets/{$ticket->id}/comments", ['body' => 'Hi'])
                ->assertStatus(403);
        });

        it('returns 422 when body is missing', function () {
            $user = User::factory()->create();
            $ticket = Ticket::factory()->create(['requester_id' => $user->id]);

            $this->actingAs($user)
                ->postJson("/api/v1/tickets/{$ticket->id}/comments", [])
                ->assertStatus(422)
                ->assertJsonValidationErrors(['body']);
        });
    });

    describe('destroy', function () {
        it('lets comment author delete their comment', function () {
            $user = User::factory()->create();
            $ticket = Ticket::factory()->create(['requester_id' => $user->id]);
            $comment = Comment::factory()->create(['ticket_id' => $ticket->id, 'user_id' => $user->id]);

            $this->actingAs($user)
                ->deleteJson("/api/v1/tickets/{$ticket->id}/comments/{$comment->id}")
                ->assertOk();

            expect(Comment::find($comment->id))->toBeNull();
        });

        it('prevents other user from deleting comment', function () {
            $user = User::factory()->create();
            $other = User::factory()->create();
            $ticket = Ticket::factory()->create(['requester_id' => $user->id]);
            $comment = Comment::factory()->create(['ticket_id' => $ticket->id, 'user_id' => $other->id]);

            $this->actingAs($user)
                ->deleteJson("/api/v1/tickets/{$ticket->id}/comments/{$comment->id}")
                ->assertStatus(403);
        });

        it('lets agent delete any comment', function () {
            $agent = User::factory()->agent()->create();
            $ticket = Ticket::factory()->create();
            $comment = Comment::factory()->create(['ticket_id' => $ticket->id]);

            $this->actingAs($agent)
                ->deleteJson("/api/v1/tickets/{$ticket->id}/comments/{$comment->id}")
                ->assertOk();
        });
    });
});

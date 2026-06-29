<?php

use App\Enums\UserRole;
use App\Models\Category;
use App\Models\Ticket;
use App\Models\User;

describe('Tickets', function () {
    describe('index', function () {
        it('returns 401 for unauthenticated', function () {
            $this->getJson('/api/v1/tickets')->assertStatus(401);
        });

        it('returns only own tickets for regular users', function () {
            $user = User::factory()->create();
            $other = User::factory()->create();
            $category = Category::factory()->create();

            Ticket::factory()->create(['requester_id' => $user->id, 'category_id' => $category->id]);
            Ticket::factory()->create(['requester_id' => $other->id, 'category_id' => $category->id]);

            $response = $this->actingAs($user)->getJson('/api/v1/tickets');

            $response->assertOk();
            expect($response->json('data'))->toHaveCount(1);
        });

        it('returns all tickets for agents', function () {
            $agent = User::factory()->agent()->create();
            $category = Category::factory()->create();

            Ticket::factory()->count(3)->create(['category_id' => $category->id]);

            $this->actingAs($agent)
                ->getJson('/api/v1/tickets')
                ->assertOk()
                ->assertJsonCount(3, 'data');
        });

        it('filters tickets by status', function () {
            $agent = User::factory()->agent()->create();
            $category = Category::factory()->create();

            Ticket::factory()->open()->create(['category_id' => $category->id]);
            Ticket::factory()->resolved()->create(['category_id' => $category->id]);

            $this->actingAs($agent)
                ->getJson('/api/v1/tickets?status=open')
                ->assertOk()
                ->assertJsonCount(1, 'data');
        });
    });

    describe('store', function () {
        it('creates a ticket as regular user', function () {
            $user = User::factory()->create();
            $category = Category::factory()->create();

            $this->actingAs($user)
                ->postJson('/api/v1/tickets', [
                    'title' => 'My first ticket',
                    'description' => 'Something is broken.',
                    'priority' => 'high',
                    'category_id' => $category->id,
                ])
                ->assertStatus(201)
                ->assertJsonPath('data.title', 'My first ticket')
                ->assertJsonPath('data.status', 'open')
                ->assertJsonPath('data.requester.id', $user->id);
        });

        it('returns 422 when required fields are missing', function () {
            $user = User::factory()->create();

            $this->actingAs($user)
                ->postJson('/api/v1/tickets', [])
                ->assertStatus(422)
                ->assertJsonValidationErrors(['title', 'description', 'priority', 'category_id']);
        });
    });

    describe('show', function () {
        it('lets requester view their own ticket', function () {
            $user = User::factory()->create();
            $ticket = Ticket::factory()->create(['requester_id' => $user->id]);

            $this->actingAs($user)
                ->getJson("/api/v1/tickets/{$ticket->id}")
                ->assertOk()
                ->assertJsonPath('data.id', $ticket->id);
        });

        it('returns 403 when user tries to view another\'s ticket', function () {
            $user = User::factory()->create();
            $other = User::factory()->create();
            $ticket = Ticket::factory()->create(['requester_id' => $other->id]);

            $this->actingAs($user)
                ->getJson("/api/v1/tickets/{$ticket->id}")
                ->assertStatus(403);
        });

        it('lets admin view any ticket', function () {
            $admin = User::factory()->admin()->create();
            $ticket = Ticket::factory()->create();

            $this->actingAs($admin)
                ->getJson("/api/v1/tickets/{$ticket->id}")
                ->assertOk();
        });
    });

    describe('update', function () {
        it('lets requester update their own ticket', function () {
            $user = User::factory()->create();
            $ticket = Ticket::factory()->create(['requester_id' => $user->id]);

            $this->actingAs($user)
                ->putJson("/api/v1/tickets/{$ticket->id}", ['title' => 'Updated title'])
                ->assertOk()
                ->assertJsonPath('data.title', 'Updated title');
        });

        it('prevents user from updating another\'s ticket', function () {
            $user = User::factory()->create();
            $other = User::factory()->create();
            $ticket = Ticket::factory()->create(['requester_id' => $other->id]);

            $this->actingAs($user)
                ->putJson("/api/v1/tickets/{$ticket->id}", ['title' => 'Hijacked'])
                ->assertStatus(403);
        });

        it('lets agent update any ticket status', function () {
            $agent = User::factory()->agent()->create();
            $ticket = Ticket::factory()->open()->create();

            $this->actingAs($agent)
                ->putJson("/api/v1/tickets/{$ticket->id}", ['status' => 'in_progress'])
                ->assertOk()
                ->assertJsonPath('data.status', 'in_progress');
        });
    });

    describe('destroy', function () {
        it('lets admin delete a ticket', function () {
            $admin = User::factory()->admin()->create();
            $ticket = Ticket::factory()->create();

            $this->actingAs($admin)
                ->deleteJson("/api/v1/tickets/{$ticket->id}")
                ->assertOk();

            expect(Ticket::find($ticket->id))->toBeNull();
        });

        it('prevents non-admin from deleting a ticket', function () {
            $user = User::factory()->create();
            $ticket = Ticket::factory()->create(['requester_id' => $user->id]);

            $this->actingAs($user)
                ->deleteJson("/api/v1/tickets/{$ticket->id}")
                ->assertStatus(403);
        });
    });
});

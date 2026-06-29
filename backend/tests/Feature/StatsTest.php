<?php

use App\Models\Category;
use App\Models\Ticket;
use App\Models\User;

describe('Stats', function () {
    it('returns 401 for unauthenticated', function () {
        $this->getJson('/api/v1/stats')->assertStatus(401);
    });

    it('returns stats for authenticated user', function () {
        $user = User::factory()->create();
        $category = Category::factory()->create();

        Ticket::factory()->open()->count(3)->create(['category_id' => $category->id]);
        Ticket::factory()->inProgress()->count(2)->create(['category_id' => $category->id]);
        Ticket::factory()->resolved()->count(1)->create(['category_id' => $category->id]);

        $this->actingAs($user)
            ->getJson('/api/v1/stats')
            ->assertOk()
            ->assertJsonStructure([
                'data' => ['open', 'in_progress', 'resolved_today', 'by_priority'],
            ])
            ->assertJsonPath('data.open', 3)
            ->assertJsonPath('data.in_progress', 2);
    });
});

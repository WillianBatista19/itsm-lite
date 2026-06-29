<?php

use App\Models\Category;
use App\Models\User;

describe('Categories', function () {
    it('returns 401 for unauthenticated', function () {
        $this->getJson('/api/v1/categories')->assertStatus(401);
    });

    it('returns category list for authenticated users', function () {
        $user = User::factory()->create();
        Category::factory()->count(3)->create();

        $this->actingAs($user)
            ->getJson('/api/v1/categories')
            ->assertOk()
            ->assertJsonCount(3, 'data');
    });

    it('returns correct resource shape', function () {
        $user = User::factory()->create();
        Category::factory()->create(['name' => 'Network']);

        $this->actingAs($user)
            ->getJson('/api/v1/categories')
            ->assertOk()
            ->assertJsonStructure(['data' => [['id', 'name']]]);
    });
});

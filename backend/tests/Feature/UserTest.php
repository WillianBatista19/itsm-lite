<?php

use App\Models\User;

describe('Users', function () {
    it('returns 403 for non-admin on list', function () {
        $user = User::factory()->create();

        $this->actingAs($user)->getJson('/api/v1/users')->assertStatus(403);
    });

    it('returns user list for admin', function () {
        $admin = User::factory()->admin()->create();
        User::factory()->count(3)->create();

        $this->actingAs($admin)
            ->getJson('/api/v1/users')
            ->assertOk()
            ->assertJsonStructure(['data', 'meta']);
    });

    it('lets admin create a user', function () {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->postJson('/api/v1/users', [
                'name' => 'New Agent',
                'email' => 'newagent@example.com',
                'password' => 'password',
                'password_confirmation' => 'password',
                'role' => 'agent',
            ])
            ->assertStatus(201)
            ->assertJsonPath('data.role', 'agent');
    });

    it('returns 422 for duplicate email on create', function () {
        $admin = User::factory()->admin()->create();
        $existing = User::factory()->create(['email' => 'dupe@example.com']);

        $this->actingAs($admin)
            ->postJson('/api/v1/users', [
                'name' => 'Dup',
                'email' => 'dupe@example.com',
                'password' => 'password',
                'password_confirmation' => 'password',
                'role' => 'user',
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    });

    it('lets admin update a user', function () {
        $admin = User::factory()->admin()->create();
        $user = User::factory()->create();

        $this->actingAs($admin)
            ->putJson("/api/v1/users/{$user->id}", ['name' => 'Renamed'])
            ->assertOk()
            ->assertJsonPath('data.name', 'Renamed');
    });

    it('lets admin delete a user', function () {
        $admin = User::factory()->admin()->create();
        $user = User::factory()->create();

        $this->actingAs($admin)
            ->deleteJson("/api/v1/users/{$user->id}")
            ->assertOk();

        expect(User::find($user->id))->toBeNull();
    });

    it('prevents admin from deleting themselves', function () {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->deleteJson("/api/v1/users/{$admin->id}")
            ->assertStatus(403);
    });

    it('prevents non-admin from creating users', function () {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->postJson('/api/v1/users', [
                'name' => 'Attacker',
                'email' => 'attacker@example.com',
                'password' => 'password',
                'password_confirmation' => 'password',
                'role' => 'admin',
            ])
            ->assertStatus(403);
    });
});

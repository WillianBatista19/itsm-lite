<?php

use App\Models\User;

describe('Auth', function () {
    it('returns 422 when login fields are missing', function () {
        $this->postJson('/api/v1/auth/login', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['email', 'password']);
    });

    it('returns 401 for invalid credentials', function () {
        User::factory()->create(['email' => 'test@example.com', 'password' => bcrypt('secret')]);

        $this->postJson('/api/v1/auth/login', [
            'email' => 'test@example.com',
            'password' => 'wrong-password',
        ])->assertStatus(401);
    });

    it('returns token on successful login', function () {
        $user = User::factory()->create(['password' => bcrypt('password')]);

        $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'password',
        ])
            ->assertOk()
            ->assertJsonStructure(['data' => ['id', 'name', 'email', 'role'], 'token']);
    });

    it('returns 401 on unauthenticated access to protected route', function () {
        $this->getJson('/api/v1/auth/me')->assertStatus(401);
    });

    it('returns authenticated user on /me', function () {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->getJson('/api/v1/auth/me')
            ->assertOk()
            ->assertJsonPath('data.id', $user->id);
    });

    it('logs out and revokes token', function () {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->postJson('/api/v1/auth/logout')
            ->assertOk()
            ->assertJsonPath('message', 'Logged out successfully.');
    });
});

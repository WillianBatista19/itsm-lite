<?php

namespace Database\Factories;

use App\Models\Ticket;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class CommentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'body' => fake()->paragraph(),
            'ticket_id' => Ticket::factory(),
            'user_id' => User::factory(),
        ];
    }
}

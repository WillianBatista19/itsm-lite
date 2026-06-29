<?php

namespace Database\Factories;

use App\Enums\TicketPriority;
use App\Enums\TicketStatus;
use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class TicketFactory extends Factory
{
    public function definition(): array
    {
        return [
            'title' => fake()->sentence(),
            'description' => fake()->paragraph(),
            'status' => fake()->randomElement(TicketStatus::cases())->value,
            'priority' => fake()->randomElement(TicketPriority::cases())->value,
            'category_id' => Category::factory(),
            'requester_id' => User::factory(),
            'assignee_id' => null,
        ];
    }

    public function open(): static
    {
        return $this->state(fn () => ['status' => TicketStatus::Open->value]);
    }

    public function inProgress(): static
    {
        return $this->state(fn () => ['status' => TicketStatus::InProgress->value]);
    }

    public function resolved(): static
    {
        return $this->state(fn () => ['status' => TicketStatus::Resolved->value]);
    }
}

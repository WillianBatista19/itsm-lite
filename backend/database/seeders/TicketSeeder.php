<?php

namespace Database\Seeders;

use App\Enums\TicketPriority;
use App\Enums\TicketStatus;
use App\Models\Category;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Database\Seeder;

class TicketSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::all();
        $categories = Category::all();
        $statuses = TicketStatus::cases();
        $priorities = TicketPriority::cases();

        for ($i = 1; $i <= 20; $i++) {
            Ticket::create([
                'title' => "Sample Ticket #{$i}",
                'description' => "This is the description for ticket #{$i}. It contains details about the issue.",
                'status' => $statuses[array_rand($statuses)]->value,
                'priority' => $priorities[array_rand($priorities)]->value,
                'category_id' => $categories->random()->id,
                'requester_id' => $users->random()->id,
                'assignee_id' => rand(0, 1) ? $users->random()->id : null,
            ]);
        }
    }
}

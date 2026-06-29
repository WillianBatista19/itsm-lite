<?php

namespace App\Http\Controllers;

use App\Enums\TicketPriority;
use App\Enums\TicketStatus;
use App\Models\Ticket;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;

class StatsController extends Controller
{
    public function index(): JsonResponse
    {
        $byPriority = [];
        foreach (TicketPriority::cases() as $priority) {
            $byPriority[$priority->value] = Ticket::where('priority', $priority->value)->count();
        }

        return response()->json([
            'data' => [
                'open' => Ticket::where('status', TicketStatus::Open->value)->count(),
                'in_progress' => Ticket::where('status', TicketStatus::InProgress->value)->count(),
                'resolved_today' => Ticket::where('status', TicketStatus::Resolved->value)
                    ->whereDate('updated_at', Carbon::today())
                    ->count(),
                'by_priority' => $byPriority,
            ],
        ]);
    }
}

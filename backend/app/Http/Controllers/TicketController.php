<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTicketRequest;
use App\Http\Requests\UpdateTicketRequest;
use App\Http\Resources\TicketResource;
use App\Models\Ticket;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class TicketController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Ticket::class);

        $query = Ticket::query()
            ->with(['category', 'requester', 'assignee'])
            ->withCount('comments');

        if (! $request->user()->isAgentOrAdmin()) {
            $query->where('requester_id', $request->user()->id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }

        if ($request->filled('assignee_id')) {
            $query->where('assignee_id', $request->assignee_id);
        }

        $tickets = $query->latest()->paginate(15);

        return TicketResource::collection($tickets);
    }

    public function store(StoreTicketRequest $request): JsonResponse
    {
        $this->authorize('create', Ticket::class);

        $ticket = Ticket::create([
            ...$request->validated(),
            'requester_id' => $request->user()->id,
            'status' => 'open',
        ]);

        $ticket->load(['category', 'requester', 'assignee']);

        return response()->json(['data' => new TicketResource($ticket)], 201);
    }

    public function show(Ticket $ticket): JsonResponse
    {
        $this->authorize('view', $ticket);

        $ticket->load(['category', 'requester', 'assignee', 'comments.user']);

        return response()->json(['data' => new TicketResource($ticket)]);
    }

    public function update(UpdateTicketRequest $request, Ticket $ticket): JsonResponse
    {
        $this->authorize('update', $ticket);

        $ticket->update($request->validated());
        $ticket->load(['category', 'requester', 'assignee']);

        return response()->json(['data' => new TicketResource($ticket)]);
    }

    public function destroy(Ticket $ticket): JsonResponse
    {
        $this->authorize('delete', $ticket);

        $ticket->delete();

        return response()->json(['message' => 'Ticket deleted successfully.']);
    }
}

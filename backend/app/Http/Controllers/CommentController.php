<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCommentRequest;
use App\Http\Resources\CommentResource;
use App\Models\Comment;
use App\Models\Ticket;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CommentController extends Controller
{
    public function index(Ticket $ticket): AnonymousResourceCollection
    {
        $this->authorize('viewAny', [Comment::class, $ticket]);

        $comments = $ticket->comments()->with('user')->latest()->get();

        return CommentResource::collection($comments);
    }

    public function store(StoreCommentRequest $request, Ticket $ticket): JsonResponse
    {
        $this->authorize('create', [Comment::class, $ticket]);

        $comment = $ticket->comments()->create([
            'body' => $request->validated('body'),
            'user_id' => $request->user()->id,
        ]);

        $comment->load('user');

        return response()->json(['data' => new CommentResource($comment)], 201);
    }

    public function destroy(Ticket $ticket, Comment $comment): JsonResponse
    {
        $this->authorize('delete', $comment);

        $comment->delete();

        return response()->json(['message' => 'Comment deleted successfully.']);
    }
}

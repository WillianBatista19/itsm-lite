<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\StatsController;
use App\Http\Controllers\TicketController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::post('auth/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('auth/logout', [AuthController::class, 'logout']);
        Route::get('auth/me', [AuthController::class, 'me']);

        Route::apiResource('tickets', TicketController::class);

        Route::get('tickets/{ticket}/comments', [CommentController::class, 'index']);
        Route::post('tickets/{ticket}/comments', [CommentController::class, 'store']);
        Route::delete('tickets/{ticket}/comments/{comment}', [CommentController::class, 'destroy']);

        Route::apiResource('users', UserController::class)->except(['show']);

        Route::get('categories', [CategoryController::class, 'index']);

        Route::get('stats', [StatsController::class, 'index']);
    });
});

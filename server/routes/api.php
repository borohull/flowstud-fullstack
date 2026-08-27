<?php

require __DIR__.'/auth.php';

use App\Http\Controllers\Api\Admin\StatsController as AdminStatsController;
use App\Http\Controllers\Api\Admin\TagController as AdminTagController;
use App\Http\Controllers\Api\Admin\UserController as AdminUserController;
use App\Http\Controllers\Api\AssignmentController;
use App\Http\Controllers\Api\CourseController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\StudySessionController;
use App\Http\Controllers\Api\TagController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Current authenticated user (used by Breeze/Sanctum)
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Public routes
Route::get('/users', [UserController::class, 'index']);
Route::get('/users/{username}', [UserController::class, 'show']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Own profile update + social lists
    Route::patch('/user/profile', [UserController::class, 'updateProfile']);
    Route::get('/user/followers', [UserController::class, 'myFollowers']);
    Route::get('/user/following', [UserController::class, 'myFollowing']);

    // Courses
    Route::apiResource('courses', CourseController::class);

    // Assignments
    Route::apiResource('assignments', AssignmentController::class);
    Route::patch('/assignments/{assignment}/complete', [AssignmentController::class, 'complete']);
    Route::post('/assignments/{assignment}/tags/{tagId}', [AssignmentController::class, 'attachTag']);
    Route::delete('/assignments/{assignment}/tags/{tagId}', [AssignmentController::class, 'detachTag']);

    // Study Sessions
    Route::apiResource('sessions', StudySessionController::class);
    Route::post('/sessions/{session}/items', [StudySessionController::class, 'addItem']);
    Route::delete('/sessions/{session}/items/{assignment}', [StudySessionController::class, 'removeItem']);
    Route::patch('/sessions/{session}/items/reorder', [StudySessionController::class, 'reorderItems']);

    // Tags
    Route::get('/tags', [TagController::class, 'index']);
    Route::post('/tags', [TagController::class, 'store']);
    Route::patch('/tags/{tag}', [TagController::class, 'update']);
    Route::delete('/tags/{tag}', [TagController::class, 'destroy']);

    // Follow / Unfollow (uses ID-based route model binding)
    Route::post('/users/{user}/follow', [UserController::class, 'follow']);
    Route::delete('/users/{user}/follow', [UserController::class, 'unfollow']);
});

// Admin routes
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('/stats', [AdminStatsController::class, 'index']);
    Route::get('/users', [AdminUserController::class, 'index']);
    Route::patch('/users/{user}/role', [AdminUserController::class, 'updateRole']);
    Route::delete('/users/{user}', [AdminUserController::class, 'destroy']);
    Route::get('/tags', [AdminTagController::class, 'index']);
    Route::delete('/tags/{tag}', [AdminTagController::class, 'destroy']);
});

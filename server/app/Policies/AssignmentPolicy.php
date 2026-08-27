<?php

namespace App\Policies;

use App\Models\Assignment;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class AssignmentPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Assignment $assignment): bool
    {
        return $user->id === $assignment->user_id || $user->role === 'admin';
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Assignment $assignment): bool
    {
        return $user->id === $assignment->user_id || $user->role === 'admin';
    }

    public function delete(User $user, Assignment $assignment): bool
    {
        return $user->id === $assignment->user_id || $user->role === 'admin';
    }
}

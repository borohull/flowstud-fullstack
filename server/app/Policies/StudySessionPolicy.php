<?php

namespace App\Policies;

use App\Models\StudySession;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class StudySessionPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, StudySession $studySession): bool
    {
        return $user->id === $studySession->user_id || $user->role === 'admin';
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, StudySession $studySession): bool
    {
        return $user->id === $studySession->user_id || $user->role === 'admin';
    }

    public function delete(User $user, StudySession $studySession): bool
    {
        return $user->id === $studySession->user_id || $user->role === 'admin';
    }
}

<?php

namespace App\Policies;

use App\Models\Tag;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class TagPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Tag $tag): bool
    {
        return $tag->is_global || $user->id === $tag->user_id || $user->role === 'admin';
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Tag $tag): bool
    {
        if ($tag->is_global) {
            return $user->role === 'admin';
        }
        return $user->id === $tag->user_id;
    }

    public function delete(User $user, Tag $tag): bool
    {
        if ($tag->is_global) {
            return $user->role === 'admin';
        }
        return $user->id === $tag->user_id;
    }
}

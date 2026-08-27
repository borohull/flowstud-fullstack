<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $q = $request->query('search');

        $users = User::select('id', 'name', 'username', 'avatar', 'bio', 'is_profile_public')
            ->when($q, fn($query) => $query->where(function ($sub) use ($q) {
                $sub->where('name', 'like', "%{$q}%")
                    ->orWhere('username', 'like', "%{$q}%");
            }))
            ->get();

        if (auth()->check()) {
            $followingIds = auth()->user()->following()->pluck('users.id')->toArray();
            return $users->map(function ($user) use ($followingIds) {
                $user->is_following = in_array($user->id, $followingIds);
                return $user;
            });
        }

        return $users;
    }

    public function show(Request $request, string $username)
    {
        $user = User::where('username', $username)->firstOrFail();

        $profile = [
            'id'                => $user->id,
            'name'              => $user->name,
            'username'          => $user->username,
            'avatar'            => $user->avatar,
            'bio'               => $user->bio,
            'is_profile_public' => $user->is_profile_public,
            'followers_count'   => $user->followers()->count(),
            'following_count'   => $user->following()->count(),
        ];

        if (auth()->check()) {
            $profile['is_following'] = auth()->user()->following()
                ->where('followed_id', $user->id)->exists();
        }

        if ($user->show_completed_assignments_count) {
            $profile['completed_assignments_count'] = $user->assignments()
                ->whereNotNull('completed_at')->count();
        }

        if ($user->show_study_streak) {
            $profile['study_streak'] = $this->computeStreak($user);
        }

        if ($user->show_study_sessions_count) {
            $profile['study_sessions_count'] = $user->studySessions()->count();
        }

        return response()->json($profile);
    }

    public function updateProfile(Request $request)
    {
        $user = auth()->user();

        $data = $request->validate([
            'name'     => 'sometimes|string|max:255',
            'username' => 'sometimes|string|max:25|unique:users,username,' . $user->id,
            'bio'      => 'nullable|string',
            'is_profile_public'                 => 'boolean',
            'show_completed_assignments_count'  => 'boolean',
            'show_study_streak'                 => 'boolean',
            'show_study_sessions_count'         => 'boolean',
        ]);

        $user->update($data);

        return response()->json($user);
    }

    public function myFollowers(Request $request)
    {
        return $request->user()
            ->followers()
            ->select('users.id', 'users.name', 'users.username', 'users.avatar', 'users.bio')
            ->get();
    }

    public function myFollowing(Request $request)
    {
        return $request->user()
            ->following()
            ->select('users.id', 'users.name', 'users.username', 'users.avatar', 'users.bio')
            ->get();
    }

    public function follow(Request $request, User $user)
    {
        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'Cannot follow yourself.'], 422);
        }

        $request->user()->following()->syncWithoutDetaching([$user->id]);

        return response()->json(['following' => true]);
    }

    public function unfollow(Request $request, User $user)
    {
        $request->user()->following()->detach($user->id);

        return response()->json(['following' => false]);
    }

    private function computeStreak(User $user): int
    {
        $dates = $user->assignments()
            ->whereNotNull('completed_at')
            ->orderByDesc('completed_at')
            ->pluck('completed_at')
            ->map(fn($dt) => $dt->toDateString())
            ->unique()
            ->values();

        if ($dates->isEmpty()) {
            return 0;
        }

        $streak = 0;
        $expected = now()->toDateString();

        foreach ($dates as $date) {
            if ($date === $expected) {
                $streak++;
                $expected = now()->subDays($streak)->toDateString();
            } else {
                break;
            }
        }

        return $streak;
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        $upcoming = $user->assignments()
            ->with('course')
            ->whereIn('status', ['pending', 'in_progress'])
            ->whereNotNull('due_date')
            ->orderBy('due_date')
            ->limit(10)
            ->get();

        $completedCount = $user->assignments()
            ->whereNotNull('completed_at')
            ->count();

        $xp    = $completedCount * 10;
        $level = (int) floor($xp / 100) + 1;
        $xpIntoLevel = $xp % 100;

        $streak = $this->computeStreak($user);

        return response()->json([
            'streak'        => $streak,
            'xp'            => $xp,
            'level'         => $level,
            'xp_into_level' => $xpIntoLevel,
            'upcoming'      => $upcoming,
        ]);
    }

    private function computeStreak($user): int
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

        $streak   = 0;
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

<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\StudySession;
use App\Models\Tag;
use App\Models\User;

class StatsController extends Controller
{
    public function index()
    {
        return response()->json([
            'user_count'       => User::count(),
            'assignment_count' => Assignment::count(),
            'session_count'    => StudySession::count(),
            'tag_count'        => Tag::count(),
        ]);
    }
}

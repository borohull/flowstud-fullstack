<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use Illuminate\Http\Request;

class AssignmentController extends Controller
{
    public function index(Request $request)
    {
        $query = auth()->user()->assignments()->with(['course', 'tags']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }

        if ($request->filled('course_id')) {
            $query->where('course_id', $request->course_id);
        }

        return $query->latest()->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title'           => 'required|string|max:255',
            'description'     => 'nullable|string',
            'course_id'       => 'nullable|exists:courses,id',
            'assignment_type' => 'nullable|string|in:homework,quiz,exam,project,reading,presentation,lab,personal,other',
            'status'          => 'nullable|string|in:pending,in_progress,completed',
            'priority'        => 'nullable|string|in:low,medium,high',
            'due_date'        => 'nullable|date',
            'due_time'        => 'nullable|string',
            'color_theme'     => 'nullable|string|in:purple,blue,green,red,orange,yellow',
            'is_public_progress_visible' => 'boolean',
        ]);

        $data['user_id'] = auth()->id();
        $assignment = Assignment::create($data);

        return response()->json($assignment->load(['course', 'tags']), 201);
    }

    public function show(Assignment $assignment)
    {
        $this->authorize('view', $assignment);

        return $assignment->load(['course', 'tags']);
    }

    public function update(Request $request, Assignment $assignment)
    {
        $this->authorize('update', $assignment);

        $data = $request->validate([
            'title'           => 'sometimes|string|max:255',
            'description'     => 'nullable|string',
            'course_id'       => 'nullable|exists:courses,id',
            'assignment_type' => 'nullable|string|in:homework,quiz,exam,project,reading,presentation,lab,personal,other',
            'status'          => 'nullable|string|in:pending,in_progress,completed',
            'priority'        => 'nullable|string|in:low,medium,high',
            'due_date'        => 'nullable|date',
            'due_time'        => 'nullable|string',
            'color_theme'     => 'nullable|string|in:purple,blue,green,red,orange,yellow',
            'is_public_progress_visible' => 'boolean',
        ]);

        $assignment->update($data);

        return response()->json($assignment->load(['course', 'tags']));
    }

    public function destroy(Assignment $assignment)
    {
        $this->authorize('delete', $assignment);

        $assignment->delete();

        return response()->noContent();
    }

    public function complete(Assignment $assignment)
    {
        $this->authorize('update', $assignment);

        if ($assignment->completed_at) {
            $assignment->update(['status' => 'pending', 'completed_at' => null]);
        } else {
            $assignment->update(['status' => 'completed', 'completed_at' => now()]);
        }

        return response()->json($assignment);
    }

    public function attachTag(Assignment $assignment, int $tagId)
    {
        $this->authorize('update', $assignment);
        $assignment->tags()->syncWithoutDetaching([$tagId]);
        return response()->json($assignment->load(['course', 'tags']));
    }

    public function detachTag(Assignment $assignment, int $tagId)
    {
        $this->authorize('update', $assignment);
        $assignment->tags()->detach($tagId);
        return response()->json($assignment->load(['course', 'tags']));
    }
}

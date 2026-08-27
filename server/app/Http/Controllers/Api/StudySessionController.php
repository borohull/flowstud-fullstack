<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\StudySession;
use Illuminate\Http\Request;

class StudySessionController extends Controller
{
    public function index()
    {
        return auth()->user()->studySessions()->latest()->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title'        => 'required|string|max:255',
            'description'  => 'nullable|string',
            'session_date' => 'nullable|date',
            'status'       => 'nullable|string|in:pending,in_progress,completed',
        ]);

        $session = auth()->user()->studySessions()->create($data);

        return response()->json($session, 201);
    }

    public function show(StudySession $session)
    {
        $this->authorize('view', $session);

        return $session->load('assignments');
    }

    public function update(Request $request, StudySession $session)
    {
        $this->authorize('update', $session);

        $data = $request->validate([
            'title'        => 'sometimes|string|max:255',
            'description'  => 'nullable|string',
            'session_date' => 'nullable|date',
            'status'       => 'nullable|string|in:pending,in_progress,completed',
        ]);

        $session->update($data);

        return response()->json($session);
    }

    public function destroy(StudySession $session)
    {
        $this->authorize('delete', $session);

        $session->delete();

        return response()->noContent();
    }

    public function addItem(Request $request, StudySession $session)
    {
        $this->authorize('update', $session);

        $request->validate([
            'assignment_id' => 'required|exists:assignments,id',
        ]);

        $assignment = Assignment::findOrFail($request->assignment_id);

        if ($assignment->user_id !== auth()->id()) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $maxOrder = $session->sessionItems()->max('sort_order') ?? -1;

        $session->assignments()->syncWithoutDetaching([
            $request->assignment_id => ['sort_order' => $maxOrder + 1],
        ]);

        return response()->json($session->load('assignments'));
    }

    public function removeItem(StudySession $session, Assignment $assignment)
    {
        $this->authorize('update', $session);

        $session->assignments()->detach($assignment->id);

        return response()->noContent();
    }

    public function reorderItems(Request $request, StudySession $session)
    {
        $this->authorize('update', $session);

        $request->validate([
            'items'              => 'required|array',
            'items.*.id'         => 'required|integer|exists:assignments,id',
            'items.*.sort_order' => 'required|integer',
        ]);

        foreach ($request->items as $item) {
            $session->assignments()->updateExistingPivot($item['id'], [
                'sort_order' => $item['sort_order'],
            ]);
        }

        return response()->json($session->load('assignments'));
    }
}

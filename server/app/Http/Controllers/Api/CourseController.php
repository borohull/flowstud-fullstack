<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use Illuminate\Http\Request;

class CourseController extends Controller
{
    public function index()
    {
        return auth()->user()->courses()->latest()->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'color_theme' => 'nullable|string|in:purple,blue,green,red,orange,yellow',
            'is_archived' => 'boolean',
        ]);

        $course = auth()->user()->courses()->create($data);

        return response()->json($course, 201);
    }

    public function show(Course $course)
    {
        $this->authorize('view', $course);

        return $course->load('assignments');
    }

    public function update(Request $request, Course $course)
    {
        $this->authorize('update', $course);

        $data = $request->validate([
            'title'       => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'color_theme' => 'nullable|string|in:purple,blue,green,red,orange,yellow',
            'is_archived' => 'boolean',
        ]);

        $course->update($data);

        return response()->json($course);
    }

    public function destroy(Course $course)
    {
        $this->authorize('delete', $course);

        $course->delete();

        return response()->noContent();
    }
}

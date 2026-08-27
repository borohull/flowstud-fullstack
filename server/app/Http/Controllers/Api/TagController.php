<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tag;
use Illuminate\Http\Request;

class TagController extends Controller
{
    public function index()
    {
        return Tag::where('is_global', true)
            ->orWhere('user_id', auth()->id())
            ->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'  => 'required|string|max:50',
            'color' => 'nullable|string|max:20',
        ]);

        $data['user_id'] = auth()->id();
        $data['is_global'] = false;

        $tag = Tag::create($data);

        return response()->json($tag, 201);
    }

    public function update(Request $request, Tag $tag)
    {
        $this->authorize('update', $tag);

        $data = $request->validate([
            'name'  => 'sometimes|string|max:50',
            'color' => 'nullable|string|max:20',
        ]);

        $tag->update($data);

        return response()->json($tag);
    }

    public function destroy(Tag $tag)
    {
        $this->authorize('delete', $tag);

        $tag->delete();

        return response()->noContent();
    }
}

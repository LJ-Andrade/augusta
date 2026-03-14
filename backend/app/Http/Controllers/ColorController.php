<?php

namespace App\Http\Controllers;

use App\Models\Color;
use App\Http\Resources\ColorResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class ColorController extends Controller
{
    public function index(Request $request)
    {
        $query = Color::query();

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where('name', 'like', "%{$search}%");
        }

        // Advanced filters
        if ($request->filled('filter_id')) {
            $query->where('id', $request->filter_id);
        }

        if ($request->filled('filter_name')) {
            $query->where('name', 'like', '%' . $request->filter_name . '%');
        }

        $sortBy = $request->input('sort_by', 'id');
        $sortDir = $request->input('sort_dir', 'desc');

        if (in_array($sortBy, ['id', 'name', 'created_at'])) {
            $query->orderBy($sortBy, $sortDir === 'asc' ? 'asc' : 'desc');
        }

        if ($request->boolean('all')) {
            return ColorResource::collection($query->get());
        }

        return ColorResource::collection($query->paginate(10));
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'hex_color' => 'required|string|max:7|regex:/^#[a-fA-F0-9]{6}$/',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $color = Color::create($validator->validated());

        return new ColorResource($color);
    }

    public function show(Color $color)
    {
        return new ColorResource($color);
    }

    public function update(Request $request, Color $color)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'hex_color' => 'required|string|max:7|regex:/^#[a-fA-F0-9]{6}$/',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $color->update($validator->validated());

        return new ColorResource($color);
    }

    public function destroy(Color $color)
    {
        $color->delete();
        return response()->json(['message' => 'Color deleted successfully']);
    }

    public function bulkDelete(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:colors,id',
        ]);

        $ids = $validated['ids'];
        $count = 0;

        DB::transaction(function () use ($ids, &$count) {
            foreach ($ids as $id) {
                $color = Color::find($id);
                if ($color) {
                    $color->delete();
                    $count++;
                }
            }
        });

        return response()->json([
            'message' => $count . ' colors deleted successfully',
            'deleted_count' => $count,
        ]);
    }
}

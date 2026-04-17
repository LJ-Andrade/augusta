<?php

namespace App\Http\Controllers;

use App\Models\ProductSize;
use App\Http\Resources\ProductSizeResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class ProductSizeController extends Controller
{
    public function index(Request $request)
    {
        $query = ProductSize::query();

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where('name', 'like', "%{$search}%");
        }

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
            return ProductSizeResource::collection($query->get());
        }

        return ProductSizeResource::collection($query->paginate(10));
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $size = ProductSize::create($validator->validated());

        return new ProductSizeResource($size);
    }

    public function show(ProductSize $productSize)
    {
        return new ProductSizeResource($productSize);
    }

    public function update(Request $request, ProductSize $productSize)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $productSize->update($validator->validated());

        return new ProductSizeResource($productSize);
    }

    public function destroy(ProductSize $productSize)
    {
        $productSize->delete();
        return response()->json(['message' => 'Size deleted successfully']);
    }

    public function bulkDelete(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:product_sizes,id',
        ]);

        $ids = $validated['ids'];
        $count = 0;

        DB::transaction(function () use ($ids, &$count) {
            foreach ($ids as $id) {
                $size = ProductSize::find($id);
                if ($size) {
                    $size->delete();
                    $count++;
                }
            }
        });

        return response()->json([
            'message' => $count . ' sizes deleted successfully',
            'deleted_count' => $count,
        ]);
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\ProductCategory;
use App\Http\Resources\ProductCategoryResource;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Validator;

class ProductCategoryController extends Controller
{
    public function publicIndex(Request $request)
    {
        $query = ProductCategory::query();

        if ($request->filled('search')) {
            $query->where('name', 'like', "%{$request->input('search')}%");
        }

        return ProductCategoryResource::collection($query->orderBy('name')->get());
    }

    public function index(Request $request)
    {
        $query = ProductCategory::query();

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where('name', 'like', "%{$search}%");
        }

        if ($request->filled('filter_id')) {
            $query->where('id', $request->input('filter_id'));
        }

        if ($request->filled('filter_name')) {
            $query->where('name', 'like', "%{$request->input('filter_name')}%");
        }

        $sortBy = $request->input('sort_by', 'id');
        $sortDir = $request->input('sort_dir', 'desc');

        if (in_array($sortBy, ['id', 'name', 'created_at'])) {
            $query->orderBy($sortBy, $sortDir === 'asc' ? 'asc' : 'desc');
        }

        if ($request->boolean('all')) {
            return ProductCategoryResource::collection($query->get());
        }

        return ProductCategoryResource::collection($query->paginate(10));
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:product_categories,slug',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        if (empty($data['slug'])) {
            $data['slug'] = Str::slug($data['name']);
            $originalSlug = $data['slug'];
            $count = 1;
            while (ProductCategory::where('slug', $data['slug'])->exists()) {
                $data['slug'] = $originalSlug . '-' . $count++;
            }
        }

        $category = ProductCategory::create($data);

        return new ProductCategoryResource($category);
    }

    public function show(ProductCategory $product_category)
    {
        return new ProductCategoryResource($product_category);
    }

    public function update(Request $request, ProductCategory $product_category)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:product_categories,slug,' . $product_category->id,
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        if (empty($data['slug'])) {
            $data['slug'] = Str::slug($data['name']);
            $originalSlug = $data['slug'];
            $count = 1;
            while (ProductCategory::where('slug', $data['slug'])->where('id', '!=', $product_category->id)->exists()) {
                $data['slug'] = $originalSlug . '-' . $count++;
            }
        }

        $product_category->update($data);

        return new ProductCategoryResource($product_category);
    }

    public function destroy(ProductCategory $product_category)
    {
        $product_category->delete();

        return response()->noContent();
    }

    public function bulkDelete(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:product_categories,id'
        ]);

        ProductCategory::whereIn('id', $request->ids)->delete();

        return response()->json(['message' => 'Categorías de producto eliminadas correctamente']);
    }
}

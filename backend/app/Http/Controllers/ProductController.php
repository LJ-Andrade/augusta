<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Http\Resources\ProductResource;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class ProductController extends Controller
{
    public function publicIndex(Request $request)
    {
        $query = Product::with(['author', 'category', 'subcategory', 'tags'])->where('status', 'published');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where('name', 'like', "%{$search}%");
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->input('category_id'));
        }

        if ($request->filled('tag_id')) {
            $query->whereHas('tags', function ($q) use ($request) {
                $q->where('product_tags.id', $request->input('tag_id'));
            });
        }

        $sortBy = $request->input('sort_by', 'created_at');
        $sortDir = $request->input('sort_dir', 'desc');

        $allowedSortBy = ['id', 'name', 'created_at'];
        if (in_array($sortBy, $allowedSortBy)) {
            $query->orderBy($sortBy, $sortDir === 'asc' ? 'asc' : 'desc');
        }

        return ProductResource::collection($query->paginate(12));
    }

    public function publicShow($slug)
    {
        $product = Product::where('slug', $slug)->first();
        
        if (!$product || $product->status !== 'published') {
            return response()->json(['message' => 'Product not found'], 404);
        }

        return new ProductResource($product->load(['author', 'category', 'tags', 'media']));
    }

    public function index(Request $request)
    {
        $query = Product::with(['author', 'category', 'subcategory', 'tags']);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where('name', 'like', "%{$search}%");
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->input('category_id'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $sortBy = $request->input('sort_by', 'created_at');
        $sortDir = $request->input('sort_dir', 'desc');

        $allowedSortBy = ['id', 'name', 'created_at', 'order', 'featured'];
        if (in_array($sortBy, $allowedSortBy)) {
            $query->orderBy($sortBy, $sortDir === 'asc' ? 'asc' : 'desc');
        }

        return ProductResource::collection($query->paginate(10));
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:products,slug',
            'description' => 'nullable|string',
            'cost_price' => 'required|numeric|min:0',
            'sale_price' => 'required|numeric|min:0',
            'status' => 'required|in:draft,published,archived',
            'category_id' => 'nullable|exists:product_categories,id',
            'subcategory_id' => 'nullable|exists:product_categories,id',
            'tag_ids' => 'nullable|array',
            'tag_ids.*' => 'exists:product_tags,id',
            'size_ids' => 'nullable|array',
            'size_ids.*' => 'exists:product_sizes,id',
            'featured' => 'nullable|boolean',
            'order' => 'nullable|integer',
            'cover' => 'nullable|image|max:2048',
            'gallery.*' => 'nullable|image|max:2048',
            'document' => 'nullable|file|mimes:pdf,txt,doc,docx|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        $data['featured'] = $request->boolean('featured');
        $data['user_id'] = Auth::id() ?? 1;

        if (empty($data['slug'])) {
            $data['slug'] = Str::slug($data['name']);
            $originalSlug = $data['slug'];
            $count = 1;
            while (Product::where('slug', $data['slug'])->exists()) {
                $data['slug'] = $originalSlug . '-' . $count++;
            }
        }

        $product = Product::create($data);

        if ($request->has('tag_ids')) {
            $product->tags()->sync($request->input('tag_ids'));
        }

        if ($request->has('size_ids')) {
            $product->sizes()->sync($request->input('size_ids'));
        }

        if ($request->hasFile('cover')) {
            $product->addMediaFromRequest('cover')->toMediaCollection('cover');
        }

        if ($request->hasFile('gallery')) {
            foreach ($request->file('gallery') as $image) {
                if ($image && $image->isValid()) {
                    $product->addMedia($image)->toMediaCollection('gallery');
                }
            }
        }

        if ($request->hasFile('document')) {
            $product->addMediaFromRequest('document')->toMediaCollection('document');
        }

        return new ProductResource($product->load(['author', 'category', 'tags', 'sizes']));
    }

    public function show(Product $product)
    {
        return new ProductResource($product->load(['author', 'category', 'tags', 'sizes', 'media']));
    }

    public function regenerateQr(Product $product)
    {
        $product->qr_url = $product->generateQrUrl();
        $product->save();
        return new ProductResource($product->load(['author', 'category', 'tags', 'sizes', 'media']));
    }

    public function updateQrUrl(Request $request, Product $product)
    {
        $validated = $request->validate([
            'qr_url' => 'nullable|string|max:500',
        ]);
        
        $product->qr_url = $validated['qr_url'];
        $product->save();
        
        return new ProductResource($product->load(['author', 'category', 'tags', 'sizes', 'media']));
    }

    public function update(Request $request, Product $product)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:products,slug,' . $product->id,
            'description' => 'nullable|string',
            'cost_price' => 'required|numeric|min:0',
            'sale_price' => 'required|numeric|min:0',
            'status' => 'required|in:draft,published,archived',
            'category_id' => 'nullable|exists:product_categories,id',
            'subcategory_id' => 'nullable|exists:product_categories,id',
            'tag_ids' => 'nullable|array',
            'tag_ids.*' => 'exists:product_tags,id',
            'size_ids' => 'nullable|array',
            'size_ids.*' => 'exists:product_sizes,id',
            'featured' => 'nullable|boolean',
            'order' => 'nullable|integer',
            'cover' => 'nullable|image|max:2048',
            'gallery.*' => 'nullable|image|max:2048',
            'document' => 'nullable|file|mimes:pdf,txt,doc,docx|max:5120',
            'remove_gallery' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        $data['featured'] = $request->boolean('featured');

        if (empty($data['slug'])) {
            $data['slug'] = Str::slug($data['name']);
            $originalSlug = $data['slug'];
            $count = 1;
            while (Product::where('slug', $data['slug'])->where('id', '!=', $product->id)->exists()) {
                $data['slug'] = $originalSlug . '-' . $count++;
            }
        }

        $product->update($data);

        if ($request->has('tag_ids')) {
            $product->tags()->sync($request->input('tag_ids'));
        }

        if ($request->has('size_ids')) {
            $product->sizes()->sync($request->input('size_ids'));
        }

        if ($request->hasFile('cover')) {
            $product->addMediaFromRequest('cover')->toMediaCollection('cover');
        }

        if ($request->hasFile('gallery')) {
            foreach ($request->file('gallery') as $image) {
                $product->addMedia($image)->toMediaCollection('gallery');
            }
        }

        if ($request->has('remove_gallery')) {
            $mediaToRemove = $product->getMedia('gallery')
                ->whereIn('id', $request->input('remove_gallery'));
            foreach ($mediaToRemove as $media) {
                $media->delete();
            }
        }

        if ($request->hasFile('document')) {
            $product->addMediaFromRequest('document')->toMediaCollection('document');
        }

        return new ProductResource($product->load(['author', 'category', 'tags', 'sizes']));
    }

    public function quickUpdate(Request $request, Product $product)
    {
        $validator = Validator::make($request->all(), [
            'featured' => 'nullable|boolean',
            'status' => 'nullable|in:draft,published,archived',
            'order' => 'nullable|integer',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();

        if (isset($data['featured'])) {
            $product->featured = $data['featured'];
        }

        if (isset($data['status'])) {
            $product->status = $data['status'];
        }

        if (isset($data['order'])) {
            $product->order = $data['order'];
        }

        $product->save();

        return new ProductResource($product->load(['author', 'category', 'tags', 'sizes']));
    }

    public function deleteGalleryImage(Product $product, $mediaId)
    {
        $media = $product->getMedia('gallery')->firstWhere('id', $mediaId);

        if (!$media) {
            return response()->json(['message' => 'Image not found'], 404);
        }

        $media->delete();

        return response()->json(['message' => 'Image deleted successfully']);
    }

    public function destroy(Product $product)
    {
        $product->delete();

        return response()->noContent();
    }

    public function bulkDelete(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:products,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $ids = $request->input('ids');
        Product::whereIn('id', $ids)->delete();

        return response()->noContent();
    }
}

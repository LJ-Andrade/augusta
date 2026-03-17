<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'code' => $this->code,
            'slug' => $this->slug,
            'description' => $this->description,
            'cost_price' => $this->cost_price,
            'sale_price' => $this->sale_price,
            'status' => $this->status,
            'featured' => $this->featured,
            'order' => $this->order,
            'qr_url' => $this->qr_url,
            'category_id' => $this->category_id,
            'wholesale_price' => $this->wholesale_price,
            'discount' => $this->discount,
            'author' => new UserResource($this->whenLoaded('author')),
            'category' => new ProductCategoryResource($this->whenLoaded('category')),
            'tags' => ProductTagResource::collection($this->whenLoaded('tags')),
            'sizes' => ProductSizeResource::collection($this->whenLoaded('sizes')),
            'colors' => ProductColorResource::collection($this->whenLoaded('colors')),
            'variants' => ProductVariantResource::collection($this->whenLoaded('variants')),
            'cover_url' => $this->getFirstMediaUrl('cover'),
            'gallery' => $this->loadMedia('gallery')
                ->sortBy('order_column')
                ->values()
                ->map(function ($media) {
                    return [
                        'id' => $media->id,
                        'url' => $media->getUrl(),
                        'order' => $media->order_column,
                    ];
                }),
            'document_url' => $this->getFirstMediaUrl('document'),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}

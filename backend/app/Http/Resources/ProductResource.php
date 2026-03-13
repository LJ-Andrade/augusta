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
            'slug' => $this->slug,
            'description' => $this->description,
            'cost_price' => $this->cost_price,
            'sale_price' => $this->sale_price,
            'status' => $this->status,
            'featured' => $this->featured,
            'order' => $this->order,
            'qr_url' => $this->qr_url,
            'category_id' => $this->category_id,
            'subcategory_id' => $this->subcategory_id,
            'author' => new UserResource($this->whenLoaded('author')),
            'category' => new ProductCategoryResource($this->whenLoaded('category')),
            'subcategory' => new ProductCategoryResource($this->whenLoaded('subcategory')),
            'tags' => ProductTagResource::collection($this->whenLoaded('tags')),
            'cover_url' => $this->getFirstMediaUrl('cover'),
            'gallery' => $this->getMedia('gallery')->map(function ($media) {
                return [
                    'id' => $media->id,
                    'url' => $media->getUrl(),
                ];
            }),
            'document_url' => $this->getFirstMediaUrl('document'),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}

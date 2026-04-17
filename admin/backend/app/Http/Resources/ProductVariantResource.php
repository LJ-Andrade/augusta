<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductVariantResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'product_id' => $this->product_id,
            'product_color_id' => $this->product_color_id,
            'product_size_id' => $this->product_size_id,
            'sku' => $this->sku,
            'stock' => $this->stock,
            'active' => $this->active,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'color' => new ProductColorResource($this->whenLoaded('color')),
            'size' => new ProductSizeResource($this->whenLoaded('size')),
        ];
    }
}

<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ImageSettingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'section' => $this->section,
            'name' => $this->name,
            'max_size_kb' => $this->max_size_kb,
            'allowed_extensions' => $this->allowed_extensions,
            'min_width' => $this->min_width,
            'min_height' => $this->min_height,
            'max_width' => $this->max_width,
            'max_height' => $this->max_height,
            'aspect_ratio' => $this->aspect_ratio,
            'active' => $this->active,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}

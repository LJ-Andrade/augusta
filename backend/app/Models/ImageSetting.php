<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ImageSetting extends Model
{
    protected $fillable = [
        'section',
        'name',
        'max_size_kb',
        'allowed_extensions',
        'min_width',
        'min_height',
        'max_width',
        'max_height',
        'aspect_ratio',
        'active',
    ];

    protected $casts = [
        'max_size_kb' => 'integer',
        'min_width' => 'integer',
        'min_height' => 'integer',
        'max_width' => 'integer',
        'max_height' => 'integer',
        'active' => 'boolean',
    ];

    public static function getBySection(string $section): ?self
    {
        return static::where('section', $section)
            ->where('active', true)
            ->first();
    }

    public static function getBySections(array $sections): \Illuminate\Database\Eloquent\Collection
    {
        return static::whereIn('section', $sections)
            ->where('active', true)
            ->get()
            ->keyBy('section');
    }

    public function getExtensionsArray(): array
    {
        return array_map('trim', explode(',', $this->allowed_extensions));
    }

    public function getMimeTypes(): array
    {
        $map = [
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'png' => 'image/png',
            'webp' => 'image/webp',
            'gif' => 'image/gif',
            'svg' => 'image/svg+xml',
        ];

        $extensions = $this->getExtensionsArray();
        $mimes = [];
        foreach ($extensions as $ext) {
            if (isset($map[$ext])) {
                $mimes[] = $map[$ext];
            }
        }

        return $mimes;
    }

    public function getValidationRules(): array
    {
        $extensions = $this->getExtensionsArray();
        $mimes = $this->getMimeTypes();

        $rules = [
            'max:' . $this->max_size_kb,
            'mimes:' . implode(',', $extensions),
        ];

        return $rules;
    }
}

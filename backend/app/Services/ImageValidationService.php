<?php

namespace App\Services;

use App\Models\ImageSetting;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Validator;

class ImageValidationService
{
    public function getConfig(string $section): ?ImageSetting
    {
        return ImageSetting::getBySection($section);
    }

    public function getConfigs(array $sections): \Illuminate\Database\Eloquent\Collection
    {
        return ImageSetting::getBySections($sections);
    }

    public function buildValidationRules(string $section, string $field = 'image'): array
    {
        $config = $this->getConfig($section);

        if (!$config) {
            return $this->getDefaultRules();
        }

        $rules = [];

        $extensions = $config->getExtensionsArray();
        $rules[] = 'mimes:' . implode(',', $extensions);

        $rules[] = 'max:' . $config->max_size_kb;

        return $rules;
    }

    public function getDefaultRules(): array
    {
        return [
            'mimes:jpg,jpeg,png,webp',
            'max:2048',
        ];
    }

    public function validateDimensions(UploadedFile $file, ?ImageSetting $config = null): array
    {
        $result = ['valid' => true, 'errors' => []];

        if (!$config) {
            return $result;
        }

        $imagePath = $file->getRealPath();
        
        if (!file_exists($imagePath)) {
            $result['valid'] = false;
            $result['errors'][] = 'No se pudo leer la imagen';
            return $result;
        }

        $imageInfo = getimagesize($imagePath);
        
        if (!$imageInfo) {
            $result['valid'] = false;
            $result['errors'][] = 'Archivo de imagen inválido';
            return $result;
        }

        $width = $imageInfo[0];
        $height = $imageInfo[1];

        if ($config->min_width && $width < $config->min_width) {
            $result['valid'] = false;
            $result['errors'][] = "El ancho mínimo es {$config->min_width}px (actual: {$width}px)";
        }

        if ($config->max_width && $width > $config->max_width) {
            $result['valid'] = false;
            $result['errors'][] = "El ancho máximo es {$config->max_width}px (actual: {$width}px)";
        }

        if ($config->min_height && $height < $config->min_height) {
            $result['valid'] = false;
            $result['errors'][] = "El alto mínimo es {$config->min_height}px (actual: {$height}px)";
        }

        if ($config->max_height && $height > $config->max_height) {
            $result['valid'] = false;
            $result['errors'][] = "El alto máximo es {$config->max_height}px (actual: {$height}px)";
        }

        if ($config->aspect_ratio) {
            $expectedRatio = $this->parseAspectRatio($config->aspect_ratio);
            if ($expectedRatio) {
                $actualRatio = $width / $height;
                $tolerance = 0.02;

                if (abs($actualRatio - $expectedRatio) > $tolerance) {
                    $result['valid'] = false;
                    $result['errors'][] = "El aspect ratio debe ser {$config->aspect_ratio} (actual: " . round($actualRatio, 2) . ")";
                }
            }
        }

        return $result;
    }

    public function parseAspectRatio(string $ratio): ?float
    {
        if (strpos($ratio, ':') !== false) {
            $parts = explode(':', $ratio);
            if (count($parts) === 2 && is_numeric($parts[0]) && is_numeric($parts[1])) {
                return (float) $parts[0] / (float) $parts[1];
            }
        }
        
        if (is_numeric($ratio)) {
            return (float) $ratio;
        }

        return null;
    }

    public function validateWithConfig(UploadedFile $file, string $section): array
    {
        $config = $this->getConfig($section);
        
        $rules = $this->buildValidationRules($section);
        
        $validator = Validator::make(
            ['image' => $file],
            ['image' => $rules]
        );

        if ($validator->fails()) {
            return [
                'valid' => false,
                'errors' => $validator->errors()->get('image'),
            ];
        }

        if ($config && ($config->min_width || $config->max_width || $config->min_height || $config->max_height || $config->aspect_ratio)) {
            return $this->validateDimensions($file, $config);
        }

        return ['valid' => true, 'errors' => []];
    }

    public function toArray(ImageSetting $config): array
    {
        return [
            'id' => $config->id,
            'section' => $config->section,
            'name' => $config->name,
            'max_size_kb' => $config->max_size_kb,
            'allowed_extensions' => $config->allowed_extensions,
            'min_width' => $config->min_width,
            'min_height' => $config->min_height,
            'max_width' => $config->max_width,
            'max_height' => $config->max_height,
            'aspect_ratio' => $config->aspect_ratio,
            'active' => $config->active,
        ];
    }
}

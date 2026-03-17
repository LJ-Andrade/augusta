<?php

namespace App\MediaLibrary;

use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Spatie\MediaLibrary\Support\PathGenerator\PathGenerator;

class ProductPathGenerator implements PathGenerator
{
    /**
     * Get the base path for the given media.
     */
    public function getPath(Media $media): string
    {
        return $this->getBasePath($media) . '/';
    }

    /**
     * Get the path for conversions of the given media.
     */
    public function getPathForConversions(Media $media): string
    {
        return $this->getBasePath($media) . '/conversions/';
    }

    /**
     * Get the path for responsive images of the given media.
     */
    public function getPathForResponsiveImages(Media $media): string
    {
        return $this->getBasePath($media) . '/responsive-images/';
    }

    /**
     * Get the base path based on model type and collection.
     */
    protected function getBasePath(Media $media): string
    {
        $model = $media->model;
        $modelType = class_basename($model);
        $modelId = $model->getKey();
        
        // Organize by model type and ID
        $path = strtolower($modelType) . 's/' . $modelId;
        
        // If it's a gallery collection, put it in a subdirectory
        if ($media->collection_name === 'gallery') {
            $path .= '/gallery';
        }
        
        return $path;
    }
}

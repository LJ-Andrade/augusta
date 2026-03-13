<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class ProductTag extends Model
{
    protected $fillable = ['name', 'slug'];

    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'product_product_tag', 'product_tag_id', 'product_id');
    }

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($tag) {
            if (empty($tag->slug) && !empty($tag->name)) {
                $tag->slug = \Illuminate\Support\Str::slug($tag->name);
            }
        });
        static::saving(function ($tag) {
            if ($tag->slug) {
                $tag->slug = \Illuminate\Support\Str::slug($tag->slug);
            }
        });
    }
}

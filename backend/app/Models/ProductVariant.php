<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductVariant extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'product_color_id',
        'product_size_id',
        'sku',
        'stock',
        'price',
        'wholesale_price',
        'discount',
        'active',
    ];

    protected $casts = [
        'stock' => 'integer',
        'price' => 'decimal:2',
        'wholesale_price' => 'decimal:2',
        'discount' => 'decimal:2',
        'active' => 'boolean',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function color(): BelongsTo
    {
        return $this->belongsTo(ProductColor::class, 'product_color_id');
    }

    public function size(): BelongsTo
    {
        return $this->belongsTo(ProductSize::class, 'product_size_id');
    }
}

<?php

namespace Database\Factories;

use App\Models\ProductVariant;
use App\Models\Product;
use App\Models\ProductColor;
use App\Models\ProductSize;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ProductVariantFactory extends Factory
{
    protected $model = ProductVariant::class;

    public function definition(): array
    {
        return [
            'product_id' => Product::factory(),
            'product_color_id' => ProductColor::inRandomOrder()->first()->id ?? 1,
            'product_size_id' => ProductSize::inRandomOrder()->first()->id ?? 1,
            'sku' => 'SKU-' . strtoupper(Str::random(8)),
            'stock' => $this->faker->numberBetween(5, 30),
            'min_stock' => $this->faker->numberBetween(2, 10),
            'active' => true,
        ];
    }

    public function forProduct(Product $product): static
    {
        return $this->state(fn (array $attributes) => [
            'product_id' => $product->id,
        ]);
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'active' => false,
        ]);
    }
}

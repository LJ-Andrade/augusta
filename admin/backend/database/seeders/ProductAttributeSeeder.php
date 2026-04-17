<?php

namespace Database\Seeders;

use App\Models\ProductColor;
use App\Models\ProductSize;
use App\Models\ProductCategory;
use App\Models\ProductTag;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProductAttributeSeeder extends Seeder
{
    public function run(): void
    {
        // Sizes
        $sizes = ['S', 'SM', 'M', 'L', 'XL', 'XXL'];
        foreach ($sizes as $size) {
            ProductSize::firstOrCreate(['name' => $size]);
        }

        // Colors
        $colors = [
            ['name' => 'Negro', 'hex_color' => '#000000'],
            ['name' => 'Blanco', 'hex_color' => '#FFFFFF'],
            ['name' => 'Rojo', 'hex_color' => '#FF0000'],
            ['name' => 'Azul', 'hex_color' => '#0000FF'],
            ['name' => 'Verde', 'hex_color' => '#00FF00'],
            ['name' => 'Gris', 'hex_color' => '#808080'],
            ['name' => 'Beige', 'hex_color' => '#F5F5DC'],
        ];

        foreach ($colors as $color) {
            ProductColor::firstOrCreate(
                ['name' => $color['name']],
                ['hex_color' => $color['hex_color']]
            );
        }

        // Product Categories
        $categories = ['Camisas', 'Pantalones', 'Accesorios', 'Calzado'];
        foreach ($categories as $category) {
            DB::table('product_categories')->updateOrInsert(
                ['slug' => Str::slug($category)],
                ['name' => $category, 'created_at' => now(), 'updated_at' => now()]
            );
        }

        // Product Tags
        $tags = ['Importado', 'Nacional', 'Oferta', 'Nueva Colección'];
        foreach ($tags as $tag) {
            DB::table('product_tags')->updateOrInsert(
                ['slug' => Str::slug($tag)],
                ['name' => $tag, 'created_at' => now(), 'updated_at' => now()]
            );
        }
    }
}

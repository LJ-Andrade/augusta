<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_product_color', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_color_id')->constrained('product_colors')->onDelete('cascade');
            $table->timestamps();

            $table->unique(['product_id', 'product_color_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_product_color');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('category_id')->nullable();
            $table->string('code', 100)->unique();
            $table->string('name', 255);
            $table->string('slug', 255)->unique();
            $table->text('description')->nullable();
            $table->string('fabric')->nullable();
            
            // Core Pricing (for UI fallback, real ranges come from Variants)
            $table->decimal('reseller_price', 10, 2)->default(0);
            $table->decimal('price', 10, 2)->default(0);
            $table->decimal('cost', 10, 2)->nullable();
            $table->decimal('discount', 10, 2)->default(0);
            $table->decimal('offer_price', 10, 2)->nullable();

            // Images and Config
            $table->string('thumb')->nullable();
            $table->json('gallery')->nullable();
            $table->boolean('featured')->default(false);
            $table->integer('order')->default(0);
            
            // Status and SEO
            $table->boolean('active')->default(true);
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();

            $table->unsignedBigInteger('user_id');
            $table->text('qr_url')->nullable();
            $table->timestamps();

            // Relations
            $table->foreign('category_id')->references('id')->on('product_categories')->onDelete('set null');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};

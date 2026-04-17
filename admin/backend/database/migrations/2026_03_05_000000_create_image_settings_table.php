<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('image_settings', function (Blueprint $table) {
            $table->id();
            $table->string('section')->unique();
            $table->string('name');
            $table->integer('max_size_kb')->default(2048);
            $table->string('allowed_extensions')->default('jpg,jpeg,png,webp');
            $table->integer('min_width')->nullable();
            $table->integer('min_height')->nullable();
            $table->integer('max_width')->nullable();
            $table->integer('max_height')->nullable();
            $table->string('aspect_ratio')->nullable();
            $table->boolean('active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('image_settings');
    }
};

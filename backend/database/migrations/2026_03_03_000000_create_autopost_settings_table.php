<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('autopost_settings', function (Blueprint $table) {
            $table->id();
            $table->text('gemini_api_key')->nullable();
            $table->text('pre_prompt')->nullable();
            $table->string('model')->default('gemini-2.0-flash');
            $table->foreignId('author_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('autopost_settings');
    }
};

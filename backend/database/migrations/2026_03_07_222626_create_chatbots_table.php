<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('chatbots', function (Blueprint $table) {
            $table->id();
            $table->uuid('widget_token')->unique()->nullable();
            $table->foreignId('customer_id')->nullable()->constrained()->onDelete('set null');
            $table->string('name');
            $table->string('description')->nullable();
            $table->text('system_prompt')->nullable();
            $table->text('welcome_message')->nullable();
            $table->string('cta_text')->nullable();
            $table->string('provider')->default('groq');
            $table->string('model');
            $table->float('temperature')->default(0.7);
            $table->string('tone')->default('Professional');
            $table->json('suggested_questions')->nullable();
            $table->integer('max_tokens')->default(1000);
            $table->integer('token_limit_per_session')->nullable();
            $table->text('limit_reached_message')->nullable();
            $table->string('consent_notice', 500)->nullable()
                ->default('Para brindarte un mejor servicio, las interacciones con este asistente virtual pueden ser registradas. Al continuar, aceptas nuestra Política de Privacidad.');
            $table->text('privacy_policy')->nullable();
            $table->string('primary_color')->nullable();
            $table->string('secondary_color')->nullable();
            $table->text('authorized_domains')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('chatbots');
    }
};

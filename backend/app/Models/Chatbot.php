<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

use Illuminate\Support\Str;

class Chatbot extends Model implements HasMedia
{
    use HasFactory, InteractsWithMedia;

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->widget_token)) {
                $model->widget_token = (string) Str::uuid();
            }
        });
    }

    protected $fillable = [
        'customer_id',
        'widget_token',
        'name',
        'description',
        'system_prompt',
        'welcome_message',
        'cta_text',
        'provider',
        'model',
        'temperature',
        'tone',
        'suggested_questions',
        'max_tokens',
        'token_limit_per_session',
        'limit_reached_message',
        'is_active',
        'consent_notice',
        'privacy_policy',
        'primary_color',
        'secondary_color',
        'authorized_domains',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'temperature' => 'float',
        'suggested_questions' => 'json',
        'max_tokens' => 'integer',
        'token_limit_per_session' => 'integer',
        'authorized_domains' => 'array',
    ];

    public function sessions(): HasMany
    {
        return $this->hasMany(ChatSession::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function knowledge(): HasMany
    {
        return $this->hasMany(ChatbotKnowledge::class);
    }

    /**
     * Register media collections.
     */
    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('avatar')
            ->singleFile();
    }
}

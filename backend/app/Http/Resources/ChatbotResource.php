<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\Admin\CustomerResource;

class ChatbotResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'widget_token' => $this->widget_token,
            'customer_id' => $this->customer_id,
            'customer' => new CustomerResource($this->whenLoaded('customer')),
            'name' => $this->name,
            'description' => $this->description,
            'system_prompt' => $this->system_prompt,
            'welcome_message' => $this->welcome_message,
            'cta_text' => $this->cta_text,
            'provider' => $this->provider,
            'model' => $this->model,
            'temperature' => $this->temperature,
            'tone' => $this->tone,
            'suggested_questions' => $this->suggested_questions,
            'max_tokens' => $this->max_tokens,
            'token_limit_per_session' => $this->token_limit_per_session,
            'limit_reached_message' => $this->limit_reached_message,
            'is_active' => $this->is_active,
            'consent_notice' => $this->consent_notice,
            'privacy_policy' => $this->privacy_policy,
            'primary_color' => $this->primary_color,
            'secondary_color' => $this->secondary_color,
            'authorized_domains' => $this->authorized_domains,
            'avatar_url' => $this->getFirstMediaUrl('avatar') ?: null,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}

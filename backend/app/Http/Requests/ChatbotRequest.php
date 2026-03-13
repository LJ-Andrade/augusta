<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ChatbotRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'customer_id' => ['nullable', 'exists:customers,id'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:255'],
            'system_prompt' => ['nullable', 'string'],
            'welcome_message' => ['nullable', 'string'],
            'cta_text' => ['nullable', 'string', 'max:255'],
            'provider' => ['nullable', 'string', 'max:50'],
            'model' => ['required', 'string', 'max:100'],
            'temperature' => ['nullable', 'numeric', 'min:0', 'max:1'],
            'tone' => ['nullable', 'string', 'max:50'],
            'suggested_questions' => ['nullable', 'array'],
            'max_tokens' => ['nullable', 'integer', 'min:1'],
            'token_limit_per_session' => ['nullable', 'integer', 'min:0'],
            'limit_reached_message' => ['nullable', 'string'],
            'is_active' => ['sometimes', 'boolean'],
            'avatar_base64' => ['nullable', 'string'],
            'consent_notice' => ['nullable', 'string'],
            'privacy_policy' => ['nullable', 'string'],
            'primary_color' => ['nullable', 'string', 'max:50'],
            'secondary_color' => ['nullable', 'string', 'max:50'],
            'authorized_domains' => ['nullable', 'array'],
        ];
    }
}

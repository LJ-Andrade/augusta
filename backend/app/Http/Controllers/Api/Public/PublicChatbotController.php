<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\Chatbot;
use App\Services\LLM\LLMProviderInterface;
use Illuminate\Http\Request;

class PublicChatbotController extends Controller
{
    public function config($token)
    {
        $chatbot = Chatbot::where('widget_token', $token)
            ->with(['media', 'customer'])
            ->firstOrFail();

        return response()->json([
            'data' => [
                'name' => $chatbot->name,
                'description' => $chatbot->description,
                'welcome_message' => $chatbot->welcome_message,
                'cta_text' => $chatbot->cta_text,
                'avatar_url' => $chatbot->getFirstMediaUrl('avatar'),
                'suggested_questions' => $chatbot->suggested_questions,
                'consent_notice' => $chatbot->consent_notice,
                'privacy_policy' => $chatbot->privacy_policy,
                'primary_color' => $chatbot->primary_color,
                'secondary_color' => $chatbot->secondary_color,
                'customer_name' => $chatbot->customer?->name,
                'customer_logo' => $chatbot->customer?->getFirstMediaUrl('logo'),
                'is_active' => $chatbot->is_active,
            ]
        ]);
    }

    public function chat(Request $request, $token, LLMProviderInterface $llmProvider)
    {
        $chatbot = Chatbot::where('widget_token', $token)->firstOrFail();

        if (!$chatbot->is_active) {
            return response()->json(['message' => 'Chatbot is inactive.'], 400);
        }

        $request->validate([
            'message' => 'required|string|max:5000',
            'session_uuid' => 'required|string',
            'history' => 'nullable|array',
        ]);

        try {
            $sessionUuid = $request->input('session_uuid');
            $session = $chatbot->sessions()->firstOrCreate(
                ['session_uuid' => $sessionUuid],
                ['ip_address' => $request->ip()]
            );

            // Update IP if it's missing (for existing sessions)
            if (!$session->ip_address) {
                $session->update(['ip_address' => $request->ip()]);
            }

            // Check limits
            if ($chatbot->token_limit_per_session > 0 && $session->total_tokens_used >= $chatbot->token_limit_per_session) {
                return response()->json([
                    'data' => [
                        'reply' => $chatbot->limit_reached_message ?? 'Has alcanzado el límite de tokens para esta sesión.',
                        'limit_reached' => true
                    ]
                ]);
            }

            $history = $request->input('history', []);
            $response = $llmProvider->sendMessage($chatbot, $session, $request->message, $history);

            return response()->json([
                'data' => [
                    'reply' => $response['reply'],
                    'usage' => $response['usage'],
                    'session_uuid' => $session->session_uuid
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    public function history(Request $request, $token)
    {
        $chatbot = Chatbot::where('widget_token', $token)->firstOrFail();

        $sessionUuid = $request->query('session_uuid');
        if (!$sessionUuid) {
            return response()->json(['data' => []]);
        }

        $session = $chatbot->sessions()->where('session_uuid', $sessionUuid)->first();

        if (!$session) {
            return response()->json(['data' => []]);
        }

        $messages = $session->messages()
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(function ($msg) {
                return [
                    'role' => $msg->role,
                    'content' => $msg->content,
                    'created_at' => $msg->created_at->toIso8601String(),
                ];
            });

        return response()->json(['data' => $messages]);
    }
}

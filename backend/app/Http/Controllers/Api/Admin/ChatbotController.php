<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\ChatbotRequest;
use App\Http\Resources\ChatbotResource;
use App\Models\Chatbot;
use App\Services\LLM\LLMProviderInterface;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ChatbotController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Chatbot::query()->with('customer');

        // Search filter
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('description', 'like', "%{$request->search}%");
            });
        }

        // Customer filter
        if ($request->filled('customer_id')) {
            $query->where('customer_id', $request->customer_id);
        }

        // Active status filter
        if ($request->filled('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        // Sorting
        $sortBy = $request->sort_by ?? 'id';
        $sortDir = $request->sort_dir ?? 'desc';
        $allowedSorts = ['id', 'name', 'is_active', 'created_at'];
        
        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortDir === 'asc' ? 'asc' : 'desc');
        }

        $perPage = min($request->per_page ?? 10, 100);
        $chatbots = $query->paginate($perPage);

        return ChatbotResource::collection($chatbots);
    }

    public function store(ChatbotRequest $request): ChatbotResource
    {
        $chatbot = Chatbot::create($request->validated());

        if ($request->avatar_base64) {
            $chatbot->addMediaFromBase64($request->avatar_base64)
                ->usingFileName('avatar.webp')
                ->toMediaCollection('avatar');
        }

        return new ChatbotResource($chatbot);
    }

    public function show(Chatbot $chatbot): ChatbotResource
    {
        return new ChatbotResource($chatbot->load(['media', 'customer']));
    }

    public function update(ChatbotRequest $request, Chatbot $chatbot): ChatbotResource
    {
        $chatbot->update($request->validated());

        if ($request->avatar_base64) {
            $chatbot->addMediaFromBase64($request->avatar_base64)
                ->usingFileName('avatar.webp')
                ->toMediaCollection('avatar');
        }

        return new ChatbotResource($chatbot->load('media'));
    }

    public function destroy(Chatbot $chatbot)
    {
        $chatbot->delete();

        return response()->noContent();
    }

    public function test(Request $request, Chatbot $chatbot, LLMProviderInterface $llmProvider)
    {
        $request->validate([
            'message' => 'required|string|max:5000',
        ]);

        if (!$chatbot->is_active) {
            return response()->json(['message' => 'Chatbot is inactive.'], 400);
        }

        try {
            $history = $request->input('history', []);
            $sessionUuid = $request->input('session_uuid');
            
            $session = null;
            if ($sessionUuid) {
                $session = $chatbot->sessions()->firstOrCreate([
                    'session_uuid' => $sessionUuid,
                ]);
            }

            // Check limit simulation for test window
            $currentUsage = $session ? $session->total_tokens_used : (int) $request->input('total_usage', 0);
            
            if ($chatbot->token_limit_per_session > 0 && $currentUsage >= $chatbot->token_limit_per_session) {
                return response()->json([
                    'data' => [
                        'reply' => $chatbot->limit_reached_message ?? 'Has alcanzado el límite de tokens para esta sesión.',
                        'usage' => 0,
                        'limit_reached' => true
                    ]
                ]);
            }
            
            // Pasamos history para que tenga "memoria" sin persistir en DB si no hay session
            // Si hay session, el provider sacará el history de la DB
            $response = $llmProvider->sendMessage($chatbot, $session, $request->message, $history);

            return response()->json([
                'data' => [
                    'reply' => $response['reply'],
                    'usage' => $response['usage'],
                    'session_uuid' => $session?->session_uuid
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error del proveedor LLM: ' . $e->getMessage()
            ], 500);
        }
    }

    public function bulkDelete(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:chatbots,id'
        ]);

        Chatbot::whereIn('id', $request->ids)->delete();

        return response()->noContent();
    }
}

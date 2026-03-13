<?php

namespace App\Services\LLM;

use App\Models\Chatbot;
use App\Models\ChatSession;
use App\Models\ChatMessage;
use Illuminate\Support\Facades\Http;
use Exception;

class GroqService implements LLMProviderInterface
{
    protected string $apiKey;
    protected string $baseUrl = 'https://api.groq.com/openai/v1/chat/completions';
    protected EmbeddingService $embeddingService;

    public function __construct(EmbeddingService $embeddingService)
    {
        $this->apiKey = config('services.groq.key', env('GROQ_API_KEY', ''));
        $this->embeddingService = $embeddingService;
    }

    public function sendMessage(Chatbot $chatbot, ?ChatSession $session, string $message, array $history = []): array
    {
        // 1. Check Limits (if session exists)
        if ($session && $chatbot->token_limit_per_session > 0) {
            if ($session->total_tokens_used >= $chatbot->token_limit_per_session) {
                return [
                    'reply' => $chatbot->limit_reached_message ?? "Has excedido el límite de tokens para esta sesión.",
                    'usage' => 0
                ];
            }
        }

        // Fetch previous messages for context
        $mergedHistory = !empty($history) ? $history : ($session ? $session->messages()->orderBy('created_at', 'asc')->get()->toArray() : []);

        $messages = [];
        
        // --- RAG: Knowledge Retrieval ---
        $contextText = "";
        $knowledgeBase = $chatbot->knowledge; // Using the relationship

        if ($knowledgeBase->count() > 0) {
            $queryEmbedding = $this->embeddingService->getEmbedding($message);
            
            if ($queryEmbedding) {
                $similarities = [];
                foreach ($knowledgeBase as $item) {
                    $similarities[] = [
                        'content' => $item->content,
                        'score' => $this->cosineSimilarity($queryEmbedding, $item->embedding)
                    ];
                }

                // Sort by score and take top 3
                usort($similarities, fn($a, $b) => $b['score'] <=> $a['score']);
                $topChunks = array_slice($similarities, 0, 3);
                
                // Only take relevant enough chunks (e.g. score > 0.5)
                $relevantChunks = array_filter($topChunks, fn($item) => $item['score'] > 0.4);
                
                if (!empty($relevantChunks)) {
                    $contextText = "\n\nINFORMACIÓN DE CONTEXTO RELEVANTE:\n" . 
                        implode("\n---\n", array_column($relevantChunks, 'content')) . 
                        "\n\nInstrucción: Utiliza la información de contexto anterior para responder la pregunta del usuario de forma precisa. Si la información no es suficiente, responde basándote en tu conocimiento general pero menciona que no encontraste detalles específicos en los documentos.";
                }
            }
        }

        // --- Identity Integration ---
        $identity = "Tu nombre es '{$chatbot->name}'.";
        if ($chatbot->description) {
            $identity .= " Tu cargo o rol es: {$chatbot->description}.";
        }
        $identity .= " Tu tono de voz debe ser: {$chatbot->tone}.";

        // Add system prompt if exists
        $systemContent = $identity . "\n\n" . ($chatbot->system_prompt ?? "Eres un asistente útil.");
        if (!empty($contextText)) {
            $systemContent .= $contextText;
        }

        $messages[] = [
            'role' => 'system',
            'content' => $systemContent,
        ];

        // Add history
        foreach ($mergedHistory as $msg) {
            $messages[] = [
                'role' => $msg['role'] ?? 'user',
                'content' => $msg['content'] ?? '',
            ];
        }

        // Add new user message
        $messages[] = [
            'role' => 'user',
            'content' => $message,
        ];

        // Save user message if session exists
        if ($session) {
            $session->messages()->create([
                'role' => 'user',
                'content' => $message,
            ]);
        }

        // Send request with chatbot specific settings
        $response = Http::withToken($this->apiKey)
            ->post($this->baseUrl, [
                'model' => $chatbot->model,
                'messages' => $messages,
                'temperature' => (float) (($chatbot->temperature > 0) ? $chatbot->temperature : 0.7),
                'max_tokens' => (int) (($chatbot->max_tokens > 0) ? $chatbot->max_tokens : 1000),
            ]);

        if ($response->failed()) {
            throw new Exception("Groq API error: " . $response->body());
        }

        $data = $response->json();
        $reply = $data['choices'][0]['message']['content'] ?? '';
        
        // --- Token Tracking & Message Persistence ---
        $usage = $data['usage']['total_tokens'] ?? 0;
        if ($session) {
            if ($usage > 0) {
                $session->increment('total_tokens_used', $usage);
            }
            
            // Save assistant response
            if ($reply) {
                $session->messages()->create([
                    'role' => 'assistant',
                    'content' => $reply,
                ]);
            }
        }

        return [
            'reply' => $reply,
            'usage' => $usage
        ];
    }

    /**
     * Calculate Cosine Similarity between two vectors
     */
    private function cosineSimilarity(array $vec1, array $vec2): float
    {
        $dotProduct = 0;
        $normA = 0;
        $normB = 0;

        foreach ($vec1 as $i => $val) {
            if (!isset($vec2[$i])) continue;
            $dotProduct += $val * $vec2[$i];
            $normA += $val ** 2;
            $normB += $vec2[$i] ** 2;
        }

        $normA = sqrt($normA);
        $normB = sqrt($normB);

        if ($normA == 0 || $normB == 0) {
            return 0;
        }

        return $dotProduct / ($normA * $normB);
    }
}

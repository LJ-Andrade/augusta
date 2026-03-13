<?php

namespace App\Services\LLM;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class EmbeddingService
{
    protected string $apiKey;
    // model: models/embedding-001 or models/text-embedding-04
    protected string $model = 'models/gemini-embedding-001';
    protected string $apiUrl = 'https://generativelanguage.googleapis.com/v1beta/';

    public function __construct()
    {
        $this->apiKey = env('GEMINI_API_KEY', '');
    }

    /**
     * Generate embedding for a given text using Google Gemini
     *
     * @param string $text
     * @return array|null
     */
    public function getEmbedding(string $text): ?array
    {
        if (empty($this->apiKey)) {
            Log::error('Gemini API key is not configured for embeddings.');
            return null;
        }

        try {
            $url = $this->apiUrl . $this->model . ':embedContent?key=' . $this->apiKey;
            
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
            ])
            ->timeout(30)
            ->post($url, [
                'content' => [
                    'parts' => [
                        [
                            'text' => $text
                        ]
                    ]
                ]
            ]);

            if ($response->successful()) {
                $data = $response->json();
                return $data['embedding']['values'] ?? null;
            }

            $errorBody = $response->body();
            Log::error('Gemini Embedding API error (Status ' . $response->status() . '): ' . $errorBody);
            throw new \Exception("Gemini API Error (" . $response->status() . "): " . $errorBody);

        } catch (\Exception $e) {
            Log::error('Gemini Embedding generation failed: ' . $e->getMessage());
            throw $e;
        }
    }
}

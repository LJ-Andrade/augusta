<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Chatbot;
use App\Models\ChatbotKnowledge;
use App\Services\LLM\EmbeddingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Exception;

class KnowledgeController extends Controller
{
    protected EmbeddingService $embeddingService;

    public function __construct(EmbeddingService $embeddingService)
    {
        $this->embeddingService = $embeddingService;
    }

    public function index(Chatbot $chatbot)
    {
        return response()->json([
            'data' => $chatbot->knowledge()->orderBy('created_at', 'desc')->get()
        ]);
    }

    public function store(Request $request, Chatbot $chatbot)
    {
        $request->validate([
            'content' => 'required|string',
            'title' => 'nullable|string',
        ]);

        $content = $request->input('content');
        
        // --- Chunking Strategy ---
        // Basic: Split by ~1000 characters with 200 overlap
        $chunkSize = 1000;
        $overlap = 200;
        $chunks = [];
        
        $start = 0;
        $textLength = strlen($content);
        
        while ($start < $textLength) {
            $end = min($start + $chunkSize, $textLength);
            $chunks[] = substr($content, $start, $end - $start);
            if ($end >= $textLength) break;
            $start += ($chunkSize - $overlap);
        }

        $createdCount = 0;
        
        try {
            DB::beginTransaction();
            
            foreach ($chunks as $chunk) {
                $embedding = $this->embeddingService->getEmbedding($chunk);
                
                if (!$embedding) {
                    throw new Exception("Error al generar embedding para uno de los fragmentos.");
                }

                $chatbot->knowledge()->create([
                    'content' => $chunk,
                    'embedding' => $embedding,
                    'metadata' => [
                        'title' => $request->input('title', 'Manual Input'),
                        'source' => 'web_admin'
                    ]
                ]);
                
                $createdCount++;
            }
            
            DB::commit();
            
            return response()->json([
                'message' => "Procesado correctamente. Se crearon $createdCount fragmentos de conocimiento.",
                'count' => $createdCount
            ], 201);

        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Knowledge Processing Error: ' . $e->getMessage());
            return response()->json([
                'message' => "Error durante el procesamiento: " . $e->getMessage(),
                'details' => $e->getPrevious() ? $e->getPrevious()->getMessage() : null
            ], 500);
        }
    }

    public function destroy(Chatbot $chatbot, ChatbotKnowledge $knowledge)
    {
        // Enforce ownership
        if ($knowledge->chatbot_id !== $chatbot->id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $knowledge->delete();
        
        return response()->json(['message' => 'Fragmento eliminado correctamente']);
    }
}

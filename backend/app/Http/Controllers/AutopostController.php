<?php

namespace App\Http\Controllers;

use App\Models\AutopostSettings;
use App\Models\Post;
use App\Models\Category;
use App\Models\Tag;
use App\Http\Resources\PostResource;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Validator;

class AutopostController extends Controller
{
    public function getSettings()
    {
        $settings = AutopostSettings::getSettings();
        
        return response()->json([
            'gemini_api_key' => $settings->gemini_api_key ? '••••••••' : null,
            'pre_prompt' => $settings->pre_prompt,
            'model' => $settings->model,
            'author_id' => $settings->author_id,
            'has_api_key' => !empty($settings->gemini_api_key),
        ]);
    }

    public function updateSettings(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'gemini_api_key' => 'nullable|string',
            'pre_prompt' => 'required|string|min:1000',
            'model' => 'nullable|string',
            'author_id' => 'nullable|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $settings = AutopostSettings::updateSettings($request->only(['gemini_api_key', 'pre_prompt', 'model', 'author_id']));

        return response()->json([
            'message' => 'Settings updated successfully',
            'gemini_api_key' => '••••••••',
            'pre_prompt' => $settings->pre_prompt,
            'model' => $settings->model,
            'author_id' => $settings->author_id,
            'has_api_key' => !empty($settings->gemini_api_key),
        ]);
    }

    public function generate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'topic' => 'required|string|min:3',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $settings = AutopostSettings::getSettings();

        if (empty($settings->gemini_api_key)) {
            return response()->json(['error' => 'API key not configured'], 400);
        }

        $topic = $request->input('topic');
        $prePrompt = $settings->pre_prompt ?? 'Eres un escritor profesional de blog.';
        $model = $settings->model ?? 'gemini-2.0-flash-lite';
        // Sanitizar: si el usuario puso "models/gemini-..." lo limpiamos
        $model = preg_replace('/^models\//i', '', $model);

        $prompt = "{$prePrompt}\n\nEscribe un artículo completo sobre el siguiente tema: {$topic}\n\nEl artículo debe tener:\n1. Un título atractivo\n2. Contenido estructurado en párrafos\n3. Una categoría apropiada\n4. Una lista de hasta 3 etiquetas (tags) clave\n\nResponde en formato JSON exacto con los siguientes campos: \"title\", \"content\" (HTML con p, h2, ul, etc), \"category\" (string con el nombre de la categoría) y \"tags\" (array de strings). Ejemplo:\n{\n  \"title\": \"Título\",\n  \"content\": \"<p>...</p>\",\n  \"category\": \"Tecnología\",\n  \"tags\": [\"IA\", \"Desarrollo Web\"]\n}";

        try {
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
            ])->post("https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$settings->gemini_api_key}", [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $prompt]
                        ]
                    ]
                ],
                'generationConfig' => [
                    'temperature' => 0.7,
                    'topP' => 0.95,
                    'topK' => 40,
                    'maxOutputTokens' => 8192,
                    'responseMimeType' => 'application/json',
                ],
            ]);

            if (!$response->successful()) {
                return response()->json([
                    'error' => 'Failed to generate content',
                    'details' => $response->json()
                ], $response->status());
            }

            $result = $response->json();
            
            if (!isset($result['candidates'][0]['content']['parts'][0]['text'])) {
                return response()->json(['error' => 'Invalid response from AI'], 500);
            }

            $text = $result['candidates'][0]['content']['parts'][0]['text'];
            // Eliminamos correctamente los bloques markdown ```json ... ``` si los hubiera
            $text = preg_replace('/^```(?:json)?\s*/i', '', trim($text));
            $text = preg_replace('/\s*```$/i', '', $text);
            $text = trim($text);

            $generated = json_decode($text, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                return response()->json([
                    'error' => 'Failed to parse AI response',
                    'raw' => $text
                ], 500);
            }

            return response()->json([
                'title' => $generated['title'] ?? 'Untitled',
                'content' => $generated['content'] ?? '',
                'category' => $generated['category'] ?? '',
                'tags' => $generated['tags'] ?? [],
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error generating content: ' . $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|min:3',
            'content' => 'required|string|min:10',
            'category_name' => 'nullable|string',
            'tags' => 'nullable|array',
            'tags.*' => 'string',
            'status' => 'in:draft,published,archived',
            'featured' => 'boolean',
            'order' => 'integer',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $request->all();

        // Generar slug único: si ya existe se le agrega un sufijo numérico
        $baseSlug = !empty($data['slug']) ? Str::slug($data['slug']) : Str::slug($data['title']);
        $slug = $baseSlug;
        $counter = 1;
        while (Post::where('slug', $slug)->exists()) {
            $slug = $baseSlug . '-' . $counter;
            $counter++;
        }
        $data['slug'] = $slug;

        $settings = AutopostSettings::getSettings();
        $data['user_id'] = $settings->author_id ?? auth()->id();

        // Manejar la categoría dinámicamente
        $categoryName = !empty($data['category_name']) ? trim($data['category_name']) : 'General';
        $category = Category::firstOrCreate(
            ['name' => $categoryName],
            ['slug' => Str::slug($categoryName)]
        );
        $data['category_id'] = $category->id;

        $post = Post::create($data);

        // Manejar las etiquetas (tags) dinámicamente
        if (!empty($data['tags']) && is_array($data['tags'])) {
            $tagIds = collect($data['tags'])->map(function ($tagName) {
                return Tag::firstOrCreate(
                    ['name' => $tagName],
                    ['slug' => Str::slug($tagName)]
                )->id;
            });
            $post->tags()->sync($tagIds);
        }

        return response()->json([
            'message' => 'Post created successfully',
            'data' => new PostResource($post->load(['author', 'category', 'tags']))
        ], 201);
    }
}

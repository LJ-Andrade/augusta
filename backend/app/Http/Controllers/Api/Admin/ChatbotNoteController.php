<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ChatbotNote;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ChatbotNoteController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json([
            'data' => ChatbotNote::orderBy('created_at', 'desc')->get()
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'content' => 'required|string',
        ]);

        $note = ChatbotNote::create($validated);

        return response()->json([
            'message' => 'Nota guardada correctamente',
            'data' => $note
        ], Response::HTTP_CREATED);
    }

    /**
     * Display the specified resource.
     */
    public function show(ChatbotNote $chatbotNote)
    {
        return response()->json([
            'data' => $chatbotNote
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $note = ChatbotNote::findOrFail($id);

        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'content' => 'required|string',
        ]);

        $note->update($validated);

        return response()->json([
            'message' => 'Nota actualizada correctamente',
            'data' => $note
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $note = ChatbotNote::findOrFail($id);
        $note->delete();

        return response()->json([
            'message' => 'Nota eliminada correctamente'
        ]);
    }
}

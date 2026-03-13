<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Chatbot;
use App\Models\ChatSession;
use Illuminate\Http\Request;

class ChatInteractionController extends Controller
{
    /**
     * List chat sessions for a specific chatbot.
     */
    public function index(Chatbot $chatbot)
    {
        $sessions = $chatbot->sessions()
            ->withCount('messages')
            ->orderBy('updated_at', 'desc')
            ->paginate(15);

        return response()->json($sessions);
    }

    /**
     * Show details of a specific chat session (all messages).
     */
    public function show(ChatSession $session)
    {
        $session->load(['messages' => function($query) {
            $query->orderBy('created_at', 'asc');
        }]);

        return response()->json($session);
    }

    /**
     * Delete a chat session.
     */
    public function destroy(ChatSession $session)
    {
        $session->delete();
        return response()->noContent();
    }
}

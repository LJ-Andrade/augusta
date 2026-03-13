<?php

namespace App\Services\LLM;

use App\Models\Chatbot;
use App\Models\ChatSession;

interface LLMProviderInterface
{
    /**
     * Send a message to the LLM and get the response string.
     *
     * @param Chatbot $chatbot
     * @param ChatSession|null $session
     * @param string $message
     * @param array $history Optional message history for stateless calls
     * @return array{reply: string, usage: int}
     */
    public function sendMessage(Chatbot $chatbot, ?ChatSession $session, string $message, array $history = []): array;
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChatbotNote extends Model
{
    use HasFactory;

    protected $table = 'chatbot_notes';

    protected $fillable = [
        'title',
        'content',
    ];
}

<?php

namespace App\Http\Controllers;

use App\Mail\ContactNotification;
use App\Models\ContactMessage;
use App\Models\SystemSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class ContactController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'message' => 'required|string',
        ]);

        $contactMessage = ContactMessage::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'message' => $validated['message'],
            'is_read' => false,
        ]);

        $businessEmailSetting = SystemSetting::where('key', 'mail_to_address')->first();
        $destinationEmail = $businessEmailSetting?->value 
            ?: config('mail.from.address', 'server@studiovimana.com.ar');
        
        try {
            Mail::to($destinationEmail)->send(new ContactNotification(
                $validated['name'],
                $validated['email'],
                $validated['message']
            ));
        } catch (\Exception $e) {
            logger()->error('Failed to send contact email: ' . $e->getMessage());
        }

        return response()->json(['ok' => true, 'data' => $contactMessage]);
    }

    public function index(Request $request): JsonResponse
    {
        $query = ContactMessage::query();

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('message', 'like', "%{$search}%");
            });
        }

        $perPage = $request->input('perPage', 10);
        $messages = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'data' => $messages->items(),
            'meta' => [
                'current_page' => $messages->currentPage(),
                'last_page' => $messages->lastPage(),
                'per_page' => $messages->perPage(),
                'total' => $messages->total(),
            ]
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $message = ContactMessage::findOrFail($id);
        return response()->json(['data' => $message]);
    }

    public function markAsRead(int $id): JsonResponse
    {
        $message = ContactMessage::findOrFail($id);
        $message->update(['is_read' => true]);
        return response()->json(['ok' => true, 'data' => $message]);
    }

    public function destroy(int $id): JsonResponse
    {
        $message = ContactMessage::findOrFail($id);
        $message->delete();
        return response()->json(['ok' => true]);
    }

    public function bulkDelete(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:contact_messages,id',
        ]);

        ContactMessage::whereIn('id', $validated['ids'])->delete();
        return response()->json(['ok' => true]);
    }
}

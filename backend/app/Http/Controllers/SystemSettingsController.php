<?php

namespace App\Http\Controllers;

use App\Http\Resources\SystemSettingResource;
use App\Models\SystemSetting;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SystemSettingsController extends Controller
{
    public function index(): \Illuminate\Http\Resources\Json\AnonymousResourceCollection
    {
        return SystemSettingResource::collection(SystemSetting::all());
    }

    public function publicInfo(): JsonResponse
    {
        $keys = [
            'business_phone',
            'business_email', 
            'business_address',
            'business_hours',
            'business_whatsapp',
            'business_facebook',
            'business_instagram',
            'business_linkedin',
            'business_youtube',
            'business_tiktok',
        ];
        
        $settings = SystemSetting::whereIn('key', $keys)->get();
        
        $data = [];
        foreach ($settings as $setting) {
            $data[$setting->key] = $setting->value;
        }
        
        return response()->json(['data' => $data]);
    }

    public function show(string $key): JsonResponse
    {
        $setting = SystemSetting::where('key', $key)->first();
        
        if (!$setting) {
            return response()->json(['message' => 'Setting not found'], 404);
        }

        return response()->json(['data' => new SystemSettingResource($setting)]);
    }

    public function update(Request $request, string $key): JsonResponse
    {
        $validated = $request->validate([
            'value' => 'nullable|string',
            'description' => 'nullable|string',
        ]);

        $setting = SystemSetting::set($key, $validated['value'] ?? null, $validated['description'] ?? null);

        return response()->json(['data' => new SystemSettingResource($setting)]);
    }
}
